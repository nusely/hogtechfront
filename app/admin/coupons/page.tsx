'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  Ticket,
  Users,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { listCoupons, deleteCoupon, Coupon } from '@/services/coupon.service';
import { CouponModal } from '@/components/admin/CouponModal';
import { formatCurrency } from '@/lib/helpers';

export default function CouponsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }
    fetchCoupons();
  }, [isAuthenticated, user, router, page, searchQuery, statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const result = await listCoupons(page, 10, searchQuery, statusFilter !== 'all' ? statusFilter : undefined);
      setCoupons(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setShowModal(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete coupon');
    }
  };

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date();
    const startDate = new Date(coupon.start_date);
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;
    
    let status = 'Active';
    let color = 'bg-green-100 text-green-800';

    if (!coupon.is_active) {
      status = 'Inactive';
      color = 'bg-gray-100 text-gray-800';
    } else if (startDate > now) {
      status = 'Scheduled';
      color = 'bg-blue-100 text-blue-800';
    } else if (endDate && endDate < now) {
      status = 'Expired';
      color = 'bg-red-100 text-red-800';
    } else if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      status = 'Depleted';
      color = 'bg-yellow-100 text-yellow-800';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin')) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-600">Manage discount codes and promotions</p>
        </div>
        <Button onClick={handleCreate} variant="primary" className="flex items-center gap-2">
          <Plus size={20} />
          Create Coupon
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afef] focus:border-transparent"
          />
        </div>
        <div className="w-full md:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00afef] focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Discount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Validity</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{coupon.code}</span>
                        <span className="text-xs text-gray-500">{coupon.description || 'No description'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700 font-medium">
                        {coupon.discount_type === 'percentage' && <span className="text-blue-600">{coupon.discount_value}% OFF</span>}
                        {coupon.discount_type === 'fixed_amount' && <span className="text-green-600">{formatCurrency(coupon.discount_value)} OFF</span>}
                        {coupon.discount_type === 'free_shipping' && <span className="text-purple-600">Free Shipping</span>}
                      </div>
                      {coupon.min_purchase_amount > 0 && (
                        <div className="text-xs text-gray-500">Min: {formatCurrency(coupon.min_purchase_amount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {coupon.used_count} / {coupon.usage_limit || '∞'} used
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        <div>{new Date(coupon.start_date).toLocaleDateString()}</div>
                        {coupon.end_date && (
                          <div className="text-xs text-gray-500">to {new Date(coupon.end_date).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(coupon)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-1 text-gray-500 hover:text-[#00afef] transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <CouponModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchCoupons}
        coupon={editingCoupon}
      />
    </div>
  );
}

