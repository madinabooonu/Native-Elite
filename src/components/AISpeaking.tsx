import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════
   AI SPEAKING — SESAME-STYLE VOICE CALL
   IELTS Speaking practice with real voice
   ═══════════════════════════════════════════ */

// ── Types ──
interface Message {
    id: string;
    role: 'ai' | 'user';
    text: string;
    feedback?: FeedbackData;
}

interface FeedbackData {
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation: number;
    band: number;
    suggestions: string[];
}

type SpeakingPart = 'part1' | 'part2' | 'part3';

interface TopicOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    part: SpeakingPart;
}

type SessionState = 'topics' | 'call' | 'summary';

// ── Data ──
const TOPICS: TopicOption[] = [
    { id: 't1', title: 'Hometown', description: 'Talk about where you live', icon: '🏘️', part: 'part1' },
    { id: 't2', title: 'Work & Study', description: 'Your job or education', icon: '💼', part: 'part1' },
    { id: 't3', title: 'Hobbies', description: 'Your free time activities', icon: '🎨', part: 'part1' },
    { id: 't4', title: 'Food', description: 'Your favorite meals and cuisine', icon: '🍕', part: 'part1' },
    { id: 't5', title: 'Weather', description: 'Climate and seasons', icon: '🌤️', part: 'part1' },
    { id: 't6', title: 'A Person You Admire', description: 'Describe someone important', icon: '👤', part: 'part2' },
    { id: 't7', title: 'A Memorable Trip', description: 'Describe a journey you took', icon: '✈️', part: 'part2' },
    { id: 't8', title: 'A Skill You Learned', description: 'Something you can do well', icon: '🎯', part: 'part2' },
    { id: 't9', title: 'A Book or Film', description: 'A story that impacted you', icon: '📖', part: 'part2' },
    { id: 't10', title: 'Technology & Society', description: 'Impact of technology', icon: '💻', part: 'part3' },
    { id: 't11', title: 'Education System', description: 'Modern learning challenges', icon: '🎓', part: 'part3' },
    { id: 't12', title: 'Environment', description: 'Climate change and solutions', icon: '🌍', part: 'part3' },
];

const AI_QUESTIONS: Record<string, string[]> = {
    't1': [
        "Let's talk about your hometown. Where are you from?",
        "What do you like most about living there?",
        "Has your hometown changed much over the years?",
        "If you could change one thing about your hometown, what would it be?",
        "Do you think you'll continue living there in the future?",
    ],
    't2': [
        "Let's discuss your work or studies. What do you do?",
        "What do you enjoy most about your work or studies?",
        "What are some challenges you face in your field?",
        "How do you see your career developing in the future?",
        "What advice would you give to someone starting in your field?",
    ],
    't3': [
        "Tell me about your hobbies. What do you enjoy doing in your free time?",
        "How did you get started with that hobby?",
        "Do you prefer indoor or outdoor activities? Why?",
        "Has your interest in hobbies changed since you were younger?",
        "Would you recommend your hobby to others?",
    ],
    't4': [
        "Let's talk about food! What kind of food do you enjoy?",
        "Do you prefer cooking at home or eating out?",
        "What's your favorite traditional dish from your country?",
        "Has your diet changed compared to when you were younger?",
        "Do you think food culture is important? Why?",
    ],
    't5': [
        "Let's discuss the weather. What's the climate like where you live?",
        "Which season do you prefer and why?",
        "Does the weather affect your mood or daily activities?",
        "Have you noticed any changes in weather patterns recently?",
        "What kind of weather is best for outdoor activities?",
    ],
    't6': [
        "Describe a person you admire. Who is this person and how do you know them?",
        "What specific qualities make them admirable?",
        "Do you think people today have good role models?",
    ],
    't7': [
        "Describe a memorable trip you took. Where did you go and who did you go with?",
        "Do you prefer planned trips or spontaneous adventures?",
        "How has travel changed with modern technology?",
    ],
    't8': [
        "Describe a skill you learned. What is it and how did you learn it?",
        "Do you think some skills are more important than others?",
        "How has the way people learn new skills changed with the internet?",
    ],
    't9': [
        "Describe a book or film that impressed you. What was it about?",
        "Do you think reading is more beneficial than watching films?",
        "How has digital media changed people's reading habits?",
    ],
    't10': [
        "How has technology changed the way people communicate?",
        "Do you think social media has more positive or negative effects?",
        "What technological advancement will have the biggest impact in the next 10 years?",
        "Some people say technology makes us lazier. Do you agree?",
    ],
    't11': [
        "What are the biggest challenges facing education today?",
        "Do you think online learning can replace traditional classrooms?",
        "How important is creativity in the education system?",
        "Should education focus more on practical skills or theoretical knowledge?",
    ],
    't12': [
        "What environmental issues concern you most?",
        "What can individuals do to help protect the environment?",
        "Do you think governments are doing enough to address climate change?",
        "How has environmental awareness changed in recent years?",
    ],
};

