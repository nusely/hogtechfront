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
  Eye, 
  EyeOff, 
  Clock,
  Zap,
  Package,
  X,
  Upload,
  ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MediaPicker } from '@/components/admin/MediaPicker';
import { 
  getAllFlashDealsAdmin,
  createFlashDeal,
  updateFlashDeal,
  deleteFlashDeal,
  getProductsForFlashDeal,
  removeProductFromFlashDeal,
  FlashDeal,
  Product
} from '@/services/flashDeal.service';
import { productService } from '@/services/product.service';
import { CountdownTimer } from '@/components/shop/CountdownTimer';
import { formatCurrency } from '@/lib/helpers';
import Image from 'next/image';

export default function FlashDealsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FlashDeal | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<FlashDeal | null>(null);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner_image_url: '',
    start_time: '',
    end_time: '',
    is_active: true,
  });

  useEffect(() => {
    if (isAuthenticated && user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchFlashDeals();
  }, [isAuthenticated, user, router]);

  const fetchFlashDeals = async () => {
    try {
      setLoading(true);
      const deals = await getAllFlashDealsAdmin(true);
      setFlashDeals(deals);
    } catch (error: any) {
      console.error('Error fetching flash deals:', error);
      toast.error(error.message || 'Failed to load flash deals');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (deal: FlashDeal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      description: deal.description || '',
      banner_image_url: deal.banner_image_url || '',
      start_time: deal.start_time ? new Date(deal.start_time).toISOString().slice(0, 16) : '',
      end_time: deal.end_time ? new Date(deal.end_time).toISOString().slice(0, 16) : '',
      is_active: deal.is_active !== false,
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
      start_time: '',
      end_time: '',
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.start_time || !formData.end_time) {
      toast.error('Please fill in title, start time, and end time');
      return;
    }

    if (new Date(formData.end_time) <= new Date(formData.start_time)) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      if (editingDeal) {
        await updateFlashDeal(editingDeal.id, {
          title: formData.title,
          description: formData.description || undefined,
          banner_image_url: formData.banner_image_url || undefined,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          is_active: formData.is_active,
        });
        toast.success('Flash deal updated successfully');
      } else {
        await createFlashDeal({
          title: formData.title,
          description: formData.description || undefined,
          banner_image_url: formData.banner_image_url || undefined,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          is_active: formData.is_active,
        });
        toast.success('Flash deal created successfully');
      }

      handleCancel();
      fetchFlashDeals();
    } catch (error: any) {
      console.error('Error saving flash deal:', error);
      toast.error(error.message || 'Failed to save flash deal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this flash deal?')) {
      return;
    }

    try {
      await deleteFlashDeal(id);
      toast.success('Flash deal deleted successfully');
      fetchFlashDeals();
    } catch (error: any) {
      console.error('Error deleting flash deal:', error);
      toast.error(error.message || 'Failed to delete flash deal');
    }
  };

  const handleViewProducts = async (deal: FlashDeal) => {
    try {
      setSelectedDeal(deal);
      const products = await getProductsForFlashDeal(deal.id);
      setDealProducts(products);
      setShowProducts(true);
    } catch (error: any) {
      console.error('Error fetching deal products:', error);
      toast.error(error.message || 'Failed to load products');
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!selectedDeal || !confirm('Remove this product from the flash deal?')) {
      return;
    }

    try {
      await removeProductFromFlashDeal(selectedDeal.id, productId);
      toast.success('Product removed from flash deal');
      handleViewProducts(selectedDeal);
    } catch (error: any) {
      console.error('Error removing product:', error);
      toast.error(error.message || 'Failed to remove product');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { uploadImage } = await import('@/services/image-upload.service');
      const result = await uploadImage(file, 'flash-deals', true);
      
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
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const isDealActive = (deal: FlashDeal): boolean => {
    const now = new Date();
    const start = new Date(deal.start_time);
    const end = new Date(deal.end_time);
    return deal.is_active && now >= start && now <= end;
  };

  const getDealStatus = (deal: FlashDeal): 'active' | 'upcoming' | 'expired' | 'inactive' => {
    if (!deal.is_active) return 'inactive';
    const now = new Date();
    const start = new Date(deal.start_time);
    const end = new Date(deal.end_time);
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
            <h1 className="text-2xl font-bold text-gray-900">Flash Deals</h1>
            <p className="text-gray-600 mt-1">Manage flash deal campaigns</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            icon={<Plus size={18} />}
            variant="primary"
          >
            Create Flash Deal
          </Button>
        </div>

        {/* Flash Deals List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {flashDeals.length === 0 ? (
            <div className="p-12 text-center">
              <Zap className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600 mb-4">No flash deals yet</p>
              <Button onClick={() => setShowForm(true)} icon={<Plus size={18} />}>
                Create Your First Flash Deal
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {flashDeals.map((deal) => {
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
                          {!deal.is_active && (
                            <Badge variant="default" size="sm">Disabled</Badge>
                          )}
                        </div>
                        {deal.description && (
                          <p className="text-gray-600 mb-3">{deal.description}</p>
                        )}
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Starts: {new Date(deal.start_time).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>Ends: {new Date(deal.end_time).toLocaleString()}</span>
                          </div>
                        </div>
                        {isDealActive(deal) && (
                          <div className="mt-3">
                            <CountdownTimer endTime={deal.end_time} variant="compact" />
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
                  {editingDeal ? 'Edit Flash Deal' : 'Create Flash Deal'}
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
                  {formData.banner_image_url && (
                    <div className="mb-3">
                      <img
                        src={formData.banner_image_url}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<ImageIcon size={18} />}
                      onClick={() => setShowMediaPicker(true)}
                    >
                      Select from R2/Media Library
                    </Button>
                    <div className="relative flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        id="flash-deal-upload"
                      />
                      <label
                        htmlFor="flash-deal-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors w-full justify-center text-sm"
                      >
                        <Upload size={18} />
                        {uploading ? 'Uploading...' : 'Upload from Local'}
                      </label>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={formData.banner_image_url}
                    onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    placeholder="Or enter image URL directly"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose from media library, upload from PC, or enter URL directly
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>

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

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button type="button" onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    {editingDeal ? 'Update' : 'Create'} Flash Deal
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
                  Products in &quot;{selectedDeal.title}&quot;
                </h2>
                <button
                  onClick={() => {
                    setShowProducts(false);
                    setSelectedDeal(null);
                    setDealProducts([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                {dealProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 mb-4">No products in this flash deal</p>
                    <p className="text-sm text-gray-500">
                      Add products to this deal from the product management page
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dealProducts.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 flex items-center gap-4">
                        {product.thumbnail && (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">
                            Discount: {(product as any).flash_deal_discount || 0}%
                          </p>
                          {(product as any).flash_deal_price && (
                            <p className="text-sm text-gray-600">
                              Deal Price: {formatCurrency((product as any).flash_deal_price)}
                            </p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleRemoveProduct(product.id)}
                          variant="outline"
                          size="sm"
                          icon={<Trash2 size={16} />}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Picker Modal */}
        <MediaPicker
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={(url) => {
            setFormData(prev => ({ ...prev, banner_image_url: url }));
            setShowMediaPicker(false);
            toast.success('Image selected from media library');
          }}
          folder="flash-deals"
        />
      </div>
    </div>
  );
}

