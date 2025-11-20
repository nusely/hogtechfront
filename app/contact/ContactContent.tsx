'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Headphones
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contactService } from '@/services/contact.service';
import { settingsService } from '@/lib/settings.service';
import { motion, Variants } from 'framer-motion';
import { fadeIn, fadeInScale, fadeInUp, staggerChildren } from '@/lib/motion';

const contactListVariants = staggerChildren(0.08, 0.05);
const contactItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
};
const infoCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};
const formCardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 0.61, 0.36, 1] as const,
    },
  },
};

export function ContactContent() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const storeSettings = await settingsService.getSettingsByCategory('store');
        if (isMounted) {
          setSettings(storeSettings);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching settings for contact page:', error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const storePhone = settings.store_phone || '0553 886 5804';
  const storeEmail = settings.store_email || 'hedgehog.technologies1@gmail.com';
  // For migration: check new key first, then fallback to old keys
  const address = settings.store_address || 
                  (settings.store_address_ho && settings.store_address_accra 
                    ? `${settings.store_address_ho}, ${settings.store_address_accra}`
                    : settings.store_address_ho || settings.store_address_accra || 'Ghana');
  const businessHours = settings.store_business_hours || 'Mon-Sat: 9AM-6PM, Sun: Closed';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await contactService.submitContactForm(formData);
      
      if (result.success) {
        toast.success('Message sent! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <motion.main
      className="min-h-screen bg-white"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.section className="bg-gradient-to-r from-[#00afef] to-[#163b86] py-16" variants={fadeInUp} custom={0.05}>
        <div className="container mx-auto px-4 text-center">
          <motion.h1 className="text-3xl md:text-4xl font-bold mb-4 text-white" variants={fadeInUp} custom={0.08}>
            Get in Touch
          </motion.h1>
          <motion.p className="text-lg text-white/90 max-w-2xl mx-auto" variants={fadeInUp} custom={0.12}>
            Have questions? We&apos;re here to help. Reach out to us anytime!
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Info & Form */}
      <motion.section className="container mx-auto px-4 py-16" variants={fadeInUp} custom={0.1}>
        <div className="grid md:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <motion.div className="md:col-span-2 space-y-6" variants={infoCardVariants}>
            <div>
              <motion.h2 className="text-2xl font-bold text-[#1A1A1A] mb-6" variants={fadeInUp} custom={0.05}>
                Contact Information
              </motion.h2>
              <motion.p className="text-[#3A3A3A] text-sm mb-8" variants={fadeInUp} custom={0.08}>
                Feel free to reach out through any of these channels. We typically respond within 24 hours.
              </motion.p>
            </div>

            <motion.div className="space-y-4" variants={contactListVariants}>
              <motion.div className="flex gap-4" variants={contactItemVariants}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="text-[#00afef]" size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1">Phone</h3>
                  <a href={`tel:${storePhone.replace(/\s/g, '')}`} className="text-[#3A3A3A] text-sm hover:text-[#00afef] transition-colors">
                    {storePhone}
                  </a>
                </div>
              </motion.div>

              <motion.div className="flex gap-4" variants={contactItemVariants}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="text-[#00afef]" size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1">Email</h3>
                  <a href={`mailto:${storeEmail}`} className="text-[#3A3A3A] text-sm hover:text-[#00afef] transition-colors">
                    {storeEmail}
                  </a>
                </div>
              </motion.div>

              <motion.div className="flex gap-4" variants={contactItemVariants}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="text-[#00afef]" size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1">Address</h3>
                  <p className="text-[#3A3A3A] text-sm">{address}</p>
                </div>
              </motion.div>

              <motion.div className="flex gap-4" variants={contactItemVariants}>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-[#00afef]" size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#1A1A1A] mb-1">Business Hours</h3>
                  <p className="text-[#3A3A3A] text-sm">{businessHours}</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Quick Support */}
            <motion.div className="bg-gray-50 rounded-xl p-6 mt-8" variants={fadeInScale}>
              <div className="flex items-center gap-3 mb-3">
                <Headphones className="text-[#00afef]" size={24} />
                <h3 className="font-bold text-[#1A1A1A]">Need Immediate Help?</h3>
              </div>
              <p className="text-sm text-[#3A3A3A] mb-4">
                Our customer support team is available to assist you with any questions or concerns.
              </p>
              <a 
                href="https://wa.me/233538865804" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button variant="primary" size="sm" className="w-full">
                  <MessageSquare size={16} />
                  Start Live Chat
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div className="md:col-span-3" variants={formCardVariants}>
            <div className="bg-gray-50 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef] focus:border-transparent text-sm"
                    placeholder="John Doe"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef] focus:border-transparent text-sm"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef] focus:border-transparent text-sm"
                      placeholder="+233 553 886 5804"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef] focus:border-transparent text-sm"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Status</option>
                    <option value="product">Product Question</option>
                    <option value="return">Return/Refund</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00afef] focus:border-transparent text-sm resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-full"
                  icon={<Send size={18} />}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Map Section */}
      <motion.section className="bg-gray-100 py-16" variants={fadeInUp} custom={0.15}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-8">
            <MapPin className="mx-auto mb-4 text-[#00afef]" size={48} />
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Visit Our Store</h2>
            <p className="text-[#3A3A3A] text-sm mb-6">
              Come see our products in person. Our friendly staff is ready to help you find exactly what you need.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3097.2231529858846!2d-0.3079048!3d5.5575211!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdfbd0037ffbc5b%3A0x951289c75a6182e2!2sHEDGEHOG%20TECHNOLOGIES!5e1!3m2!1sen!2sgh!4v1763538508267!5m2!1sen!2sgh" 
                width="100%" 
                height="450" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>
          </div>
        </div>
      </motion.section>
    </motion.main>
  );
}

