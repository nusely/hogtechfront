'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SidebarAd } from '@/types/sidebar';
import Autoplay from 'embla-carousel-autoplay';
import { r2ImageLoader } from '@/lib/imageLoader';

interface SidebarAdCarouselProps {
  ads: SidebarAd[];
}

export const SidebarAdCarousel: React.FC<SidebarAdCarouselProps> = ({ ads }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {ads.map((ad) => (
            <div key={ad.id} className="flex-[0_0_100%]">
              <Link href={ad.link}>
                <div className="relative aspect-square">
                  <Image
                    loader={r2ImageLoader}
                    src={ad.image_url || '/placeholders/placeholder-ad.webp'}
                    alt={ad.title || 'Advertisement'}
                    fill
                    sizes="(max-width: 1280px) 0vw, 176px"
                    className="object-cover"
                    loading="lazy"
                    unoptimized={ad.image_url?.includes('files.hogtechgh.com') || ad.image_url?.includes('.r2.dev') || true}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {ads.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            aria-label="Previous ad"
          >
            <ChevronLeft size={14} className="text-[#1A1A1A]" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            aria-label="Next ad"
          >
            <ChevronRight size={14} className="text-[#1A1A1A]" />
          </button>
        </>
      )}

      {/* Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === selectedIndex
                  ? 'bg-[#00afef] w-4'
                  : 'bg-white/60 hover:bg-white/90'
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