// ── Feedback Generator ──
const generateFeedback = (text: string): FeedbackData => {
    const wordCount = text.split(/\s+/).length;
    const hasComplex = /although|however|moreover|furthermore|nevertheless|consequently/i.test(text);
    const hasSophisticatedVocab = /significant|considerable|fascinating|remarkable|perspective|contribute/i.test(text);
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;

    let grammar = Math.min(5 + (sentenceCount > 2 ? 1 : 0) + (hasComplex ? 1.5 : 0), 9);
    let vocabulary = Math.min(4.5 + (wordCount > 20 ? 1 : 0) + (hasSophisticatedVocab ? 1.5 : 0) + (wordCount > 40 ? 0.5 : 0), 9);
    let fluency = Math.min(4.5 + (wordCount > 15 ? 1 : 0) + (wordCount > 30 ? 1 : 0) + (sentenceCount > 3 ? 0.5 : 0), 9);
    let pronunciation = Math.min(5.5 + Math.random() * 1.5, 9);

    grammar = Math.round((grammar + (Math.random() * 0.5 - 0.25)) * 2) / 2;
    vocabulary = Math.round((vocabulary + (Math.random() * 0.5 - 0.25)) * 2) / 2;
    fluency = Math.round((fluency + (Math.random() * 0.5 - 0.25)) * 2) / 2;
    pronunciation = Math.round(pronunciation * 2) / 2;

    const band = Math.round(((grammar + vocabulary + fluency + pronunciation) / 4) * 2) / 2;

    const suggestions: string[] = [];
    if (wordCount < 20) suggestions.push('Try to elaborate more on your answers with examples.');
    if (!hasComplex) suggestions.push('Use linking words like "however", "moreover", "although" for cohesion.');
    if (!hasSophisticatedVocab) suggestions.push('Include more advanced vocabulary relevant to the topic.');
    if (sentenceCount < 3) suggestions.push('Structure your response with multiple sentences for clarity.');
    if (suggestions.length === 0) suggestions.push('Excellent response! Keep practicing to maintain consistency.');

    return { grammar, vocabulary, fluency, pronunciation, band, suggestions };
};

// ── Format time ──
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

