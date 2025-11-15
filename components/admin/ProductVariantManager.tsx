'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/helpers';
import { buildApiUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { AddOptionToAttribute } from './AddOptionToAttribute';

interface AttributeOption {
  id: string;
  attribute_id: string;
  value: string;
  label: string;
  price_modifier: number;
  stock_quantity: number;
  sku_suffix?: string;
  display_order: number;
  is_available: boolean;
}

interface Attribute {
  id: string;
  name: string;
  slug: string;
  type: 'select' | 'radio' | 'color' | 'size';
  display_order: number;
  is_required: boolean;
  options?: AttributeOption[];
}

interface ProductVariant {
  attribute_id: string;
  attribute_name: string;
  selected_options: string[]; // Array of option IDs
  is_required: boolean;
}

interface ProductVariantManagerProps {
  productId?: string;
  onVariantChange: (variants: ProductVariant[]) => void;
}

export function ProductVariantManager({ productId, onVariantChange }: ProductVariantManagerProps) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [expandedAttributes, setExpandedAttributes] = useState<string[]>([]);
  const [newAttributeName, setNewAttributeName] = useState('');
  const [newAttributeType, setNewAttributeType] = useState<'select' | 'radio'>('select');
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  // Track which option's price is being edited: { attributeId: { optionId: price } }
  const [editingPrices, setEditingPrices] = useState<{ [key: string]: { [key: string]: string } }>({});

  const getAuthHeaders = async (): Promise<HeadersInit> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Authentication required');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const prevProductIdRef = useRef<string | undefined>(undefined);
  const prevAttributesLengthRef = useRef<number>(0);

  useEffect(() => {
    // Only fetch variants if productId or attributes actually changed
    const productIdChanged = prevProductIdRef.current !== productId;
    const attributesLoaded = attributes.length > 0 && prevAttributesLengthRef.current === 0;
    
    if (productId && attributes.length > 0 && (productIdChanged || attributesLoaded)) {
      prevProductIdRef.current = productId;
      prevAttributesLengthRef.current = attributes.length;
      fetchProductVariants();
    } else if (!productId) {
      // Clear variants when no productId (new product)
      setProductVariants([]);
      setExpandedAttributes([]);
      prevProductIdRef.current = undefined;
      prevAttributesLengthRef.current = 0;
    }
  }, [productId, attributes.length]);

  const isInitialMount = useRef(true);
  const prevVariantsRef = useRef<string>('');
  const variantChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Create a string representation of variants for comparison
    const variantsKey = JSON.stringify(productVariants.map(v => ({
      attribute_id: v.attribute_id,
      selected_options: [...v.selected_options].sort(),
    })).sort((a, b) => a.attribute_id.localeCompare(b.attribute_id)));
    
    // Skip calling onVariantChange on initial mount or if variants haven't changed
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevVariantsRef.current = variantsKey;
      return;
    }
    
    // Only call if variants actually changed
    if (prevVariantsRef.current !== variantsKey) {
      prevVariantsRef.current = variantsKey;
      
      // Clear any pending timeout
      if (variantChangeTimeoutRef.current) {
        clearTimeout(variantChangeTimeoutRef.current);
      }
      
      // Debounce the callback to prevent rapid updates
      variantChangeTimeoutRef.current = setTimeout(() => {
        onVariantChange(productVariants);
      }, 100);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (variantChangeTimeoutRef.current) {
        clearTimeout(variantChangeTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productVariants.length]); // Only depend on length to prevent infinite loops

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const { data: attrs, error: attrError } = await supabase
        .from('product_attributes')
        .select('*')
        .order('display_order');

      if (attrError) throw attrError;

      // Fetch options for each attribute
      const attrsWithOptions = await Promise.all(
        (attrs || []).map(async (attr) => {
          const { data: options, error: optError } = await supabase
            .from('product_attribute_options')
            .select('*')
            .eq('attribute_id', attr.id)
            .order('display_order');

          if (optError) console.error('Error fetching options:', optError);

          return {
            ...attr,
            options: options || [],
          };
        })
      );

      setAttributes(attrsWithOptions);
    } catch (error: any) {
      console.error('Error fetching attributes:', error);
      toast.error('Failed to load attributes');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductVariants = async () => {
    if (!productId || attributes.length === 0) {
      setProductVariants([]);
      return;
    }

    try {
      const { data: mappings, error } = await supabase
        .from('product_attribute_mappings')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;

      // Fetch options for each mapped attribute
      const variantsWithOptions = await Promise.all(
        (mappings || []).map(async (mapping: any) => {
          const attr = attributes.find(a => a.id === mapping.attribute_id);
          
          // Get saved selected options for this product-attribute combination
          // Check if there's a selected_options column in mapping, or fetch from a separate table
          let selectedOptionIds: string[] = [];
          
          // Try to get selected options from product_attribute_option_mappings table
          const { data: optionMappings } = await supabase
            .from('product_attribute_option_mappings')
            .select('option_id, stock_quantity, is_available')
            .eq('product_id', productId)
            .eq('attribute_id', mapping.attribute_id);
          
          if (optionMappings && optionMappings.length > 0) {
            // Use saved selected options (if variant is in mappings, it's selected/available)
            selectedOptionIds = optionMappings.map((om: any) => om.option_id);
          } else {
            // If no saved options, start with empty array (user must select manually)
            selectedOptionIds = [];
          }

          return {
            attribute_id: mapping.attribute_id,
            attribute_name: attr?.name || '',
            selected_options: selectedOptionIds,
            is_required: mapping.is_required,
          };
        })
      );

      setProductVariants(variantsWithOptions);
      // Expand all mapped attributes
      setExpandedAttributes(variantsWithOptions.map(v => v.attribute_id));
    } catch (error: any) {
      console.error('Error fetching product variants:', error);
      setProductVariants([]);
    }
  };

  const toggleAttribute = async (attributeId: string) => {
    const variant = productVariants.find(v => v.attribute_id === attributeId);
    const attr = attributes.find(a => a.id === attributeId);

    if (variant) {
      // Remove attribute
      setProductVariants(productVariants.filter(v => v.attribute_id !== attributeId));
    } else {
      // Add attribute
      if (!attr) return;

      setProductVariants([
        ...productVariants,
        {
          attribute_id: attributeId,
          attribute_name: attr.name,
          selected_options: attr.options && attr.options.length > 0 ? [attr.options[0].id] : [],
          is_required: attr.is_required,
        },
      ]);
      setExpandedAttributes([...expandedAttributes, attributeId]);
    }
  };

  const toggleOption = (attributeId: string, optionId: string) => {
    setProductVariants(productVariants.map(variant => {
      if (variant.attribute_id === attributeId) {
        const hasOption = variant.selected_options.includes(optionId);
        const newSelectedOptions = hasOption
          ? variant.selected_options.filter(id => id !== optionId)
          : [...variant.selected_options, optionId];
        
        return {
          ...variant,
          selected_options: newSelectedOptions,
        };
      }
      return variant;
    }));
  };


  const startEditingPrice = (attributeId: string, optionId: string, currentPrice: number) => {
    setEditingPrices(prev => ({
      ...prev,
      [attributeId]: {
        ...(prev[attributeId] || {}),
        [optionId]: currentPrice.toString(),
      },
    }));
  };

  const cancelEditingPrice = (attributeId: string, optionId: string) => {
    setEditingPrices(prev => {
      const newEditing = { ...prev };
      if (newEditing[attributeId]) {
        delete newEditing[attributeId][optionId];
        if (Object.keys(newEditing[attributeId]).length === 0) {
          delete newEditing[attributeId];
        }
      }
      return newEditing;
    });
  };

  const saveOptionPrice = async (attributeId: string, optionId: string) => {
    const priceStr = editingPrices[attributeId]?.[optionId];
    if (priceStr === undefined) return;

    const priceModifier = parseFloat(priceStr);
    if (isNaN(priceModifier)) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        buildApiUrl(`/api/products/variants/options/${optionId}`),
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ price_modifier: priceModifier }),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || `Failed to update price (status ${response.status})`);
      }

      toast.success('Price updated successfully');
      cancelEditingPrice(attributeId, optionId);
      await fetchAttributes(); // Refresh to show updated price
    } catch (error: any) {
      console.error('Error updating option price:', error);
      toast.error(error?.message || 'Failed to update price');
    }
  };

  const deleteOption = async (attributeId: string, optionId: string) => {
    if (!confirm('Are you sure you want to delete this option? This will remove it from all products using it.')) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const endpoint = buildApiUrl(`/api/products/variants/options/${optionId}${productId ? `?productId=${productId}` : ''}`);
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || `Failed to delete option (status ${response.status})`);
      }

      toast.success('Option deleted successfully');
      await fetchAttributes(); // Refresh attributes
      
      // Remove from selected options if it was selected
      setProductVariants(productVariants.map(variant => {
        if (variant.attribute_id === attributeId) {
          return {
            ...variant,
            selected_options: variant.selected_options.filter(id => id !== optionId),
          };
        }
        return variant;
      }));
    } catch (error: any) {
      console.error('Error deleting option:', error);
      toast.error(error.message || 'Failed to delete option');
    }
  };

  const deleteAttribute = async (attributeId: string) => {
    if (!confirm('Are you sure you want to delete this attribute? This will remove it and all its options from the system.')) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const endpoint = buildApiUrl(`/api/products/variants/attributes/${attributeId}${productId ? `?productId=${productId}` : ''}`);
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || `Failed to delete attribute (status ${response.status})`);
      }

      toast.success('Attribute deleted successfully');
      await fetchAttributes(); // Refresh attributes
      
      // Remove from product variants
      setProductVariants(productVariants.filter(v => v.attribute_id !== attributeId));
      setExpandedAttributes(expandedAttributes.filter(id => id !== attributeId));
    } catch (error: any) {
      console.error('Error deleting attribute:', error);
      toast.error(error.message || 'Failed to delete attribute');
    }
  };

  const toggleExpand = (attributeId: string) => {
    setExpandedAttributes(prev =>
      prev.includes(attributeId)
        ? prev.filter(id => id !== attributeId)
        : [...prev, attributeId]
    );
  };

  const addNewAttribute = async () => {
    if (!newAttributeName.trim()) {
      toast.error('Please enter an attribute name');
      return;
    }

    try {
      const slug = newAttributeName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data, error } = await supabase
        .from('product_attributes')
        .insert({
          name: newAttributeName,
          slug,
          type: newAttributeType,
          display_order: attributes.length + 1,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Attribute created! Now add values for it.');
      setNewAttributeName('');
      setShowAddAttribute(false);
      await fetchAttributes();

      // Add to selected attributes
      setProductVariants([
        ...productVariants,
        {
          attribute_id: data.id,
          attribute_name: data.name,
          selected_options: [],
          is_required: false,
        },
      ]);
    } catch (error: any) {
      console.error('Error creating attribute:', error);
      toast.error(error.message || 'Failed to create attribute');
    }
  };

  const addOptionToAttribute = async (attributeId: string, value: string, label: string, priceModifier: number = 0) => {
    try {
      const { data, error } = await supabase
        .from('product_attribute_options')
        .insert({
          attribute_id: attributeId,
          value,
          label,
          price_modifier: priceModifier,
          display_order: 1,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Option added!');
      await fetchAttributes();
    } catch (error: any) {
      console.error('Error adding option:', error);
      toast.error(error.message || 'Failed to add option');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading attributes...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Existing Attributes */}
      <div className="space-y-3">
        {attributes.map((attr) => {
          const variant = productVariants.find(v => v.attribute_id === attr.id);
          const isExpanded = expandedAttributes.includes(attr.id);
          const isSelected = !!variant;

          return (
            <div
              key={attr.id}
              className={`border-2 rounded-lg transition-all ${
                isSelected ? 'border-[#00afef] bg-blue-50' : 'border-gray-200'
              }`}
            >
              {/* Attribute Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAttribute(attr.id)}
                      className="w-5 h-5 text-[#00afef] border-gray-300 rounded focus:ring-[#00afef]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#1A1A1A]">{attr.name}</p>
                      <p className="text-xs text-[#3A3A3A] capitalize">{attr.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(attr.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteAttribute(attr.id)}
                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                      title="Delete attribute"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Attribute Options (shown when expanded) */}
              {isSelected && isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                  <p className="text-xs text-[#3A3A3A] mb-3">
                    Select which values are available for this product
                  </p>
                  <div className="space-y-3">
                    {attr.options && attr.options.length > 0 ? (
                      attr.options.map((option) => {
                        const isOptionSelected = variant?.selected_options.includes(option.id);
                        const isEditingPrice = editingPrices[attr.id]?.[option.id] !== undefined;
                        const editingPriceValue = editingPrices[attr.id]?.[option.id] || '';

                        return (
                          <div
                            key={option.id}
                            className={`p-3 border rounded-lg ${
                              isOptionSelected ? 'border-[#00afef] bg-white' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <input
                                  type={attr.type === 'radio' ? 'radio' : 'checkbox'}
                                  name={`attr-${attr.id}`}
                                  checked={isOptionSelected}
                                  onChange={() => toggleOption(attr.id, option.id)}
                                  className="w-4 h-4 text-[#00afef] border-gray-300 focus:ring-[#00afef]"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-[#1A1A1A]">{option.label}</p>
                                  <p className="text-xs text-[#3A3A3A]">{option.value}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                {isEditingPrice ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      value={editingPriceValue}
                                      onChange={(e) => setEditingPrices(prev => ({
                                        ...prev,
                                        [attr.id]: {
                                          ...(prev[attr.id] || {}),
                                          [option.id]: e.target.value,
                                        },
                                      }))}
                                      className="w-24 px-2 py-1 text-sm"
                                      placeholder="0.00"
                                      step="0.01"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => saveOptionPrice(attr.id, option.id)}
                                      className="p-1 hover:bg-green-100 rounded transition-colors text-green-600"
                                      title="Save price"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => cancelEditingPrice(attr.id, option.id)}
                                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                                      title="Cancel"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-[#1A1A1A]">
                                        {option.price_modifier > 0 
                                          ? `+${formatCurrency(option.price_modifier)}`
                                          : option.price_modifier < 0
                                          ? formatCurrency(option.price_modifier)
                                          : 'No change'
                                        }
                                      </p>
                                      <p className="text-xs text-[#3A3A3A]">Price adjustment</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => startEditingPrice(attr.id, option.id, option.price_modifier)}
                                      className="p-1 hover:bg-blue-100 rounded transition-colors text-blue-600"
                                      title="Edit price"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteOption(attr.id, option.id)}
                                      className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                                      title="Delete option"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-[#3A3A3A] italic">No options available for this attribute</p>
                    )}
                    {/* Add Custom Option */}
                    <AddOptionToAttribute
                      attributeId={attr.id}
                      attributeName={attr.name}
                      onAdd={addOptionToAttribute}
                      onRefresh={fetchAttributes}
                    />
                  </div>
                  
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Attribute */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {!showAddAttribute ? (
          <button
            type="button"
            onClick={() => setShowAddAttribute(true)}
            className="w-full flex items-center justify-center gap-2 text-[#00afef] hover:text-[#163b86] font-medium"
          >
            <Plus size={18} />
            Add Custom Attribute
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Attribute name (e.g., Screen Size, Processor)"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
            />
            <select
              value={newAttributeType}
              onChange={(e) => setNewAttributeType(e.target.value as 'select' | 'radio')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef]"
            >
              <option value="select">Select (Multiple values)</option>
              <option value="radio">Radio (Single value)</option>
            </select>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                type="button"
                onClick={addNewAttribute}
              >
                Create Attribute
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => {
                  setShowAddAttribute(false);
                  setNewAttributeName('');
                }}
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-[#3A3A3A]">
              After creating, expand the attribute to add values with price adjustments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


