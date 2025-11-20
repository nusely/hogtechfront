'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Laptop,
  Wrench,
  HardDrive,
  Download,
  Shield,
  Smartphone,
  Settings,
  Zap,
  Database,
  Cpu,
  Monitor,
  Battery,
  Wifi,
  Clock,
  CheckCircle2,
  ArrowRight,
  Phone,
  MapPin,
} from 'lucide-react';

const services = [
  {
    icon: Laptop,
    title: 'Laptop & Computer Repair',
    description: 'Expert repair for all laptop and desktop brands. Screen replacement, keyboard repair, motherboard fixes, and complete diagnostics.',
    features: ['Screen Replacement', 'Keyboard Repair', 'Motherboard Fixing', 'Power Jack Repair'],
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: Download,
    title: 'Software Installation',
    description: 'Professional OS and software installation. Windows, macOS, Linux, drivers, and all essential applications setup.',
    features: ['Windows Installation', 'macOS Setup', 'Software Licensing', 'Driver Updates'],
    color: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    icon: Cpu,
    title: 'Hardware Upgrades',
    description: 'Boost your computer performance with RAM upgrades, SSD installation, graphics card replacement, and component upgrades.',
    features: ['RAM Upgrades', 'SSD Installation', 'Graphics Cards', 'Component Replacement'],
    color: 'from-orange-500 to-red-500',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    icon: Database,
    title: 'Data Recovery & Backup',
    description: 'Recover lost data from damaged drives, crashed systems, or deleted files. Professional backup solutions.',
    features: ['Hard Drive Recovery', 'File Restoration', 'Backup Solutions', 'Data Migration'],
    color: 'from-green-500 to-emerald-500',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: Shield,
    title: 'Virus & Malware Removal',
    description: 'Complete system cleaning, virus removal, malware protection, antivirus installation, and security optimization.',
    features: ['Virus Removal', 'Malware Cleaning', 'Antivirus Setup', 'Security Hardening'],
    color: 'from-red-500 to-rose-500',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
  },
  {
    icon: Smartphone,
    title: 'Phone & Tablet Repair',
    description: 'Professional smartphone and tablet repair. Screen replacement, battery change, charging ports, and software fixes.',
    features: ['Screen Replacement', 'Battery Replacement', 'Charging Port Fix', 'Software Repair'],
    color: 'from-indigo-500 to-blue-500',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
];

const whyChooseUs = [
  {
    icon: Zap,
    title: 'Fast Service',
    description: 'Same-day repairs available for most services',
  },
  {
    icon: CheckCircle2,
    title: 'Expert Technicians',
    description: 'Certified professionals with years of experience',
  },
  {
    icon: Shield,
    title: 'Quality Guarantee',
    description: 'All repairs backed by our warranty',
  },
  {
    icon: Clock,
    title: 'Flexible Hours',
    description: 'Open 6 days a week to serve you better',
  },
];

export default function ServicesContent() {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#00afef] via-[#0099d6] to-[#163b86] text-white">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6"
            >
              <Wrench size={20} />
              <span className="text-sm font-medium">Professional Tech Services</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              The Only Limit is Your <span className="text-yellow-300">Imagination</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Expert laptop repairs, software installation, hardware upgrades & technical support in Weija, Accra
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#services"
                className="bg-white text-[#00afef] px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                View Services
                <ArrowRight size={20} />
              </Link>
              <Link
                href="#contact"
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Phone size={20} />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive tech solutions to keep your devices running smoothly
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
                className="relative group"
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full border border-gray-100 hover:border-[#00afef]/20">
                  {/* Icon */}
                  <div className={`${service.iconBg} ${service.iconColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#00afef] transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Hover Gradient Border */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <p className="text-xl text-gray-600">
              Your trusted tech partner in Greater Accra
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="bg-[#00afef] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">
            Simple 4-step process to get your device fixed
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            { step: '01', title: 'Contact Us', description: 'Call or visit our store with your device', icon: Phone },
            { step: '02', title: 'Diagnosis', description: 'Free diagnostic to identify the issue', icon: Settings },
            { step: '03', title: 'Repair', description: 'Expert repair by certified technicians', icon: Wrench },
            { step: '04', title: 'Collect', description: 'Pick up your fixed device - good as new!', icon: CheckCircle2 },
          ].map((process, index) => {
            const Icon = process.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Connecting Line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-[#00afef] to-[#163b86]" />
                )}
                
                <div className="relative z-10 text-center">
                  <div className="bg-gradient-to-br from-[#00afef] to-[#163b86] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon size={28} />
                  </div>
                  <div className="text-3xl font-bold text-[#00afef] mb-2">{process.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{process.title}</h3>
                  <p className="text-gray-600">{process.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="bg-gradient-to-br from-[#00afef] to-[#163b86] text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Fix Your Device?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Visit our store in Weija or call us for a free consultation
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                    <a href="tel:+233553886580" className="text-2xl font-bold hover:text-yellow-300 transition-colors">
                      +233 553 886 5804
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
                <div className="flex items-start gap-4">
                  <div className="bg-white/20 rounded-lg p-3">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Visit Us</h3>
                    <p className="text-lg">
                      Oblogo Road, Weija<br />
                      Greater Accra, Ghana
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-white text-[#00afef] px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Get Directions
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/shop"
                className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
              >
                Shop Gadgets
                <Laptop size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

