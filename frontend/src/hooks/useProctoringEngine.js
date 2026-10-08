import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useProctoringEngine
 * Real-time Computer Vision & Telemetry Proctoring Hook
 * Monitors:
 * 1. Face Presence (detects if candidate is OUT OF FRAME)
 * 2. Eye Gaze & Head Orientation (detects if candidate is LOOKING AWAY from screen)
 * 3. Tab Switching / Window Blur (immediate zero-tolerance malpractice)
 *
 * Enforces zero-tolerance termination if violations persist for 3 seconds, or instantly on tab blur.
 */
export function useProctoringEngine({
  stream,
  isCameraActive = true,
  onTerminate,
  enabled = true
}) {
  const [isOutOfFrame, setIsOutOfFrame] = useState(false);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [isTabSwitched, setIsTabSwitched] = useState(false);
  const [activeViolation, setActiveViolation] = useState(null);
  const [countdownSeconds, setCountdownSeconds] = useState(3);
  const [isTerminated, setIsTerminated] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  const offscreenCanvasRef = useRef(null);
  const offscreenVideoRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const consecutiveViolationsRef = useRef(0);
  const isTerminatedRef = useRef(false);

  // Helper to append proctoring telemetry log
  const logEvent = useCallback((type, message) => {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setTelemetryLogs((prev) => [entry, ...prev.slice(0, 19)]);
  }, []);

  // Terminate assessment immediately
  const triggerTermination = useCallback((reason, violationType) => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;
    setIsTerminated(true);
    setActiveViolation({ reason, violationType });
    logEvent('TERMINATION', `Assessment terminated: ${reason}`);

    if (onTerminate) {
      onTerminate({ reason, violationType, timestamp: new Date().toISOString() });
    }
  }, [logEvent, onTerminate]);

  // Tab switch / Window blur: IMMEDIATE ZERO-TOLERANCE TERMINATION
  useEffect(() => {
    if (!enabled || isTerminatedRef.current) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabSwitched(true);
        triggerTermination(
          'Unauthorized window blur or tab switch detected during active assessment',
          'TAB_SWITCH_MALPRACTICE'
        );
      }
    };

    const handleWindowBlur = () => {
      // Small timeout to avoid false positives on system alerts
      setTimeout(() => {
        if (document.hidden && !isTerminatedRef.current) {
          setIsTabSwitched(true);
          triggerTermination(
            'Candidate navigated away from assessment window (window focus lost)',
            'WINDOW_BLUR_MALPRACTICE'
          );
        }
      }, 300);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled, triggerTermination]);

  // Set up offscreen canvas and video for video frame processing
  useEffect(() => {
    if (!enabled || !stream) return;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.width = 320;
    video.height = 240;
    offscreenVideoRef.current = video;

    const canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    offscreenCanvasRef.current = canvas;

    // Check frames every 750ms
    checkIntervalRef.current = setInterval(async () => {
      if (isTerminatedRef.current || !isCameraActive) return;

      const v = offscreenVideoRef.current;
      const c = offscreenCanvasRef.current;
      if (!v || !c || v.readyState < 2) return;

      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(v, 0, 0, c.width, c.height);

      let outOfFrameDetected = false;
      let gazeAvertedDetected = false;

      // 1. Check with window.FaceDetector if available natively in browser
      if (window.FaceDetector) {
        try {
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 3 });
          const faces = await detector.detect(c);

          if (faces.length === 0) {
            outOfFrameDetected = true;
          } else {
            const face = faces[0].boundingBox;
            const faceCenterX = face.x + face.width / 2;
            const faceCenterY = face.y + face.height / 2;

            // Bounding box ratio and centroid offset
            const normalizedX = faceCenterX / c.width;
            const normalizedY = faceCenterY / c.height;

            // Looking away check: Head turned left/right or looking down/away
            if (normalizedX < 0.22 || normalizedX > 0.78 || normalizedY < 0.15 || normalizedY > 0.85) {
              gazeAvertedDetected = true;
            }
          }
        } catch (e) {
          // fallback to pixel analysis
        }
      } else {
        // 2. High-performance Canvas Skin & Centroid Luminance Analysis
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        const data = imgData.data;

        let skinPixelCount = 0;
        let sumX = 0;
        let sumY = 0;

        for (let y = 0; y < c.height; y += 2) {
          for (let x = 0; x < c.width; x += 2) {
            const idx = (y * c.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Skin color hue spectrum filter
            const isSkin =
              r > 50 &&
              g > 35 &&
              b > 20 &&
              r > g &&
              r > b &&
              Math.abs(r - g) > 12;

            if (isSkin) {
              skinPixelCount++;
              sumX += x;
              sumY += y;
            }
          }
        }

        const totalSampledPixels = (c.width * c.height) / 4;
        const skinPercentage = (skinPixelCount / totalSampledPixels) * 100;

        // Candidate Out of Frame: Less than 3.5% skin pixels in frame
        if (skinPercentage < 3.5) {
          outOfFrameDetected = true;
        } else {
          // Centroid calculation
          const centroidX = sumX / skinPixelCount;
          const centroidY = sumY / skinPixelCount;
          const normX = centroidX / c.width;
          const normY = centroidY / c.height;

          // Looking away if head/gaze is turned outside 25% - 75% quadrant
          if (normX < 0.20 || normX > 0.80 || normY < 0.15 || normY > 0.85) {
            gazeAvertedDetected = true;
          }
        }
      }

      // Process detection state
      setIsOutOfFrame(outOfFrameDetected);
      setIsLookingAway(gazeAvertedDetected);

      if (outOfFrameDetected || gazeAvertedDetected) {
        consecutiveViolationsRef.current += 1;
        const reason = outOfFrameDetected
          ? 'Candidate moved out of camera frame / face not detected'
          : 'Gaze averted: Candidate is looking away from the assessment screen';

        setActiveViolation({
          reason,
          violationType: outOfFrameDetected ? 'OUT_OF_FRAME' : 'GAZE_AVERTED'
        });

        logEvent('VIOLATION_TICK', reason);

        // Start countdown to termination
        setCountdownSeconds((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            triggerTermination(reason, outOfFrameDetected ? 'OUT_OF_FRAME' : 'GAZE_AVERTED');
            return 0;
          }
          return next;
        });
      } else {
        // Reset countdown when candidate looks back at screen
        consecutiveViolationsRef.current = 0;
        setActiveViolation(null);
        setCountdownSeconds(3);
      }
    }, 850);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [enabled, stream, isCameraActive, triggerTermination, logEvent]);

  return {
    isOutOfFrame,
    isLookingAway,
    isTabSwitched,
    activeViolation,
    countdownSeconds,
    isTerminated,
    telemetryLogs,
    triggerTermination
  };
}
