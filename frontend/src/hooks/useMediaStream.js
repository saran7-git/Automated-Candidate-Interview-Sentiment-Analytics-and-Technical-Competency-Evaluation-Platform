import { useState, useEffect, useRef, useCallback } from 'react';

export function useMediaStream(options = { video: true, audio: true, autoStart: false }) {
  const [stream, setStream] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100
  const [pitchHz, setPitchHz] = useState(0);
  const [voiceEmotion, setVoiceEmotion] = useState({
    emotion: 'Silent / Listening',
    confidence: 85,
    pitchHz: 0,
    energyLevel: 'Low',
    hesitationScore: 0,
    tonePolarity: 'Neutral',
    emotionClass: 'text-slate-400 bg-slate-800'
  });
  const [isInitializing, setIsInitializing] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const streamRef = useRef(null);
  const pitchHistoryRef = useRef([]);
  const volumeHistoryRef = useRef([]);
  const silenceCountRef = useRef(0);
  const speakingCountRef = useRef(0);

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

      // Set up AudioContext Analyser for real-time microphone volume level & voice emotion
      if (hasAudio) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;

            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 512;
            analyser.smoothingTimeConstant = 0.65;
            analyserRef.current = analyser;

            const source = audioCtx.createMediaStreamSource(mediaStream);
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const timeDomainArray = new Float32Array(analyser.fftSize);

            let frameCounter = 0;

            const updateAudioAndEmotion = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              analyserRef.current.getFloatTimeDomainData(timeDomainArray);

              // 1. Calculate RMS volume
              let sum = 0;
              let peakIdx = 0;
              let peakVal = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
                if (dataArray[i] > peakVal) {
                  peakVal = dataArray[i];
                  peakIdx = i;
                }
              }
              const average = sum / dataArray.length;
              const normalized = Math.min(100, Math.round((average / 128) * 100));
              setAudioLevel(normalized);

              // 2. Frequency / Pitch estimation (Peak bin approximation)
              const sampleRate = audioCtx.sampleRate || 44100;
              const nyquist = sampleRate / 2;
              const binSize = nyquist / dataArray.length;
              const estimatedPitch = Math.round(peakIdx * binSize);

              frameCounter++;
              if (frameCounter % 6 === 0) {
                // Track volume & pitch history
                volumeHistoryRef.current.push(normalized);
                if (volumeHistoryRef.current.length > 20) volumeHistoryRef.current.shift();

                if (normalized > 8 && estimatedPitch > 60 && estimatedPitch < 600) {
                  pitchHistoryRef.current.push(estimatedPitch);
                  if (pitchHistoryRef.current.length > 15) pitchHistoryRef.current.shift();
                  speakingCountRef.current += 1;
                } else {
                  silenceCountRef.current += 1;
                }

                // 3. Classify Voice Emotion based on acoustics
                if (normalized <= 6) {
                  setVoiceEmotion({
                    emotion: 'Ambient / Listening',
                    confidence: 90,
                    pitchHz: 0,
                    energyLevel: 'Low',
                    hesitationScore: 5,
                    tonePolarity: 'Neutral',
                    emotionClass: 'text-slate-400 bg-slate-800/80 border-slate-700'
                  });
                  setPitchHz(0);
                } else {
                  setPitchHz(estimatedPitch);

                  // Calculate pitch variance
                  const pHistory = pitchHistoryRef.current;
                  let pitchVar = 0;
                  if (pHistory.length > 2) {
                    const avgP = pHistory.reduce((a, b) => a + b, 0) / pHistory.length;
                    const sqDiffs = pHistory.map(p => Math.pow(p - avgP, 2));
                    pitchVar = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / pHistory.length);
                  }

                  const recentAvgVol = volumeHistoryRef.current.reduce((a, b) => a + b, 0) / (volumeHistoryRef.current.length || 1);
                  const totalSamples = speakingCountRef.current + silenceCountRef.current || 1;
                  const hesitationScore = Math.min(100, Math.round((silenceCountRef.current / totalSamples) * 100));

                  let currentEmotion = 'Confident';
                  let emotionConfidence = 85;
                  let energy = 'Optimal';
                  let polarity = 'Positive';
                  let emClass = 'text-emerald-300 bg-emerald-950/80 border-emerald-700';

                  if (recentAvgVol > 55 && pitchVar > 35) {
                    currentEmotion = 'Enthusiastic & Engaging';
                    emotionConfidence = 92;
                    energy = 'High';
                    polarity = 'Positive';
                    emClass = 'text-indigo-300 bg-indigo-950/80 border-indigo-700';
                  } else if (recentAvgVol >= 20 && recentAvgVol <= 55 && pitchVar <= 25) {
                    currentEmotion = 'Confident & Composed';
                    emotionConfidence = 88;
                    energy = 'Balanced';
                    polarity = 'Positive';
                    emClass = 'text-emerald-300 bg-emerald-950/80 border-emerald-700';
                  } else if (recentAvgVol >= 15 && pitchVar <= 12) {
                    currentEmotion = 'Calm & Measured';
                    emotionConfidence = 84;
                    energy = 'Stable';
                    polarity = 'Neutral';
                    emClass = 'text-blue-300 bg-blue-950/80 border-blue-700';
                  } else if (pitchVar > 50 && recentAvgVol < 30) {
                    currentEmotion = 'Nervous / Rapid Variance';
                    emotionConfidence = 80;
                    energy = 'Erratic';
                    polarity = 'Negative';
                    emClass = 'text-amber-300 bg-amber-950/80 border-amber-700';
                  } else if (hesitationScore > 40 && recentAvgVol < 20) {
                    currentEmotion = 'Hesitant / Pausing';
                    emotionConfidence = 78;
                    energy = 'Low';
                    polarity = 'Hesitant';
                    emClass = 'text-rose-300 bg-rose-950/80 border-rose-700';
                  }

                  setVoiceEmotion({
                    emotion: currentEmotion,
                    confidence: emotionConfidence,
                    pitchHz: estimatedPitch,
                    energyLevel: energy,
                    hesitationScore,
                    tonePolarity: polarity,
                    emotionClass: emClass
                  });
                }
              }

              animFrameRef.current = requestAnimationFrame(updateAudioAndEmotion);
            };

            animFrameRef.current = requestAnimationFrame(updateAudioAndEmotion);
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
    pitchHz,
    voiceEmotion,
    isInitializing,
    startStream,
    stopStream,
    toggleCamera,
    toggleMic
  };
}
