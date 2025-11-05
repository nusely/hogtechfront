'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/loaders/Spinner';
import { Package, MapPin, CreditCard, Search, Eye } from 'lucide-react';
import { formatCurrency, formatDate, getOrderStatusColor } from '@/lib/helpers';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  total: number;
  subtotal: number;
  shipping_fee: number;
  created_at: string;
  tracking_number?: string;
  shipping_address?: any;
  delivery_address?: any;
  payment_method: string;
  order_items?: any[];
  items?: any[];
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const orderNumberFromUrl = searchParams.get('order_number');

  const [orderNumber, setOrderNumber] = useState(orderNumberFromUrl || '');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (orderNumberFromUrl) {
      setOrderNumber(orderNumberFromUrl);
      // Auto-search if order number is in URL
      // Note: We still need email for security, but we can pre-fill if available
    }
  }, [orderNumberFromUrl]);

  const trackOrder = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    setOrder(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/orders/track`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_number: orderNumber.trim(),
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track order');
      }

      if (data.success && data.data) {
        setOrder(data.data);
        toast.success('Order found!');
      } else {
        setOrder(null);
        toast.error(data.message || 'Order not found');
      }
    } catch (error: any) {
      console.error('Error tracking order:', error);
      setOrder(null);
      toast.error(error.message || 'Failed to track order. Please check your order number and email.');
    } finally {
      setIsLoading(false);
    }
  };

  const orderItems = order?.items || order?.order_items || [];
  const deliveryAddress = order?.delivery_address || order?.shipping_address;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Search size={32} />
            Track Your Order
          </h1>
          <p className="text-gray-600 mb-6">
            Enter your order number and email address to track your order status
          </p>

          <form onSubmit={trackOrder} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Order Number"
                name="order_number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD-001051125"
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full md:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </form>
        </div>

        {searched && !isLoading && (
          <>
            {order ? (
              <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Order {order.order_number}
                      </h2>
                      <p className="text-gray-600">
                        Placed on {formatDate(order.created_at)}
                      </p>
                    </div>
                    <Badge
                      className={getOrderStatusColor(order.status)}
                      size="lg"
                    >
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>

                  {order.tracking_number && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-800">
                        <strong>Tracking Number:</strong> {order.tracking_number}
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                {orderItems.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Package size={20} />
                      Order Items
                    </h3>
                    <div className="space-y-4">
                      {orderItems.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex gap-4 p-4 border border-gray-200 rounded-lg"
                        >
                          {item.product_image && (
                            <div className="relative w-20 h-20 flex-shrink-0">
                              <Image
                                src={item.product_image}
                                alt={item.product_name || 'Product'}
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {item.product_name || 'Product'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity || 1}
                            </p>
                            {item.selected_variants && (
                              <p className="text-xs text-gray-500 mt-1">
                                {Object.entries(item.selected_variants)
                                  .map(([key, value]: [string, any]) => `${key}: ${value}`)
                                  .join(', ')}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {formatCurrency(item.total_price || item.subtotal || 0)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(item.unit_price || item.price || 0)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(order.subtotal || order.total || 0)}</span>
                        </div>
                        {order.shipping_fee && order.shipping_fee > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>Shipping:</span>
                            <span>{formatCurrency(order.shipping_fee)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                          <span>Total:</span>
                          <span>{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping & Payment Info */}
                {deliveryAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={18} />
                        Shipping Address
                      </h3>
                      <div className="text-gray-600 space-y-1">
                        {deliveryAddress.full_name && (
                          <p className="font-semibold">{deliveryAddress.full_name}</p>
                        )}
                        {deliveryAddress.street_address && (
                          <p>{deliveryAddress.street_address}</p>
                        )}
                        {deliveryAddress.city && (
                          <p>
                            {deliveryAddress.city}
                            {deliveryAddress.region && `, ${deliveryAddress.region}`}
                          </p>
                        )}
                        {deliveryAddress.postal_code && (
                          <p>{deliveryAddress.postal_code}</p>
                        )}
                        {deliveryAddress.country && (
                          <p>{deliveryAddress.country}</p>
                        )}
                        {deliveryAddress.phone && (
                          <p className="mt-2">Phone: {deliveryAddress.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard size={18} />
                        Payment Method
                      </h3>
                      <p className="text-gray-600 capitalize mb-2">
                        {order.payment_method.replace('_', ' ')}
                      </p>
                      <Badge
                        className={
                          order.payment_status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                        size="sm"
                      >
                        {order.payment_status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
                  <p className="text-blue-800 text-sm mb-4">
                    If you have any questions about your order, please contact our customer support team.
                  </p>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>📧 ventechgadgets@gmail.com</p>
                    <p>📞 +233 55 134 4310</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Order Not Found
                </h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find an order with that order number and email address.
                </p>
                <p className="text-sm text-gray-500">
                  Please double-check your order number and email address, or contact support if you need assistance.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

