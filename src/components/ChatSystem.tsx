import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface ChatMessage {
    id: string;
    sender: 'me' | 'other';
    senderName: string;
    text: string;
    timestamp: string;
    type: 'text' | 'file' | 'homework';
    fileName?: string;
}

interface ChatContact {
    id: string;
    name: string;
    role: 'teacher' | 'admin' | 'student';
    avatarColor: string;
    lastMessage: string;
    lastTime: string;
    unread: number;
    online: boolean;
}

const CONTACTS: ChatContact[] = [
    { id: 'c1', name: 'Ms. Osiyo', role: 'teacher', avatarColor: 'from-purple-500 to-violet-600', lastMessage: 'Great job on your essay! 👏', lastTime: '2 min', unread: 2, online: true },
    { id: 'c2', name: 'Mr. Sarvar', role: 'teacher', avatarColor: 'from-orange-500 to-amber-600', lastMessage: 'Don\'t forget tomorrow\'s class', lastTime: '15 min', unread: 0, online: true },
    { id: 'c3', name: 'Admin Support', role: 'admin', avatarColor: 'from-brand-blue-mid to-teal-600', lastMessage: 'Your payment has been confirmed', lastTime: '1h', unread: 1, online: false },
    { id: 'c4', name: 'Ali Karimov', role: 'student', avatarColor: 'from-blue-500 to-cyan-600', lastMessage: 'Can you share your notes?', lastTime: '3h', unread: 0, online: false },
];

const DEMO_MESSAGES: Record<string, ChatMessage[]> = {
    c1: [
        { id: 'm1', sender: 'other', senderName: 'Ms. Osiyo', text: 'Hello! How was your speaking practice today?', timestamp: '10:30', type: 'text' },
        { id: 'm2', sender: 'me', senderName: 'Me', text: 'It was great! I practiced Part 2 about describing a person.', timestamp: '10:32', type: 'text' },
        { id: 'm3', sender: 'other', senderName: 'Ms. Osiyo', text: 'Excellent! Remember to use varied vocabulary and complex sentence structures.', timestamp: '10:33', type: 'text' },
        { id: 'm4', sender: 'other', senderName: 'Ms. Osiyo', text: '', timestamp: '10:34', type: 'homework', fileName: 'Speaking_Task_Week5.pdf' },
        { id: 'm5', sender: 'me', senderName: 'Me', text: 'Thank you! I\'ll complete it by Friday.', timestamp: '10:35', type: 'text' },
        { id: 'm6', sender: 'other', senderName: 'Ms. Osiyo', text: 'Great job on your essay! 👏', timestamp: '10:40', type: 'text' },
    ],
    c2: [
        { id: 'm7', sender: 'other', senderName: 'Mr. Sarvar', text: 'Hi! Class starts at 16:00 tomorrow.', timestamp: '14:00', type: 'text' },
        { id: 'm8', sender: 'me', senderName: 'Me', text: 'Got it! Should I prepare anything?', timestamp: '14:05', type: 'text' },
        { id: 'm9', sender: 'other', senderName: 'Mr. Sarvar', text: 'Don\'t forget tomorrow\'s class', timestamp: '14:10', type: 'text' },
    ],
    c3: [
        { id: 'm10', sender: 'other', senderName: 'Admin', text: 'Welcome to Native Elite! Your account has been activated.', timestamp: '09:00', type: 'text' },
        { id: 'm11', sender: 'me', senderName: 'Me', text: 'Thank you! How can I make a payment?', timestamp: '09:15', type: 'text' },
        { id: 'm12', sender: 'other', senderName: 'Admin', text: 'Your payment has been confirmed', timestamp: '09:30', type: 'text' },
    ],
    c4: [
        { id: 'm13', sender: 'other', senderName: 'Ali', text: 'Hey! Can you share your notes?', timestamp: '16:00', type: 'text' },
    ],
};

