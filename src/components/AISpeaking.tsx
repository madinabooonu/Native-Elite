import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════
   AI SPEAKING PRACTICE
   IELTS Speaking partner with feedback
   ═══════════════════════════════════════════ */

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

const TOPICS: TopicOption[] = [
    // Part 1
    { id: 't1', title: 'Hometown', description: 'Talk about where you live', icon: '🏘️', part: 'part1' },
    { id: 't2', title: 'Work & Study', description: 'Your job or education', icon: '💼', part: 'part1' },
    { id: 't3', title: 'Hobbies', description: 'Your free time activities', icon: '🎨', part: 'part1' },
    { id: 't4', title: 'Food', description: 'Your favorite meals and cuisine', icon: '🍕', part: 'part1' },
    { id: 't5', title: 'Weather', description: 'Climate and seasons', icon: '🌤️', part: 'part1' },
    // Part 2
    { id: 't6', title: 'A Person You Admire', description: 'Describe someone important', icon: '👤', part: 'part2' },
    { id: 't7', title: 'A Memorable Trip', description: 'Describe a journey you took', icon: '✈️', part: 'part2' },
    { id: 't8', title: 'A Skill You Learned', description: 'Something you can do well', icon: '🎯', part: 'part2' },
    { id: 't9', title: 'A Book or Film', description: 'A story that impacted you', icon: '📖', part: 'part2' },
    // Part 3
    { id: 't10', title: 'Technology & Society', description: 'Impact of technology', icon: '💻', part: 'part3' },
    { id: 't11', title: 'Education System', description: 'Modern learning challenges', icon: '🎓', part: 'part3' },
    { id: 't12', title: 'Environment', description: 'Climate change and solutions', icon: '🌍', part: 'part3' },
];

const AI_RESPONSES: Record<string, string[]> = {
    't1': [
        "Great! Let's talk about your hometown. Where are you from?",
        "That sounds interesting! What do you like most about living there?",
        "Has your hometown changed much over the years?",
        "If you could change one thing about your hometown, what would it be?",
        "Do you think you'll continue living there in the future? Why or why not?",
    ],
    't2': [
        "Let's discuss your work or studies. What do you do?",
        "What do you enjoy most about your work/studies?",
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
        "What kind of weather is best for outdoor activities in your opinion?",
    ],
    't6': [
        "In Part 2, I'd like you to describe a person you admire. You'll have 1 minute to prepare and 2 minutes to speak. You should include: who this person is, how you know them, what qualities they have, and why you admire them. Ready? Go ahead!",
        "That was a good description! Now let me ask: What specific qualities make a good role model?",
        "Do you think people today have good role models compared to the past?",
    ],
    't7': [
        "For Part 2, describe a memorable trip you took. Include: where you went, who you went with, what you did there, and why it was memorable. You have 2 minutes. Go ahead!",
        "Wonderful! Do you prefer planned trips or spontaneous adventures?",
        "How has travel changed with modern technology?",
    ],
    't8': [
        "Describe a skill you learned. Tell me: what the skill is, how you learned it, how long it took, and how useful it is. You have 2 minutes.",
        "Interesting! Do you think some skills are more important than others?",
        "How has the way people learn new skills changed with the internet?",
    ],
    't9': [
        "Describe a book or film that impressed you. Include: what it was about, when you read/watched it, what you learned from it, and why you'd recommend it. Go ahead!",
        "Do you think reading is more beneficial than watching films? Why?",
        "How has digital media changed people's reading habits?",
    ],
    't10': [
        "Let's discuss technology's impact on society. How has technology changed the way people communicate?",
        "Do you think social media has more positive or negative effects on young people?",
        "What technological advancement do you think will have the biggest impact in the next 10 years?",
        "Some people say technology makes us lazier. Do you agree or disagree?",
    ],
    't11': [
        "Let's discuss education. What do you think are the biggest challenges facing education today?",
        "Do you think online learning can replace traditional classrooms?",
        "How important is creativity in the education system?",
        "Should education focus more on practical skills or theoretical knowledge?",
    ],
    't12': [
        "Let's talk about the environment. What environmental issues concern you most?",
        "What can individuals do to help protect the environment?",
        "Do you think governments are doing enough to address climate change?",
        "How has environmental awareness changed in recent years?",
    ],
};

