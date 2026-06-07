/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  variant?: 'badge' | 'inline' | 'iconOnly';
}

export default function Logo({ size = 48, className = '', variant = 'inline' }: LogoProps) {
  // Brand Color Codes extracted from the logo
  const techTeal = "#00dfc1";
  const darkTeal = "#008b81";
  const charcoalBlack = "#070c0e";

  if (variant === 'iconOnly') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block ${className}`}
        id="logo-icon-only"
      >
        <circle cx="50" cy="50" r="46" fill="url(#miniBg)" stroke="url(#miniBorder)" strokeWidth="2.5" />
        {/* Car Outline */}
        <path
          d="M 22 52 C 28 44, 42 40, 50 40 C 58 40, 63 42, 70 47 C 74 49, 78 51, 80 52 C 74 50, 70 49, 62 49 C 56 49, 40 50, 22 52 Z"
          fill="#FFFFFF"
        />
        {/* Customized E stripes */}
        <g transform="translate(38, 56) scale(0.6)">
          <path d="M 5 0 H 35 V 5 H 5 Z" fill={techTeal} />
          <path d="M 5 10 H 30 V 15 H 5 Z" fill={techTeal} />
          <path d="M 5 20 H 35 V 25 H 5 Z" fill={techTeal} />
          <path d="M 0 0 H 5 V 25 H 0 Z" fill={techTeal} />
        </g>
        <defs>
          <linearGradient id="miniBg" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#0b171a" />
            <stop offset="100%" stopColor="#020405" />
          </linearGradient>
          <linearGradient id="miniBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor={techTeal} />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={darkTeal} />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (variant === 'badge') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`block mx-auto max-w-full ${className}`}
        id="logo-brand-badge"
      >
        {/* Main Circle Grid background */}
        <circle cx="250" cy="250" r="235" fill="url(#badgeBg)" stroke="url(#badgeBorder)" strokeWidth="10" />
        
        {/* Double Inner Thin Ring */}
        <circle cx="250" cy="250" r="226" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" />
        
        {/* Decorative Wave/Arc background glow */}
        <path 
          d="M 90 410 C 180 340, 320 330, 410 338 M 110 430 C 190 350, 310 345, 390 365" 
          stroke="url(#glowGradient)" 
          strokeWidth="8" 
          strokeLinecap="round"
          fill="none" 
          opacity="0.85"
        />

        {/* Car Outline Structure */}
        <path
          d="M 100 205 C 130 160, 200 145, 250 145 C 300 145, 325 152, 360 178 C 385 197, 405 202, 415 205 C 385 196, 365 191, 325 191 C 295 191, 210 195, 100 205 Z"
          fill="#FFFFFF"
        />

        {/* Brand Text Header "DriveEaze" */}
        <g transform="translate(68, 215)">
          {/* Drive Text */}
          <text 
            x="0" 
            y="45" 
            fontFamily="'Space Grotesk', system-ui, -apple-system, sans-serif" 
            fontWeight="900" 
            fontStyle="italic" 
            fontSize="54" 
            fill="#FFFFFF"
            letterSpacing="-0.03em"
          >
            Drive
          </text>
          
          {/* Eaze Styled with Horizontal tech bars */}
          <g transform="translate(136, 10)">
            {/* Elegant horizontal stripes of the stylized "E" */}
            <path d="M 0 10 H 55 V 19 H 0 Z" fill={techTeal} />
            <path d="M 0 25 H 46 V 34 H 0 Z" fill={techTeal} />
            <path d="M 0 40 H 55 V 49 H 0 Z" fill={techTeal} />
            {/* Left side connector for E */}
            <path d="M -8 10 H 0 V 49 H -8 Z" fill={techTeal} />
            
            {/* Remaining text "aze" */}
            <text 
              x="62" 
              y="35" 
              fontFamily="'Space Grotesk', system-ui, sans-serif" 
              fontWeight="900" 
              fontStyle="italic" 
              fontSize="54" 
              fill={techTeal}
              letterSpacing="-0.03em"
            >
              aze
            </text>
          </g>
        </g>

        {/* Subtitle "SELF DRIVE CAR RENTALS" bordered by lines */}
        <g transform="translate(120, 285)">
          {/* Left indicator line */}
          <line x1="-35" y1="-5" x2="25" y2="-5" stroke={techTeal} strokeWidth="2.5" strokeLinecap="round" />
          
          <text 
            x="130" 
            y="0" 
            fontFamily="'Space Grotesk', system-ui, sans-serif" 
            fontWeight="700" 
            fontSize="15" 
            letterSpacing="0.28em" 
            fill="#FFFFFF" 
            textAnchor="middle"
          >
            SELF DRIVE CAR RENTALS
          </text>
          
          {/* Right indicator line */}
          <line x1="235" y1="-5" x2="295" y2="-5" stroke={techTeal} strokeWidth="2.5" strokeLinecap="round" />
        </g>
        
        <defs>
          <linearGradient id="badgeBg" x1="0" y1="0" x2="500" y2="500">
            <stop offset="0%" stopColor="#0c191c" />
            <stop offset="50%" stopColor="#060e10" />
            <stop offset="100%" stopColor="#010303" />
          </linearGradient>
          <linearGradient id="badgeBorder" x1="0" y1="0" x2="500" y2="500">
            <stop offset="0%" stopColor={techTeal} />
            <stop offset="35%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#718096" />
            <stop offset="100%" stopColor={darkTeal} />
          </linearGradient>
          <linearGradient id="glowGradient" x1="100" y1="350" x2="400" y2="350">
            <stop offset="0%" stopColor={darkTeal} stopOpacity="0.1" />
            <stop offset="50%" stopColor={techTeal} stopOpacity="0.9" />
            <stop offset="100%" stopColor={darkTeal} stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // default 'inline' variant (highly optimized for Header list/banner)
  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`} id="logo-brand-inline">
      {/* Icon portion from badge */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Pulsing neon-teal background glowing aura around/behind the logo */}
        <div className="absolute inset-[-4px] bg-[#00dfc1]/35 rounded-full blur-md animate-[pulse_1.8s_infinite] pointer-events-none" />
        <div className="absolute inset-[-12px] bg-[#00dfc1]/10 rounded-full blur-xl pointer-events-none" />
        <svg
          width={size * 0.9}
          height={size * 0.9}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <circle cx="60" cy="60" r="54" fill="url(#inlineIconBg)" stroke="url(#inlineIconBorder)" strokeWidth="3" />
          <circle cx="60" cy="60" r="49" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
          {/* Mini sports car roofline */}
          <path
            d="M 25 50 C 32 40, 48 36, 60 36 C 72 36, 78 38, 86 44 C 92 48, 97 49, 100 50 C 93 48, 88 46, 78 46 C 71 46, 50 47, 25 50 Z"
            fill="#FFFFFF"
          />
          {/* E custom striped icon block */}
          <g transform="translate(48, 55) scale(0.65)">
            <path d="M 0 6 H 32 V 12 H 0 Z" fill={techTeal} />
            <path d="M 0 16 H 26 V 22 H 0 Z" fill={techTeal} />
            <path d="M 0 26 H 32 V 32 H 0 Z" fill={techTeal} />
            <path d="M -5 6 H 0 V 32 H -5 Z" fill={techTeal} />
          </g>
          <defs>
            <linearGradient id="inlineIconBg" x1="0" y1="0" x2="120" y2="120">
              <stop offset="0%" stopColor="#0d1b1e" />
              <stop offset="100%" stopColor="#020506" />
            </linearGradient>
            <linearGradient id="inlineIconBorder" x1="0" y1="0" x2="120" y2="120">
              <stop offset="0%" stopColor={techTeal} />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={darkTeal} />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Typography portion with 3D font text and 3D effects */}
      <div className="flex flex-col justify-center leading-none pl-1">
        <div className="flex items-center font-display font-extrabold tracking-tighter text-white logo-text-3d py-1 pr-1">
          <span className="text-[20px] font-black uppercase text-white tracking-tight">DRIVE</span>
          <span className="text-[20px] font-black uppercase text-[#00dfc1] tracking-tight ml-0.5">EAZE</span>
        </div>
        <span className="text-[7px] font-mono tracking-[0.24em] text-[#8da4a8] mt-1.5 uppercase block font-semibold leading-none">
          Self Drive Car Rentals
        </span>
      </div>
    </div>
  );
}
