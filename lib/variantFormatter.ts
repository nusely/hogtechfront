import { supabase } from '@/lib/supabase';

interface VariantOption {
  id: string;
  attribute_id: string;
  value: string;
  label: string;
}

interface FormattedVariant {
  attribute_name: string;
  option_label: string;
  option_value: string;
}

/**
 * Formats variant data from order items to display readable names
 * @param selectedVariants - The selected_variants object from order item
 * @returns Array of formatted variant strings like "Storage: 32GIG" or "Color: RED"
 */
export async function formatOrderVariants(selectedVariants: any): Promise<FormattedVariant[]> {
  if (!selectedVariants || typeof selectedVariants !== 'object') {
    return [];
  }

  try {
    const variantEntries = Object.entries(selectedVariants);
    if (variantEntries.length === 0) {
      return [];
    }

    // Extract attribute IDs and option IDs
    const attributeIds = variantEntries.map(([attrId]) => attrId);
    const optionIds: string[] = [];
    const optionIdToAttributeId: { [key: string]: string } = {};

    variantEntries.forEach(([attrId, optionData]: [string, any]) => {
      // Handle both cases: optionData is an object with id, or optionData is the id itself
      const optionId = typeof optionData === 'object' && optionData?.id 
        ? optionData.id 
        : typeof optionData === 'string' 
        ? optionData 
        : null;
      
      if (optionId) {
        optionIds.push(optionId);
        optionIdToAttributeId[optionId] = attrId;
      }
    });

    if (optionIds.length === 0) {
      return [];
    }

    // Fetch attributes and options in parallel
    const [attributesResult, optionsResult] = await Promise.all([
      supabase
        .from('product_attributes')
        .select('id, name')
        .in('id', attributeIds),
      supabase
        .from('product_attribute_options')
        .select('id, attribute_id, value, label')
        .in('id', optionIds),
    ]);

    if (attributesResult.error) {
      console.error('Error fetching attributes:', attributesResult.error);
    }
    if (optionsResult.error) {
      console.error('Error fetching options:', optionsResult.error);
    }

    const attributes = (attributesResult.data || []).reduce((acc: any, attr: any) => {
      acc[attr.id] = attr.name;
      return acc;
    }, {});

    const options = (optionsResult.data || []).reduce((acc: any, opt: any) => {
      acc[opt.id] = opt;
      return acc;
    }, {});

    // Format variants
    const formatted: FormattedVariant[] = [];
    variantEntries.forEach(([attrId, optionData]: [string, any]) => {
      const optionId = typeof optionData === 'object' && optionData?.id 
        ? optionData.id 
        : typeof optionData === 'string' 
        ? optionData 
        : null;
      
      if (optionId && options[optionId]) {
        const option = options[optionId];
        const attributeName = attributes[attrId] || 'Variant';
        formatted.push({
          attribute_name: attributeName,
          option_label: option.label || option.value,
          option_value: option.value,
        });
      }
    });

    return formatted;
  } catch (error) {
    console.error('Error formatting variants:', error);
    return [];
  }
}

/**
 * Formats variants as a simple string for display
 */
export async function formatOrderVariantsAsString(selectedVariants: any): Promise<string> {
  const formatted = await formatOrderVariants(selectedVariants);
  return formatted.map(v => `${v.attribute_name}: ${v.option_label}`).join(', ');
}

