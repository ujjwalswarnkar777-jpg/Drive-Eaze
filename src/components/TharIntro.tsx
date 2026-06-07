import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TharIntroProps {
  onComplete: () => void;
}

export default function TharIntro({ onComplete }: TharIntroProps) {
  const [showText, setShowText] = useState(false);
  const [smokeParticles, setSmokeParticles] = useState<{ id: number; x: number; y: number; scale: number; opacity: number }[]>([]);
  const [isExiting, setIsExiting] = useState(false);

  // Generate smoke particles during the Thar's pass
  useEffect(() => {
    let particleId = 0;
    const interval = setInterval(() => {
      // Only generate smoke as the car crosses (from 0s to 1.6s)
      if (particleId < 45) {
        // Calculate vehicle position to place the exhaust pipe
        const progress = particleId / 45;
        const carX = progress * 110 - 15; // Maps roughly from -15% to 95% left
        
        // Random drift coordinates
        const randomY = (Math.random() - 0.5) * 20 + 2; 
        
        setSmokeParticles(prev => [
          ...prev,
          {
            id: particleId++,
            x: carX,
            y: 50 + randomY, // Center height of the viewport
            scale: Math.random() * 1.5 + 0.8,
            opacity: Math.random() * 0.4 + 0.5,
          }
        ]);
      }
    }, 35);

    // Reveal logo text when the Thar passes the halfway mark
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, 700);

    // Initiate exit transition of the entire splash screen
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2800);

    // Call completion handler after fade-out finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3400);

    return () => {
      clearInterval(interval);
      clearTimeout(textTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="thar-intro-splash"
          className="fixed inset-0 bg-[#070c0e] z-[99999] flex flex-col items-center justify-center overflow-hidden select-none"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            y: '-100vh', 
            transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          {/* Drifting Ambient Background Mist */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,223,193,0.06)_0%,transparent_75%)] pointer-events-none" />
          
          {/* Subtly moving background grids for high tech feel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#132125_1px,transparent_1px),linear-gradient(to_bottom,#132125_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

          {/* Core Animation Container */}
          <div className="relative w-full max-w-4xl h-80 flex flex-col items-center justify-center">
            
            {/* 3D DRIVE-EAZE BRAND REVEAL */}
            <AnimatePresence>
              {showText && (
                <motion.div
                  id="thar-3d-text-container"
                  className="flex flex-col items-center justify-center text-center z-10"
                  initial={{ opacity: 0, scale: 0.85, rotateX: 35, y: 15 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotateX: 12, 
                    y: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
                  }}
                  style={{ perspective: 800 }}
                >
                  <h1 
                    id="thar-intro-brand-name"
                    className="font-display text-6xl sm:text-8xl font-black tracking-tighter text-[#00dfc1] select-none"
                    style={{
                      textShadow: `
                        0px 1px 0px #00bfa5,
                        0px 2px 0px #00aa93,
                        0px 3px 0px #009581,
                        0px 4px 0px #00806f,
                        0px 5px 0px #006c5e,
                        0px 6px 0px #00564b,
                        0px 7px 12px rgba(0, 223, 193, 0.6)
                      `
                    }}
                  >
                    DRIVE-EAZE
                  </h1>
                  
                  {/* Luxury subtitle showing underneath */}
                  <motion.p
                    className="font-mono text-xs text-[#8da4a8] tracking-[0.3em] uppercase mt-4"
                    initial={{ opacity: 0, letterSpacing: '0.1em' }}
                    animate={{ opacity: 1, letterSpacing: '0.3em' }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    Lucknow's No.1 Premium Self-Drive
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* DYNAMIC SMOKE PARTICLES */}
            <div className="absolute inset-x-0 h-24 top-1/2 -translate-y-1/2 pointer-events-none z-0">
              {smokeParticles.map(p => (
                <motion.div
                  key={p.id}
                  className="absolute rounded-full bg-gradient-to-br from-[#8da4a8] to-[#132125] mix-blend-screen filter blur-[8px]"
                  style={{
                    left: `${p.x}%`,
                    top: `${p.y - 12}px`,
                    width: '32px',
                    height: '32px',
                  }}
                  initial={{ scale: p.scale * 0.4, opacity: p.opacity, rotate: 0 }}
                  animate={{ 
                    scale: p.scale * 4.5, 
                    opacity: 0, 
                    x: (Math.random() - 0.5) * 50 - 20, 
                    y: (Math.random() - 0.5) * 40 - 15,
                    rotate: Math.random() * 180 
                  }}
                  transition={{ duration: 1.6, ease: 'easeOut' }}
                />
              ))}
            </div>

            {/* THE DRIVING RUGGED MAHINDRA THAR */}
            <motion.div
              id="thar-intro-car-vehicle"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{ width: '190px', height: '110px' }}
              initial={{ x: '-250px' }}
              animate={{ 
                x: '105vw',
                transition: { duration: 1.9, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
            >
              {/* Suspension Bouncing chassis representing 4x4 Off-roading */}
              <motion.div
                className="w-full h-full relative"
                animate={{ 
                  y: [0, -3.5, 1, -4, 0, -2, 0.5, -2.5, 0],
                }}
                transition={{ 
                  duration: 1.9, 
                  ease: 'easeInOut' 
                }}
              >
                {/* SVG PROFILE OF RUGGED MAHINDRA THAR 4x4 */}
                <svg
                  viewBox="0 0 220 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,223,193,0.3)]"
                >
                  {/* Ground Shadow underneath */}
                  <ellipse cx="110" cy="108" rx="85" ry="8" fill="black" fillOpacity="0.4" />

                  {/* Rear Canopy / Roof Cover (Classic convertible/hard top boxy shape) */}
                  <path d="M25 45 L85 45 L95 62 L20 62 Z" fill="#132125" />
                  <path d="M25 45 L95 45 L155 45 L160 62 L20 62 Z" fill="#0c1518" />
                  
                  {/* Windshield Pillar */}
                  <line x1="155" y1="45" x2="168" y2="68" stroke="#132125" strokeWidth="4" />
                  
                  {/* Front Cabin Windshield Glass */}
                  <path d="M148 48 L158 48 L166 65 L144 65 Z" fill="#e6fffc" fillOpacity="0.25" />

                  {/* Main Thar Metal Body Tub */}
                  {/* Front horizontal hood plane, bumper, rear wheel mount body, robust details */}
                  <path 
                    d="M15 62 L158 62 L185 62 L198 75 L200 86 L195 90 L180 92 L145 92 L130 92 L75 92 L60 92 L20 92 Z" 
                    fill="#00dfc1" 
                  />
                  
                  {/* Rugged Black Cladding Fender Guards */}
                  {/* Front Fender Guard */}
                  <path d="M140 82 C140 68, 185 68, 185 82 L190 82 L180 68 L142 68 Z" fill="#132125" />
                  {/* Rear Fender Guard */}
                  <path d="M30 82 C30 68, 75 68, 75 82 L80 82 L72 68 L32 68 Z" fill="#132125" />

                  {/* Rear Spare Mounted Wheel (Tops off the Thar aesthetic!) */}
                  <circle cx="10" cy="65" r="14" fill="#04080a" stroke="#132125" strokeWidth="2" />
                  <circle cx="10" cy="65" r="8" fill="#132125" />

                  {/* Front Radiator Grille Grid */}
                  <rect x="188" y="70" width="10" height="15" rx="1" fill="#132125" />
                  <line x1="190" y1="71" x2="190" y2="84" stroke="#00dfc1" strokeWidth="1" />
                  <line x1="193" y1="71" x2="193" y2="84" stroke="#00dfc1" strokeWidth="1" />
                  <line x1="196" y1="71" x2="196" y2="84" stroke="#00dfc1" strokeWidth="1" />

                  {/* Round Highlight Headlight (Glowing neon cyan!) */}
                  <circle cx="196" cy="74" r="4.5" fill="#e6fffc" className="animate-pulse" />
                  <circle cx="196" cy="74" r="2.5" fill="#00dfc1" />

                  {/* Cyber Underglow Neon Bar */}
                  <rect x="50" y="93" width="112" height="2" fill="#00dfc1" className="animate-pulse" />

                  {/* Side Heavy Rails / Foot Step */}
                  <rect x="75" y="90" width="55" height="4" fill="#132125" rx="1" />

                  {/* Door line seam details */}
                  <path d="M95 62 L95 90" stroke="#0c1518" strokeWidth="1.5" />
                  <path d="M142 62 L142 90" stroke="#0c1518" strokeWidth="1.5" />
                  {/* Handle */}
                  <rect x="100" y="67" width="10" height="3" fill="#132125" rx="0.5" />

                  {/* Front Heavy Utility Steel Bumper */}
                  <rect x="190" y="87" width="15" height="10" fill="#04080a" rx="10" />
                  <rect x="194" y="89" width="10" height="6" fill="#132125" rx="1" />
                </svg>

                {/* SPINNING FRONT WHEEL */}
                <div 
                  className="absolute" 
                  style={{ 
                    left: '141px', 
                    top: '65px', 
                    width: '42px', 
                    height: '42px' 
                  }}
                >
                  <svg viewBox="0 0 40 40" className="w-full h-full animate-[spin_0.35s_linear_infinite]">
                    {/* Off-road Tire Outer Bead */}
                    <circle cx="20" cy="20" r="18" fill="#132125" />
                    {/* Chunky Tread Grooves */}
                    <circle cx="20" cy="20" r="16" fill="#04080a" />
                    {/* Metal Teal Alloy Face */}
                    <circle cx="20" cy="20" r="10" fill="#070c0e" stroke="#00dfc1" strokeWidth="1.5" />
                    {/* Heavy dual spokes */}
                    <line x1="20" y1="10" x2="20" y2="30" stroke="#00dfc1" strokeWidth="2.5" />
                    <line x1="10" y1="20" x2="30" y2="20" stroke="#00dfc1" strokeWidth="2.5" />
                    <line x1="13" y1="13" x2="27" y2="27" stroke="#00dfc1" strokeWidth="1.5" />
                    <line x1="13" y1="27" x2="27" y2="13" stroke="#00dfc1" strokeWidth="1.5" />
                    {/* Hub Cap center */}
                    <circle cx="20" cy="20" r="3" fill="#00dfc1" />
                  </svg>
                </div>

                {/* SPINNING REAR WHEEL */}
                <div 
                  className="absolute" 
                  style={{ 
                    left: '30px', 
                    top: '65px', 
                    width: '42px', 
                    height: '42px' 
                  }}
                >
                  <svg viewBox="0 0 40 40" className="w-full h-full animate-[spin_0.35s_linear_infinite]">
                    {/* Off-road Tire Outer Bead */}
                    <circle cx="20" cy="20" r="18" fill="#132125" />
                    {/* Chunky Tread Grooves */}
                    <circle cx="20" cy="20" r="16" fill="#04080a" />
                    {/* Metal Teal Alloy Face */}
                    <circle cx="20" cy="20" r="10" fill="#070c0e" stroke="#00dfc1" strokeWidth="1.5" />
                    {/* Heavy dual spokes */}
                    <line x1="20" y1="10" x2="20" y2="30" stroke="#00dfc1" strokeWidth="2.5" />
                    <line x1="10" y1="20" x2="30" y2="20" stroke="#00dfc1" strokeWidth="2.5" />
                    <line x1="13" y1="13" x2="27" y2="27" stroke="#00dfc1" strokeWidth="1.5" />
                    <line x1="13" y1="27" x2="27" y2="13" stroke="#00dfc1" strokeWidth="1.5" />
                    {/* Hub Cap center */}
                    <circle cx="20" cy="20" r="3" fill="#00dfc1" />
                  </svg>
                </div>

              </motion.div>
            </motion.div>

          </div>

          {/* Luxury loading cue at the bottom */}
          <div className="absolute bottom-10 flex flex-col items-center gap-1.5 opacity-60">
            <span className="font-mono text-[9px] tracking-widest text-[#8da4a8] uppercase">Igniting Engines</span>
            <div className="w-16 h-0.5 bg-[#132125] rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#00dfc1] to-[#008b81]"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
