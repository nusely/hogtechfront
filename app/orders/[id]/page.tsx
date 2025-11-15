'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/loaders/Spinner';
import { ChevronLeft, Package, MapPin, CreditCard, FileText, Zap } from 'lucide-react';
import { Order } from '@/types/order';
import { orderService } from '@/services/order.service';
import { useAppSelector, useAppDispatch } from '@/store';
import { clearCart } from '@/store/cartSlice';
import { formatCurrency, formatDate, getOrderStatusColor } from '@/lib/helpers';
import { formatOrderVariants } from '@/lib/variantFormatter';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formattedVariants, setFormattedVariants] = useState<{ [key: number]: any[] }>({});
  const [isCancelling, setIsCancelling] = useState(false);

  const transformOrder = (data: any): Order => {
    const deliveryOption =
      data.delivery_option ||
      data.shipping_address?.delivery_option ||
      data.delivery_address?.delivery_option || {
        id: 'standard',
        name: 'Standard Delivery',
        description: 'Standard delivery option',
        price: data.shipping_fee || data.delivery_fee || 0,
      };

    return {
      ...data,
      items: data.items || data.order_items || [],
      delivery_address: data.shipping_address || data.delivery_address,
      delivery_option: deliveryOption,
      delivery_fee: data.shipping_fee || data.delivery_fee || 0,
      tax: data.tax ?? data.tax_amount ?? 0,
    };
  };

  useEffect(() => {
    // Check for payment success callback
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment');
    const paymentReference = urlParams.get('reference');
    
    if (paymentSuccess === 'success' && paymentReference) {
      // Clear cart if payment was successful
      const shouldClearCart = sessionStorage.getItem('clear_cart_after_payment');
      if (shouldClearCart === 'true') {
        dispatch(clearCart());
        sessionStorage.removeItem('clear_cart_after_payment');
      }
      
      // Clear checkout session data
      sessionStorage.removeItem('pending_checkout_data');
      sessionStorage.removeItem('pending_payment_reference');
      
      toast.success('Payment successful! Order created.');
    }
    
    if (user) {
      fetchOrder();
    }
  }, [user, orderId, dispatch]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const data = await orderService.getOrderById(orderId);
      const formattedOrder = transformOrder(data);
      setOrder(formattedOrder);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );

    if (!confirmCancel) {
      return;
    }

    try {
      setIsCancelling(true);
      const updatedOrder = await orderService.cancelOrder(order.id, 'Cancelled by customer');
      const formattedOrder = transformOrder(updatedOrder);
      setOrder(formattedOrder);
      toast.success('Order cancelled successfully.');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link href="/orders">
            <Button variant="primary">Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders">
            <Button variant="ghost" size="sm" icon={<ChevronLeft size={16} />} className="mb-4">
              Back to Orders
            </Button>
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Details</h1>
              <p className="text-gray-600">Order #{order.order_number}</p>
            </div>
            <Badge className={getOrderStatusColor(order.status)} size="lg">
              {order.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const itemVariants = formattedVariants[index] || [];
                  const isFlashDeal = (item as any).is_flash_deal;
                  
                  return (
                    <div key={index} className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.product_image ? (
                          <Image
                            src={item.product_image}
                            alt={item.product_name || 'Product'}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="text-gray-400 m-auto mt-4" size={32} />
                        )}
                        {isFlashDeal && (
                          <div className="absolute top-1 right-1 bg-[#00afef] text-white rounded-full p-1">
                            <Zap size={12} className="fill-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <p className="font-semibold text-gray-900">{item.product_name}</p>
                          {isFlashDeal && (
                            <Badge variant="error" size="sm">
                              <Zap size={10} className="mr-1" />
                              Flash Deal
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Quantity: {item.quantity}</p>
                        {itemVariants.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {itemVariants.map((variant, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {variant.attribute_name}: {variant.option_label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">
                          {formatCurrency((item as any).total_price || item.subtotal || (item.unit_price * item.quantity))}
                        </p>
                        <p className="text-sm text-gray-600">{formatCurrency(item.unit_price)} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Address */}
            {(order.delivery_address || order.shipping_address) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} />
                  Delivery Address
                </h2>
                <div className="text-gray-600">
                  {(order.delivery_address || order.shipping_address)?.full_name && (
                    <p className="font-semibold text-gray-900 mb-1">
                      {(order.delivery_address || order.shipping_address).full_name}
                    </p>
                  )}
                  {(order.delivery_address || order.shipping_address)?.phone && (
                    <p>{(order.delivery_address || order.shipping_address).phone}</p>
                  )}
                  {(order.delivery_address || order.shipping_address)?.street_address && (
                    <p>{(order.delivery_address || order.shipping_address).street_address}</p>
                  )}
                  {(order.delivery_address || order.shipping_address)?.city && (
                    <p>
                      {(order.delivery_address || order.shipping_address).city}
                      {(order.delivery_address || order.shipping_address)?.region && 
                        `, ${(order.delivery_address || order.shipping_address).region}`}
                    </p>
                  )}
                  {(order.delivery_address || order.shipping_address)?.postal_code && (
                    <p>{(order.delivery_address || order.shipping_address).postal_code}</p>
                  )}
                  {(order.delivery_address || order.shipping_address)?.country && (
                    <p>{(order.delivery_address || order.shipping_address).country}</p>
                  )}
                </div>
              </div>
            )}

            {/* Payment & Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard size={18} />
                  Payment Method
                </h3>
                <p className="text-gray-600 capitalize">{order.payment_method.replace('_', ' ')}</p>
                <Badge
                  className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  size="sm"
                >
                  {order.payment_status.toUpperCase()}
                </Badge>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Package size={18} />
                  Delivery Option
                </h3>
                {order.delivery_option || (order.shipping_address as any)?.delivery_option || (order.delivery_address as any)?.delivery_option ? (
                  <>
                    <p className="text-gray-900 font-medium">
                      {(order.delivery_option || (order.shipping_address as any)?.delivery_option || (order.delivery_address as any)?.delivery_option)?.name || 'Standard Delivery'}
                    </p>
                    {(order.delivery_option || (order.shipping_address as any)?.delivery_option || (order.delivery_address as any)?.delivery_option)?.description && (
                      <p className="text-sm text-gray-600">
                        {(order.delivery_option || (order.shipping_address as any)?.delivery_option || (order.delivery_address as any)?.delivery_option).description}
                      </p>
                    )}
                    {((order as any).shipping_fee || order.delivery_fee) && (
                      <p className="text-sm text-gray-600 mt-1">
                        Fee: {formatCurrency((order as any).shipping_fee || order.delivery_fee || 0)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">Standard Delivery</p>
                )}
              </div>
            </div>

            {/* Order Notes */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={18} />
                  Order Notes
                </h3>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Order Date</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tracking #</span>
                    <span className="font-mono text-sm">{order.tracking_number}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.delivery_fee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {order.status === 'pending' && (
                  <Button
                    variant="danger"
                    size="md"
                    className="w-full"
                    onClick={handleCancelOrder}
                    isLoading={isCancelling}
                  >
                    Cancel Order
                  </Button>
                )}
                <Button variant="outline" size="md" className="w-full">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



