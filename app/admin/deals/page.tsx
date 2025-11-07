'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  X,
  Upload,
  ImageIcon,
  Clock,
  Percent,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { 
  getAllDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealProducts,
  addProductToDeal,
  removeProductFromDeal,
  Deal,
  DealProduct
} from '@/services/deal.service';
import { Product } from '@/types/product';
import { productService } from '@/services/product.service';
import { CountdownTimer } from '@/components/shop/CountdownTimer';
import { formatCurrency } from '@/lib/helpers';
import Image from 'next/image';
import { AddProductToDealModal } from '@/components/admin/AddProductToDealModalNew';

export default function DealsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [dealProducts, setDealProducts] = useState<DealProduct[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DealProduct | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner_image_url: '',
    discount_percentage: 0,
    start_date: '',
    end_date: '',
    is_active: true,
    is_flash_deal: false,
    display_order: 0,
  });

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }
    fetchDeals();
    fetchAllProducts();
  }, [isAuthenticated, user, router]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const dealsData = await getAllDeals(true); // Get all deals including inactive
      setDeals(dealsData);
    } catch (error: any) {
      console.error('Error fetching deals:', error);
      toast.error(error.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const products = await productService.getProducts({});
      setAllProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      description: deal.description || '',
      banner_image_url: deal.banner_image_url || '',
      discount_percentage: deal.discount_percentage || 0,
      start_date: deal.start_date ? new Date(deal.start_date).toISOString().slice(0, 16) : '',
      end_date: deal.end_date ? new Date(deal.end_date).toISOString().slice(0, 16) : '',
      is_active: deal.is_active !== false,
      is_flash_deal: deal.is_flash_deal === true,
      display_order: deal.display_order || 0,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDeal(null);
    setFormData({
      title: '',
      description: '',
      banner_image_url: '',
      discount_percentage: 0,
      start_date: '',
      end_date: '',
      is_active: true,
      is_flash_deal: false,
      display_order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDeal) {
        await updateDeal(editingDeal.id, formData);
        toast.success('Deal updated successfully!');
      } else {
        await createDeal(formData);
        toast.success('Deal created successfully!');
      }
      handleCancel();
      fetchDeals();
    } catch (error: any) {
      console.error('Error saving deal:', error);
      toast.error(error.message || 'Failed to save deal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal? This will also remove all products from the deal.')) {
      return;
    }
    try {
      await deleteDeal(id);
      toast.success('Deal deleted successfully!');
      fetchDeals();
    } catch (error: any) {
      console.error('Error deleting deal:', error);
      toast.error(error.message || 'Failed to delete deal');
    }
  };

  const handleViewProducts = async (deal: Deal) => {
    setSelectedDeal(deal);
    try {
      console.log('Fetching products for deal:', deal.id);
      const products = await getDealProducts(deal.id);
      console.log('Products received:', products);
      setDealProducts(products || []);
      setShowProducts(true);
    } catch (error: any) {
      console.error('Error fetching deal products:', error);
      toast.error(error.message || 'Failed to load products');
      setDealProducts([]);
    }
  };

  const handleRemoveProduct = async (dealId: string, productIdOrDealProductId: string) => {
    if (!confirm('Are you sure you want to remove this product from the deal?')) {
      return;
    }
    try {
      // For standalone products, productId is actually the deal_product id
      // For existing products, productId is the product_id
      await removeProductFromDeal(dealId, productIdOrDealProductId);
      toast.success('Product removed from deal!');
      if (selectedDeal) {
        handleViewProducts(selectedDeal);
      }
    } catch (error: any) {
      console.error('Error removing product:', error);
      toast.error(error.message || 'Failed to remove product');
    }
  };

  const handleImageSelect = async (file: File | string) => {
    try {
      setUploading(true);
      if (typeof file === 'string') {
        // Selected from media library
        setFormData({ ...formData, banner_image_url: file });
        toast.success('Image selected from media library');
      } else {
        // Upload new image
        const { uploadImage } = await import('@/services/image-upload.service');
        const result = await uploadImage(file, 'deals', true);
        
        if (result.success && result.url) {
          setFormData({ ...formData, banner_image_url: result.url });
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

  const getDealStatus = (deal: Deal): 'active' | 'upcoming' | 'expired' | 'inactive' => {
    if (!deal.is_active) return 'inactive';
    const now = new Date();
    const start = new Date(deal.start_date);
    const end = new Date(deal.end_date);
    if (now < start) return 'upcoming';
    if (now > end) return 'expired';
    return 'active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
            <p className="text-gray-600 mt-1">Manage deals and products</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            icon={<Plus size={18} />}
            variant="primary"
          >
            Create Deal
          </Button>
        </div>

        {/* Deals List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {deals.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-4">No deals yet</p>
              <Button onClick={() => setShowForm(true)} icon={<Plus size={18} />}>
                Create Your First Deal
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {deals.map((deal) => {
                const status = getDealStatus(deal);
                return (
                  <div key={deal.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                          <Badge
                            variant={
                              status === 'active' ? 'success' :
                              status === 'upcoming' ? 'warning' :
                              status === 'expired' ? 'error' : 'default'
                            }
                            size="sm"
                          >
                            {status === 'active' ? 'Active' :
                             status === 'upcoming' ? 'Upcoming' :
                             status === 'expired' ? 'Expired' : 'Inactive'}
                          </Badge>
                          {deal.discount_percentage > 0 && (
                            <Badge variant="error" size="sm">
                              <Percent size={12} className="mr-1" />
                              {deal.discount_percentage}% OFF
                            </Badge>
                          )}
                        </div>
                        {deal.description && (
                          <p className="text-gray-600 mb-3">{deal.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Starts: {new Date(deal.start_date).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Ends: {new Date(deal.end_date).toLocaleString()}</span>
                          </div>
                        </div>
                        {status === 'active' && (
                          <div className="mt-3">
                            <CountdownTimer endTime={deal.end_date} variant="compact" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handleViewProducts(deal)}
                          variant="outline"
                          size="sm"
                          icon={<Package size={16} />}
                        >
                          Products
                        </Button>
                        <Button
                          onClick={() => handleEdit(deal)}
                          variant="outline"
                          size="sm"
                          icon={<Edit size={16} />}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(deal.id)}
                          variant="outline"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingDeal ? 'Edit Deal' : 'Create Deal'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Image
                  </label>
                  <div className="flex items-center gap-3">
                    {formData.banner_image_url && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                        <Image
                          src={formData.banner_image_url}
                          alt="Banner"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowMediaPicker(true)}
                        icon={<ImageIcon size={16} />}
                        disabled={uploading}
                      >
                        {formData.banner_image_url ? 'Change' : 'Select Image'}
                      </Button>
                      {formData.banner_image_url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, banner_image_url: '' })}
                          icon={<X size={16} />}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_flash_deal"
                      checked={formData.is_flash_deal}
                      onChange={(e) => setFormData({ ...formData, is_flash_deal: e.target.checked })}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="is_flash_deal" className="text-sm font-medium text-gray-700">
                      Flash Deal (Show on Homepage)
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" variant="primary" disabled={uploading}>
                    {editingDeal ? 'Update Deal' : 'Create Deal'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products Modal */}
        {showProducts && selectedDeal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">
                  Products in "{selectedDeal.title}"
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowAddProductModal(true)}
                    variant="primary"
                    size="sm"
                    icon={<Plus size={16} />}
                  >
                    Add Product
                  </Button>
                  <button
                    onClick={() => {
                      setShowProducts(false);
                      setSelectedDeal(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {dealProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 mb-4">No products in this deal</p>
                    <Button
                      onClick={() => setShowAddProductModal(true)}
                      variant="primary"
                      icon={<Plus size={18} />}
                    >
                      Add Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dealProducts.map((dealProduct) => {
                      // Handle both existing products and standalone products
                      const productName = dealProduct.product?.name || dealProduct.product_name || 'Unnamed Product';
                      const productImage = dealProduct.product?.thumbnail || dealProduct.product_image_url;
                      const productDescription = dealProduct.product?.description || dealProduct.product_description;
                      const originalPrice = dealProduct.product?.original_price || dealProduct.original_price || 0;
                      
                      return (
                        <div key={dealProduct.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                          {productImage && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                              <Image
                                src={productImage}
                                alt={productName}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{productName}</h3>
                            {productDescription && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{productDescription}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              {originalPrice > 0 && (
                                <span>Original: <span className="line-through">{formatCurrency(originalPrice)}</span></span>
                              )}
                              {dealProduct.deal_price && (
                                <span className="font-semibold text-orange-600">Deal Price: {formatCurrency(dealProduct.deal_price)}</span>
                              )}
                              {dealProduct.discount_percentage > 0 && (
                                <span>Discount: {dealProduct.discount_percentage}%</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setEditingProduct(dealProduct);
                                setShowAddProductModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              icon={<Edit size={16} />}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleRemoveProduct(selectedDeal.id, dealProduct.product_id || dealProduct.id)}
                              variant="outline"
                              size="sm"
                              icon={<Trash2 size={16} />}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Picker */}
        {showMediaPicker && (
          <MediaPicker
            isOpen={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={handleImageSelect}
          />
        )}

        {/* Add/Edit Product Modal */}
        {showAddProductModal && selectedDeal && (
          <AddProductToDealModal
            isOpen={showAddProductModal}
            onClose={() => {
              setShowAddProductModal(false);
              setEditingProduct(null);
            }}
            dealId={selectedDeal.id}
            dealTitle={selectedDeal.title}
            dealDiscountPercentage={selectedDeal.discount_percentage || 0}
            editingProduct={editingProduct || undefined}
            onSuccess={() => {
              if (selectedDeal) {
                handleViewProducts(selectedDeal);
              }
              setEditingProduct(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

