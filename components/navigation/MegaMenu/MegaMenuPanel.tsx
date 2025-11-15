'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { MegaMenuCategory } from '@/types/megaMenu';
import { useMegaMenuStore } from '@/store/megaMenuStore';

interface MegaMenuPanelProps {
  category: MegaMenuCategory;
}

export const MegaMenuPanel: React.FC<MegaMenuPanelProps> = ({ category }) => {
  const { closeMenu } = useMegaMenuStore();

  const columnCount = category.columns.length + 1; // +1 for category image on far right

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40" 
        onClick={closeMenu}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
        style={{ minWidth: '700px', maxWidth: '900px' }}
      >
        <div className="p-6">
          <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
            {/* Columns */}
            {category.columns.map((column, index) => (
              <div key={index}>
                <h3 className="font-bold text-sm text-[#1A1A1A] mb-3 pb-2 border-b border-gray-200">
                  {column.title}
                </h3>
                <ul className="space-y-2">
                  {column.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center justify-between text-sm text-[#3A3A3A] hover:text-[#00afef] hover:translate-x-1 transition-all group"
                      >
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            item.badge.color === 'orange' ? 'bg-blue-100 text-[#00afef]' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.badge.text}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Category Image Section - Far Right */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <Link href={`/categories/${category.slug}`} onClick={closeMenu}>
                <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={category.image || '/placeholders/placeholder-category.webp'}
                    alt={category.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-bold text-sm text-[#1A1A1A] mb-2">
                  {category.title}
                </h4>
                <div className="flex items-center gap-1 text-[#00afef] text-xs font-semibold">
                  <span>Shop Now</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};


