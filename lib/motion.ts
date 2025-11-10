import { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay,
      ease: [0.22, 0.61, 0.36, 1],
    },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.35,
      delay,
      ease: 'easeOut',
    },
  }),
};

export const scaleHover = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.985 },
  transition: { type: 'spring', stiffness: 320, damping: 24 },
};

export const staggerChildren = (stagger: number = 0.08, delayChildren: number = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: Math.max(stagger, 0),
      delayChildren,
    },
  },
});

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      delay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};
