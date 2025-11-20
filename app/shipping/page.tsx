'use client';

import Link from 'next/link';
import { Package, Truck, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-[#00afef] hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Shipping & Delivery
          </h1>
          <p className="text-lg text-[#3A3A3A] max-w-2xl mx-auto">
            Fast, reliable delivery across Ghana. Get your tech gadgets delivered to your doorstep.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-[#00afef]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Fast Delivery</h3>
            <p className="text-[#3A3A3A]">1-3 days in Accra & Ho<br/>3-5 days nationwide</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-[#00afef]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Free Shipping</h3>
            <p className="text-[#3A3A3A]">On orders over<br/>GHS 500</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#00afef]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Order Tracking</h3>
            <p className="text-[#3A3A3A]">Real-time updates<br/>via SMS & email</p>
          </div>
        </div>

        {/* Delivery Times */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-[#00afef]" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Delivery Times</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-[#1A1A1A] font-semibold">Location</th>
                  <th className="text-left py-4 px-4 text-[#1A1A1A] font-semibold">Delivery Time</th>
                  <th className="text-left py-4 px-4 text-[#1A1A1A] font-semibold">Shipping Fee</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    <strong>Accra</strong>
                    <br/>
                    <span className="text-sm">Greater Accra Region</span>
                  </td>
                  <td className="py-4 px-4 text-[#3A3A3A]">1-2 business days</td>
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    GHS 20<br/>
                    <span className="text-xs text-green-600">Free over GHS 500</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    <strong>Ho</strong>
                    <br/>
                    <span className="text-sm">Volta Region</span>
                  </td>
                  <td className="py-4 px-4 text-[#3A3A3A]">1-3 business days</td>
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    GHS 25<br/>
                    <span className="text-xs text-green-600">Free over GHS 500</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    <strong>Kumasi</strong>
                    <br/>
                    <span className="text-sm">Ashanti Region</span>
                  </td>
                  <td className="py-4 px-4 text-[#3A3A3A]">2-4 business days</td>
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    GHS 30<br/>
                    <span className="text-xs text-green-600">Free over GHS 500</span>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    <strong>Tamale</strong>
                    <br/>
                    <span className="text-sm">Northern Region</span>
                  </td>
                  <td className="py-4 px-4 text-[#3A3A3A]">3-5 business days</td>
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    GHS 40<br/>
                    <span className="text-xs text-green-600">Free over GHS 500</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    <strong>Other Regions</strong>
                    <br/>
                    <span className="text-sm">Cape Coast, Takoradi, Sunyani, etc.</span>
                  </td>
                  <td className="py-4 px-4 text-[#3A3A3A]">3-5 business days</td>
                  <td className="py-4 px-4 text-[#3A3A3A]">
                    GHS 35<br/>
                    <span className="text-xs text-green-600">Free over GHS 500</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-[#3A3A3A]">
              <strong>Note:</strong> Orders placed before 2:00 PM are processed the same day. 
              Orders placed after 2:00 PM will be processed the next business day.
            </p>
          </div>
        </div>

        {/* Shipping Process */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-8 h-8 text-[#00afef]" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">How Shipping Works</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#00afef] text-white flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Order Confirmation</h3>
                <p className="text-[#3A3A3A]">
                  After you place your order, you'll receive an email confirmation with your order details 
                  and estimated delivery date.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#00afef] text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Order Processing</h3>
                <p className="text-[#3A3A3A]">
                  Our team prepares your order, quality checks all items, and carefully packages them 
                  for safe delivery.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#00afef] text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Shipment</h3>
                <p className="text-[#3A3A3A]">
                  Your order is handed to our courier partner. You'll receive a tracking number via 
                  email and SMS.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#00afef] text-white flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Delivery</h3>
                <p className="text-[#3A3A3A]">
                  Our courier will contact you before delivery. Please ensure someone is available to 
                  receive the package and provide ID for verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Areas */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-8 h-8 text-[#00afef]" />
            <h2 className="text-2xl font-bold text-[#1A1A1A]">Delivery Coverage</h2>
          </div>
          <p className="text-[#3A3A3A] mb-4">
            We currently deliver to all regions in Ghana, including:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Greater Accra Region
              </li>
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Volta Region (Ho, Hohoe, Keta, etc.)
              </li>
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Ashanti Region (Kumasi and surrounding)
              </li>
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Northern Region (Tamale, Bolgatanga)
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Western Region (Takoradi, Tarkwa)
              </li>
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Central Region (Cape Coast, Kasoa)
              </li>
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Eastern Region (Koforidua, Mpraeso)
              </li>
              <li className="flex items-center gap-2 text-[#3A3A3A]">
                <CheckCircle className="w-5 h-5 text-green-500" />
                And all other regions!
              </li>
            </ul>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Important Delivery Information</h2>
          <ul className="space-y-3 text-[#3A3A3A]">
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Please provide accurate delivery address and contact information</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Recipient must provide valid ID for verification upon delivery</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Inspect your package before signing for delivery</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Report any damage or missing items within 24 hours</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Delivery times may vary during peak seasons and holidays</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-[#00afef] to-[#163b86] rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Your Delivery?</h2>
          <p className="mb-6">Contact our support team for assistance</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:+2335538865804"
              className="bg-white text-[#00afef] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Call: +233 553 886 5804
            </a>
            <a
              href="mailto:hedgehog.technologies1@gmail.com"
              className="bg-white text-[#00afef] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Email: hedgehog.technologies1@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}



