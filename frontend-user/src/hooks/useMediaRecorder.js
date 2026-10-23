import { useState, useRef, useEffect, useCallback } from 'react';

export const useMediaRecorder = () => {
  // Streams
  const [userStream, setUserStream] = useState(null); // Camera + Mic
  const [screenStream, setScreenStream] = useState(null); // Screen Share
  
  // Status states
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const [hasScreenPermission, setHasScreenPermission] = useState(false);
  const [isScreenSharingStopped, setIsScreenSharingStopped] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaError, setMediaError] = useState(null);

  // Recorder references
  const webcamRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const screenRecorderRef = useRef(null);

  // Chunks storage
  const webcamChunksRef = useRef([]);
  const audioChunksRef = useRef([]);
  const screenChunksRef = useRef([]);

  // Timing
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const questionTimestampsRef = useRef({});

  /**
   * Request Webcam and Microphone Access
   */
  const requestUserMedia = useCallback(async () => {
    setMediaError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support media recording APIs.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      setUserStream(stream);
      setHasCameraPermission(stream.getVideoTracks().length > 0);
      setHasMicPermission(stream.getAudioTracks().length > 0);
      return stream;
    } catch (err) {
      console.error('Camera/Mic permission error:', err);
      let msg = 'Camera and Microphone access was denied or not found.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera & microphone permissions are required. Please allow access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera or microphone device found on this system.';
      }
      setMediaError(msg);
      setHasCameraPermission(false);
      setHasMicPermission(false);
      return null;
    }
  }, []);

  /**
   * Request Screen Sharing Stream
   */
  const requestScreenMedia = useCallback(async () => {
    setMediaError(null);
    setIsScreenSharingStopped(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: true, // Audio where supported
      });

      // Listen for when candidate manually stops sharing via browser bar
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsScreenSharingStopped(true);
          setHasScreenPermission(false);
        };
      }

      setScreenStream(stream);
      setHasScreenPermission(true);
      return stream;
    } catch (err) {
      console.error('Screen sharing error:', err);
      let msg = 'Screen sharing permission was cancelled or denied.';
      if (err.name === 'NotAllowedError') {
        msg = 'Screen sharing permission is required for the technical interview.';
      }
      setMediaError(msg);
      setHasScreenPermission(false);
      return null;
    }
  }, []);

  /**
   * Start Multi-stream Recording
   */
  const startRecording = useCallback((activeUserStream = userStream, activeScreenStream = screenStream) => {
    const streamToUse = activeUserStream || userStream;
    if (!streamToUse) {
      setMediaError('Cannot start recording: Camera and microphone streams are not active.');
      return false;
    }

    try {
      webcamChunksRef.current = [];
      audioChunksRef.current = [];
      screenChunksRef.current = [];
      questionTimestampsRef.current = { 0: 0 }; // Question 1 starts at 0s

      const mimeTypeVideo = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mimeTypeAudio = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      // 1. Webcam + Mic Recorder
      const webcamRecorder = new MediaRecorder(streamToUse, {
        mimeType: mimeTypeVideo,
        videoBitsPerSecond: 1500000, // 1.5 Mbps
      });

      webcamRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          webcamChunksRef.current.push(event.data);
        }
      };
      webcamRecorderRef.current = webcamRecorder;
      webcamRecorder.start(1000); // 1-second timeslices

      // 2. Pure Audio Recorder (extract audio tracks only)
      const audioTracks = streamToUse.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioOnlyStream = new MediaStream(audioTracks);
        const audioRecorder = new MediaRecorder(audioOnlyStream, {
          mimeType: mimeTypeAudio,
          audioBitsPerSecond: 128000,
        });

        audioRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        audioRecorderRef.current = audioRecorder;
        audioRecorder.start(1000);
      }

      // 3. Screen Recorder (if active)
      const currentScreenStream = activeScreenStream || screenStream;
      if (currentScreenStream && currentScreenStream.active) {
        const screenRecorder = new MediaRecorder(currentScreenStream, {
          mimeType: mimeTypeVideo,
          videoBitsPerSecond: 2000000, // 2 Mbps
        });

        screenRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            screenChunksRef.current.push(event.data);
          }
        };
        screenRecorderRef.current = screenRecorder;
        screenRecorder.start(1000);
      }

      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();

      // Start elapsed timer
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setRecordingDuration(elapsed);
        }
      }, 1000);

      return true;
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      setMediaError(`Recording initiation failed: ${err.message}`);
      return false;
    }
  }, [userStream, screenStream]);

  /**
   * Pause Recording
   */
  const pauseRecording = useCallback(() => {
    if (webcamRecorderRef.current && webcamRecorderRef.current.state === 'recording') {
      webcamRecorderRef.current.pause();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state === 'recording') {
      audioRecorderRef.current.pause();
    }
    if (screenRecorderRef.current && screenRecorderRef.current.state === 'recording') {
      screenRecorderRef.current.pause();
    }
    setIsPaused(true);
  }, []);

  /**
   * Resume Recording
   */
  const resumeRecording = useCallback(() => {
    if (webcamRecorderRef.current && webcamRecorderRef.current.state === 'paused') {
      webcamRecorderRef.current.resume();
    }
    if (audioRecorderRef.current && audioRecorderRef.current.state === 'paused') {
      audioRecorderRef.current.resume();
    }
    if (screenRecorderRef.current && screenRecorderRef.current.state === 'paused') {
      screenRecorderRef.current.resume();
    }
    setIsPaused(false);
  }, []);

  /**
   * Associate question index with current elapsed timestamp
   */
  const markQuestionTimestamp = useCallback((questionIndex) => {
    const elapsed = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : 0;
    questionTimestampsRef.current[questionIndex] = elapsed;
  }, []);

  /**
   * Stop All Recorders and return consolidated blobs
   */
  const stopRecording = useCallback(async () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const duration = startTimeRef.current
      ? Math.floor((Date.now() - startTimeRef.current) / 1000)
      : recordingDuration;

    return new Promise((resolve) => {
      let stoppedCount = 0;
      const expectedStops = (webcamRecorderRef.current ? 1 : 0) +
        (audioRecorderRef.current ? 1 : 0) +
        (screenRecorderRef.current ? 1 : 0);

      const checkComplete = () => {
        stoppedCount++;
        if (stoppedCount >= expectedStops || expectedStops === 0) {
          const webcamBlob = webcamChunksRef.current.length > 0
            ? new Blob(webcamChunksRef.current, { type: 'video/webm' })
            : null;

          const audioBlob = audioChunksRef.current.length > 0
            ? new Blob(audioChunksRef.current, { type: 'audio/webm' })
            : null;

          const screenBlob = screenChunksRef.current.length > 0
            ? new Blob(screenChunksRef.current, { type: 'video/webm' })
            : null;

          setIsRecording(false);

          resolve({
            webcamBlob,
            audioBlob,
            screenBlob,
            duration,
            questionTimestamps: questionTimestampsRef.current,
          });
        }
      };

      if (webcamRecorderRef.current && webcamRecorderRef.current.state !== 'inactive') {
        webcamRecorderRef.current.onstop = checkComplete;
        webcamRecorderRef.current.stop();
      } else {
        checkComplete();
      }

      if (audioRecorderRef.current && audioRecorderRef.current.state !== 'inactive') {
        audioRecorderRef.current.onstop = checkComplete;
        audioRecorderRef.current.stop();
      }

      if (screenRecorderRef.current && screenRecorderRef.current.state !== 'inactive') {
        screenRecorderRef.current.onstop = checkComplete;
        screenRecorderRef.current.stop();
      }
    });
  }, [recordingDuration]);

  /**
   * Stop all active hardware streams
   */
  const stopAllStreams = useCallback(() => {
    if (userStream) {
      userStream.getTracks().forEach((t) => t.stop());
      setUserStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach((t) => t.stop());
      setScreenStream(null);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  }, [userStream, screenStream]);

  // Clean up tracks on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (userStream) userStream.getTracks().forEach((t) => t.stop());
      if (screenStream) screenStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return {
    userStream,
    screenStream,
    hasCameraPermission,
    hasMicPermission,
    hasScreenPermission,
    isScreenSharingStopped,
    isRecording,
    isPaused,
    recordingDuration,
    mediaError,
    requestUserMedia,
    requestScreenMedia,
    startRecording,
    pauseRecording,
    resumeRecording,
    markQuestionTimestamp,
    stopRecording,
    stopAllStreams,
    clearError: () => setMediaError(null),
  };
};
