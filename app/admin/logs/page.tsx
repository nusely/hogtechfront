'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { logService, AdminLogEntry } from '@/services/log.service';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const formatDuration = (value?: number | null) => {
  if (!value || value < 0) return '—';
  if (value < 1000) return `${value}ms`;
  return `${(value / 1000).toFixed(2)}s`;
};

export default function AdminLogsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const isWhitelisted =
      user?.email?.toLowerCase() === 'cimons@hogtechgh.com';

    if (!user || (user.role !== 'superadmin' && !isWhitelisted)) {
      router.push('/admin');
      return;
    }

    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const result = await logService.getAdminLogs(page, 50);
        setLogs(result.logs);
        setTotalPages(result.pagination.totalPages || 1);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load admin logs:', err);
        setError(err?.message || 'Failed to load logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [isAuthenticated, user, page, router]);

  const isWhitelisted =
    user?.email?.toLowerCase() === 'cimons@hogtechgh.com';

  if (!user || (user.role !== 'superadmin' && !isWhitelisted)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Audit Logs</h1>
              <p className="text-sm text-gray-600">
                Real-time record of admin and superadmin actions across the platform.
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-[#00afef]" />
                        Loading logs...
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No admin activity recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{log.action}</div>
                        {log.metadata?.path && (
                          <div className="text-xs text-gray-500">{log.metadata.method} {log.metadata.path}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-gray-900 font-medium">{log.user_id || 'Unknown'}</span>
                          <span className="text-xs text-gray-500">{log.role || 'n/a'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={log.status_code && log.status_code >= 400 ? 'error' : 'success'}>
                          {log.status_code || '—'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDuration(log.duration_ms)}</td>
                      <td className="px-6 py-4 text-gray-700">{log.ip_address || '—'}</td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm">
            <span className="text-gray-600">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page >= totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

