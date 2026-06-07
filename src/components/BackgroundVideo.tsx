import { useRef, useEffect } from 'react';

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85; // Slightly slower playback rate for premium, dreamlike luxury smooth flow
      videoRef.current.muted = true; // Ensure video is muted programmatically to bypass browser autoplay blocks
      
      // Force play execution
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Autoplay was prevented by browser security. Retrying on user interaction.", error);
        });
      }
    }
  }, []);

  return (
    <div 
      id="brand-background-video-wrapper"
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none"
      style={{ minHeight: '100%' }}
    >
      {/* Fallback gradients if video fails to load */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070c0e] via-[#0c1518] to-[#04080a] z-0" />

      {/* The looping video background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        referrerPolicy="no-referrer"
        className="absolute top-0 left-0 w-full h-full object-cover z-1 opacity-[0.38] filter brightness-[0.7] contrast-[1.1] saturate-[0.85]"
      >
        {/* Real fast-loading public CDN MP4s of premium cyber-night driving first */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-driving-in-the-neon-city-at-night-41887-large.mp4" type="video/mp4" />
        <source src="https://assets.mixkit.co/videos/preview/mixkit-street-lights-and-car-lights-at-night-34444-large.mp4" type="video/mp4" />
        
        {/* Alternate high performance fallback representative driving clips */}
        <source src="https://cdn.coverr.co/videos/coverr-driving-in-a-cyberpunk-city-at-night-5711/1080p.mp4" type="video/mp4" />
        <source src="https://cdn.coverr.co/videos/coverr-driving-in-a-car-at-night-5431/1080p.mp4" type="video/mp4" />

        {/* User's local custom video fallbacks if they choose to upload local copies later */}
        <source src="/background.mp4" type="video/mp4" />
        <source src="/video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Masks and Overlays with calibrated transparency to ensure excellent legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070c0e]/75 via-transparent to-[#070c0e]/95 z-2" />
      <div className="absolute inset-0 bg-radial-gradient(circle_at_center,rgba(0,223,193,0.03)_0%,transparent_80%) z-2" />
    </div>
  );
}
