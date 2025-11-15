'use client';

import Link from 'next/link';
import { RotateCcw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="text-sm text-[#00afef] hover:underline mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            Returns & Refunds
          </h1>
          <p className="text-lg text-[#3A3A3A] max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. Learn about our return policy.
          </p>
        </div>

        {/* Return Policy Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-[#00afef]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">7-Day Returns</h3>
            <p className="text-[#3A3A3A]">Return eligible items within 7 days of delivery</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-[#00afef]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Easy Returns</h3>
            <p className="text-[#3A3A3A]">Simple return process with full refund</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#00afef]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Quality Guaranteed</h3>
            <p className="text-[#3A3A3A]">Defective items replaced at no cost</p>
          </div>
        </div>

        {/* Return Eligibility */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Return Eligibility</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Eligible for Return */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-semibold text-[#1A1A1A]">Eligible for Return</h3>
              </div>
              <ul className="space-y-3 text-[#3A3A3A]">
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Item is unused and in original condition</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>All original packaging, tags, and accessories included</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Return requested within 7 days of delivery</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Product is in resalable condition</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Defective or damaged items (any time)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>Wrong item received</span>
                </li>
              </ul>
            </div>

            {/* Not Eligible for Return */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-semibold text-[#1A1A1A]">Not Eligible for Return</h3>
              </div>
              <ul className="space-y-3 text-[#3A3A3A]">
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Items used, damaged, or altered by customer</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Missing original packaging or accessories</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Software products with broken seals</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Personalized or custom-ordered items</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Items on clearance or final sale</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-500 font-bold">✗</span>
                  <span>Returns requested after 7 days (unless defective)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">How to Return an Item</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00afef] to-[#163b86] text-white flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Contact Us</h3>
                <p className="text-[#3A3A3A] mb-2">
                  Reach out to our customer service team within 7 days of receiving your order:
                </p>
                <ul className="text-[#3A3A3A] space-y-1">
                  <li>📧 Email: <a href="mailto:hedgehog.technologies1@gmail.com" className="text-[#00afef] hover:underline">hedgehog.technologies1@gmail.com</a></li>
                  <li>📞 Phone: <a href="tel:+233551344310" className="text-[#00afef] hover:underline">+233 55 134 4310</a></li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00afef] to-[#163b86] text-white flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Get Return Authorization</h3>
                <p className="text-[#3A3A3A]">
                  Provide your order number, reason for return, and photos if applicable. Our team will 
                  review your request and provide a Return Authorization (RA) number and instructions.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00afef] to-[#163b86] text-white flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Package the Item</h3>
                <p className="text-[#3A3A3A]">
                  Carefully pack the item in its original packaging with all accessories, manuals, and 
                  tags. Include a copy of your invoice and the RA number inside the package.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00afef] to-[#163b86] text-white flex items-center justify-center font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Ship or Drop Off</h3>
                <p className="text-[#3A3A3A] mb-2">
                  <strong>Option A:</strong> Ship the package to our return address (provided in your RA email)
                </p>
                <p className="text-[#3A3A3A]">
                  <strong>Option B:</strong> Drop off at our offices in Accra or Ho (Ho Civic Center Shop #22)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00afef] to-[#163b86] text-white flex items-center justify-center font-bold">
                  5
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">Inspection & Refund</h3>
                <p className="text-[#3A3A3A]">
                  Once we receive and inspect your return (1-2 business days), we'll process your refund 
                  or exchange. Refunds are issued within 5-7 business days to your original payment method.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Refund Information</h2>
          
          <div className="space-y-4 text-[#3A3A3A]">
            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Refund Processing Time</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Inspection: 1-2 business days after we receive your return</li>
                <li>Refund processing: 5-7 business days</li>
                <li>Bank processing time may vary (allow an additional 3-5 days)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Refund Method</h3>
              <p>Refunds are issued to the original payment method:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                <li><strong>Mobile Money:</strong> Instant to same number</li>
                <li><strong>Credit/Debit Card:</strong> 5-10 business days</li>
                <li><strong>Cash on Delivery:</strong> Bank transfer or MoMo (provide details)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#1A1A1A] mb-2">Shipping Costs</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Original shipping fees are non-refundable (unless item was defective/wrong)</li>
                <li>Return shipping costs are the customer's responsibility (unless item was defective/wrong)</li>
                <li>For defective or wrong items, we provide a prepaid return label</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Exchanges */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Exchanges</h2>
          <p className="text-[#3A3A3A] mb-4">
            We gladly offer exchanges for a different size, color, or model of the same product. 
            Follow the same return process and indicate you'd like an exchange instead of a refund.
          </p>
          <ul className="space-y-2 text-[#3A3A3A]">
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Exchanges are subject to product availability</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Price differences may apply and will be charged or refunded accordingly</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#00afef] font-bold">•</span>
              <span>Exchanges are processed within 3-5 business days after receiving the original item</span>
            </li>
          </ul>
        </div>

        {/* Warranty vs Returns */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-[#00afef] flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-3">Returns vs. Warranty</h2>
              <p className="text-[#3A3A3A] mb-3">
                <strong>Returns (7 days):</strong> For change of mind, wrong item, or items that don't 
                meet expectations. Item must be unused and in original condition.
              </p>
              <p className="text-[#3A3A3A]">
                <strong>Warranty Claims (after 7 days):</strong> For defects or malfunctions covered 
                by manufacturer warranty. Contact us with your warranty card and purchase proof.
              </p>
            </div>
          </div>
        </div>

        {/* Defective Items */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Received a Defective Item?</h2>
          <p className="text-[#3A3A3A] mb-4">
            If you receive a defective, damaged, or wrong item:
          </p>
          <ul className="space-y-2 text-[#3A3A3A] mb-4">
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">1.</span>
              <span>Contact us immediately (within 48 hours preferred)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">2.</span>
              <span>Provide photos/videos of the defect or damage</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">3.</span>
              <span>We'll arrange a free replacement or full refund</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-500 font-bold">4.</span>
              <span>We cover all return shipping costs for defective items</span>
            </li>
          </ul>
          <p className="text-[#3A3A3A] font-semibold">
            Your satisfaction is our priority. We'll make it right!
          </p>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-[#00afef] via-[#0d7bc4] to-[#163b86] rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help With a Return?</h2>
          <p className="mb-6">Our customer service team is here to assist you</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:+233551344310"
              className="bg-white text-[#00afef] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Call: +233 55 134 4310
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



