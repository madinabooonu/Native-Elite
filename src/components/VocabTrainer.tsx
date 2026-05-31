import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════
   VOCABULARY DATA
   ═══════════════════════════════════════════ */
interface VocabWord {
    id: string;
    word: string;
    definition: string;
    translation: string;
    example: string;
    topic: string;
}

interface Topic {
    id: string;
    name: string;
    emoji: string;
    words: VocabWord[];
}

const TOPICS: Topic[] = [
    {
        id: 'all-about-me', name: 'All About Me', emoji: '🤩',
        words: [
            { id: 'w1', word: 'outgoing', definition: 'Friendly and socially confident', translation: "ochiq ko'ngil", example: "She's very outgoing and loves meeting new people.", topic: 'All About Me' },
            { id: 'w2', word: 'ambitious', definition: 'Having a strong desire to succeed', translation: 'shijoatli', example: 'He is ambitious about his career goals.', topic: 'All About Me' },
            { id: 'w3', word: 'introvert', definition: 'A person who prefers solitude', translation: 'ichiga yopiq odam', example: "As an introvert, I enjoy quiet evenings at home.", topic: 'All About Me' },
            { id: 'w4', word: 'personality', definition: 'The combination of characteristics', translation: 'shaxsiyat', example: 'She has a wonderful personality.', topic: 'All About Me' },
            { id: 'w5', word: 'passionate', definition: 'Having strong feelings or beliefs', translation: 'ishtiyoqli', example: "I'm passionate about learning languages.", topic: 'All About Me' },
            { id: 'w6', word: 'easygoing', definition: 'Relaxed and casual', translation: 'oson keladigan', example: 'My teacher is very easygoing.', topic: 'All About Me' },
            { id: 'w7', word: 'determined', definition: 'Firmly decided', translation: 'qat\'iyatli', example: 'She is determined to pass the IELTS exam.', topic: 'All About Me' },
            { id: 'w8', word: 'self-confident', definition: 'Trusting in one\'s abilities', translation: "o'ziga ishongan", example: 'Speaking practice made me more self-confident.', topic: 'All About Me' },
            { id: 'w9', word: 'open-minded', definition: 'Willing to consider new ideas', translation: "keng fikrli", example: "Being open-minded helps you learn faster.", topic: 'All About Me' },
        ]
    },
    {
        id: 'daily-routine', name: 'Daily Routine', emoji: '📅',
        words: [
            { id: 'w10', word: 'commute', definition: 'Travel to and from work', translation: "ish joyiga qatnash", example: 'My daily commute takes about 30 minutes.', topic: 'Daily Routine' },
            { id: 'w11', word: 'productive', definition: 'Achieving a lot', translation: 'samarali', example: 'I had a very productive morning.', topic: 'Daily Routine' },
            { id: 'w12', word: 'schedule', definition: 'A plan for activities', translation: 'jadval', example: 'I follow a strict daily schedule.', topic: 'Daily Routine' },
            { id: 'w13', word: 'habit', definition: 'A regular practice', translation: "odat", example: 'Reading before bed is my favorite habit.', topic: 'Daily Routine' },
            { id: 'w14', word: 'multitask', definition: 'Do several things at once', translation: "bir vaqtda bir necha ish qilish", example: "I often multitask while cooking dinner.", topic: 'Daily Routine' },
            { id: 'w15', word: 'oversleep', definition: 'Sleep longer than planned', translation: "uxlab qolish", example: 'I overslept and missed my morning class.', topic: 'Daily Routine' },
            { id: 'w16', word: 'workout', definition: 'A session of exercise', translation: "mashq", example: 'I do a 30-minute workout every morning.', topic: 'Daily Routine' },
            { id: 'w17', word: 'rush hour', definition: 'Peak traffic time', translation: "pik soat", example: "I try to avoid driving during rush hour.", topic: 'Daily Routine' },
            { id: 'w18', word: 'wind down', definition: 'Relax after being busy', translation: "dam olish", example: "I wind down by listening to music.", topic: 'Daily Routine' },
        ]
    },
    {
        id: 'small-talk', name: 'Small Talk', emoji: '💬',
        words: [
            { id: 'w19', word: 'break the ice', definition: 'Start a conversation in a social setting', translation: 'muzni sindirmoq', example: 'A joke can help break the ice at parties.', topic: 'Small Talk' },
            { id: 'w20', word: 'How about you?', definition: 'Asking the same question back', translation: "Sizchi?", example: "I love coffee. How about you?", topic: 'Small Talk' },
            { id: 'w21', word: 'catch up', definition: 'Exchange news with someone', translation: "gaplashib olish", example: "Let's catch up over coffee.", topic: 'Small Talk' },
            { id: 'w22', word: 'small talk', definition: 'Light, casual conversation', translation: "yengil suhbat", example: 'Making small talk is an important social skill.', topic: 'Small Talk' },
            { id: 'w23', word: 'by the way', definition: 'Introducing a new topic', translation: "aytgancha", example: "By the way, have you seen the new movie?", topic: 'Small Talk' },
            { id: 'w24', word: 'get along', definition: 'Have a friendly relationship', translation: "til topishmoq", example: 'I get along well with my classmates.', topic: 'Small Talk' },
        ]
    },
    {
        id: 'people-in-my-life', name: 'People in My Life', emoji: '👫',
        words: [
            { id: 'w25', word: 'acquaintance', definition: 'Someone you know slightly', translation: 'tanish', example: "He's an acquaintance from work.", topic: 'People in My Life' },
            { id: 'w26', word: 'sibling', definition: 'A brother or sister', translation: "aka-uka/opa-singil", example: 'I have two siblings.', topic: 'People in My Life' },
            { id: 'w27', word: 'colleague', definition: 'A person you work with', translation: "hamkasb", example: 'My colleague helped me with the project.', topic: 'People in My Life' },
            { id: 'w28', word: 'close-knit', definition: 'Very united as a group', translation: "juda yaqin", example: "We have a close-knit family.", topic: 'People in My Life' },
            { id: 'w29', word: 'look up to', definition: 'Admire and respect someone', translation: "hurmat qilmoq", example: 'I look up to my father.', topic: 'People in My Life' },
            { id: 'w30', word: 'reliable', definition: 'Consistently good, trustworthy', translation: "ishonchli", example: 'She is a very reliable friend.', topic: 'People in My Life' },
            { id: 'w31', word: 'supportive', definition: 'Providing encouragement', translation: "qo'llab-quvvatlovchi", example: 'My parents are very supportive.', topic: 'People in My Life' },
            { id: 'w32', word: 'bond', definition: 'A close connection', translation: "bog'liqlik", example: 'We share a strong bond.', topic: 'People in My Life' },
        ]
    },
    {
        id: 'job-studies', name: 'Job & Studies', emoji: '📮',
        words: [
            { id: 'w33', word: 'deadline', definition: 'The latest time something should be completed', translation: "muddat", example: 'The project deadline is next Friday.', topic: 'Job & Studies' },
            { id: 'w34', word: 'major', definition: 'Main subject of study at university', translation: "asosiy fan", example: 'My major is Computer Science.', topic: 'Job & Studies' },
            { id: 'w35', word: 'internship', definition: 'A temporary work experience', translation: "amaliyot", example: 'I did an internship at a tech company.', topic: 'Job & Studies' },
            { id: 'w36', word: 'workload', definition: 'The amount of work to be done', translation: "ish hajmi", example: 'The workload this semester is heavy.', topic: 'Job & Studies' },
            { id: 'w37', word: 'procrastinate', definition: 'Delay doing something', translation: "kechiktirmoq", example: "I tend to procrastinate before exams.", topic: 'Job & Studies' },
            { id: 'w38', word: 'scholarship', definition: 'Financial aid for students', translation: "stipendiya", example: 'She received a full scholarship.', topic: 'Job & Studies' },
            { id: 'w39', word: 'promotion', definition: 'Advancement in position', translation: "lavozim ko'tarilishi", example: 'He got a promotion last month.', topic: 'Job & Studies' },
            { id: 'w40', word: 'resign', definition: 'Voluntarily leave a job', translation: "iste\'fo berish", example: "She decided to resign from her position.", topic: 'Job & Studies' },
            { id: 'w41', word: 'curriculum', definition: 'The subjects in a course', translation: "o'quv dasturi", example: "The curriculum includes many practical subjects.", topic: 'Job & Studies' },
        ]
    },
    {
        id: 'food-restaurants', name: 'Food & Restaurants', emoji: '🍜',
        words: [
            { id: 'w42', word: 'cuisine', definition: 'A style of cooking', translation: "oshxona uslubi", example: 'Italian cuisine is popular worldwide.', topic: 'Food & Restaurants' },
            { id: 'w43', word: 'appetizer', definition: 'A small dish before the main meal', translation: "ishtaha ochuvchi", example: 'We ordered a salad as an appetizer.', topic: 'Food & Restaurants' },
            { id: 'w44', word: 'takeaway', definition: 'Food bought to eat elsewhere', translation: "olib ketish uchun", example: "Let's get a takeaway tonight.", topic: 'Food & Restaurants' },
            { id: 'w45', word: 'mouthwatering', definition: 'Extremely delicious-looking', translation: "og'iz suvi oqadigan", example: 'The cake looked absolutely mouthwatering.', topic: 'Food & Restaurants' },
            { id: 'w46', word: 'dietary', definition: 'Related to diet', translation: "parhez bilan bog'liq", example: 'Do you have any dietary restrictions?', topic: 'Food & Restaurants' },
            { id: 'w47', word: 'portion', definition: 'An amount of food for one person', translation: "bir kishilik ulush", example: 'The portions here are generous.', topic: 'Food & Restaurants' },
            { id: 'w48', word: 'treat', definition: 'Something special to enjoy', translation: "taom/hadya", example: "Let me treat you to dinner.", topic: 'Food & Restaurants' },
            { id: 'w49', word: 'savory', definition: 'Salty or spicy rather than sweet', translation: "mazali (sho'r)", example: 'I prefer savory snacks over sweet ones.', topic: 'Food & Restaurants' },
            { id: 'w50', word: 'bland', definition: 'Lacking flavor', translation: "mazasiz", example: "The soup was a bit bland.", topic: 'Food & Restaurants' },
            { id: 'w51', word: 'dine out', definition: 'Eat at a restaurant', translation: "tashqarida ovqatlanish", example: 'We dine out every weekend.', topic: 'Food & Restaurants' },
            { id: 'w52', word: 'nutritious', definition: 'Full of nutrients, healthy', translation: "to'yimli", example: "A balanced diet should be nutritious.", topic: 'Food & Restaurants' },
        ]
    },
    {
        id: 'future-plans', name: 'Future Plans', emoji: '🚀',
        words: [
            { id: 'w53', word: 'aspiration', definition: 'A hope or ambition', translation: "intilish", example: 'Her aspiration is to become a doctor.', topic: 'Future Plans' },
            { id: 'w54', word: 'milestone', definition: 'An important stage or event', translation: "muhim bosqich", example: 'Graduating was a major milestone.', topic: 'Future Plans' },
            { id: 'w55', word: 'pursue', definition: 'Follow or chase a goal', translation: "izlash/quvmoq", example: "I want to pursue a career in medicine.", topic: 'Future Plans' },
            { id: 'w56', word: 'settle down', definition: 'Begin living a stable life', translation: "o'rnashib olish", example: "I plan to settle down in my hometown.", topic: 'Future Plans' },
            { id: 'w57', word: 'accomplish', definition: 'Successfully achieve', translation: "erishmoq", example: 'I want to accomplish all my goals this year.', topic: 'Future Plans' },
            { id: 'w58', word: 'envision', definition: 'Imagine as a future possibility', translation: "tasavvur qilish", example: 'I envision myself traveling the world.', topic: 'Future Plans' },
            { id: 'w59', word: 'long-term', definition: 'Over a long period of time', translation: "uzoq muddatli", example: 'My long-term goal is to own a business.', topic: 'Future Plans' },
            { id: 'w60', word: 'backup plan', definition: 'Alternative plan', translation: "zaxira reja", example: 'Always have a backup plan.', topic: 'Future Plans' },
            { id: 'w61', word: 'opportunity', definition: 'A favorable situation', translation: "imkoniyat", example: 'This job is a great opportunity.', topic: 'Future Plans' },
            { id: 'w62', word: 'sacrifice', definition: 'Give up something valued', translation: "qurbonlik", example: 'Success requires some sacrifice.', topic: 'Future Plans' },
            { id: 'w63', word: 'strive', definition: 'Make great effort', translation: "harakat qilmoq", example: 'I strive for excellence in everything.', topic: 'Future Plans' },
            { id: 'w64', word: 'setback', definition: 'A reversal of progress', translation: "orqaga qaytish", example: "Don't let setbacks discourage you.", topic: 'Future Plans' },
        ]
    },
    {
        id: 'education-career', name: 'Education & Career', emoji: '🎓',
        words: [
            { id: 'w65', word: 'degree', definition: 'An academic qualification', translation: "diplom/daraja", example: 'She has a degree in Engineering.', topic: 'Education & Career' },
            { id: 'w66', word: 'tuition', definition: 'Fees for education', translation: "o'qish to'lovi", example: 'University tuition is expensive.', topic: 'Education & Career' },
            { id: 'w67', word: 'graduate', definition: 'Complete a degree', translation: "bitiruvchi", example: "I'll graduate next year.", topic: 'Education & Career' },
            { id: 'w68', word: 'dropout', definition: 'Leave school without finishing', translation: "o'qishni tashlamoq", example: 'He was a college dropout but became successful.', topic: 'Education & Career' },
            { id: 'w69', word: 'fluent', definition: 'Able to speak a language well', translation: "ravon", example: 'She is fluent in three languages.', topic: 'Education & Career' },
            { id: 'w70', word: 'hands-on', definition: 'Practical, involving doing', translation: "amaliy", example: 'I prefer hands-on learning.', topic: 'Education & Career' },
            { id: 'w71', word: 'extracurricular', definition: 'Outside the regular curriculum', translation: "darsdan tashqari", example: 'I participate in extracurricular activities.', topic: 'Education & Career' },
            { id: 'w72', word: 'networking', definition: 'Building professional contacts', translation: "aloqalar o'rnatish", example: 'Networking is key to career success.', topic: 'Education & Career' },
            { id: 'w73', word: 'mentor', definition: 'An experienced advisor', translation: "ustoz", example: 'My mentor guided me through my first job.', topic: 'Education & Career' },
            { id: 'w74', word: 'expertise', definition: 'Expert skill or knowledge', translation: "malaka", example: "She has expertise in digital marketing.", topic: 'Education & Career' },
            { id: 'w75', word: 'competitive', definition: 'Having strong competition', translation: "raqobatbardosh", example: 'The job market is very competitive.', topic: 'Education & Career' },
        ]
    },
    {
        id: 'challenges', name: 'Challenges', emoji: '💪',
        words: [
            { id: 'w76', word: 'overcome', definition: 'Successfully deal with', translation: "yengmoq", example: 'She overcame many obstacles.', topic: 'Challenges' },
            { id: 'w77', word: 'resilient', definition: 'Able to recover quickly', translation: "chidamli", example: 'Children are often very resilient.', topic: 'Challenges' },
            { id: 'w78', word: 'struggle', definition: 'Fight or work hard', translation: "kurashmoq", example: 'I struggled with math in school.', topic: 'Challenges' },
            { id: 'w79', word: 'persevere', definition: 'Continue despite difficulty', translation: "davom etmoq", example: 'You must persevere to achieve your dreams.', topic: 'Challenges' },
            { id: 'w80', word: 'cope with', definition: 'Deal effectively with', translation: "bardosh bermoq", example: 'How do you cope with stress?', topic: 'Challenges' },
            { id: 'w81', word: 'obstacle', definition: 'Something that blocks progress', translation: "to'siq", example: 'Every obstacle is an opportunity to grow.', topic: 'Challenges' },
            { id: 'w82', word: 'adaptable', definition: 'Able to adjust to new conditions', translation: "moslashuvchan", example: 'Being adaptable is crucial in today\'s world.', topic: 'Challenges' },
            { id: 'w83', word: 'breakthrough', definition: 'A sudden important discovery', translation: "yutuq", example: 'Scientists made a major breakthrough.', topic: 'Challenges' },
            { id: 'w84', word: 'setback', definition: 'A problem that delays progress', translation: "to'siq", example: 'The project faced several setbacks.', topic: 'Challenges' },
        ]
    },
    {
        id: 'money-spending', name: 'Money & Spending', emoji: '💰',
        words: [
            { id: 'w85', word: 'budget', definition: 'A plan for spending money', translation: "byudjet", example: 'I need to stick to my budget.', topic: 'Money & Spending' },
            { id: 'w86', word: 'afford', definition: 'Have enough money for', translation: "ko\'ra olish", example: "I can't afford a new car right now.", topic: 'Money & Spending' },
            { id: 'w87', word: 'investment', definition: 'Money put into something for profit', translation: "investitsiya", example: 'Education is the best investment.', topic: 'Money & Spending' },
            { id: 'w88', word: 'bargain', definition: 'Something bought cheaply', translation: "arzon narx", example: 'I found a great bargain at the market.', topic: 'Money & Spending' },
            { id: 'w89', word: 'expense', definition: 'The cost of something', translation: "xarajat", example: 'Living expenses in the city are high.', topic: 'Money & Spending' },
            { id: 'w90', word: 'savings', definition: 'Money set aside for the future', translation: "jamg'arma", example: 'I put 20% of my salary into savings.', topic: 'Money & Spending' },
            { id: 'w91', word: 'debt', definition: 'Money owed to someone', translation: "qarz", example: 'She paid off all her student debt.', topic: 'Money & Spending' },
            { id: 'w92', word: 'splurge', definition: 'Spend a lot of money', translation: "isrof qilmoq", example: "I splurged on a new phone.", topic: 'Money & Spending' },
            { id: 'w93', word: 'frugal', definition: 'Careful with money', translation: "tejamkor", example: 'My grandmother is very frugal.', topic: 'Money & Spending' },
            { id: 'w94', word: 'mortgage', definition: 'A loan to buy property', translation: "ipoteka", example: "They're paying off their mortgage.", topic: 'Money & Spending' },
            { id: 'w95', word: 'currency', definition: 'A system of money', translation: "valyuta", example: 'The local currency is the sum.', topic: 'Money & Spending' },
            { id: 'w96', word: 'donate', definition: 'Give money to charity', translation: "xayriya qilmoq", example: 'I donate to charity every month.', topic: 'Money & Spending' },
            { id: 'w97', word: 'installment', definition: 'A partial payment', translation: "bo'lib to'lash", example: 'I bought the laptop in installments.', topic: 'Money & Spending' },
            { id: 'w98', word: 'luxury', definition: 'An expensive non-essential item', translation: "hashamat", example: "Designer bags are a luxury.", topic: 'Money & Spending' },
        ]
    },
];

