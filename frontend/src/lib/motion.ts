import type { Variants } from "framer-motion";

export const motionTimings = {
  fast: 0.18,

  normal: 0.32,

  slow: 0.56,

  premium: 0.72,
};

export const spring = {
  type: "spring",

  stiffness: 260,

  damping: 24,

  mass: 0.8,
} as const;

export const softSpring = {
  type: "spring",

  stiffness: 180,

  damping: 22,

  mass: 1,
} as const;

export const pageTransition: Variants = {
  initial: {
    opacity: 0,

    y: 18,

    scale: 0.985,

    filter: "blur(6px)",
  },

  animate: {
    opacity: 1,

    y: 0,

    scale: 1,

    filter: "blur(0px)",

    transition: {
      duration: motionTimings.normal,

      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,

    y: -10,

    scale: 0.99,

    filter: "blur(4px)",

    transition: {
      duration: motionTimings.fast,

      ease: [0.4, 0, 1, 1],
    },
  },
};

export const staggerContainer: Variants = {
  initial: {},

  animate: {
    transition: {
      staggerChildren: 0.075,

      delayChildren: 0.05,
    },
  },
};

export const sectionReveal: Variants = {
  initial: {
    opacity: 0,

    y: 18,

    filter: "blur(6px)",
  },

  animate: {
    opacity: 1,

    y: 0,

    filter: "blur(0px)",

    transition: {
      duration: motionTimings.normal,

      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const cardReveal: Variants = {
  initial: {
    opacity: 0,

    y: 22,

    scale: 0.98,
  },

  animate: {
    opacity: 1,

    y: 0,

    scale: 1,

    transition: softSpring,
  },
};

export const errorShake: Variants = {
  initial: {
    x: 0,
  },

  animate: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],

    transition: {
      duration: 0.42,

      ease: "easeInOut",
    },
  },
};

export const activeMenuIndicator: Variants = {
  inactive: {
    opacity: 0,

    x: -8,

    scaleX: 0.92,
  },

  active: {
    opacity: 1,

    x: 0,

    scaleX: 1,

    transition: spring,
  },
};

export const liveGlow: Variants = {
  idle: {
    boxShadow: "0 0 0 rgba(34,197,94,0)",
  },

  live: {
    boxShadow: [
      "0 0 0 rgba(34,197,94,0)",

      "0 0 28px rgba(34,197,94,0.28)",

      "0 0 0 rgba(34,197,94,0)",
    ],

    transition: {
      duration: 2.2,

      repeat: Infinity,

      ease: "easeInOut",
    },
  },
};

export const riskPulse: Variants = {
  safe: {
    boxShadow: "0 0 0 rgba(34,197,94,0)",
  },

  warning: {
    boxShadow: [
      "0 0 0 rgba(245,158,11,0)",

      "0 0 28px rgba(245,158,11,0.28)",

      "0 0 0 rgba(245,158,11,0)",
    ],

    transition: {
      duration: 1.8,

      repeat: Infinity,

      ease: "easeInOut",
    },
  },

  danger: {
    boxShadow: [
      "0 0 0 rgba(244,63,94,0)",

      "0 0 34px rgba(244,63,94,0.38)",

      "0 0 0 rgba(244,63,94,0)",
    ],

    transition: {
      duration: 1.2,

      repeat: Infinity,

      ease: "easeInOut",
    },
  },
};
