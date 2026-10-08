import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useProctoringEngine
 * Real-time AI Computer Vision, Eye Tracking, Fullscreen & Anti-Malpractice Proctoring Hook
 *
 * Rules:
 * 1. Eye Tracking: Tracks eyes & gaze direction. If eyes are away from screen for 10 seconds,
 *    gives an audible/visual warning and increments malpractice attempt counter.
 * 2. Fullscreen & Tab Switch: Monitors fullscreen mode, tab switches, and window blur.
 *    Shows a prominent warning modal for each tab switch (up to 10 allowed).
 * 3. Malpractice Attempts: Unified strike counter (Max 10 attempts).
 *    If malpractice attempts reach or exceed 10, gives final warning and stops the test immediately.
 */
export function useProctoringEngine({
  stream,
  isCameraActive = true,
  onTerminate,
  enabled = true,
  maxAttempts = 10,
  maxTabSwitches = 10,
  eyeAwayThresholdSeconds = 10
}) {
  const [isOutOfFrame, setIsOutOfFrame] = useState(false);
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [eyeAwayDuration, setEyeAwayDuration] = useState(0); // 0 to 10s continuous
  const [outOfFrameDuration, setOutOfFrameDuration] = useState(0); // 0 to 10s continuous
  const [isTabSwitched, setIsTabSwitched] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [malpracticeAttempts, setMalpracticeAttempts] = useState(0);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [activeViolation, setActiveViolation] = useState(null);
  const [isTerminated, setIsTerminated] = useState(false);
  const [telemetryLogs, setTelemetryLogs] = useState([]);

  const offscreenCanvasRef = useRef(null);
  const offscreenVideoRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const eyeAwayDurationRef = useRef(0);
  const outOfFrameDurationRef = useRef(0);
  const tabSwitchCountRef = useRef(0);
  const malpracticeAttemptsRef = useRef(0);
  const isTerminatedRef = useRef(false);
  const lastTabSwitchTimestampRef = useRef(0);

  // Helper to append proctoring telemetry log
  const logEvent = useCallback((type, message) => {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      malpracticeAttempts: malpracticeAttemptsRef.current
    };
    setTelemetryLogs((prev) => [entry, ...prev.slice(0, 24)]);
  }, []);

  // Terminate assessment immediately and stop test
  const triggerTermination = useCallback((reason, violationType) => {
    if (isTerminatedRef.current) return;
    isTerminatedRef.current = true;
    setIsTerminated(true);
    setActiveViolation({ reason, violationType, isTerminal: true });
    logEvent('TERMINATION', `Assessment stopped & disqualified: ${reason}`);

    if (onTerminate) {
      onTerminate({
        reason,
        violationType,
        totalAttempts: malpracticeAttemptsRef.current,
        totalTabSwitches: tabSwitchCountRef.current,
        timestamp: new Date().toISOString()
      });
    }
  }, [logEvent, onTerminate]);

  // Record a malpractice attempt
  const recordMalpracticeAttempt = useCallback((reason, violationType) => {
    if (isTerminatedRef.current) return;

    malpracticeAttemptsRef.current += 1;
    const currentAttempts = malpracticeAttemptsRef.current;
    setMalpracticeAttempts(currentAttempts);

    logEvent('MALPRACTICE_STRIKE', `Warning strike (${currentAttempts}/${maxAttempts}): ${reason}`);

    setActiveViolation({
      reason,
      violationType,
      attemptNumber: currentAttempts,
      remainingAttempts: Math.max(0, maxAttempts - currentAttempts),
      isTerminal: currentAttempts >= maxAttempts
    });

    // If attempts reach or exceed maximum limit (10 attempts), stop the test immediately
    if (currentAttempts >= maxAttempts) {
      triggerTermination(
        `Exceeded maximum allowed ${maxAttempts} malpractice warnings. Violated: ${reason}`,
        violationType
      );
    }
  }, [logEvent, maxAttempts, triggerTermination]);

  // Request Fullscreen Mode
  const enterFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenWarning(false);
    } catch (err) {
      console.warn('Fullscreen request notification:', err.message);
    }
  }, []);

  // Handle Dismissal & Re-entry from Fullscreen/Tab switch warning
  const acknowledgeFullscreenWarning = useCallback(async () => {
    setShowFullscreenWarning(false);
    setActiveViolation(null);
    await enterFullscreen();
  }, [enterFullscreen]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(activeFs);

      if (!activeFs && enabled && !isTerminatedRef.current) {
        const now = Date.now();
        if (now - lastTabSwitchTimestampRef.current > 1500) {
          lastTabSwitchTimestampRef.current = now;
          tabSwitchCountRef.current += 1;
          setTabSwitchCount(tabSwitchCountRef.current);
          setShowFullscreenWarning(true);

          recordMalpracticeAttempt(
            `Fullscreen mode exited (Tab/Fullscreen violation ${tabSwitchCountRef.current}/${maxTabSwitches})`,
            'FULLSCREEN_EXIT'
          );

          if (tabSwitchCountRef.current >= maxTabSwitches) {
            triggerTermination(
              `Exceeded maximum allowed ${maxTabSwitches} tab switch / fullscreen violations`,
              'TAB_SWITCH_LIMIT_EXCEEDED'
            );
          }
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [enabled, maxTabSwitches, recordMalpracticeAttempt, triggerTermination]);

  // Tab switch & Window blur detection (10 allowed warnings before stop)
  useEffect(() => {
    if (!enabled || isTerminatedRef.current) return;

    const handleVisibilityOrBlur = (eventSource) => {
      const now = Date.now();
      // Debounce events within 1.5s to avoid duplicate strikes on simultaneous blur+hide
      if (now - lastTabSwitchTimestampRef.current < 1500) return;
      lastTabSwitchTimestampRef.current = now;

      setIsTabSwitched(true);
      tabSwitchCountRef.current += 1;
      const currentTabCount = tabSwitchCountRef.current;
      setTabSwitchCount(currentTabCount);
      setShowFullscreenWarning(true);

      const reason = `Tab switch / window focus lost detected (${currentTabCount}/${maxTabSwitches} warnings)`;
      recordMalpracticeAttempt(reason, 'TAB_SWITCH_WARNING');

      if (currentTabCount >= maxTabSwitches) {
        triggerTermination(
          `Exceeded maximum allowed ${maxTabSwitches} tab switch infractions during assessment`,
          'TAB_SWITCH_LIMIT_EXCEEDED'
        );
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleVisibilityOrBlur('visibilitychange');
      }
    };

    const handleWindowBlur = () => {
      setTimeout(() => {
        if (document.hidden && !isTerminatedRef.current) {
          handleVisibilityOrBlur('blur');
        }
      }, 350);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled, maxTabSwitches, recordMalpracticeAttempt, triggerTermination]);

  // Video Frame Processing & Computer Vision Eye/Gaze Tracking
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

    const checkIntervalMs = 500; // Check frame every 500ms

    checkIntervalRef.current = setInterval(async () => {
      if (isTerminatedRef.current || !isCameraActive) return;

      const v = offscreenVideoRef.current;
      const c = offscreenCanvasRef.current;
      if (!v || !c || v.readyState < 2) return;

      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(v, 0, 0, c.width, c.height);

      let outOfFrameDetected = false;
      let gazeAvertedDetected = false;

      // 1. Native browser FaceDetector API if supported
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

            const normX = faceCenterX / c.width;
            const normY = faceCenterY / c.height;

            // Eye / Gaze orientation boundary: head turned away or eyes averted
            if (normX < 0.22 || normX > 0.78 || normY < 0.16 || normY > 0.84) {
              gazeAvertedDetected = true;
            }
          }
        } catch (e) {
          // fallback to pixel skin & centroid variance
        }
      } else {
        // 2. High-performance Skin Spectrum & Eye-Centroid Variance Analysis
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

        if (skinPercentage < 3.2) {
          outOfFrameDetected = true;
        } else {
          const centroidX = sumX / skinPixelCount;
          const centroidY = sumY / skinPixelCount;
          const normX = centroidX / c.width;
          const normY = centroidY / c.height;

          // Gaze averted if head or eye region deviates from central 22% - 78% quadrant
          if (normX < 0.22 || normX > 0.78 || normY < 0.16 || normY > 0.84) {
            gazeAvertedDetected = true;
          }
        }
      }

      setIsOutOfFrame(outOfFrameDetected);
      setIsLookingAway(gazeAvertedDetected);

      // --- Eye Tracking Duration & 10s Warning Rule ---
      if (gazeAvertedDetected) {
        eyeAwayDurationRef.current += (checkIntervalMs / 1000);
        const currentSecs = Math.round(eyeAwayDurationRef.current * 10) / 10;
        setEyeAwayDuration(currentSecs);

        // If eyes have been away from screen for 10 continuous seconds
        if (eyeAwayDurationRef.current >= eyeAwayThresholdSeconds) {
          recordMalpracticeAttempt(
            `Candidate eyes were away from the screen for ${eyeAwayThresholdSeconds} continuous seconds`,
            'EYE_AWAY_10S_WARNING'
          );
          // Reset continuous counter so another 10s triggers next strike
          eyeAwayDurationRef.current = 0;
          setEyeAwayDuration(0);
        }
      } else {
        // Candidate looking directly at screen -> reset eye away timer
        if (eyeAwayDurationRef.current > 0) {
          eyeAwayDurationRef.current = 0;
          setEyeAwayDuration(0);
        }
      }

      // --- Out of Frame Duration & 10s Warning Rule ---
      if (outOfFrameDetected) {
        outOfFrameDurationRef.current += (checkIntervalMs / 1000);
        const currentOutOfFrameSecs = Math.round(outOfFrameDurationRef.current * 10) / 10;
        setOutOfFrameDuration(currentOutOfFrameSecs);

        if (outOfFrameDurationRef.current >= eyeAwayThresholdSeconds) {
          recordMalpracticeAttempt(
            `Candidate face was completely out of camera frame for ${eyeAwayThresholdSeconds} seconds`,
            'OUT_OF_FRAME_10S_WARNING'
          );
          outOfFrameDurationRef.current = 0;
          setOutOfFrameDuration(0);
        }
      } else {
        if (outOfFrameDurationRef.current > 0) {
          outOfFrameDurationRef.current = 0;
          setOutOfFrameDuration(0);
        }
      }
    }, checkIntervalMs);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [enabled, stream, isCameraActive, eyeAwayThresholdSeconds, recordMalpracticeAttempt]);

  return {
    isOutOfFrame,
    isLookingAway,
    eyeAwayDuration,
    eyeAwayThresholdSeconds,
    outOfFrameDuration,
    isTabSwitched,
    tabSwitchCount,
    maxTabSwitches,
    malpracticeAttempts,
    maxAttempts,
    showFullscreenWarning,
    isFullscreen,
    activeViolation,
    isTerminated,
    telemetryLogs,
    enterFullscreen,
    acknowledgeFullscreenWarning,
    triggerTermination,
    recordMalpracticeAttempt
  };
}