type TrainingStage = 'setup' | 'stage-intro' | 'learn' | 'recognize' | 'produce' | 'results';

/* ═══════════════════════════════════════════
   VOCAB TRAINER COMPONENT
   ═══════════════════════════════════════════ */
export const VocabTrainer = () => {
    const [selectedTopics, setSelectedTopics] = useState<string[]>(TOPICS.map(t => t.id));
    const [wordsPerSession, setWordsPerSession] = useState(10);
    const [stage, setStage] = useState<TrainingStage>('setup');
    const [currentStage, setCurrentStage] = useState<'learn' | 'recognize' | 'produce'>('learn');
    const [sessionWords, setSessionWords] = useState<VocabWord[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [knownWords, setKnownWords] = useState<Set<string>>(new Set());
    const [unknownWords, setUnknownWords] = useState<Set<string>>(new Set());
    const [userInput, setUserInput] = useState('');
    const [recognizeOptions, setRecognizeOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [correctCount, setCorrectCount] = useState(0);

    const totalSelected = TOPICS.filter(t => selectedTopics.includes(t.id)).reduce((acc, t) => acc + t.words.length, 0);

    const toggleTopic = (id: string) => {
        setSelectedTopics(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const startTraining = () => {
        const pool = TOPICS.filter(t => selectedTopics.includes(t.id)).flatMap(t => t.words);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const words = shuffled.slice(0, Math.min(wordsPerSession, shuffled.length));
        setSessionWords(words);
        setCurrentIndex(0);
        setRevealed(false);
        setKnownWords(new Set());
        setUnknownWords(new Set());
        setCorrectCount(0);
        setCurrentStage('learn');
        setStage('stage-intro');
    };

    const handleKnown = (known: boolean) => {
        const word = sessionWords[currentIndex];
        if (known) {
            setKnownWords(prev => new Set(prev).add(word.id));
        } else {
            setUnknownWords(prev => new Set(prev).add(word.id));
        }

        if (currentIndex < sessionWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setRevealed(false);
            setSelectedAnswer(null);
            setUserInput('');
            if (currentStage === 'recognize') {
                generateRecognizeOptions(currentIndex + 1);
            }
        } else {
            // Move to next stage or results
            if (currentStage === 'learn') {
                setCurrentStage('recognize');
                setCurrentIndex(0);
                setRevealed(false);
                setSelectedAnswer(null);
                setStage('stage-intro');
            } else if (currentStage === 'recognize') {
                setCurrentStage('produce');
                setCurrentIndex(0);
                setRevealed(false);
                setUserInput('');
                setStage('stage-intro');
            } else {
                setStage('results');
            }
        }
    };

    const generateRecognizeOptions = (idx: number) => {
        const correctWord = sessionWords[idx];
        const allWords = TOPICS.flatMap(t => t.words);
        const otherWords = allWords.filter(w => w.id !== correctWord.id);
        const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [...shuffledOthers.map(w => w.translation), correctWord.translation].sort(() => Math.random() - 0.5);
        setRecognizeOptions(options);
    };

    const handleRecognizeAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        const correct = answer === sessionWords[currentIndex].translation;
        if (correct) setCorrectCount(prev => prev + 1);
        setTimeout(() => handleKnown(correct), 800);
    };

    const handleProduceSubmit = () => {
        const correct = userInput.trim().toLowerCase() === sessionWords[currentIndex].word.toLowerCase();
        if (correct) setCorrectCount(prev => prev + 1);
        setRevealed(true);
        setTimeout(() => handleKnown(correct), 1200);
    };

    const startStage = () => {
        if (currentStage === 'recognize') {
            generateRecognizeOptions(0);
        }
        setStage(currentStage);
    };

    const resetTrainer = () => {
        setStage('setup');
        setCurrentIndex(0);
        setRevealed(false);
        setCorrectCount(0);
    };

    const wordPerSessionOptions = [5, 8, 10, 15, 20];

    /* ── SETUP SCREEN ── */
    if (stage === 'setup') {
        return (
            <div className="min-h-screen bg-[#0a1628] text-white pb-24">
                {/* Header */}
                <div className="text-center pt-6 pb-4 px-4">
                    <span className="inline-block text-[10px] font-bold tracking-[0.2em] text-emerald-400 border border-emerald-400/40 px-3 py-1 rounded-full mb-3 uppercase">
                        Native Elite American Academy
                    </span>
                    <h1 className="text-2xl font-black">
                        <span className="text-white">Vocab</span>{' '}
                        <span className="text-emerald-400">Trainer</span>
                    </h1>
                    <p className="text-gray-400 text-xs mt-1">Learn → Recognize → Produce</p>
                </div>

                {/* Topic Selection */}
                <div className="px-4 mt-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Select Topics</p>

                    <div className="flex gap-2 mb-4">
                        <button onClick={() => setSelectedTopics(TOPICS.map(t => t.id))}
                            className="text-xs px-3 py-1.5 rounded-full border border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 transition-all">
                            Select All
                        </button>
                        <button onClick={() => setSelectedTopics([])}
                            className="text-xs px-3 py-1.5 rounded-full border border-gray-600 text-gray-400 hover:bg-gray-700/40 transition-all">
                            Clear
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {TOPICS.map(topic => (
                            <button
                                key={topic.id}
                                onClick={() => toggleTopic(topic.id)}
                                className={cn(
                                    'p-3 rounded-xl border text-left transition-all flex items-center justify-between',
                                    selectedTopics.includes(topic.id)
                                        ? 'border-emerald-400/60 bg-emerald-400/5'
                                        : 'border-gray-700/50 bg-[#0d1f38]/60 opacity-50'
                                )}
                            >
                                <div>
                                    <p className="text-emerald-400 text-sm font-semibold">{topic.name}</p>
                                    <p className="text-gray-500 text-[10px]">{topic.words.length} words</p>
                                </div>
                                <span className="text-lg">{topic.emoji}</span>
                            </button>
                        ))}
                    </div>

                    <p className="text-center text-xs text-gray-500 mt-3">
                        <span className="text-emerald-400 font-bold">{totalSelected}</span> words from{' '}
                        <span className="text-emerald-400 font-bold">{selectedTopics.length}</span> topics
                    </p>
                </div>

                {/* Words Per Session */}
                <div className="px-4 mt-6">
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-3">Words Per Session</p>
                    <div className="flex gap-2 flex-wrap">
                        {wordPerSessionOptions.map(n => (
                            <button
                                key={n}
                                onClick={() => setWordsPerSession(n)}
                                className={cn(
                                    'w-11 h-11 rounded-xl border text-sm font-bold transition-all',
                                    wordsPerSession === n
                                        ? 'bg-emerald-400 text-[#0a1628] border-emerald-400 shadow-lg shadow-emerald-400/30'
                                        : 'border-gray-600 text-gray-400 hover:border-emerald-400/40'
                                )}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setWordsPerSession(999)}
                            className={cn(
                                'px-4 h-11 rounded-xl border text-sm font-bold transition-all',
                                wordsPerSession === 999
                                    ? 'bg-emerald-400 text-[#0a1628] border-emerald-400 shadow-lg shadow-emerald-400/30'
                                    : 'border-gray-600 text-gray-400 hover:border-emerald-400/40'
                            )}
                        >
                            All
                        </button>
                    </div>
                </div>

                {/* Start Button */}
                <div className="px-4 mt-8">
                    <button
                        onClick={startTraining}
                        disabled={selectedTopics.length === 0}
                        className="w-full py-4 rounded-2xl bg-emerald-400 text-[#0a1628] font-extrabold text-base transition-all hover:bg-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-emerald-400/20"
                    >
                        Start Training
                    </button>
                </div>
            </div>
        );
    }

    /* ── STAGE INTRO ── */
    if (stage === 'stage-intro') {
        const stageInfo = {
            learn: { icon: '📖', title: 'Stage 1: Learn', desc: 'See each word with its definition, then tap to reveal the translation. Mark whether you knew it or not.' },
            recognize: { icon: '🧠', title: 'Stage 2: Recognize', desc: 'Choose the correct translation from multiple options. Test your recognition skills.' },
            produce: { icon: '✍️', title: 'Stage 3: Produce', desc: 'Type the English word from the translation shown. Prove you can produce it from memory.' },
        };
        const info = stageInfo[currentStage];

        return (
            <div className="min-h-screen bg-[#0a1628] text-white flex flex-col items-center justify-center px-6 pb-24">
                <div className="text-center">
                    <span className="inline-block text-[10px] font-bold tracking-[0.2em] text-emerald-400 border border-emerald-400/40 px-3 py-1 rounded-full mb-6 uppercase">
                        Native Elite American Academy
                    </span>
                    <div className="text-5xl mb-4">{info.icon}</div>
                    <h2 className="text-2xl font-black text-emerald-400 mb-3">{info.title}</h2>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto mb-2">{info.desc}</p>
                    <p className="text-white font-bold text-sm">{sessionWords.length} words</p>
                    <button
                        onClick={startStage}
                        className="mt-8 px-10 py-3.5 rounded-2xl bg-emerald-400 text-[#0a1628] font-extrabold text-base hover:bg-emerald-300 transition-all shadow-xl shadow-emerald-400/20"
                    >
                        Let's Go
                    </button>
                </div>
            </div>
        );
    }

    /* ── RESULTS ── */
    if (stage === 'results') {
        const percentage = Math.round((correctCount / sessionWords.length) * 100);
        return (
            <div className="min-h-screen bg-[#0a1628] text-white flex flex-col items-center justify-center px-6 pb-24">
                <div className="text-center">
                    <div className="text-5xl mb-4">🏆</div>
                    <h2 className="text-2xl font-black text-emerald-400 mb-2">Training Complete!</h2>
                    <p className="text-gray-400 text-sm mb-6">Here are your results</p>

                    <div className="bg-[#0d1f38] rounded-2xl p-6 border border-emerald-400/20 mb-6 min-w-[260px]">
                        <div className="text-5xl font-black text-emerald-400 mb-2">{percentage}%</div>
                        <p className="text-gray-400 text-sm">{correctCount} / {sessionWords.length} correct</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-4">
                            <p className="text-2xl font-bold text-emerald-400">{knownWords.size}</p>
                            <p className="text-xs text-gray-400">Known</p>
                        </div>
                        <div className="bg-red-400/10 border border-red-400/30 rounded-xl p-4">
                            <p className="text-2xl font-bold text-red-400">{unknownWords.size}</p>
                            <p className="text-xs text-gray-400">Still Learning</p>
                        </div>
                    </div>

                    <button
                        onClick={resetTrainer}
                        className="w-full py-4 rounded-2xl bg-emerald-400 text-[#0a1628] font-extrabold text-base hover:bg-emerald-300 transition-all shadow-xl shadow-emerald-400/20"
                    >
                        Train Again
                    </button>
                </div>
            </div>
        );
    }

    /* ── TRAINING VIEW (Learn / Recognize / Produce) ── */
    const currentWord = sessionWords[currentIndex];
    const progress = ((currentIndex) / sessionWords.length) * 100;

    return (
        <div className="min-h-screen bg-[#0a1628] text-white pb-24">
            {/* Header */}
            <div className="text-center pt-4 pb-2 px-4">
                <span className="inline-block text-[10px] font-bold tracking-[0.2em] text-emerald-400 border border-emerald-400/40 px-3 py-1 rounded-full mb-2 uppercase">
                    Native Elite American Academy
                </span>
                <h1 className="text-lg font-black">
                    <span className="text-white">Vocab</span>{' '}
                    <span className="text-emerald-400">Trainer</span>
                </h1>
            </div>

            {/* Stage Tabs */}
            <div className="flex gap-2 px-4 mb-3">
                {(['learn', 'recognize', 'produce'] as const).map(s => (
                    <div
                        key={s}
                        className={cn(
                            'flex-1 py-2.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider border transition-all',
                            currentStage === s
                                ? 'bg-emerald-400/10 border-emerald-400/40 text-emerald-400'
                                : 'border-gray-700/40 text-gray-600'
                        )}
                    >
                        {s}
                    </div>
                ))}
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between px-4 mb-4">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{correctCount} correct</span>
                <div className="flex-1 mx-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-emerald-400 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <span className="text-xs text-gray-400">{currentIndex + 1} / {sessionWords.length}</span>
            </div>

            {/* Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${currentWord.id}-${currentStage}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mx-4"
                >
                    <div className="bg-[#0d1f38] rounded-2xl p-5 border border-gray-700/40">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider">💬 {currentWord.topic}</span>
                        </div>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded mb-3">
                            Stage {currentStage === 'learn' ? 1 : currentStage === 'recognize' ? 2 : 3} — {currentStage}
                        </span>

                        {/* LEARN STAGE */}
                        {currentStage === 'learn' && (
                            <>
                                <h3 className="text-xl font-black text-white mb-1">{currentWord.word}</h3>
                                <p className="text-gray-400 text-sm mb-1">{currentWord.definition}</p>
                                <p className="text-gray-500 text-xs italic mb-4">"{currentWord.example}"</p>

                                {!revealed ? (
                                    <button
                                        onClick={() => setRevealed(true)}
                                        className="w-full py-4 rounded-xl border-2 border-dashed border-emerald-400/30 text-emerald-400/60 text-sm font-semibold hover:bg-emerald-400/5 transition-all"
                                    >
                                        👆 Tap to reveal translation
                                    </button>
                                ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                        <div className="w-full py-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-center mb-4">
                                            <p className="text-white font-bold text-base">{currentWord.translation}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleKnown(true)}
                                                className="py-3 rounded-xl border border-emerald-400/40 text-emerald-400 font-bold text-sm hover:bg-emerald-400/10 transition-all"
                                            >
                                                I knew it ✓
                                            </button>
                                            <button
                                                onClick={() => handleKnown(false)}
                                                className="py-3 rounded-xl border border-red-400/40 text-red-400 font-bold text-sm hover:bg-red-400/10 transition-all"
                                            >
                                                Still learning
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}

                        {/* RECOGNIZE STAGE */}
                        {currentStage === 'recognize' && (
                            <>
                                <h3 className="text-xl font-black text-white mb-1">{currentWord.word}</h3>
                                <p className="text-gray-400 text-sm mb-4">{currentWord.definition}</p>
                                <p className="text-gray-500 text-xs mb-3">Choose the correct translation:</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {recognizeOptions.map((opt, i) => {
                                        const isCorrect = opt === currentWord.translation;
                                        const isSelected = selectedAnswer === opt;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => !selectedAnswer && handleRecognizeAnswer(opt)}
                                                disabled={!!selectedAnswer}
                                                className={cn(
                                                    'py-3 px-4 rounded-xl border text-sm font-semibold text-left transition-all',
                                                    !selectedAnswer
                                                        ? 'border-gray-600/50 text-gray-300 hover:border-emerald-400/40 hover:bg-emerald-400/5'
                                                        : isSelected && isCorrect
                                                            ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                                                            : isSelected && !isCorrect
                                                                ? 'border-red-400 bg-red-400/20 text-red-400'
                                                                : isCorrect
                                                                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-400'
                                                                    : 'border-gray-700/30 text-gray-600'
                                                )}
                                            >
                                                {opt}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* PRODUCE STAGE */}
                        {currentStage === 'produce' && (
                            <>
                                <p className="text-gray-400 text-sm mb-2">Write the English word for:</p>
                                <div className="w-full py-4 rounded-xl bg-emerald-400/10 border border-emerald-400/30 text-center mb-4">
                                    <p className="text-white font-bold text-base">{currentWord.translation}</p>
                                </div>
                                {!revealed ? (
                                    <>
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={e => setUserInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && userInput.trim() && handleProduceSubmit()}
                                            placeholder="Type the English word..."
                                            className="w-full py-3 px-4 rounded-xl bg-[#0a1628] border border-gray-600/50 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-emerald-400/50 mb-3"
                                        />
                                        <button
                                            onClick={handleProduceSubmit}
                                            disabled={!userInput.trim()}
                                            className="w-full py-3 rounded-xl bg-emerald-400 text-[#0a1628] font-bold text-sm disabled:opacity-30 transition-all"
                                        >
                                            Check
                                        </button>
                                    </>
                                ) : (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <div className={cn(
                                            'w-full py-3 px-4 rounded-xl text-center mb-2 border',
                                            userInput.trim().toLowerCase() === currentWord.word.toLowerCase()
                                                ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                                                : 'bg-red-400/10 border-red-400/30 text-red-400'
                                        )}>
                                            <p className="font-bold text-sm">
                                                {userInput.trim().toLowerCase() === currentWord.word.toLowerCase()
                                                    ? '✓ Correct!'
                                                    : `✗ Your answer: ${userInput}`}
                                            </p>
                                        </div>
                                        <p className="text-center text-white text-sm font-bold">Answer: {currentWord.word}</p>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
