import React, { useState, useRef } from 'react';
import { Camera, Mic, Monitor, Play, Pause, RotateCcw, Volume2, Maximize2, Layers } from 'lucide-react';
import { recordingService } from '../../services/api';
import { QuestionTimelineBar } from './QuestionTimelineBar';

export const MediaSyncPlayer = ({
  recordings = [],
  questions = [],
  answers = [],
  totalDuration = 0,
}) => {
  const [activeTab, setActiveTab] = useState('webcam'); // 'webcam' | 'screen' | 'audio' | 'split'
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const videoWebcamRef = useRef(null);
  const videoScreenRef = useRef(null);
  const audioRef = useRef(null);

  // Find recordings by type
  const webcamRec = recordings.find((r) => r.type === 'webcam');
  const audioRec = recordings.find((r) => r.type === 'audio');
  const screenRec = recordings.find((r) => r.type === 'screen');

  const getMediaUrl = (rec) => {
    if (!rec) return null;
    return `/uploads/${rec.filePath}`;
  };

  // Synchronize playback seek across all media elements
  const handleSeek = (timeInSeconds) => {
    setCurrentTime(timeInSeconds);
    if (videoWebcamRef.current) videoWebcamRef.current.currentTime = timeInSeconds;
    if (videoScreenRef.current) videoScreenRef.current.currentTime = timeInSeconds;
    if (audioRef.current) audioRef.current.currentTime = timeInSeconds;
  };

  const togglePlayPause = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    const applyPlay = (mediaEl) => {
      if (!mediaEl) return;
      if (nextPlay) mediaEl.play().catch(() => {});
      else mediaEl.pause();
    };

    applyPlay(videoWebcamRef.current);
    applyPlay(videoScreenRef.current);
    applyPlay(audioRef.current);
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const changeSpeed = (rate) => {
    setPlaybackRate(rate);
    if (videoWebcamRef.current) videoWebcamRef.current.playbackRate = rate;
    if (videoScreenRef.current) videoScreenRef.current.playbackRate = rate;
    if (audioRef.current) audioRef.current.playbackRate = rate;
  };

  return (
    <div className="space-y-6">
      {/* Player Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-dark-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('webcam')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'webcam'
                ? 'bg-brand-500 text-dark-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Candidate Video</span>
          </button>

          <button
            onClick={() => setActiveTab('screen')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'screen'
                ? 'bg-brand-500 text-dark-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Screen Recording</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'audio'
                ? 'bg-brand-500 text-dark-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Pure Audio Track</span>
          </button>

          <button
            onClick={() => setActiveTab('split')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'split'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Speed:</span>
          {[1, 1.25, 1.5, 2].map((speed) => (
            <button
              key={speed}
              onClick={() => changeSpeed(speed)}
              className={`px-2 py-0.5 rounded-md font-mono ${
                playbackRate === speed
                  ? 'bg-slate-700 text-brand-300 font-bold'
                  : 'bg-dark-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Playback Viewport */}
      <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl">
        {activeTab === 'webcam' && (
          <div className="relative aspect-video w-full bg-dark-950 flex items-center justify-center">
            {webcamRec ? (
              <video
                ref={videoWebcamRef}
                src={getMediaUrl(webcamRec)}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8 text-slate-500 space-y-2">
                <Camera className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-sm">No webcam video recording file available for this session.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'screen' && (
          <div className="relative aspect-video w-full bg-dark-950 flex items-center justify-center">
            {screenRec ? (
              <video
                ref={videoScreenRef}
                src={getMediaUrl(screenRec)}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-8 text-slate-500 space-y-2">
                <Monitor className="w-12 h-12 mx-auto stroke-1" />
                <p className="text-sm">No screen recording file available for this session.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="p-8 bg-dark-950 flex flex-col items-center justify-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-lg">
              <Mic className="w-10 h-10 animate-pulse-subtle" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-white">Candidate Microphone Audio Track</h4>
              <p className="text-xs text-slate-400">High-fidelity verbal answer recording</p>
            </div>
            {audioRec || webcamRec ? (
              <audio
                ref={audioRef}
                src={getMediaUrl(audioRec || webcamRec)}
                controls
                onTimeUpdate={handleTimeUpdate}
                className="w-full max-w-md"
              />
            ) : (
              <p className="text-xs text-slate-500">No standalone audio stream available.</p>
            )}
          </div>
        )}

        {activeTab === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-black p-2">
            <div className="relative aspect-video bg-dark-950 rounded-2xl overflow-hidden border border-slate-800">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-dark-950/80 text-[10px] text-brand-300 font-bold border border-slate-700">
                Webcam Feed
              </div>
              {webcamRec ? (
                <video
                  ref={videoWebcamRef}
                  src={getMediaUrl(webcamRec)}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No video recording
                </div>
              )}
            </div>

            <div className="relative aspect-video bg-dark-950 rounded-2xl overflow-hidden border border-slate-800">
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-dark-950/80 text-[10px] text-teal-300 font-bold border border-slate-700">
                Screen Broadcast
              </div>
              {screenRec ? (
                <video
                  ref={videoScreenRef}
                  src={getMediaUrl(screenRec)}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No screen recording
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Synchronized Question Timeline Bar */}
      <QuestionTimelineBar
        questions={questions}
        answers={answers}
        currentTime={currentTime}
        totalDuration={totalDuration}
        onSeekTo={handleSeek}
      />
    </div>
  );
};
