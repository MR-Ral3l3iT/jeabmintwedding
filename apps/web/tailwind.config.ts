import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: '#6B7C5E',
        'sage-light': '#8E9E80',
        'sage-pale': '#D4DDC8',
        'teal-dark': '#1E3A3A',
        cream: '#FAF7F2',
        gold: '#C8A96E',
        'gold-light': '#E8D5A3',
        text: '#2C2C2C',
        'text-light': '#6B6B6B',
      },
      fontFamily: {
        display: ['"Dancing Script"', 'Prompt', 'cursive'],
        serif: ['"Cormorant Garamond"', 'Prompt', 'sans-serif'],
        thai: ['Prompt', 'sans-serif'],
        sans: ['Prompt', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease forwards',
        'fade-in': 'fadeIn 0.8s ease forwards',
        float: 'float 2s ease-in-out infinite',
        pulse: 'pulse 1.5s ease-in-out infinite',
        'scroll-pulse': 'scrollPulse 1.5s ease-in-out infinite',
        'load-slide': 'loadSlide 1.8s ease forwards',
        'butterfly-wing': 'butterflyWing 0.32s ease-in-out infinite alternate',
        'butterfly-path-1': 'butterflyPath1 15s ease-in-out infinite',
        'butterfly-path-2': 'butterflyPath2 18s ease-in-out infinite',
        'butterfly-path-3': 'butterflyPath3 16s ease-in-out infinite',
        'rsvp-cta': 'rsvpCta 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scrollPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        loadSlide: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        butterflyWing: {
          '0%': { transform: 'scaleX(1) scaleY(1)' },
          '100%': { transform: 'scaleX(0.72) scaleY(1.04)' },
        },
        butterflyPath1: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(-6deg)' },
          '25%': { transform: 'translate(28px, -18px) rotate(8deg)' },
          '50%': { transform: 'translate(52px, 8px) rotate(14deg)' },
          '75%': { transform: 'translate(18px, 22px) rotate(2deg)' },
        },
        butterflyPath2: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(10deg)' },
          '30%': { transform: 'translate(-36px, -14px) rotate(-4deg)' },
          '60%': { transform: 'translate(-58px, 16px) rotate(-12deg)' },
          '85%': { transform: 'translate(-20px, 28px) rotate(4deg)' },
        },
        butterflyPath3: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(-4deg)' },
          '35%': { transform: 'translate(42px, -12px) rotate(10deg)' },
          '70%': { transform: 'translate(24px, 20px) rotate(-8deg)' },
        },
        rsvpCta: {
          '0%, 100%': {
            transform: 'translateY(1px)',
            boxShadow: '0 8px 24px rgba(200,169,110,0.36)',
          },
          '50%': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 32px rgba(200,169,110,0.48)',
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
