import { useState, useEffect, useRef, useCallback } from 'react';

export function useMediaStream(options = { video: true, audio: true, autoStart: false }) {
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [isInitializing, setIsInitializing] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);

  const startStream = useCallback(async () => {
    setIsInitializing(true);
    setPermissionError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone access is not supported in this browser.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: options.video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
        audio: options.audio ? { echoCancellation: true, noiseSuppression: true } : false
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);

      const hasVideo = mediaStream.getVideoTracks().length > 0;
      const hasAudio = mediaStream.getAudioTracks().length > 0;
      setIsCameraActive(hasVideo);
      setIsMicActive(hasAudio);

      // Set up AudioContext Analyser for real-time microphone volume level
      if (hasAudio) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.5;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(mediaStream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateVolume = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);

              // Calculate RMS or average volume level
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              // Normalize roughly to 0 - 100
              const normalized = Math.min(100, Math.round((average / 128) * 100));
              setAudioLevel(normalized);

              animFrameRef.current = requestAnimationFrame(updateVolume);
            };

            animFrameRef.current = requestAnimationFrame(updateVolume);
          }
        } catch (audioErr) {
          console.warn('AudioContext volume meter warning:', audioErr);
        }
      }

      setIsInitializing(false);
      return mediaStream;
    } catch (err) {
      console.warn('MediaStream permission error:', err);
      setIsInitializing(false);
      let message = 'Unable to access camera or microphone.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera or microphone access was denied. Please allow permissions in your browser URL bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera or microphone hardware found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera or microphone is already in use by another application.';
      }
      setPermissionError(message);
      setHasPermission(false);
      throw err;
    }
  }, [options.video, options.audio]);

  const stopStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setStream(null);
    setIsCameraActive(false);
    setIsMicActive(false);
    setAudioLevel(0);
  }, []);

  const toggleCamera = useCallback(() => {
    if (!streamRef.current) return;
    const videoTracks = streamRef.current.getVideoTracks();
    if (videoTracks.length > 0) {
      const nextState = !videoTracks[0].enabled;
      videoTracks[0].enabled = nextState;
      setIsCameraActive(nextState);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length > 0) {
      const nextState = !audioTracks[0].enabled;
      audioTracks[0].enabled = nextState;
      setIsMicActive(nextState);
    }
  }, []);

  useEffect(() => {
    if (options.autoStart) {
      startStream().catch(() => {});
    }
    return () => {
      stopStream();
    };
  }, [options.autoStart, startStream, stopStream]);

  return {
    stream,
    isCameraActive,
    isMicActive,
    hasPermission,
    permissionError,
    audioLevel,
    isInitializing,
    startStream,
    stopStream,
    toggleCamera,
    toggleMic
  };
}
