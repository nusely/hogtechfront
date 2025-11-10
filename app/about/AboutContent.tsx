'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Shield,
  Truck,
  Award,
  Users,
  Target,
  Heart,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { getCategories } from '@/services/category.service';
import { Category } from '@/types/product';
import { motion, Variants } from 'framer-motion';
import { fadeIn, fadeInScale, fadeInUp, staggerChildren } from '@/lib/motion';

const missionGridVariants = staggerChildren(0.08, 0.05);
const missionCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
};
const valuesListVariants = staggerChildren(0.1, 0.05);
const valuesItemVariants: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
};

export function AboutContent() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      const list = await getCategories();
      setCategories(list.slice(0, 8));
    })();
  }, []);
  return (
    <motion.main
      className="min-h-screen bg-white"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] py-16" variants={fadeInUp} custom={0.05}>
        <div className="container mx-auto px-4 text-center">
          <motion.h1 className="text-3xl md:text-4xl font-bold mb-4 text-white" variants={fadeInUp} custom={0.08}>
            About VENTECH
          </motion.h1>
          <motion.p className="text-lg text-white/90 max-w-3xl mx-auto" variants={fadeInUp} custom={0.12}>
            Your trusted partner for quality electronics and gadgets in Ghana
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section className="container mx-auto px-4 py-16" variants={fadeInUp} custom={0.1}>
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-12" variants={fadeIn}>
            <motion.div className="inline-flex items-center gap-2 bg-orange-100 text-[#FF7A19] rounded-full px-4 py-2 mb-4" variants={fadeInScale}>
              <Target size={20} />
              <span className="text-sm font-semibold">OUR MISSION</span>
            </motion.div>
            <motion.h2 className="text-3xl font-bold text-[#1A1A1A] mb-4" variants={fadeInUp} custom={0.05}>
              Making Technology Accessible to Everyone
            </motion.h2>
            <motion.p className="text-[#3A3A3A] leading-relaxed" variants={fadeInUp} custom={0.08}>
              At VENTECH, we believe that everyone deserves access to quality technology. 
              We&apos;re committed to providing authentic, high-quality electronics and gadgets 
              at competitive prices, backed by excellent customer service and support.
            </motion.p>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-6" variants={missionGridVariants}>
            <motion.div className="bg-gray-50 rounded-xl p-6 text-center" variants={missionCardVariants}>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-[#FF7A19]" size={28} />
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-2">Quality Assured</h3>
              <p className="text-sm text-[#3A3A3A]">
                100% authentic products from authorized dealers
              </p>
            </motion.div>

            <motion.div className="bg-gray-50 rounded-xl p-6 text-center" variants={missionCardVariants}>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-[#FF7A19]" size={28} />
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-2">Customer First</h3>
              <p className="text-sm text-[#3A3A3A]">
                Dedicated support team always ready to help
              </p>
            </motion.div>

            <motion.div className="bg-gray-50 rounded-xl p-6 text-center" variants={missionCardVariants}>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-[#FF7A19]" size={28} />
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-2">Fast Delivery</h3>
              <p className="text-sm text-[#3A3A3A]">
                Quick and reliable delivery across Ghana
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section className="bg-gray-50 py-16" variants={fadeInUp} custom={0.12}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2 className="text-3xl font-bold text-[#1A1A1A] text-center mb-12" variants={fadeInUp} custom={0.05}>
              Why Choose VENTECH?
            </motion.h2>

            <motion.div className="space-y-8" variants={valuesListVariants}>
              <motion.div className="flex gap-4" variants={valuesItemVariants}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Shield className="text-[#FF7A19]" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">
                    Warranty Protection
                  </h3>
                  <p className="text-[#3A3A3A] text-sm leading-relaxed">
                    All our products come with manufacturer warranty and our 7-day return guarantee. 
                    Shop with confidence knowing you&apos;re protected.
                  </p>
                </div>
              </motion.div>

              <motion.div className="flex gap-4" variants={valuesItemVariants}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Truck className="text-[#FF7A19]" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">
                    Nationwide Delivery
                  </h3>
                  <p className="text-[#3A3A3A] text-sm leading-relaxed">
                    We deliver to all regions in Ghana with express options available. 
                    Track your order every step of the way.
                  </p>
                </div>
              </motion.div>

              <motion.div className="flex gap-4" variants={valuesItemVariants}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Heart className="text-[#FF7A19]" size={24} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1A1A] mb-2">
                    Customer Satisfaction
                  </h3>
                  <p className="text-[#3A3A3A] text-sm leading-relaxed">
                    Our customers are our priority. We go the extra mile to ensure you&apos;re 
                    happy with your purchase and shopping experience.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="container mx-auto px-4 py-16" variants={fadeInUp} custom={0.15}>
        <motion.div className="bg-gradient-to-r from-[#FF7A19] to-[#FF9A19] rounded-2xl p-12 text-center text-white" variants={fadeInScale}>
          <h2 className="text-3xl font-bold mb-4">Ready to Shop?</h2>
          <p className="text-lg text-white/90 mb-8">
            Explore our wide range of quality electronics and gadgets
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/categories">
              <Button variant="secondary" size="lg" icon={<ShoppingBag size={20} />}>
                Browse Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </motion.main>
  );
}