// ── Animated Voice Circle ──
const VoiceOrb = ({ isActive, isSpeaking }: { isActive: boolean; isSpeaking: boolean }) => {
    return (
        <div className="relative flex items-center justify-center">
            {/* Outer pulse rings */}
            {isActive && (
                <>
                    <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.15, 0, 0.15] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute w-44 h-44 rounded-full bg-brand-blue-light/20"
                    />
                    <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.05, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                        className="absolute w-36 h-36 rounded-full bg-brand-blue-light/25"
                    />
                </>
            )}
            {/* Main orb */}
            <motion.div
                animate={isActive ? {
                    scale: isSpeaking ? [1, 1.12, 1.05, 1.15, 1] : [1, 1.06, 1],
                    boxShadow: isSpeaking
                        ? ['0 0 40px rgba(123,184,245,0.3)', '0 0 80px rgba(123,184,245,0.5)', '0 0 40px rgba(123,184,245,0.3)']
                        : ['0 0 30px rgba(123,184,245,0.2)', '0 0 50px rgba(123,184,245,0.3)', '0 0 30px rgba(123,184,245,0.2)']
                } : {}}
                transition={{ duration: isSpeaking ? 0.6 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className={cn(
                    'w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all duration-500',
                    isActive
                        ? 'bg-gradient-to-br from-brand-blue-light via-blue-400 to-teal-400'
                        : 'bg-gradient-to-br from-gray-600 to-gray-700'
                )}
            >
                {/* Inner glow */}
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <motion.div
                        animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        {isSpeaking ? (
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
                                <rect x="4" y="8" width="2" height="8" rx="1" fill="currentColor">
                                    <animate attributeName="height" values="8;14;8" dur="0.6s" repeatCount="indefinite" />
                                    <animate attributeName="y" values="8;5;8" dur="0.6s" repeatCount="indefinite" />
                                </rect>
                                <rect x="8" y="6" width="2" height="12" rx="1" fill="currentColor">
                                    <animate attributeName="height" values="12;6;12" dur="0.5s" repeatCount="indefinite" />
                                    <animate attributeName="y" values="6;9;6" dur="0.5s" repeatCount="indefinite" />
                                </rect>
                                <rect x="12" y="4" width="2" height="16" rx="1" fill="currentColor">
                                    <animate attributeName="height" values="16;8;16" dur="0.7s" repeatCount="indefinite" />
                                    <animate attributeName="y" values="4;8;4" dur="0.7s" repeatCount="indefinite" />
                                </rect>
                                <rect x="16" y="7" width="2" height="10" rx="1" fill="currentColor">
                                    <animate attributeName="height" values="10;16;10" dur="0.55s" repeatCount="indefinite" />
                                    <animate attributeName="y" values="7;4;7" dur="0.55s" repeatCount="indefinite" />
                                </rect>
                                <rect x="20" y="9" width="2" height="6" rx="1" fill="currentColor">
                                    <animate attributeName="height" values="6;12;6" dur="0.65s" repeatCount="indefinite" />
                                    <animate attributeName="y" values="9;6;9" dur="0.65s" repeatCount="indefinite" />
                                </rect>
                            </svg>
                        ) : (
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white" strokeWidth="1.5">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

// ── Score Ring ──
const ScoreRing = ({ score, maxScore = 9, label, color }: { score: number; maxScore?: number; label: string; color: string }) => {
    const pct = (score / maxScore) * 100;
    const circumference = 2 * Math.PI * 28;
    const offset = circumference - (pct / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    <motion.circle
                        cx="32" cy="32" r="28" fill="none"
                        stroke={color} strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
                    {score}
                </span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{label}</span>
        </div>
    );
};

// ═══════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════
export const AISpeaking = () => {
    // ── State ──
    const [sessionState, setSessionState] = useState<SessionState>('topics');
    const [selectedPart, setSelectedPart] = useState<SpeakingPart>('part1');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentQIdx, setCurrentQIdx] = useState(0);
    const [timer, setTimer] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [showTranscript, setShowTranscript] = useState(false);
    const [statusText, setStatusText] = useState('Starting...');
    const [allFeedbacks, setAllFeedbacks] = useState<FeedbackData[]>([]);

    const recognitionRef = useRef<any>(null);
    const timerRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

    // ── Timer ──
    useEffect(() => {
        if (sessionState === 'call') {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [sessionState]);

    // ── Speech Recognition Setup ──
    const startListening = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setStatusText('Speech recognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setStatusText('Listening... Speak now');
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed') {
                setStatusText('Microphone permission denied');
            } else if (event.error !== 'aborted') {
                setStatusText('Listening... Speak now');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto restart if still in call and not muted
            if (sessionState === 'call' && !isMuted) {
                // Will be handled by submitResponse or re-start
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [sessionState, isMuted]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    // ── Speech Synthesis ──
    const speakText = useCallback((text: string): Promise<void> => {
        return new Promise((resolve) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;

            // Try to get a natural English voice
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                voices.find(v => v.lang.startsWith('en-US')) ||
                voices.find(v => v.lang.startsWith('en'));
            if (englishVoice) utterance.voice = englishVoice;

            utterance.onstart = () => setIsAiSpeaking(true);
            utterance.onend = () => {
                setIsAiSpeaking(false);
                resolve();
            };
            utterance.onerror = () => {
                setIsAiSpeaking(false);
                resolve();
            };

            synthRef.current = utterance;
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    // ── Start a topic session ──
    const startSession = useCallback(async (topicId: string) => {
        setSelectedTopic(topicId);
        setSessionState('call');
        setTimer(0);
        setMessages([]);
        setCurrentQIdx(0);
        setTranscript('');
        setAllFeedbacks([]);
        setStatusText('AI is speaking...');

        const questions = AI_QUESTIONS[topicId] || [];
        if (questions.length > 0) {
            const firstQ = questions[0];
            setMessages([{ id: `m-${Date.now()}`, role: 'ai', text: firstQ }]);

            // Speak the first question
            await speakText(firstQ);
            setStatusText('Listening... Speak now');
            startListening();
        }
    }, [speakText, startListening]);

    // ── Submit user's spoken response ──
    const submitResponse = useCallback(async () => {
        if (!transcript.trim() || !selectedTopic) return;

        stopListening();
        const userText = transcript.trim();
        const feedback = generateFeedback(userText);

        // Add user message
        const userMsg: Message = {
            id: `m-${Date.now()}`,
            role: 'user',
            text: userText,
            feedback,
        };
        setMessages(prev => [...prev, userMsg]);
        setAllFeedbacks(prev => [...prev, feedback]);
        setTranscript('');

        // Get next AI question
        const questions = AI_QUESTIONS[selectedTopic] || [];
        const nextIdx = currentQIdx + 1;

        if (nextIdx < questions.length) {
            setStatusText('AI is speaking...');
            const nextQ = questions[nextIdx];
            setMessages(prev => [...prev, { id: `m-${Date.now() + 1}`, role: 'ai', text: nextQ }]);
            setCurrentQIdx(nextIdx);

            await speakText(nextQ);
            setStatusText('Listening... Speak now');
            startListening();
        } else {
            // Session complete
            setStatusText('Session complete!');
            setTimeout(() => endSession(), 1500);
        }
    }, [transcript, selectedTopic, currentQIdx, speakText, startListening, stopListening]);

    // ── End session ──
    const endSession = useCallback(() => {
        stopListening();
        window.speechSynthesis.cancel();
        if (timerRef.current) clearInterval(timerRef.current);
        setSessionState('summary');
        setIsAiSpeaking(false);
    }, [stopListening]);

    // ── Toggle mute ──
    const toggleMute = useCallback(() => {
        if (isMuted) {
            setIsMuted(false);
            startListening();
        } else {
            setIsMuted(true);
            stopListening();
        }
    }, [isMuted, startListening, stopListening]);

    // ── Reset ──
    const resetSession = useCallback(() => {
        stopListening();
        window.speechSynthesis.cancel();
        if (timerRef.current) clearInterval(timerRef.current);
        setSessionState('topics');
        setSelectedTopic(null);
        setMessages([]);
        setTimer(0);
        setTranscript('');
        setAllFeedbacks([]);
    }, [stopListening]);

    // ── Computed ──
    const filteredTopics = TOPICS.filter(t => t.part === selectedPart);
    const currentTopic = TOPICS.find(t => t.id === selectedTopic);

    const avgFeedback: FeedbackData | null = allFeedbacks.length > 0 ? {
        grammar: Math.round((allFeedbacks.reduce((s, f) => s + f.grammar, 0) / allFeedbacks.length) * 2) / 2,
        vocabulary: Math.round((allFeedbacks.reduce((s, f) => s + f.vocabulary, 0) / allFeedbacks.length) * 2) / 2,
        fluency: Math.round((allFeedbacks.reduce((s, f) => s + f.fluency, 0) / allFeedbacks.length) * 2) / 2,
        pronunciation: Math.round((allFeedbacks.reduce((s, f) => s + f.pronunciation, 0) / allFeedbacks.length) * 2) / 2,
        band: Math.round((allFeedbacks.reduce((s, f) => s + f.band, 0) / allFeedbacks.length) * 2) / 2,
        suggestions: [...new Set(allFeedbacks.flatMap(f => f.suggestions))].slice(0, 5) as string[],
    } : null;

    // ═══════════════════════════════════════
    // SCREEN 1: TOPIC SELECTION
    // ═══════════════════════════════════════
    if (sessionState === 'topics') {
        return (
            <div className="min-h-screen bg-[#0a1628] text-white pb-24">
                {/* Header */}
                <div className="text-center pt-6 pb-4 px-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-brand-blue-light border border-brand-blue-light/40 px-3 py-1 rounded-full mb-3 uppercase"
                    >
                        <span className="w-1.5 h-1.5 bg-brand-blue-light rounded-full animate-pulse" />
                        Voice AI
                    </motion.div>
                    <h1 className="text-2xl font-black">
                        <span className="text-white">IELTS </span>
                        <span className="bg-gradient-to-r from-brand-blue-light to-teal-400 bg-clip-text text-transparent">Speaking</span>
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">Practice with AI examiner using your voice</p>
                </div>

                {/* Part Selector */}
                <div className="flex gap-2 px-4 mb-5">
                    {(['part1', 'part2', 'part3'] as const).map(part => (
                        <button
                            key={part}
                            onClick={() => setSelectedPart(part)}
                            className={cn(
                                'flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all',
                                selectedPart === part
                                    ? 'bg-brand-blue-light/10 border-brand-blue-light/40 text-brand-blue-light'
                                    : 'border-gray-700/40 text-gray-600 hover:border-gray-600'
                            )}
                        >
                            Part {part.slice(-1)}
                        </button>
                    ))}
                </div>

                {/* Part Description */}
                <div className="px-4 mb-4">
                    <div className="bg-[#0d1f38] rounded-xl p-3 border border-brand-blue-light/10">
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {selectedPart === 'part1' && '🎤 Part 1: Introduction & Interview — Answer short questions about familiar topics (4-5 min)'}
                            {selectedPart === 'part2' && '📝 Part 2: Long Turn — Speak for 1-2 minutes on a given topic with preparation time'}
                            {selectedPart === 'part3' && '💡 Part 3: Discussion — Answer in-depth questions related to Part 2 topic (4-5 min)'}
                        </p>
                    </div>
                </div>

                {/* Topics Grid */}
                <div className="px-4 space-y-2">
                    {filteredTopics.map((topic, i) => (
                        <motion.button
                            key={topic.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startSession(topic.id)}
                            className="w-full p-4 rounded-xl bg-[#0d1f38] border border-gray-700/30 flex items-center gap-3 text-left hover:border-brand-blue-light/30 transition-all group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{topic.icon}</span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white">{topic.title}</p>
                                <p className="text-xs text-gray-500">{topic.description}</p>
                            </div>
                            {/* Call icon */}
                            <div className="w-9 h-9 rounded-full bg-brand-blue-light/10 flex items-center justify-center group-hover:bg-brand-blue-light/20 transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-brand-blue-light" strokeWidth="2">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // SCREEN 2: VOICE CALL (Sesame-style)
    // ═══════════════════════════════════════
    if (sessionState === 'call') {
        return (
            <div className="min-h-screen bg-[#0a1628] text-white flex flex-col relative">
                {/* Top bar with agent name + timer */}
                <div className="text-center pt-6 pb-2">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-lg font-black text-white tracking-wide">
                            AI Examiner <span className="text-brand-blue-light font-mono ml-1">{formatTime(timer)}</span>
                        </h2>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {currentTopic?.title} • IELTS {currentTopic?.part.replace('part', 'Part ')}
                        </p>
                    </motion.div>
                </div>

                {/* Main area — Voice Orb */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-8">
                    <VoiceOrb isActive={true} isSpeaking={isAiSpeaking || isListening} />

                    {/* Status text */}
                    <motion.p
                        key={statusText}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-8 text-xs text-gray-400 font-medium"
                    >
                        {statusText}
                    </motion.p>

                    {/* Live transcript */}
                    <AnimatePresence>
                        {(transcript || showTranscript) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mt-4 mx-4 max-w-full"
                            >
                                <div className="bg-[#0d1f38] border border-gray-700/30 rounded-2xl px-4 py-3 max-h-24 overflow-y-auto">
                                    <p className="text-xs text-gray-300 leading-relaxed">
                                        {transcript || 'Listening...'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit button (visible when there's transcript) */}
                    {transcript.trim().length > 10 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={submitResponse}
                            className="mt-4 px-6 py-2.5 rounded-full bg-brand-blue-light text-[#0a1628] text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-brand-blue-light/20 transition-all"
                        >
                            Submit Response ✓
                        </motion.button>
                    )}

                    {/* Recent feedback (last response) */}
                    {allFeedbacks.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 flex items-center gap-2"
                        >
                            <span className="text-[10px] text-gray-500">Last score:</span>
                            <span className="text-sm font-black text-brand-blue-light">
                                Band {allFeedbacks[allFeedbacks.length - 1].band}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Bottom Controls — Sesame style pill */}
                <div className="pb-24 pt-4 px-4">
                    <div className="flex items-center justify-center gap-4">
                        {/* Show/hide transcript */}
                        <button
                            onClick={() => setShowTranscript(!showTranscript)}
                            className={cn(
                                'w-12 h-12 rounded-full flex items-center justify-center transition-all border',
                                showTranscript
                                    ? 'bg-white/10 border-white/20 text-white'
                                    : 'bg-transparent border-gray-700/40 text-gray-500 hover:text-gray-300'
                            )}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </button>

                        {/* Mute */}
                        <button
                            onClick={toggleMute}
                            className={cn(
                                'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                                isMuted
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-[#0d1f38] text-white border border-gray-700/40 hover:border-gray-600'
                            )}
                        >
                            {isMuted ? (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.49-.34 2.18" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                            ) : (
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                    <line x1="12" y1="19" x2="12" y2="23" />
                                    <line x1="8" y1="23" x2="16" y2="23" />
                                </svg>
                            )}
                        </button>

                        {/* End Call */}
                        <button
                            onClick={endSession}
                            className="h-14 px-6 rounded-full bg-red-500/15 text-red-400 border border-red-500/25 flex items-center gap-2 hover:bg-red-500/25 transition-all"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                            </svg>
                            <span className="text-sm font-bold">End</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════
    // SCREEN 3: SESSION SUMMARY
    // ═══════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#0a1628] text-white pb-24 flex flex-col items-center">
            {/* Thank you message */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center pt-8 pb-6 px-4"
            >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-blue-light to-teal-400 flex items-center justify-center mx-auto mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-white mb-1">Session Complete!</h2>
                <p className="text-xs text-gray-400">
                    {currentTopic?.title} • {formatTime(timer)} • {allFeedbacks.length} responses
                </p>
            </motion.div>

            {/* Overall Band Score */}
            {avgFeedback && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                >
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-brand-blue-light/20 to-teal-400/20 border-2 border-brand-blue-light/40 flex items-center justify-center mx-auto mb-2">
                        <div>
                            <p className="text-3xl font-black bg-gradient-to-r from-brand-blue-light to-teal-400 bg-clip-text text-transparent">{avgFeedback.band}</p>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest">Band</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Score Rings */}
            {avgFeedback && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex justify-center gap-4 mb-6 px-4"
                >
                    <ScoreRing score={avgFeedback.grammar} label="Grammar" color="#a78bfa" />
                    <ScoreRing score={avgFeedback.vocabulary} label="Vocab" color="#7BB8F5" />
                    <ScoreRing score={avgFeedback.fluency} label="Fluency" color="#fbbf24" />
                    <ScoreRing score={avgFeedback.pronunciation} label="Pronun." color="#60a5fa" />
                </motion.div>
            )}

            {/* Suggestions */}
            {avgFeedback && avgFeedback.suggestions.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mx-4 bg-[#0d1f38] rounded-2xl p-4 border border-brand-blue-light/15 w-full max-w-md mb-6"
                >
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">💡 Suggestions</p>
                    <div className="space-y-2">
                        {avgFeedback.suggestions.map((s, i) => (
                            <p key={i} className="text-xs text-gray-300 flex items-start gap-2">
                                <span className="text-brand-blue-light mt-0.5 flex-shrink-0">•</span>
                                <span>{s}</span>
                            </p>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Conversation History */}
            {messages.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mx-4 bg-[#0d1f38] rounded-2xl p-4 border border-gray-700/30 w-full max-w-md mb-6"
                >
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">📝 Conversation</p>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {messages.map(msg => (
                            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                <div className={cn(
                                    'max-w-[85%] rounded-xl px-3 py-2',
                                    msg.role === 'user'
                                        ? 'bg-brand-blue-light/15 border border-brand-blue-light/20'
                                        : 'bg-[#0a1628] border border-gray-700/30'
                                )}>
                                    <p className="text-[11px] leading-relaxed text-gray-300">{msg.text}</p>
                                    {msg.feedback && (
                                        <p className="text-[9px] text-brand-blue-light mt-1 font-bold">Band {msg.feedback.band}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex gap-3 px-4 w-full max-w-md"
            >
                <button
                    onClick={resetSession}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-brand-blue-light to-teal-400 text-[#0a1628] text-sm font-bold hover:shadow-lg hover:shadow-brand-blue-light/20 transition-all"
                >
                    New Session →
                </button>
            </motion.div>
        </div>
    );
};
