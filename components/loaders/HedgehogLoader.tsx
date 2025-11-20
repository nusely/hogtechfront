'use client';

import React from 'react';

interface HedgehogLoaderProps {
  size?: number; // px
  speedMs?: number; // animation cycle duration
}

/**
 * A cute, fluffy hedgehog walking and smiling
 * Uses Hedgehog Technologies brand colors with white belly
 */
export const HedgehogLoader: React.FC<HedgehogLoaderProps> = ({
  size = 100,
  speedMs = 800,
}) => {
  return (
    <div 
      className="flex flex-col items-center justify-center"
      aria-label="Loading" 
      role="status"
    >
      <svg
        viewBox="0 0 200 180"
        width={size}
        height={size * 0.9}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hedgehog-container"
      >
        <defs>
          {/* Gradient for body */}
          <radialGradient id="bodyGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#E3F4FC" />
            <stop offset="100%" stopColor="#00afef" />
          </radialGradient>
          
          {/* Gradient for spikes */}
          <linearGradient id="spikeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#163b86" />
            <stop offset="100%" stopColor="#0066a6" />
          </linearGradient>

          {/* Shadow */}
          <ellipse id="shadow" cx="100" cy="160" rx="45" ry="8" fill="#00000020" />
        </defs>

        {/* Shadow */}
        <use href="#shadow" className="hedgehog-shadow" />

        {/* Main body group */}
        <g className="hedgehog-body">
          {/* Back spikes - lots of them for fluffy effect */}
          <g className="hedgehog-spikes">
            {/* Row 1 - Back */}
            <path d="M60 55 L55 35 L62 50" fill="url(#spikeGradient)" opacity="0.9" />
            <path d="M68 50 L65 28 L70 46" fill="url(#spikeGradient)" />
            <path d="M76 48 L75 25 L78 44" fill="url(#spikeGradient)" />
            <path d="M84 47 L85 24 L86 43" fill="url(#spikeGradient)" />
            <path d="M92 48 L95 25 L94 44" fill="url(#spikeGradient)" />
            <path d="M100 50 L105 28 L102 46" fill="url(#spikeGradient)" />
            <path d="M108 52 L115 32 L110 48" fill="url(#spikeGradient)" />
            <path d="M116 55 L125 38 L118 51" fill="url(#spikeGradient)" opacity="0.9" />
            
            {/* Row 2 - Middle */}
            <path d="M58 65 L52 48 L60 60" fill="url(#spikeGradient)" opacity="0.85" />
            <path d="M66 62 L62 42 L68 58" fill="url(#spikeGradient)" opacity="0.9" />
            <path d="M74 60 L72 38 L76 56" fill="url(#spikeGradient)" />
            <path d="M82 59 L82 36 L84 55" fill="url(#spikeGradient)" />
            <path d="M90 59 L92 36 L92 55" fill="url(#spikeGradient)" />
            <path d="M98 60 L102 38 L100 56" fill="url(#spikeGradient)" />
            <path d="M106 62 L112 42 L108 58" fill="url(#spikeGradient)" opacity="0.9" />
            <path d="M114 65 L122 48 L116 60" fill="url(#spikeGradient)" opacity="0.85" />
            
            {/* Row 3 - Front */}
            <path d="M62 75 L56 62 L64 72" fill="url(#spikeGradient)" opacity="0.7" />
            <path d="M70 73 L66 58 L72 70" fill="url(#spikeGradient)" opacity="0.8" />
            <path d="M78 72 L76 55 L80 69" fill="url(#spikeGradient)" opacity="0.85" />
            <path d="M86 71 L86 54 L88 68" fill="url(#spikeGradient)" opacity="0.9" />
            <path d="M94 71 L96 54 L96 68" fill="url(#spikeGradient)" opacity="0.9" />
            <path d="M102 72 L106 55 L104 69" fill="url(#spikeGradient)" opacity="0.85" />
            <path d="M110 73 L116 58 L112 70" fill="url(#spikeGradient)" opacity="0.8" />
            <path d="M118 75 L126 62 L120 72" fill="url(#spikeGradient)" opacity="0.7" />
          </g>

          {/* Body - main round shape with white belly */}
          <ellipse cx="90" cy="95" rx="45" ry="38" fill="url(#bodyGradient)" />
          
          {/* White belly highlight */}
          <ellipse cx="90" cy="105" rx="35" ry="28" fill="#FFFFFF" opacity="0.9" />
          <ellipse cx="90" cy="110" rx="28" ry="22" fill="#FFFFFF" />

          {/* Back legs */}
          <g className="back-legs">
            <ellipse cx="70" cy="128" rx="8" ry="12" fill="#00afef" className="back-leg-1" />
            <ellipse cx="70" cy="135" rx="9" ry="5" fill="#163b86" className="back-foot-1" />
            
            <ellipse cx="85" cy="128" rx="8" ry="12" fill="#00afef" className="back-leg-2" />
            <ellipse cx="85" cy="135" rx="9" ry="5" fill="#163b86" className="back-foot-2" />
          </g>

          {/* Head - larger and rounder */}
          <circle cx="130" cy="85" r="28" fill="#00afef" />
          <ellipse cx="125" cy="90" rx="20" ry="18" fill="#E3F4FC" />
          <ellipse cx="120" cy="95" rx="15" ry="12" fill="#FFFFFF" />

          {/* Ears */}
          <ellipse cx="118" cy="65" rx="8" ry="12" fill="#00afef" transform="rotate(-20 118 65)" />
          <ellipse cx="118" cy="68" rx="5" ry="8" fill="#163b86" transform="rotate(-20 118 68)" />
          <ellipse cx="142" cy="65" rx="8" ry="12" fill="#00afef" transform="rotate(20 142 65)" />
          <ellipse cx="142" cy="68" rx="5" ry="8" fill="#163b86" transform="rotate(20 142 68)" />

          {/* Snout */}
          <ellipse cx="145" cy="92" rx="12" ry="10" fill="#00afef" />
          <ellipse cx="148" cy="93" rx="8" ry="7" fill="#0099d6" />
          
          {/* Nose */}
          <ellipse cx="152" cy="94" rx="4" ry="3.5" fill="#163b86" />
          <ellipse cx="151" cy="93" rx="1.5" ry="1.5" fill="#FFFFFF" opacity="0.8" />

          {/* Eyes - big and cute */}
          <g className="hedgehog-eyes">
            <circle cx="125" cy="80" r="5" fill="#1A1A1A" />
            <circle cx="126" cy="79" r="2" fill="#FFFFFF" />
            <circle cx="140" cy="82" r="5" fill="#1A1A1A" />
            <circle cx="141" cy="81" r="2" fill="#FFFFFF" />
          </g>

          {/* Smile - cute curved line */}
          <path 
            d="M145 100 Q148 103 151 100" 
            stroke="#163b86" 
            strokeWidth="2" 
            strokeLinecap="round"
            fill="none"
            className="hedgehog-smile"
          />
          
          {/* Whiskers */}
          <line x1="145" y1="88" x2="165" y2="85" stroke="#163b86" strokeWidth="1" opacity="0.6" />
          <line x1="145" y1="92" x2="168" y2="92" stroke="#163b86" strokeWidth="1" opacity="0.6" />
          <line x1="145" y1="96" x2="165" y2="99" stroke="#163b86" strokeWidth="1" opacity="0.6" />

          {/* Front legs */}
          <g className="front-legs">
            <ellipse cx="105" cy="128" rx="8" ry="14" fill="#00afef" className="front-leg-1" />
            <ellipse cx="105" cy="137" rx="9" ry="5" fill="#163b86" className="front-foot-1" />
            
            <ellipse cx="120" cy="128" rx="8" ry="14" fill="#00afef" className="front-leg-2" />
            <ellipse cx="120" cy="137" rx="9" ry="5" fill="#163b86" className="front-foot-2" />
          </g>
        </g>
      </svg>

      <style jsx>{`
        .hedgehog-container {
          filter: drop-shadow(0 4px 12px rgba(0, 175, 239, 0.15));
        }

        .hedgehog-body {
          animation: body-walk ${speedMs * 2}ms ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes body-walk {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .hedgehog-shadow {
          animation: shadow-pulse ${speedMs * 2}ms ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes shadow-pulse {
          0%, 100% { transform: scaleX(1); opacity: 0.3; }
          50% { transform: scaleX(0.85); opacity: 0.15; }
        }

        /* Front legs stay still - no animation */
        .front-leg-1,
        .front-leg-2,
        .front-foot-1,
        .front-foot-2 {
          /* Stationary - no animation */
        }

        /* Back/hind legs alternate - they do all the walking */
        .back-leg-1 {
          animation: leg-walk ${speedMs}ms ease-in-out infinite;
          transform-origin: 70px 120px;
        }

        .back-foot-1 {
          animation: foot-walk ${speedMs}ms ease-in-out infinite;
          transform-origin: 70px 135px;
        }

        .back-leg-2 {
          animation: leg-walk ${speedMs}ms ease-in-out infinite;
          animation-delay: ${speedMs / 2}ms;
          transform-origin: 85px 120px;
        }

        .back-foot-2 {
          animation: foot-walk ${speedMs}ms ease-in-out infinite;
          animation-delay: ${speedMs / 2}ms;
          transform-origin: 85px 135px;
        }

        @keyframes leg-walk {
          0%, 100% { 
            transform: translateY(0px) scaleY(1); 
          }
          25% { 
            transform: translateY(-6px) scaleY(0.88); 
          }
          50% { 
            transform: translateY(0px) scaleY(1.05); 
          }
          75% { 
            transform: translateY(2px) scaleY(0.94); 
          }
        }

        @keyframes foot-walk {
          0%, 100% { 
            transform: scaleX(1) translateX(0px); 
          }
          25% { 
            transform: scaleX(0.75) translateX(-1px); 
          }
          50% { 
            transform: scaleX(1.15) translateX(1px); 
          }
          75% {
            transform: scaleX(0.95) translateX(0px);
          }
        }

        /* Spikes subtle wave */
        .hedgehog-spikes {
          animation: spikes-shimmer ${speedMs * 1.5}ms ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes spikes-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.95; }
        }

        /* Eyes blink occasionally */
        .hedgehog-eyes {
          animation: eye-blink ${speedMs * 6}ms ease-in-out infinite;
        }

        @keyframes eye-blink {
          0%, 48%, 52%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.1); }
        }

        /* Smile animation */
        .hedgehog-smile {
          animation: smile-bounce ${speedMs * 3}ms ease-in-out infinite;
        }

        @keyframes smile-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-0.5px); }
        }
      `}</style>
    </div>
  );
};

export default HedgehogLoader;