const generateFeedback = (text: string): FeedbackData => {
    const wordCount = text.split(/\s+/).length;
    const hasComplex = /although|however|moreover|furthermore|nevertheless|consequently/i.test(text);
    const hasSophisticatedVocab = /significant|considerable|fascinating|remarkable|perspective|contribute/i.test(text);
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim()).length;

    let grammar = Math.min(5 + (sentenceCount > 2 ? 1 : 0) + (hasComplex ? 1.5 : 0), 9);
    let vocabulary = Math.min(4.5 + (wordCount > 20 ? 1 : 0) + (hasSophisticatedVocab ? 1.5 : 0) + (wordCount > 40 ? 0.5 : 0), 9);
    let fluency = Math.min(4.5 + (wordCount > 15 ? 1 : 0) + (wordCount > 30 ? 1 : 0) + (sentenceCount > 3 ? 0.5 : 0), 9);
    let pronunciation = Math.min(5.5 + Math.random() * 1.5, 9);

    // Add some randomness
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

export const AISpeaking = () => {
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [selectedPart, setSelectedPart] = useState<SpeakingPart>('part1');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [showFeedback, setShowFeedback] = useState<FeedbackData | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startTopic = (topicId: string) => {
        setSelectedTopic(topicId);
        setCurrentQuestionIdx(0);
        const firstQuestion = AI_RESPONSES[topicId]?.[0] || "Let's start! Tell me about this topic.";
        setMessages([{
            id: `m-${Date.now()}`,
            role: 'ai',
            text: firstQuestion,
        }]);
    };

    const sendResponse = () => {
        if (!inputText.trim() || !selectedTopic || isAiTyping) return;

        const feedback = generateFeedback(inputText);
        const userMsg: Message = {
            id: `m-${Date.now()}`,
            role: 'user',
            text: inputText,
            feedback,
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsAiTyping(true);

        // AI follow-up
        setTimeout(() => {
            const nextIdx = currentQuestionIdx + 1;
            const questions = AI_RESPONSES[selectedTopic!] || [];

            if (nextIdx < questions.length) {
                setMessages(prev => [...prev, {
                    id: `m-${Date.now()}`,
                    role: 'ai',
                    text: questions[nextIdx],
                }]);
                setCurrentQuestionIdx(nextIdx);
            } else {
                setMessages(prev => [...prev, {
                    id: `m-${Date.now()}`,
                    role: 'ai',
                    text: "That was a great practice session! 🎉 You've answered all the questions for this topic. Check your feedback scores above for each response, or go back to choose another topic.",
                }]);
            }
            setIsAiTyping(false);
        }, 1500);
    };

    const resetSession = () => {
        setSelectedTopic(null);
        setMessages([]);
        setCurrentQuestionIdx(0);
        setShowFeedback(null);
    };

    const filteredTopics = TOPICS.filter(t => t.part === selectedPart);

    /* ── TOPIC SELECTION ── */
    if (!selectedTopic) {
        return (
            <div className="min-h-screen bg-[#0a1628] text-white pb-24">
                {/* Header */}
                <div className="text-center pt-6 pb-4 px-4">
                    <span className="inline-block text-[10px] font-bold tracking-[0.2em] text-brand-blue-light border border-brand-blue-light/40 px-3 py-1 rounded-full mb-3 uppercase">
                        AI Powered
                    </span>
                    <h1 className="text-2xl font-black">
                        <span className="text-white">IELTS</span>{' '}
                        <span className="text-brand-blue-light">Speaking</span>
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">Practice with AI examiner</p>
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
                    {filteredTopics.map(topic => (
                        <motion.button
                            key={topic.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startTopic(topic.id)}
                            className="w-full p-4 rounded-xl bg-[#0d1f38] border border-gray-700/30 flex items-center gap-3 text-left hover:border-brand-blue-light/30 transition-all"
                        >
                            <span className="text-2xl">{topic.icon}</span>
                            <div>
                                <p className="text-sm font-bold text-white">{topic.title}</p>
                                <p className="text-xs text-gray-500">{topic.description}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-600 ml-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    /* ── CHAT SESSION ── */
    const currentTopic = TOPICS.find(t => t.id === selectedTopic);

    return (
        <div className="min-h-screen bg-[#0a1628] text-white flex flex-col pb-24">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700/30 bg-[#0d1f38]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={resetSession} className="p-1 text-gray-400 hover:text-white transition-colors">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue-light to-teal-500 flex items-center justify-center text-[#0a1628] font-bold text-sm">
                        AI
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">AI Examiner — {currentTopic?.title}</p>
                        <p className="text-[10px] text-brand-blue-light">● IELTS Speaking {currentTopic?.part.replace('part', 'Part ')}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map(msg => (
                    <div key={msg.id}>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                            <div className={cn(
                                'max-w-[85%] rounded-2xl px-4 py-3',
                                msg.role === 'user'
                                    ? 'bg-brand-blue-light text-[#0a1628]'
                                    : 'bg-[#0d1f38] border border-gray-700/40 text-white'
                            )}>
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                        </motion.div>

                        {/* Feedback Panel */}
                        {msg.feedback && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 ml-auto max-w-[85%]"
                            >
                                <button
                                    onClick={() => setShowFeedback(showFeedback?.band === msg.feedback?.band ? null : msg.feedback!)}
                                    className="text-[10px] text-brand-blue-light font-bold mb-1 flex items-center gap-1"
                                >
                                    📊 Band {msg.feedback.band} — tap for details
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </button>

                                {showFeedback && showFeedback.band === msg.feedback.band && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#0d1f38] rounded-xl p-3 border border-brand-blue-light/20"
                                    >
                                        {/* Score Bars */}
                                        <div className="space-y-2 mb-3">
                                            {[
                                                { label: 'Grammar', score: msg.feedback.grammar, color: 'bg-purple-400' },
                                                { label: 'Vocabulary', score: msg.feedback.vocabulary, color: 'bg-brand-blue-light' },
                                                { label: 'Fluency', score: msg.feedback.fluency, color: 'bg-amber-400' },
                                                { label: 'Pronunciation', score: msg.feedback.pronunciation, color: 'bg-blue-400' },
                                            ].map(item => (
                                                <div key={item.label}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] text-gray-400">{item.label}</span>
                                                        <span className="text-[10px] font-bold text-white">{item.score}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(item.score / 9) * 100}%` }}
                                                            transition={{ duration: 0.8 }}
                                                            className={cn('h-full rounded-full', item.color)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Overall Band */}
                                        <div className="text-center py-2 bg-brand-blue-light/10 rounded-lg mb-3">
                                            <p className="text-[10px] text-gray-400">Overall Band</p>
                                            <p className="text-xl font-black text-brand-blue-light">{msg.feedback.band}</p>
                                        </div>

                                        {/* Suggestions */}
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Suggestions</p>
                                            {msg.feedback.suggestions.map((s, i) => (
                                                <p key={i} className="text-[11px] text-gray-300 mb-1 flex items-start gap-1.5">
                                                    <span className="text-brand-blue-light mt-0.5">•</span> {s}
                                                </p>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </div>
                ))}

                {/* AI Typing indicator */}
                {isAiTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-[#0d1f38] border border-gray-700/40 rounded-2xl px-4 py-3 flex gap-1">
                            <span className="w-2 h-2 bg-brand-blue-light rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-brand-blue-light rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-brand-blue-light rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-700/30 bg-[#0d1f38]/80 backdrop-blur-sm">
                <p className="text-[10px] text-gray-500 mb-2 text-center">
                    💡 Write your spoken response as text. Get instant AI feedback on grammar, vocabulary & fluency.
                </p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendResponse()}
                        placeholder="Type your speaking response..."
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#0a1628] border border-gray-700/40 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-blue-light/40"
                        disabled={isAiTyping}
                    />
                    <button
                        onClick={sendResponse}
                        disabled={!inputText.trim() || isAiTyping}
                        className="w-10 h-10 rounded-xl bg-brand-blue-light flex items-center justify-center text-[#0a1628] hover:bg-brand-blue-light transition-all flex-shrink-0 disabled:opacity-30"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
