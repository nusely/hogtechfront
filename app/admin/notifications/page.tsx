'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  ShoppingCart,
  Package,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { buildApiUrl } from '@/lib/api';

interface Notification {
  id: string;
  type: 'order' | 'stock' | 'user' | 'alert' | 'success';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

type NotificationType = Notification['type'];
type NotificationTypeFilter = NotificationType | 'all';

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diffMs = Date.now() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diffSeconds < 60) return `${Math.max(diffSeconds, 1)}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days <= 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

const typeFilterOptions: Array<{ label: string; value: NotificationTypeFilter; icon: JSX.Element }> = [
  { label: 'All Types', value: 'all', icon: <Bell size={14} /> },
  { label: 'Orders', value: 'order', icon: <ShoppingCart size={14} /> },
  { label: 'Stock', value: 'stock', icon: <Package size={14} /> },
  { label: 'Customers', value: 'user', icon: <Users size={14} /> },
  { label: 'Alerts', value: 'alert', icon: <AlertCircle size={14} /> },
  { label: 'Success', value: 'success', icon: <CheckCircle size={14} /> },
];

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch real data from Supabase
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;

    try {
      if (silent) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const url = new URL(buildApiUrl('/api/notifications'));
      url.searchParams.set('limit', '200');

      const response = await fetch(url.toString(), {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications (${response.status})`);
      }

      const payload = await response.json();
      const notificationData = payload?.data?.notifications || [];

      setNotifications(notificationData);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchNotifications({ silent: true });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={20} className="text-blue-600" />;
      case 'stock':
        return <Package size={20} className="text-orange-600" />;
      case 'user':
        return <Users size={20} className="text-purple-600" />;
      case 'alert':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-blue-50';
      case 'stock':
        return 'bg-orange-50';
      case 'user':
        return 'bg-purple-50';
      case 'alert':
        return 'bg-red-50';
      case 'success':
        return 'bg-green-50';
      default:
        return 'bg-gray-50';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const targetExists = notifications.some((n) => n.id === notificationId);
      if (!targetExists) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(buildApiUrl(`/api/notifications/${notificationId}/read`), {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read (${response.status})`);
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const hasUnread = notifications.some((n) => !n.is_read);
      if (!hasUnread) {
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(buildApiUrl('/api/notifications/read-all'), {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notifications as read (${response.status})`);
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const response = await fetch(buildApiUrl(`/api/notifications/${notificationId}`), {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification (${response.status})`);
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    let data = [...notifications];

    if (filter === 'unread') {
      data = data.filter((n) => !n.is_read);
    }

    if (typeFilter !== 'all') {
      data = data.filter((n) => n.type === typeFilter);
    }

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      data = data.filter((n) => {
        const titleMatch = n.title?.toLowerCase().includes(query) ?? false;
        const messageMatch = n.message?.toLowerCase().includes(query) ?? false;
        return titleMatch || messageMatch;
      });
    }

    return data;
  }, [notifications, filter, typeFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Notifications</h1>
          <p className="text-sm text-[#3A3A3A] mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All notifications are read'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button variant="primary" size="sm" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-[#FF7A19] text-white'
                  : 'bg-gray-100 text-[#3A3A3A] hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-[#FF7A19] text-white'
                  : 'bg-gray-100 text-[#3A3A3A] hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF7A19] focus:border-transparent"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {typeFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTypeFilter(option.value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors flex items-center gap-1.5 ${
                typeFilter === option.value
                  ? 'bg-[#FF7A19] text-white border-[#FF7A19]'
                  : 'bg-white text-[#3A3A3A] border-gray-200 hover:border-[#FF7A19]'
              }`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-[#3A3A3A]">No notifications to display</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${
                notification.is_read ? 'bg-white' : getBgColor(notification.type)
              } rounded-xl shadow-sm border ${
                notification.is_read ? 'border-gray-200' : 'border-gray-300'
              } p-5 hover:shadow-md transition-all`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A1A1A] mb-1">
                        {notification.title}
                        {!notification.is_read && (
                          <span className="ml-2 inline-block w-2 h-2 bg-[#FF7A19] rounded-full"></span>
                        )}
                      </h3>
                      <p className="text-sm text-[#3A3A3A] mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-200 rounded-full capitalize">
                          {notification.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle size={18} className="text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 hover:bg-white rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  {notification.action_url && (
                    <a
                      href={notification.action_url}
                      className="inline-block mt-3 text-sm text-[#FF7A19] hover:underline font-semibold"
                    >
                      View Details →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


