import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Minimize2,
  Maximize2,
  GripHorizontal,
  AlertTriangle,
  Volume2,
  Eye,
  EyeOff,
  Sparkles,
  Move,
  RotateCcw
} from 'lucide-react';

const ProctoringCamera = ({
  stream,
  isCameraActive = true,
  audioLevel = 0,
  pitchHz = 0,
  voiceEmotion = {},
  isLookingAway = false,
  eyeAwayDuration = 0,
  eyeAwayThresholdSeconds = 10,
  isOutOfFrame = false,
  malpracticeAttempts = 0,
  maxAttempts = 10,
  tabSwitchCount = 0,
  initialPosition = null
}) => {
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(() => {
    if (initialPosition) return initialPosition;
    // Default position: floating at bottom right
    const width = 230;
    const height = 180;
    const initialX = typeof window !== 'undefined' ? Math.max(16, window.innerWidth - width - 24) : 900;
    const initialY = typeof window !== 'undefined' ? Math.max(70, window.innerHeight - height - 24) : 600;
    return { x: initialX, y: initialY };
  });
  const [isDragging, setIsDragging] = useState(false);

  // Attach video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Keep window inside viewport bounds on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const cardWidth = isMinimized ? 170 : 230;
        const cardHeight = isMinimized ? 44 : 190;
        const maxX = Math.max(10, window.innerWidth - cardWidth - 16);
        const maxY = Math.max(10, window.innerHeight - cardHeight - 16);
        return {
          x: Math.min(Math.max(16, prev.x), maxX),
          y: Math.min(Math.max(60, prev.y), maxY)
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMinimized]);

  // Drag handlers
  const handleStartDrag = useCallback((clientX, clientY) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  }, [position]);

  const handleMouseDown = (e) => {
    // Only drag from header/handle or if target is not a button
    if (e.target.closest('button')) return;
    e.preventDefault();
    handleStartDrag(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('button')) return;
    if (e.touches.length > 0) {
      handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const cardWidth = isMinimized ? 170 : 230;
      const cardHeight = isMinimized ? 44 : 190;
      const maxX = Math.max(10, window.innerWidth - cardWidth - 16);
      const maxY = Math.max(10, window.innerHeight - cardHeight - 16);

      const newX = Math.min(Math.max(16, e.clientX - dragOffsetRef.current.x), maxX);
      const newY = Math.min(Math.max(60, e.clientY - dragOffsetRef.current.y), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const cardWidth = isMinimized ? 170 : 230;
      const cardHeight = isMinimized ? 44 : 190;
      const maxX = Math.max(10, window.innerWidth - cardWidth - 16);
      const maxY = Math.max(10, window.innerHeight - cardHeight - 16);

      const newX = Math.min(Math.max(16, touch.clientX - dragOffsetRef.current.x), maxX);
      const newY = Math.min(Math.max(60, touch.clientY - dragOffsetRef.current.y), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handleEndDrag = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEndDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEndDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [isMinimized]);

  // Snap to corners helper
  const snapToCorner = (corner) => {
    const cardWidth = isMinimized ? 170 : 230;
    const cardHeight = isMinimized ? 44 : 190;
    const padding = 20;

    switch (corner) {
      case 'top-left':
        setPosition({ x: padding, y: 70 });
        break;
      case 'top-right':
        setPosition({ x: window.innerWidth - cardWidth - padding, y: 70 });
        break;
      case 'bottom-left':
        setPosition({ x: padding, y: window.innerHeight - cardHeight - padding });
        break;
      case 'bottom-right':
      default:
        setPosition({ x: window.innerWidth - cardWidth - padding, y: window.innerHeight - cardHeight - padding });
        break;
    }
  };

  const emotionLabel = typeof voiceEmotion === 'string'
    ? voiceEmotion
    : (voiceEmotion?.emotion || 'Confident');
  const isEyeAway = isLookingAway && eyeAwayDuration > 0.5;

  return (
    <div
      ref={cardRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
        touchAction: 'none'
      }}
      className={`select-none transition-shadow ${
        isDragging ? 'cursor-grabbing opacity-90 shadow-2xl scale-[1.02]' : 'cursor-default shadow-xl'
      }`}
    >
      <div
        className={`bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl transition-all duration-200 ${
          isMinimized ? 'w-[170px]' : 'w-[230px]'
        }`}
      >
        {/* DRAGGABLE HEADER BAR */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`px-2.5 py-1.5 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between cursor-grab ${
            isDragging ? 'cursor-grabbing bg-slate-900' : ''
          }`}
          title="Click and drag anywhere on screen"
        >
          <div className="flex items-center gap-1.5">
            <GripHorizontal className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 transition" />
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
              Live Cam
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Strike indicator */}
            {malpracticeAttempts > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                  malpracticeAttempts > 5
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
                title="Malpractice Strikes (Max 10)"
              >
                {malpracticeAttempts}/10
              </span>
            )}

            {/* Quick snap position reset */}
            <button
              type="button"
              onClick={() => snapToCorner('bottom-right')}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Snap to Bottom-Right Corner"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>

            {/* Minimize / Expand Toggle */}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isMinimized ? 'Expand Video' : 'Minimize to Floating Pill'}
            >
              {isMinimized ? <Maximize2 className="w-2.5 h-2.5" /> : <Minimize2 className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>

        {/* COMPACT VIDEO VIEWPORT */}
        {!isMinimized ? (
          <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden flex items-center justify-center">
            {stream && isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Subtle face centering oval */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-25">
                  <div className={`w-20 h-28 border border-dashed rounded-full transition-colors ${
                    isEyeAway ? 'border-amber-400' : 'border-emerald-400'
                  }`} />
                </div>

                {/* Top Floating Status Overlay */}
                <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                  {/* Eye tracking state pill */}
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-md border shadow-sm transition-all ${
                      isEyeAway
                        ? 'bg-amber-950/90 text-amber-300 border-amber-500/60 animate-pulse'
                        : 'bg-slate-950/80 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {isEyeAway ? (
                      <>
                        <EyeOff className="w-2.5 h-2.5 text-amber-400" />
                        <span>Gaze Away ({eyeAwayDuration.toFixed(0)}s/10s)</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Eyes Focused</span>
                      </>
                    )}
                  </div>

                  {tabSwitchCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-slate-900/90 text-amber-400 border border-amber-500/30">
                      Tabs {tabSwitchCount}/10
                    </span>
                  )}
                </div>

                {/* Bottom Live Audio & Emotion HUD */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between px-2 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800/90 text-[9px]">
                  {/* Audio Equalizer */}
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-2.5 h-2.5 text-indigo-400" />
                    <div className="flex items-center gap-0.5 h-2.5">
                      {[15, 45, 80, 50, 30].map((baseHeight, idx) => {
                        const scale = Math.max(0.2, audioLevel / 100);
                        const heightPercent = Math.min(100, Math.round(baseHeight * scale * 2.2));
                        return (
                          <div
                            key={idx}
                            className={`w-0.5 rounded-full transition-all duration-75 ${
                              audioLevel > 50 ? 'bg-indigo-400' : 'bg-emerald-400'
                            }`}
                            style={{ height: `${Math.max(2, heightPercent)}%` }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Emotion chip */}
                  <div className="flex items-center gap-1 font-semibold text-indigo-300 truncate max-w-[90px]">
                    <Sparkles className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{emotionLabel}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 text-center space-y-1">
                <CameraOff className="w-5 h-5 text-slate-600 mx-auto" />
                <p className="text-[10px] text-slate-400 font-medium">Camera Paused</p>
              </div>
            )}
          </div>
        ) : (
          /* MINIMIZED PILL VIEW */
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="p-1.5 px-2 flex items-center justify-between text-xs text-slate-300 cursor-grab"
          >
            <div className="flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-indigo-400" />
              <span className="text-[10px] font-bold truncate max-w-[70px]">{emotionLabel}</span>
            </div>

            {/* Micro Equalizer */}
            <div className="flex items-center gap-0.5 h-2.5">
              {[20, 60, 90, 40].map((baseHeight, idx) => (
                <div
                  key={idx}
                  className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(2, Math.round(baseHeight * (audioLevel / 100) * 2))}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctoringCamera;
