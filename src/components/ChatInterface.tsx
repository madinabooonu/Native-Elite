import React, { useState } from 'react';
import { Card } from './UI';
import { cn } from '../lib/utils';

export const ChatInterface = () => {
  const [message, setMessage] = useState('');

  const messages = [
    { id: 1, from: 'teacher', name: 'Mr.Elbek', text: 'Assalomu alaykum! Bugungi dars 14:30 da bo\'ladi.', time: '12:30' },
    { id: 2, from: 'me', text: 'Rahmat ustoz! Tayyor bo\'laman.', time: '12:32' },
    { id: 3, from: 'teacher', name: 'Mr.Elbek', text: 'Yaxshi, darsga tayyor bo\'ling. Homework tayyormi?', time: '12:35' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex', msg.from === 'me' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3',
                msg.from === 'me'
                  ? 'bg-brand-blue text-white rounded-br-md'
                  : 'bg-white text-brand-text rounded-bl-md card-shadow'
              )}
            >
              {msg.from !== 'me' && (
                <p className="text-xs font-bold text-brand-blue-mid mb-1">{msg.name}</p>
              )}
              <p className="text-sm">{msg.text}</p>
              <p
                className={cn(
                  'text-[10px] mt-1',
                  msg.from === 'me' ? 'text-white/60' : 'text-brand-text-light'
                )}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4">
        <div className="flex items-center gap-2 bg-white rounded-2xl card-shadow p-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 text-brand-text placeholder:text-gray-300"
          />
          <button
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              message.length > 0
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
