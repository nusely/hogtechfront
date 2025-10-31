'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  Mail,
  Phone,
  ChevronDown,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { logout as logoutAction } from '@/store/authSlice';
import { Button } from '../ui/Button';
import { MegaMenu } from './MegaMenu';
import { SearchBar } from '../search/SearchBar';
import { signOut } from '@/services/auth.service';
import toast from 'react-hot-toast';

export const NavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { itemCount } = useAppSelector((state) => state.cart);
  const { count: wishlistCount } = useAppSelector((state) => state.wishlist);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/deals', label: 'Deals' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
    { href: '/laptop-banking', label: '💰 Laptop Banking', highlight: true },
  ];

  const handleLogout = async () => {
    try {
      // Clear Redux state first
      dispatch(logoutAction());
      
      // Then sign out from Supabase
      await signOut();
      
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/logo/ventech_logo_1.png"
              alt="VENTECH"
              width={120}
              height={50}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <SearchBar
              placeholder="Search for products, brands, categories..."
              className="w-full"
            />
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Contact Info */}
            <div className="flex flex-col gap-1 pr-4 border-r border-gray-200">
              <a 
                href="tel:+233551344310" 
                className="flex items-center gap-2 text-xs text-[#3A3A3A] hover:text-[#FF7A19] transition-colors"
                title="Call us"
              >
                <Phone size={16} />
                <span className="hidden xl:inline font-medium">+233 55 134 4310</span>
              </a>
              <a 
                href="mailto:ventechgadgets@gmail.com" 
                className="flex items-center gap-2 text-xs text-[#3A3A3A] hover:text-[#FF7A19] transition-colors"
                title="Email us"
              >
                <Mail size={16} />
                <span className="hidden xl:inline">ventechgadgets@gmail.com</span>
              </a>
            </div>

            {isAuthenticated ? (
              <>
                <Link href="/wishlist">
                  <Button variant="ghost" size="sm" className="relative">
                    <Heart size={20} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                    Wishlist
                  </Button>
                </Link>

                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart size={20} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                    Cart
                  </Button>
                </Link>

                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <User size={18} className="text-[#3A3A3A]" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs font-medium text-[#3A3A3A]">Account</span>
                      <span className="text-xs text-[#FF7A19] font-semibold">
                        {user?.name?.split(' ')[0] || 'User'}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-[#3A3A3A]" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 rounded-t-lg text-sm">
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm">
                      <Package size={16} />
                      <span>My Orders</span>
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm">
                      <Heart size={16} />
                      <span>Wishlist</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-[#FF7A19] text-sm">
                        <Settings size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 rounded-b-lg text-red-600 w-full text-left text-sm"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/cart">
                  <Button variant="ghost" size="sm" className="relative">
                    <ShoppingCart size={20} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation with Mega Menu */}
        <div className="hidden lg:flex items-center justify-between py-3 border-t border-gray-100">
          {/* Mega Menu */}
          <MegaMenu />

          {/* Quick Links */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  text-sm font-medium transition-colors
                  ${link.highlight 
                    ? 'bg-gradient-to-r from-[#FF7A19] to-[#FF8C3A] text-white px-4 py-2 rounded-lg hover:shadow-lg font-bold' 
                    : pathname === link.href 
                      ? 'text-[#FF7A19]' 
                      : 'text-[#3A3A3A] hover:text-[#FF7A19]'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <SearchBar
              placeholder="Search products, brands, categories..."
              className="w-full"
            />
          </div>

          {/* Mobile Links */}
          <div className="p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 text-sm font-medium border-b border-gray-100 transition-colors hover:text-[#FF7A19] ${
                  pathname === link.href ? 'text-[#FF7A19]' : 'text-[#3A3A3A]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Wishlist & Cart */}
            {isAuthenticated && (
              <div className="flex gap-4 py-4 border-b border-gray-100">
                <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="relative">
                    <Heart size={16} />
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/cart" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart size={16} />
                    Cart
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF7A19] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Contact Info */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <a href="tel:+233XXXXXXXXX" className="flex items-center gap-3 text-sm text-[#3A3A3A]">
              <Phone size={18} className="text-[#FF7A19]" />
              <span>+233 XX XXX XXXX</span>
            </a>
            <a href="mailto:support@ventech.gh" className="flex items-center gap-3 text-sm text-[#3A3A3A]">
              <Mail size={18} className="text-[#FF7A19]" />
              <span>support@ventech.gh</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
