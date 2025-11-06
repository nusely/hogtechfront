'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Search, Upload, ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import toast from 'react-hot-toast';
import { 
  addProductToDeal,
  updateDealProduct,
  Deal,
  DealProduct
} from '@/services/deal.service';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/helpers';
import Image from 'next/image';
import { MediaPicker } from './MediaPicker';

interface AddProductToDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  dealTitle: string;
  dealDiscountPercentage?: number; // Deal's discount percentage
  editingProduct?: DealProduct; // Product to edit (if editing)
  onSuccess?: () => void;
}

type ProductMode = 'existing' | 'new';

export function AddProductToDealModal({
  isOpen,
  onClose,
  dealId,
  dealTitle,
  dealDiscountPercentage = 0,
  editingProduct,
  onSuccess,
}: AddProductToDealModalProps) {
  const [mode, setMode] = useState<ProductMode>('existing');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFlashDeal, setIsFlashDeal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  
  // New product fields
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    key_features: '',
    specifications: '',
    images: [] as string[],
    thumbnail: '',
    original_price: '',
    discount_price: '',
  });

  useEffect(() => {
    if (isOpen && mode === 'existing') {
      fetchProducts();
    }
  }, [isOpen, mode]);

  // Populate form when editing
  useEffect(() => {
    if (editingProduct && isOpen) {
      if (editingProduct.product_id) {
        // Existing product - set mode to existing and select the product
        setMode('existing');
        // Fetch products if not already loaded, then select the product
        if (editingProduct.product) {
          setSelectedProduct(editingProduct.product);
        } else if (editingProduct.product_id) {
          // Fetch the product details
          fetchProducts().then((fetchedProducts) => {
            const product = fetchedProducts.find((p) => p.id === editingProduct.product_id);
            if (product) {
              setSelectedProduct(product);
            }
          });
        }
        setIsFlashDeal(editingProduct.is_flash_deal || false);
      } else {
        // Standalone product - set mode to new and populate fields
        setMode('new');
        setNewProduct({
          name: editingProduct.product_name || '',
          description: editingProduct.product_description || '',
          key_features: editingProduct.product_key_features 
            ? (typeof editingProduct.product_key_features === 'string' 
                ? JSON.parse(editingProduct.product_key_features).join(', ')
                : Array.isArray(editingProduct.product_key_features)
                  ? editingProduct.product_key_features.join(', ')
                  : '')
            : '',
          specifications: editingProduct.product_specifications
            ? (typeof editingProduct.product_specifications === 'string'
                ? editingProduct.product_specifications
                : JSON.stringify(editingProduct.product_specifications))
            : '',
          images: editingProduct.product_images || (editingProduct.product_image_url ? [editingProduct.product_image_url] : []),
          thumbnail: editingProduct.product_image_url || '',
          original_price: editingProduct.original_price?.toString() || '',
          discount_price: '',
        });
      }
      setIsFlashDeal(editingProduct.is_flash_deal || false);
    } else if (isOpen && !editingProduct) {
      // Reset form when opening for new product
      setMode('existing');
      setSelectedProduct(null);
      setSearchQuery('');
      setNewProduct({
        name: '',
        description: '',
        key_features: '',
        specifications: '',
        images: [],
        thumbnail: '',
        original_price: '',
        discount_price: '',
      });
      setIsFlashDeal(false);
    }
  }, [editingProduct, isOpen]);

  useEffect(() => {
    if (mode === 'existing') {
      if (products.length === 0) {
        setFilteredProducts([]);
        return;
      }
      
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery) {
        const query = trimmedQuery.toLowerCase();
        const filtered = products.filter(p =>
          p.name && p.name.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(products);
      }
    } else {
      // Reset filtered products when not in existing mode
      setFilteredProducts([]);
    }
  }, [searchQuery, products, mode]);

  const fetchProducts = async (): Promise<Product[]> => {
    try {
      setLoading(true);
      const fetchedProducts = await productService.getProducts({});
      setProducts(fetchedProducts);
      // Initialize filtered products based on current search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const filtered = fetchedProducts.filter((p) =>
          p.name && p.name.toLowerCase().includes(query)
        );
        setFilteredProducts(filtered);
      } else {
        setFilteredProducts(fetchedProducts);
      }
      return fetchedProducts;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleImageSelect = async (file: File | string | string[]) => {
    try {
      setUploading(true);
      if (Array.isArray(file)) {
        // Multiple images selected from media library
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images, ...file],
          thumbnail: prev.thumbnail || file[0],
        }));
        toast.success(`${file.length} image(s) selected from media library`);
      } else if (typeof file === 'string') {
        // Single image selected from media library
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images, file],
          thumbnail: prev.thumbnail || file,
        }));
        toast.success('Image selected from media library');
      } else {
        // Upload new image
        const { uploadImage } = await import('@/services/image-upload.service');
        const result = await uploadImage(file, 'deals', true);
        
        if (result.success && result.url) {
          setNewProduct(prev => ({
            ...prev,
            images: [...prev.images, result.url!],
            thumbnail: prev.thumbnail || result.url!,
          }));
          if (result.fromLibrary) {
            toast.success('Image selected from media library');
          } else {
            toast.success('Image uploaded successfully!');
          }
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setShowMediaPicker(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const { uploadImages } = await import('@/services/image-upload.service');
      const filesArray = Array.from(files);
      const uploadResults = await uploadImages(filesArray, 'deals', true);
      
      const successfulUploads = uploadResults.filter(r => r.success && r.url);
      const failedUploads = uploadResults.filter(r => !r.success);
      
      if (failedUploads.length > 0) {
        const errors = failedUploads.map(r => r.error).filter(Boolean);
        toast.error(errors.join(', ') || 'Some uploads failed');
      }
      
      if (successfulUploads.length > 0) {
        const uploadedUrls = successfulUploads.map(r => r.url!);
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
          thumbnail: prev.thumbnail || uploadedUrls[0],
        }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        thumbnail: prev.thumbnail === prev.images[index] ? (newImages[0] || '') : prev.thumbnail,
      };
    });
  };

  const setAsThumbnail = (url: string) => {
    setNewProduct(prev => ({ ...prev, thumbnail: url }));
    toast.success('Thumbnail updated');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'existing') {
      if (!selectedProduct) {
        toast.error('Please select a product');
        return;
      }
    } else {
      if (!newProduct.name || !newProduct.original_price) {
        toast.error('Please fill in product name and original price');
        return;
      }
    }

    // No need to validate discount/price - deal's discount percentage will be used

    try {
      setSaving(true);
      
      // If editing, update instead of add
      if (editingProduct) {
        const productId = editingProduct.product_id || editingProduct.id;
        const updates: any = {
          is_flash_deal: isFlashDeal,
        };

        if (editingProduct.product_id) {
          // Editing existing product - only update flash deal flag
          // (can't change product details for existing products)
        } else if (mode === 'new') {
          // Update standalone product fields
          const keyFeatures = newProduct.key_features
            ? JSON.stringify(newProduct.key_features.split(',').map(f => f.trim()).filter(f => f))
            : null;

          let specifications = null;
          if (newProduct.specifications) {
            try {
              JSON.parse(newProduct.specifications);
              specifications = newProduct.specifications;
            } catch (error) {
              toast.error('Invalid JSON format in specifications field');
              setSaving(false);
              return;
            }
          }

          const productImageUrl = newProduct.thumbnail || (newProduct.images && newProduct.images[0]) || null;

          updates.product_name = newProduct.name;
          updates.product_description = newProduct.description || null;
          updates.product_image_url = productImageUrl || null;
          updates.product_images = (newProduct.images && newProduct.images.length > 0) ? newProduct.images : null;
          updates.product_key_features = keyFeatures || null;
          updates.product_specifications = specifications || null;
          updates.original_price = parseFloat(newProduct.original_price);
        }

        await updateDealProduct(dealId, productId, updates);
        toast.success(editingProduct.product_name || selectedProduct?.name || 'Product updated in deal!');
      } else if (mode === 'existing') {
        await addProductToDeal(dealId, {
          product_id: selectedProduct!.id,
          discount_percentage: dealDiscountPercentage || 0, // Use deal's discount percentage
          is_flash_deal: isFlashDeal,
        });
        toast.success(`${selectedProduct!.name} added to deal!`);
      } else {
        // Parse key_features (comma-separated string to JSON array)
        const keyFeatures = newProduct.key_features
          ? JSON.stringify(newProduct.key_features.split(',').map(f => f.trim()).filter(f => f))
          : null;

        // Parse specifications (JSON string, validate it)
        let specifications = null;
        if (newProduct.specifications) {
          try {
            // Try to parse to validate JSON
            JSON.parse(newProduct.specifications);
            specifications = newProduct.specifications;
          } catch (error) {
            toast.error('Invalid JSON format in specifications field');
            setSaving(false);
            return;
          }
        }

        // Use thumbnail or first image as product_image_url
        const productImageUrl = newProduct.thumbnail || (newProduct.images && newProduct.images[0]) || null;

        await addProductToDeal(dealId, {
          product_name: newProduct.name,
          product_description: newProduct.description || undefined,
          product_image_url: productImageUrl || undefined,
          product_images: (newProduct.images && newProduct.images.length > 0) ? newProduct.images : undefined,
          product_key_features: keyFeatures || undefined,
          product_specifications: specifications || undefined,
          original_price: parseFloat(newProduct.original_price),
          discount_percentage: dealDiscountPercentage || 0, // Use deal's discount percentage
          is_flash_deal: isFlashDeal,
        });
        toast.success(`${newProduct.name} added to deal!`);
      }
      
      onSuccess?.();
      onClose();
      // Reset form
      setMode('existing');
      setSelectedProduct(null);
      setSearchQuery('');
      setNewProduct({
        name: '',
        description: '',
        key_features: '',
        specifications: '',
        images: [],
        thumbnail: '',
        original_price: '',
        discount_price: '',
      });
      setIsFlashDeal(false);
    } catch (error: any) {
      console.error('Error adding product to deal:', error);
      toast.error(error.message || 'Failed to add product to deal');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const originalPrice = mode === 'existing' 
    ? (selectedProduct?.original_price || selectedProduct?.discount_price || 0)
    : parseFloat(newProduct.original_price) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {editingProduct ? 'Edit Product in' : 'Add Product to'} "{dealTitle}"
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('existing');
                setSelectedProduct(null);
                setSearchQuery('');
                // Reset filtered products when switching to existing mode
                if (products.length > 0) {
                  setFilteredProducts(products);
                }
                setNewProduct({
                  name: '',
                  description: '',
                  key_features: '',
                  specifications: '',
                  images: [] as string[],
                  thumbnail: '',
                  original_price: '',
                  discount_price: '',
                });
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'existing'
                  ? 'bg-white text-[#FF7A19] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Select Existing Product
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('new');
                setSelectedProduct(null);
                setSearchQuery('');
              }}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'new'
                  ? 'bg-white text-[#FF7A19] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create New Product
            </button>
          </div>

          {mode === 'existing' ? (
            <>
              {/* Search Products */}
              <div>
                <Label htmlFor="search">Search Products</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Product List */}
              <div>
                <Label>Select Product</Label>
                <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading products...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No products found</div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductSelect(product)}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            selectedProduct?.id === product.id ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {product.thumbnail && (
                              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                                <Image
                                  src={product.thumbnail}
                                  alt={product.name}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(product.original_price || product.discount_price || 0)}
                              </p>
                            </div>
                            {selectedProduct?.id === product.id && (
                              <div className="flex-shrink-0">
                                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* New Product Form - Similar to ProductModal */}
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="productDescription">Description</Label>
                <textarea
                  id="productDescription"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product description..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <Label htmlFor="keyFeatures">Key Features</Label>
                <textarea
                  id="keyFeatures"
                  value={newProduct.key_features}
                  onChange={(e) => setNewProduct({ ...newProduct, key_features: e.target.value })}
                  placeholder="Enter key features separated by commas (e.g., Fast processor, Long battery life, HD display)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Separate each feature with a comma</p>
              </div>

              <div>
                <Label htmlFor="specifications">Specifications (JSON)</Label>
                <textarea
                  id="specifications"
                  value={newProduct.specifications}
                  onChange={(e) => setNewProduct({ ...newProduct, specifications: e.target.value })}
                  placeholder='{"processor": "Intel i7", "ram": "16GB", "storage": "512GB SSD", "screen": "15.6 inch"}'
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Enter specifications as JSON object (e.g., {`{"key": "value"}`})</p>
              </div>

              {/* Pricing */}
              <div>
                <Label htmlFor="originalPrice">Original Price (GHS) *</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.original_price}
                  onChange={(e) => {
                    setNewProduct({ ...newProduct, original_price: e.target.value });
                  }}
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Product Images */}
              <div>
                <Label>Product Images</Label>
                <div className="space-y-4">
                  {/* Upload Buttons */}
                  <div>
                    <div className="flex gap-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={<ImageIcon size={16} />}
                        onClick={() => setShowMediaPicker(true)}
                        disabled={uploading}
                      >
                        Select from Library
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="product-images-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="product-images-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {uploading ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        {uploading ? 'Uploading...' : 'Upload from PC'}
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Choose from media library or upload new images. Multiple images allowed. First image will be thumbnail.
                    </p>
                  </div>

                  {/* Image Gallery */}
                  {newProduct.images && newProduct.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {newProduct.images.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`Product ${index + 1}`}
                            width={128}
                            height={128}
                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          {newProduct.thumbnail === url && (
                            <div className="absolute top-2 left-2 bg-[#FF7A19] text-white text-xs px-2 py-1 rounded">
                              Thumbnail
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            {newProduct.thumbnail !== url && (
                              <button
                                type="button"
                                onClick={() => setAsThumbnail(url)}
                                className="px-2 py-1 bg-white text-[#1A1A1A] text-xs rounded hover:bg-gray-100"
                              >
                                Set as Thumbnail
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Deal Configuration */}
          {(mode === 'existing' ? selectedProduct : newProduct.name && newProduct.original_price) && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_flash_deal"
                  checked={isFlashDeal}
                  onChange={(e) => setIsFlashDeal(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="is_flash_deal" className="text-sm font-medium text-gray-700">
                  Flash Deal (Show on Homepage)
                </label>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={saving || (mode === 'existing' ? !selectedProduct : !newProduct.name || !newProduct.original_price)}
            >
              {saving ? 'Adding...' : 'Add to Deal'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleImageSelect}
          onSelectMultiple={(urls) => handleImageSelect(urls)}
          folder={undefined} // Show all R2 images, not just from a specific folder
          multiple={true}
        />
      )}
    </div>
  );
}
