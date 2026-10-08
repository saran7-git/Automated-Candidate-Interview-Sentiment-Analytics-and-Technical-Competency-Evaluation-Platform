import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Award,
  Smile,
  Activity,
  MessageSquare
} from 'lucide-react';
import { aiAPI, sessionAPI } from '../api/client';
import { useToast } from '../context/ToastContext';

const InteractiveAiHrRound = ({
  sessionId,
  question,
  candidateName = 'Candidate',
  jobRole = 'Full-Stack Software Engineer',
  onComplete,
  isRecording = false
}) => {
  const { success, warning, error } = useToast();

  const [dialogueHistory, setDialogueHistory] = useState([
    {
      speaker: 'ai_hr',
      text: question?.question || 'Welcome to your final AI HR round! Could you briefly introduce yourself, highlight your core engineering projects, and explain why you are passionate about this role?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: 'Introduction & Culture Fit'
    }
  ]);

  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const [turnIndex, setTurnIndex] = useState(0);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [presenceMetrics, setPresenceMetrics] = useState({
    communication: 88,
    attitude: 92,
    composure: 90
  });

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dialogueHistory, isProcessing]);

  // Speak initial question if voice output enabled
  useEffect(() => {
    if (dialogueHistory.length === 1 && isVoiceOutputEnabled) {
      speakAiResponse(dialogueHistory[0].text);
    }
  }, []);

  // Web Speech API: Text to Speech
  const speakAiResponse = (text) => {
    if (!('speechSynthesis' in window) || !isVoiceOutputEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      // Select a natural sounding English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')));
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e.message);
      setIsAiSpeaking(false);
    }
  };

  // Web Speech API: Speech Recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      warning('Speech Recognition is not supported by this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setRecognitionError(null);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCurrentInput(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setRecognitionError('Microphone input error: ' + event.error);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Handle Answer Submission & Dynamic AI Counter-Questioning
  const handleSendAnswer = async () => {
    const candidateAnswer = currentInput.trim();
    if (!candidateAnswer || isProcessing) return;

    // Stop speech recognition if active
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const candidateMsg = {
      speaker: 'candidate',
      text: candidateAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDialogueHistory(prev => [...prev, candidateMsg]);
    setCurrentInput('');
    setIsProcessing(true);

    try {
      const res = await aiAPI.hrDialogue({
        candidateAnswer,
        history: [...dialogueHistory, candidateMsg],
        turnIndex,
        jobRole,
        sessionId
      });

      const dialogue = res.dialogue || {};
      const aiSpeechText = dialogue.aiSpeechText || `${dialogue.feedback || ''} ${dialogue.counterQuestion || ''}`;

      const aiMsg = {
        speaker: 'ai_hr',
        text: aiSpeechText,
        feedback: dialogue.feedback,
        counterQuestion: dialogue.counterQuestion,
        scores: {
          communication: dialogue.communicationScore || 88,
          attitude: dialogue.attitudeScore || 90,
          composure: dialogue.composureScore || 89
        },
        topic: dialogue.topic || 'HR Deep-Dive & Evaluation',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setDialogueHistory(prev => [...prev, aiMsg]);
      setTurnIndex(prev => prev + 1);

      if (dialogue.scores) {
        setPresenceMetrics(dialogue.scores);
      }

      if (dialogue.isCompleted || turnIndex >= 3) {
        setIsInterviewFinished(true);
        success('Personal AI HR Round completed successfully! Presence & Communication dossier generated.');
      }

      // Voice output
      if (isVoiceOutputEnabled) {
        speakAiResponse(aiSpeechText);
      }

      // Save turn to backend session log
      if (sessionId) {
        await sessionAPI.saveHrTurn(sessionId, {
          turn: {
            turnIndex,
            candidateAnswer,
            aiSpeechText,
            feedback: dialogue.feedback,
            counterQuestion: dialogue.counterQuestion,
            scores: aiMsg.scores
          }
        }).catch(err => console.warn('Save HR turn notice:', err.message));
      }
    } catch (err) {
      console.error('HR dialogue error:', err);
      error('Failed to get AI HR response. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinishRound = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (onComplete) {
      onComplete(dialogueHistory);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden text-slate-100">
      {/* Header bar */}
      <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Bot className="w-5 h-5" />
            </div>
            {isAiSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-slate-900"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Conversational Personal AI HR Interviewer</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Counter-Questioning
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-turn adaptive dialogue • Evaluating Presence, Tone, Communication & Attitude</p>
          </div>
        </div>

        {/* Real-time Soft Skills & Presence HUD */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center gap-1 text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Communication: <strong className="text-white">{presenceMetrics.communication}%</strong></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 text-slate-300">
              <Smile className="w-3.5 h-3.5 text-emerald-400" />
              <span>Attitude: <strong className="text-white">{presenceMetrics.attitude}%</strong></span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1 text-slate-300">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Composure: <strong className="text-white">{presenceMetrics.composure}%</strong></span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsVoiceOutputEnabled(!isVoiceOutputEnabled);
              if (isAiSpeaking && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                setIsAiSpeaking(false);
              }
            }}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
              isVoiceOutputEnabled
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
            }`}
            title={isVoiceOutputEnabled ? 'AI Voice Enabled (Speaking)' : 'AI Voice Muted'}
          >
            {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isVoiceOutputEnabled ? 'Voice On' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* Chat / Dialogue Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-950/90">
        {dialogueHistory.map((item, index) => {
          const isAi = item.speaker === 'ai_hr';
          return (
            <div
              key={index}
              className={`flex items-start gap-3.5 ${isAi ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}
            >
              {isAi && (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4.5 text-sm leading-relaxed shadow-lg ${
                  isAi
                    ? 'bg-slate-800/90 border border-slate-700/80 text-slate-100'
                    : 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white border border-indigo-500/30'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-white/10 text-xs">
                  <span className="font-semibold tracking-wide flex items-center gap-1.5">
                    {isAi ? 'Personal AI HR Director' : candidateName}
                    {item.topic && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-900/60 text-slate-300 text-[10px] font-normal border border-slate-700">
                        {item.topic}
                      </span>
                    )}
                  </span>
                  <span className="opacity-60">{item.timestamp}</span>
                </div>

                <p className="whitespace-pre-wrap">{item.text}</p>

                {/* If AI has specific counter question or feedback callout */}
                {isAi && item.counterQuestion && (
                  <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-start gap-2 bg-rose-950/20 p-2.5 rounded-xl border-rose-500/20">
                    <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="text-rose-300 block mb-0.5">AI Follow-up / Counter-Question:</strong>
                      <span className="text-rose-100">{item.counterQuestion}</span>
                    </div>
                  </div>
                )}
              </div>

              {!isAi && (
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 shadow-md">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Processing / AI thinking indicator */}
        {isProcessing && (
          <div className="flex items-start gap-3 justify-start animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-rose-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400 animate-spin" />
              <span>AI HR is analyzing your answer and formulating a contextual counter-question...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input / Response Controls */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        {isInterviewFinished ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-emerald-200">Interactive AI HR Round Completed</h4>
                <p className="text-xs text-emerald-400/80">All conversational turns and presence analytics recorded for recruiter dossier.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFinishRound}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              Proceed to Assessment Submission <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {isListening && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs animate-pulse">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Listening to your speech... Speak clearly into your microphone.
                </span>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className="text-slate-400 hover:text-white underline font-medium"
                >
                  Stop Recording
                </button>
              </div>
            )}

            <div className="relative flex items-center gap-2">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAnswer();
                  }
                }}
                disabled={isProcessing}
                placeholder="Speak using microphone or type your response to the AI HR interviewer (Press Enter to submit)..."
                rows={2}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 resize-none transition-all"
              />

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`p-3 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={isListening ? 'Stop Listening' : 'Speak with Microphone (Speech-To-Text)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleSendAnswer}
                  disabled={!currentInput.trim() || isProcessing}
                  className="p-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-rose-600/20 transition-all"
                  title="Submit Response to AI HR"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Turn {turnIndex + 1} of 4 • AI asks dynamic counter-questions based on your specific answers</span>
              <span>Supported: Chrome / Edge Web Speech Audio</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveAiHrRound;
