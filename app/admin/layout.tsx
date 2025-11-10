'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppSelector } from '@/store';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  FolderTree,
  Tag,
  Image,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  DollarSign,
  ShoppingCart,
  Heart,
  CreditCard,
  ChevronLeft,
  Percent,
  Star,
  Zap,
  SlidersHorizontal,
  ScrollText,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { signOut } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { buildApiUrl } from '@/lib/api';

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  badge?: number;
  children?: MenuItem[];
}

interface NotificationPreview {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string | null;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return <ShoppingCart size={16} className="text-blue-600" />;
    case 'stock':
      return <Package size={16} className="text-orange-600" />;
    case 'user':
      return <Users size={16} className="text-purple-600" />;
    case 'alert':
      return <AlertCircle size={16} className="text-red-600" />;
    case 'success':
      return <CheckCircle size={16} className="text-green-600" />;
    default:
      return <Bell size={16} className="text-gray-500" />;
  }
};

const getNotificationAccent = (type: string) => {
  switch (type) {
    case 'order':
      return 'bg-blue-50 text-blue-600';
    case 'stock':
      return 'bg-orange-50 text-orange-600';
    case 'user':
      return 'bg-purple-50 text-purple-600';
    case 'alert':
      return 'bg-red-50 text-red-600';
    case 'success':
      return 'bg-green-50 text-green-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['products', 'analytics']);
  const [mounted, setMounted] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number | undefined>(undefined);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number | undefined>(undefined);
  const [notificationsPreview, setNotificationsPreview] = useState<NotificationPreview[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);
  }, []);

  // Fetch badge counts
  const hasAdminPrivileges = (role?: string | null) =>
    role === 'admin' || role === 'superadmin';

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user || !hasAdminPrivileges(user.role)) {
      setNotificationsPreview([]);
      setUnreadNotificationsCount(undefined);
      setNotificationsError(null);
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError(null);

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

      const response = await fetch(buildApiUrl(`/api/notifications?limit=8`), {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications (${response.status})`);
      }

      const payload = await response.json();
      const preview = payload?.data?.notifications || [];
      const unreadCount = payload?.data?.unread_count ?? 0;

      setNotificationsPreview(preview);
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error('Error loading notifications preview:', error);
      setNotificationsError('Unable to load notifications right now.');
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadBadgeData = useCallback(async () => {
    if (!isAuthenticated || !user || !hasAdminPrivileges(user.role)) {
      setNotificationsPreview([]);
      setUnreadNotificationsCount(undefined);
      return;
    }

    try {
      const { count: pendingCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (!ordersError) {
        setPendingOrdersCount(pendingCount || 0);
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
    }

    await loadNotifications();
  }, [isAuthenticated, user, loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !user || !hasAdminPrivileges(user.role)) {
      setNotificationsPreview([]);
      setUnreadNotificationsCount(undefined);
      return;
    }

    loadBadgeData();

    const interval = setInterval(loadBadgeData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, loadBadgeData]);

  const toggleNotificationsDropdown = () => {
    setShowNotificationsDropdown((prev) => {
      const next = !prev;
      if (!prev) {
        // Ensure preview is up-to-date when opening
        loadNotifications();
      }
      return next;
    });
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const target = notificationsPreview.find((notification) => notification.id === id);
      if (!target || target.is_read) {
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

      const response = await fetch(buildApiUrl(`/api/notifications/${id}/read`), {
        method: 'PATCH',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read (${response.status})`);
      }

      setNotificationsPreview((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadNotificationsCount((prev) => {
        if (!prev || prev <= 0) {
          return 0;
        }
        return prev - 1;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const unreadIds = notificationsPreview.filter((notification) => !notification.is_read);
      if (unreadIds.length === 0) {
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

      setNotificationsPreview((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotificationById = async (id: string) => {
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

      const response = await fetch(buildApiUrl(`/api/notifications/${id}`), {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification (${response.status})`);
      }

      setNotificationsPreview((prev) => prev.filter((notification) => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification: NotificationPreview) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id);
    }
    setShowNotificationsDropdown(false);

    if (notification.action_url) {
      if (notification.action_url.startsWith('http')) {
        window.open(notification.action_url, '_blank');
      } else {
        router.push(notification.action_url);
      }
    } else {
      router.push('/admin/notifications');
    }
  };

  useEffect(() => {
    // Wait for component to mount and auth state to finish loading before checking
    if (!mounted || isLoading) {
      return; // Still mounting or loading auth state, don't redirect yet
    }

    // Longer delay to ensure auth state is fully settled after INITIAL_SESSION
    // INITIAL_SESSION can cause temporary state where isLoading is false but user isn't loaded yet
    const timeoutId = setTimeout(() => {
      // Double-check: Wait a bit more if user is still null but we're not loading
      if (!user && !isLoading) {
        // Check session directly from Supabase as a fallback
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session) {
            // No session - redirect to login
            if (pathname !== '/login' && pathname !== '/register') {
              router.replace('/login');
            }
          }
        });
        return;
      }
      
      // After loading is complete, check authentication status
      // Only redirect if we're absolutely certain the user is not authenticated or not admin
      if (!isAuthenticated || !user) {
        // User is not authenticated after loading completed
        // Only redirect if we're not already on login page to avoid loops
        if (pathname !== '/login' && pathname !== '/register') {
          router.replace('/login');
        }
        return;
      }
      
      if (!hasAdminPrivileges(user.role)) {
        // User is authenticated but not admin
        if (pathname !== '/') {
          router.replace('/');
          toast.error('Access denied. Admin only.');
        }
        return;
      }
      
      // User is authenticated and is admin - allow access
    }, 500); // Increased delay to handle INITIAL_SESSION

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, isLoading, mounted, router, pathname]);

  useEffect(() => {
    if (!showNotificationsDropdown) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotificationsDropdown]);

  useEffect(() => {
    setShowNotificationsDropdown(false);
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/admin',
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      children: [
        { icon: DollarSign, label: 'Revenue', href: '/admin/analytics/revenue' },
        { icon: ShoppingCart, label: 'Sales', href: '/admin/analytics/sales' },
        { icon: Users, label: 'Customers', href: '/admin/analytics/customers' },
      ],
    },
    {
      icon: ShoppingBag,
      label: 'Orders',
      href: '/admin/orders',
      badge: pendingOrdersCount !== undefined ? (pendingOrdersCount > 0 ? pendingOrdersCount : undefined) : undefined,
    },
    {
      icon: Package,
      label: 'Products',
      children: [
        { icon: Package, label: 'All Products', href: '/admin/products' },
        { icon: FolderTree, label: 'Categories', href: '/admin/categories' },
        { icon: Tag, label: 'Brands', href: '/admin/brands' },
      ],
    },
    {
      icon: Users,
      label: 'Customers',
      href: '/admin/users',
    },
    {
      icon: CreditCard,
      label: 'Transactions',
      href: '/admin/transactions',
    },
    {
      icon: Heart,
      label: 'Wishlist Insights',
      href: '/admin/wishlist-insights',
    },
    {
      icon: ShoppingCart,
      label: 'Cart Analytics',
      href: '/admin/cart-analytics',
    },
    {
      icon: Star,
      label: 'Reviews',
      href: '/admin/reviews',
    },
    {
      icon: Image,
      label: 'Media Library',
      href: '/admin/media',
    },
    {
      icon: Image,
      label: 'Marketing',
      children: [
        { icon: Package, label: 'Deals', href: '/admin/deals' },
        { icon: Image, label: 'Banners', href: '/admin/banners' },
        { icon: Image, label: 'Sidebar Ads', href: '/admin/sidebar-ads' },
        { icon: Tag, label: 'Coupons', href: '/admin/coupons' },
      ],
    },
    {
      icon: Bell,
      label: 'Notifications',
      href: '/admin/notifications',
      badge: unreadNotificationsCount !== undefined ? (unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined) : undefined,
    },
    {
      icon: SlidersHorizontal,
      label: 'Main Settings',
      href: '/admin/main-settings',
    },
  ];

  const isAuditWhitelisted = user?.email?.toLowerCase() === 'cimons@ventechgadgets.com';

  if (user?.role === 'superadmin' || (user?.role === 'admin' && isAuditWhitelisted)) {
    menuItems.splice(1, 0, {
      icon: ScrollText,
      label: 'Audit Logs',
      href: '/admin/logs',
    });
  }

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    // Render a minimal loading state that matches server-side rendering
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" suppressHydrationWarning>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading state while auth is being checked
  // This prevents unnecessary redirects during page refresh
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF7A19] mx-auto mb-4"></div>
          <p className="text-[#3A3A3A]">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // After loading is complete, check if user is authenticated and is admin
  // Only render if authenticated as admin, otherwise useEffect will handle redirect
  if (!isAuthenticated || !user || !hasAdminPrivileges(user.role)) {
    // Don't render anything while redirect is happening
    // This prevents flash of content
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-[#1A1A1A] text-white transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img
                src="/logo/ventech_logo-white.png"
                alt="VENTECH"
                className="h-8 w-auto object-contain"
              />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Admin Info */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF7A19] rounded-full flex items-center justify-center font-bold">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                // Expandable menu item
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors ${
                      !sidebarOpen && 'justify-center'
                    }`}
                  >
                    <item.icon size={20} />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-sm">{item.label}</span>
                        {expandedMenus.includes(item.label) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </>
                    )}
                  </button>
                  {expandedMenus.includes(item.label) && sidebarOpen && (
                    <div className="bg-gray-800">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href || '#'}
                          className={`flex items-center gap-3 px-4 py-2 pl-12 hover:bg-gray-700 transition-colors text-sm ${
                            isActive(child.href) ? 'bg-gray-700 text-[#FF7A19]' : ''
                          }`}
                        >
                          <child.icon size={16} />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular menu item
                <Link
                  href={item.href || '#'}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-700 transition-colors relative ${
                    !sidebarOpen && 'justify-center'
                  } ${isActive(item.href) ? 'bg-gray-700 text-[#FF7A19]' : ''}`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-sm">{item.label}</span>
                      {item.badge && (
                        <span className="bg-[#FF7A19] text-white text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {!sidebarOpen && item.badge && (
                    <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600 rounded-lg transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}
      >
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A]">
                {pathname === '/admin'
                  ? 'Dashboard'
                  : pathname.split('/').pop()?.replace('-', ' ').toUpperCase()}
              </h1>
              <p className="text-sm text-[#3A3A3A] mt-1">
                Welcome back, {user?.full_name?.split(' ')[0] || 'Admin'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleNotificationsDropdown}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="View notifications"
                >
                  <Bell size={20} />
                  {unreadNotificationsCount !== undefined && unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">Notifications</p>
                        <p className="text-xs text-gray-500">
                          {unreadNotificationsCount && unreadNotificationsCount > 0
                            ? `${unreadNotificationsCount} unread`
                            : 'All caught up'}
                        </p>
                      </div>
                      {unreadNotificationsCount && unreadNotificationsCount > 0 && (
                        <button
                          onClick={async () => {
                            await markAllNotificationsRead();
                            await loadNotifications();
                          }}
                          className="text-xs text-[#FF7A19] font-semibold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7A19]"></div>
                        </div>
                      ) : notificationsError ? (
                        <div className="py-6 text-center text-sm text-red-500 px-4">
                          {notificationsError}
                        </div>
                      ) : notificationsPreview.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500 px-4">
                          No notifications yet.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-100">
                          {notificationsPreview.map((notification) => (
                            <li key={notification.id}>
                              <button
                                onClick={() => handleNotificationClick(notification)}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                                  notification.is_read ? 'bg-white' : 'bg-orange-50/60'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${getNotificationAccent(notification.type)}`}>
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                                      {notification.title || 'Notification'}
                                    </p>
                                    <p className="text-xs text-[#3A3A3A] line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
                                      <Clock size={12} />
                                      <span>{formatRelativeTime(notification.created_at)}</span>
                                      {!notification.is_read && (
                                        <span className="ml-2 inline-flex text-[10px] uppercase tracking-wide text-[#FF7A19] font-semibold">
                                          New
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                      <Link
                        href="/admin/notifications"
                        className="text-sm font-medium text-[#FF7A19] hover:underline"
                        onClick={() => setShowNotificationsDropdown(false)}
                      >
                        View all notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                View Store →
              </Link>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