export const ChatSystem = () => {
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(DEMO_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeChat]);

    const sendMessage = () => {
        if (!inputText.trim() || !activeChat) return;
        const newMsg: ChatMessage = {
            id: `m-${Date.now()}`,
            sender: 'me',
            senderName: 'Me',
            text: inputText,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            type: 'text',
        };
        setMessages(prev => ({
            ...prev,
            [activeChat]: [...(prev[activeChat] || []), newMsg],
        }));
        setInputText('');
    };

    const sendFile = () => {
        if (!activeChat) return;
        const newMsg: ChatMessage = {
            id: `m-${Date.now()}`,
            sender: 'me',
            senderName: 'Me',
            text: '',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
            type: 'file',
            fileName: 'my_homework.pdf',
        };
        setMessages(prev => ({
            ...prev,
            [activeChat]: [...(prev[activeChat] || []), newMsg],
        }));
    };

    const filteredContacts = CONTACTS.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeContact = CONTACTS.find(c => c.id === activeChat);

    /* ── CONTACT LIST ── */
    if (!activeChat) {
        return (
            <div className="min-h-screen bg-[#0a1628] text-white pb-24">
                {/* Header */}
                <div className="px-4 pt-6 pb-3">
                    <h2 className="text-xl font-black text-white mb-1">Messages</h2>
                    <p className="text-gray-500 text-xs">Chat with teachers and support</p>
                </div>

                {/* Search */}
                <div className="px-4 mb-4">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-[#0d1f38] border border-gray-700/40 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-blue-light/40"
                        />
                    </div>
                </div>

                {/* Contact List */}
                <div className="px-4 space-y-2">
                    {filteredContacts.map(contact => (
                        <motion.button
                            key={contact.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveChat(contact.id)}
                            className="w-full p-3 rounded-xl bg-[#0d1f38] border border-gray-700/30 flex items-center gap-3 text-left hover:border-brand-blue-light/20 transition-all"
                        >
                            <div className="relative flex-shrink-0">
                                <div className={cn('w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm', contact.avatarColor)}>
                                    {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                {contact.online && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-blue-light rounded-full border-2 border-[#0d1f38]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-bold text-white truncate">{contact.name}</p>
                                    <span className="text-[10px] text-gray-500 flex-shrink-0">{contact.lastTime}</span>
                                </div>
                                <div className="flex items-center justify-between mt-0.5">
                                    <p className="text-xs text-gray-400 truncate">{contact.lastMessage}</p>
                                    {contact.unread > 0 && (
                                        <span className="ml-2 w-5 h-5 bg-brand-blue-light rounded-full flex items-center justify-center text-[10px] font-bold text-[#0a1628] flex-shrink-0">
                                            {contact.unread}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    'text-[9px] font-bold uppercase tracking-wider mt-1 inline-block px-1.5 py-0.5 rounded',
                                    contact.role === 'teacher' ? 'bg-purple-400/10 text-purple-400' :
                                        contact.role === 'admin' ? 'bg-brand-blue-light/10 text-brand-blue-light' :
                                            'bg-blue-400/10 text-blue-400'
                                )}>
                                    {contact.role}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    /* ── CHAT VIEW ── */
    const chatMessages = messages[activeChat] || [];

    return (
        <div className="min-h-screen bg-[#0a1628] text-white flex flex-col pb-24">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-700/30 flex items-center gap-3 bg-[#0d1f38]/80 backdrop-blur-sm sticky top-0 z-10">
                <button onClick={() => setActiveChat(null)} className="p-1 text-gray-400 hover:text-white transition-colors">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs', activeContact?.avatarColor)}>
                    {activeContact?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-white">{activeContact?.name}</p>
                    <p className="text-[10px] text-brand-blue-light">{activeContact?.online ? '● Online' : '○ Offline'}</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {chatMessages.map(msg => (
                    <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn('flex', msg.sender === 'me' ? 'justify-end' : 'justify-start')}
                    >
                        <div className={cn(
                            'max-w-[80%] rounded-2xl px-4 py-2.5',
                            msg.sender === 'me'
                                ? 'bg-brand-blue-light text-[#0a1628]'
                                : 'bg-[#0d1f38] border border-gray-700/40 text-white'
                        )}>
                            {msg.type === 'text' && <p className="text-sm leading-relaxed">{msg.text}</p>}
                            {(msg.type === 'file' || msg.type === 'homework') && (
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                                        msg.sender === 'me' ? 'bg-[#0a1628]/20' : 'bg-brand-blue-light/10'
                                    )}>
                                        📎
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{msg.fileName}</p>
                                        <p className={cn('text-[10px]', msg.sender === 'me' ? 'text-[#0a1628]/70' : 'text-gray-500')}>
                                            {msg.type === 'homework' ? 'Homework' : 'File'}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <p className={cn('text-[10px] mt-1', msg.sender === 'me' ? 'text-[#0a1628]/50' : 'text-gray-600')}>
                                {msg.timestamp}
                            </p>
                        </div>
                    </motion.div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-700/30 bg-[#0d1f38]/80 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={sendFile}
                        className="w-10 h-10 rounded-xl bg-[#0a1628] border border-gray-700/40 flex items-center justify-center text-gray-400 hover:text-brand-blue-light hover:border-brand-blue-light/40 transition-all flex-shrink-0"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                    </button>
                    <input
                        type="text"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#0a1628] border border-gray-700/40 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-blue-light/40"
                    />
                    <button
                        onClick={sendMessage}
                        className="w-10 h-10 rounded-xl bg-brand-blue-light flex items-center justify-center text-[#0a1628] hover:bg-brand-blue-light transition-all flex-shrink-0"
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
