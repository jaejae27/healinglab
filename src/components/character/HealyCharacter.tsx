import React from 'react';
import { motion } from 'motion/react';

export type HealyEmotion = 'welcome' | 'thinking' | 'cheering' | 'care' | 'celebrate' | 'proud';

interface HealyCharacterProps {
  emotion?: HealyEmotion;
  dialogue?: string;
  subDialogue?: string;
  size?: 'sm' | 'md' | 'lg';
  showDialogue?: boolean;
}

export const HealyCharacter: React.FC<HealyCharacterProps> = ({
  emotion = 'welcome',
  dialogue,
  subDialogue,
  size = 'md',
  showDialogue = true
}) => {
  const sizeMap = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-48 h-48'
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Speech Bubble */}
      {showDialogue && dialogue && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="relative max-w-xs md:max-w-md bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-[28px] border-4 border-white shadow-xl shadow-[#5A5A40]/5 mb-3 text-center"
        >
          <p className="font-jua text-[#5A5A40] text-base md:text-lg leading-snug break-keep">
            {dialogue.split(/<br\s*\/?>|\n/gi).map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          {subDialogue && (
            <p className="text-xs text-[#86198F] font-bold mt-1 font-gaegu text-sm">
              {subDialogue.split(/<br\s*\/?>|\n/gi).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          )}
          {/* Bubble tail */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-slate-100 rotate-45" />
        </motion.div>
      )}

      {/* Healy Character SVG */}
      <motion.div
        className={`relative ${sizeMap[size]} flex items-center justify-center`}
        animate={{
          y: [0, -6, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut'
        }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
          <defs>
            <radialGradient id="bodyGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFDF5" />
              <stop offset="60%" stopColor="#FFFBEB" />
              <stop offset="100%" stopColor="#FED7AA" />
            </radialGradient>
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#78716C" />
              <stop offset="100%" stopColor="#5A5A40" />
            </linearGradient>
            <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Ears/Puffs */}
          <circle cx="55" cy="70" r="22" fill="#FED7AA" opacity="0.9" />
          <circle cx="145" cy="70" r="22" fill="#FED7AA" opacity="0.9" />

          {/* Main Body (Soft round pill creature) */}
          <ellipse cx="100" cy="118" rx="66" ry="62" fill="url(#bodyGrad)" stroke="#FFFFFF" strokeWidth="4" />

          {/* Little Feet */}
          <ellipse cx="75" cy="176" rx="16" ry="9" fill="#FDBA74" />
          <ellipse cx="125" cy="176" rx="16" ry="9" fill="#FDBA74" />

          {/* Soft Cheeks (Blush) */}
          <ellipse cx="64" cy="124" rx="12" ry="7" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="136" cy="124" rx="12" ry="7" fill="#FDA4AF" opacity="0.65" />

          {/* Pharmacist Cap */}
          <g transform="translate(0, -5)">
            <ellipse cx="100" cy="58" rx="36" ry="12" fill="url(#capGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
            <path
              d="M72 58 C72 38, 128 38, 128 58 Z"
              fill="url(#capGrad)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            {/* White Heart+Cross Badge on Cap */}
            <circle cx="100" cy="50" r="9" fill="#FFFFFF" />
            <path d="M100 44 L100 56 M94 50 L106 50" stroke="#F43F5E" strokeWidth="2.8" strokeLinecap="round" />
          </g>

          {/* Eyes & Mouth depending on emotion */}
          {emotion === 'celebrate' || emotion === 'cheering' ? (
            // Joyful curved eyes
            <g>
              <path d="M72 108 Q80 98 88 108" fill="none" stroke="#5A5A40" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M112 108 Q120 98 128 108" fill="none" stroke="#5A5A40" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M93 126 Q100 137 107 126 Z" fill="#F43F5E" stroke="#E11D48" strokeWidth="1.5" />
            </g>
          ) : emotion === 'thinking' ? (
            // Curious / thinking eyes
            <g>
              <circle cx="78" cy="108" r="4.5" fill="#5A5A40" />
              <circle cx="80" cy="106" r="1.5" fill="#FFFFFF" />
              <circle cx="122" cy="104" r="5" fill="#5A5A40" />
              <circle cx="124" cy="102" r="1.8" fill="#FFFFFF" />
              <ellipse cx="100" cy="126" rx="4" ry="4" fill="#5A5A40" />
            </g>
          ) : (
            // Sweet welcoming / caring smile
            <g>
              <ellipse cx="78" cy="110" rx="4.5" ry="6" fill="#5A5A40" />
              <circle cx="76.5" cy="108" r="1.8" fill="#FFFFFF" />
              <ellipse cx="122" cy="110" rx="4.5" ry="6" fill="#5A5A40" />
              <circle cx="120.5" cy="108" r="1.8" fill="#FFFFFF" />
              <path d="M94 124 Q100 130 106 124" fill="none" stroke="#5A5A40" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* Little Medicine Bag (Across Body) */}
          <g transform="translate(112, 132)">
            <rect x="0" y="0" width="26" height="22" rx="6" fill="url(#bagGrad)" stroke="#B45309" strokeWidth="2" />
            <path d="M4 8 L22 8" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round" />
            {/* Tiny Red Cross on Bag */}
            <circle cx="13" cy="14" r="4.5" fill="#FFFFFF" />
            <path d="M13 11.5 L13 16.5 M10.5 14 L15.5 14" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Tiny Hands */}
          <ellipse cx="50" cy="130" rx="9" ry="8" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="2" />
          <ellipse cx="140" cy="126" rx="9" ry="8" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="2" />

          {/* Sparkles / Magic Hearts */}
          <path
            d="M162 68 Q168 76 174 76 Q168 76 168 84 Q168 76 162 76 Q168 76 168 68"
            fill="#FBBF24"
            className="animate-pulse"
          />
          <path
            d="M36 86 C32 82 26 84 26 89 C26 95 36 101 36 101 C36 101 46 95 46 89 C46 84 40 82 36 86 Z"
            fill="#FB7185"
            opacity="0.75"
          />
        </svg>
      </motion.div>
    </div>
  );
};
