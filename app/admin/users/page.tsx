'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  ChevronLeft,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Eye,
  Download,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppSelector } from '@/store';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { CSVExporter, CustomerColumns } from '@/lib/csvExport';
import { buildApiUrl } from '@/lib/api';

interface CustomerRecord {
  id: string;
  user_id: string | null;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  source: string | null;
  created_at: string;
  last_order_at: string | null;
  newsletter_subscribed: boolean;
}

const normalizeName = (rawName: string | null | undefined) => {
  if (!rawName) {
    return { first: 'Guest', last: 'Customer', full: 'Guest Customer' };
  }
  const trimmed = rawName.trim();
  if (!trimmed) {
    return { first: 'Guest', last: 'Customer', full: 'Guest Customer' };
  }
  const parts = trimmed.split(/\s+/);
  const first = parts[0] || 'Guest';
  const last = parts.slice(1).join(' ');
  return { first, last, full: trimmed };
};

export default function AdminCustomersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/');
      return;
    }
    fetchCustomers();
  }, [isAuthenticated, user]);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      const token = session?.access_token;
      if (!token) {
        toast.error('Authentication expired. Please sign in again.');
        setCustomers([]);
        return;
      }

      const response = await fetch(buildApiUrl('/api/customers'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        const message = result?.message || response.statusText || 'Failed to fetch customers';
        throw new Error(message);
      }

      const payload = Array.isArray(result.data) ? result.data : [];

      const mapped: CustomerRecord[] = payload.map((record: any) => {
        const joinedUser = Array.isArray(record.user) ? record.user[0] : record.user;

        const nameCandidates = [
          typeof record.full_name === 'string' ? record.full_name : null,
          typeof joinedUser?.full_name === 'string' ? joinedUser.full_name : null,
        ];

        const resolvedName = normalizeName(
          nameCandidates.find((candidate) => candidate && candidate.trim().length > 0) || 'Guest Customer'
        );

        const emailCandidates = [record.email, joinedUser?.email];
        const resolvedEmail = emailCandidates.find((candidate) => candidate && candidate.length > 0) || 'No email on file';

        const phoneCandidates = [record.phone, joinedUser?.phone];
        const resolvedPhone = phoneCandidates.find((candidate) => candidate && candidate.length > 0) || null;

        return {
          id: record.id,
          user_id: record.user_id || null,
          full_name: resolvedName.full,
          first_name: resolvedName.first,
          last_name: resolvedName.last,
          email: resolvedEmail,
          phone: resolvedPhone,
          source: record.source || (record.user_id ? 'registered' : 'guest_checkout'),
          created_at: record.created_at,
          last_order_at: record.last_order_at || null,
          newsletter_subscribed: Boolean(joinedUser?.newsletter_subscribed),
        };
      });

      setCustomers(mapped);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      toast.error(error?.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return customers.filter((customer) => {
      const composite = [
        customer.full_name,
        customer.email,
        customer.phone,
        customer.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return composite.includes(searchLower);
    });
  }, [customers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, customers.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleExportCustomers = () => {
    const exportData = filteredCustomers.map((customer) => ({
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone || '',
      newsletter_subscribed: customer.newsletter_subscribed,
      created_at: customer.created_at,
    }));

    CSVExporter.export(exportData, CustomerColumns, 'customers');
    toast.success(`Exported ${exportData.length} customer(s)!`);
  };

  const renderSourceBadge = (source: string | null) => {
    if (!source) {
      return <Badge variant="default">Unknown</Badge>;
    }

    if (source === 'registered') {
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <Shield size={12} /> Registered
        </Badge>
      );
    }

    if (source === 'admin_manual_order') {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <User size={12} /> Admin Created
        </Badge>
      );
    }

    if (source === 'guest_checkout') {
      return (
        <Badge variant="info" className="flex items-center gap-1">
          <User size={12} /> Guest Checkout
        </Badge>
      );
    }

    return <Badge variant="default">{source.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft size={20} />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-[#1A1A1A]">Customers</h1>
                <p className="text-sm text-[#3A3A3A] mt-1">Manage customer accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={16} />}
                onClick={handleExportCustomers}
              >
                Export
              </Button>
              <Badge variant="info">{filteredCustomers.length} customers</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-[#3A3A3A] mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{customers.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-[#3A3A3A] mb-1">Newsletter Subscribers</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {customers.filter((customer) => customer.newsletter_subscribed).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <p className="text-sm text-[#3A3A3A] mb-1">Active This Month</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">
              {customers.filter((customer) => {
                const created = new Date(customer.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3A3A3A]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, email, phone or customer ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A19]"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19]"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-[#FF7A19]" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">No Customers Found</h3>
              <p className="text-[#3A3A3A]">No customers match your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Email</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Phone</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Joined</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Source</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Last Order</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A1A]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedCustomers.map((customer) => {
                    const initials = `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.trim() || 'C';
                    const lastOrder = customer.last_order_at
                      ? new Date(customer.last_order_at).toLocaleDateString()
                      : '—';

                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-[#FF7A19] font-semibold">{initials}</span>
                            </div>
                            <div>
                              <p className="font-medium text-sm text-[#1A1A1A]">{customer.full_name}</p>
                              <p className="text-xs text-gray-500">ID: {customer.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#3A3A3A]">
                            <Mail size={14} />
                            {customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {customer.phone ? (
                            <div className="flex items-center gap-2 text-sm text-[#3A3A3A]">
                              <Phone size={14} />
                              {customer.phone}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#3A3A3A]">
                            <Calendar size={14} />
                            {new Date(customer.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">{renderSourceBadge(customer.source)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[#3A3A3A]">
                            <MapPin size={14} />
                            {lastOrder}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {customer.user_id ? (
                            <Link href={`/admin/users/${customer.user_id}/orders`}>
                              <span className="text-sm text-[#FF7A19] hover:underline cursor-pointer flex items-center gap-1">
                                <Eye size={14} /> View Orders
                              </span>
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-400">Guest checkout</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredCustomers.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg mt-4 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-[#3A3A3A]">
                Showing{' '}
                <span className="font-semibold">
                  {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, filteredCustomers.length)}
                </span>{' '}
                of <span className="font-semibold">{filteredCustomers.length}</span> customers
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm font-medium text-[#1A1A1A]">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


