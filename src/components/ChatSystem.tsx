import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { db, storage } from '../lib/firebase';
import {
  collection, addDoc, onSnapshot, query, where, orderBy,
  serverTimestamp, doc, getDocs, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { UserProfile } from '../types';

/* ═══════════════════════════════════════════
   CHAT SYSTEM – Telegram-like real-time chat
═══════════════════════════════════════════ */

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  read: boolean;
  conversationId: string;
}

const getConversationId = (uid1: string, uid2: string) =>
  [uid1, uid2].sort().join('_');

// Client-side image compression utility to speed up image uploading
const compressImage = (file: File | Blob, maxWidth = 640, maxHeight = 640, quality = 0.6): Promise<Blob> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

interface ChatSystemProps {
  userProfile: UserProfile;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ userProfile }) => {
  const [contacts, setContacts] = useState<UserProfile[]>([]);
  const [activeContact, setActiveContact] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const uploadFileAsync = async (file: File) => {
    setIsUploadingImage(true);
    setUploadedImageUrl(null);
    try {
      const storageRef = ref(storage, `chat/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setUploadedImageUrl(url);
    } catch (err) {
      console.error("Chat image upload error:", err);
      alert("Rasmni yuklashda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
      setImageFile(compressedFile);
      uploadFileAsync(compressedFile);
    } catch (err) {
      console.error("Error compressing chat image:", err);
      setImageFile(file);
      uploadFileAsync(file);
    }
  };

  // Load all users (contacts)
  useEffect(() => {
    const fetchContacts = async () => {
      const snap = await getDocs(collection(db, 'users'));
      const all = snap.docs
        .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
        .filter(u => u.uid !== userProfile.uid);
      setContacts(all);
    };
    fetchContacts();
  }, [userProfile.uid]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeContact) return;
    if (unsubRef.current) unsubRef.current();

    const convId = getConversationId(userProfile.uid, activeContact.uid);
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', convId),
      orderBy('createdAt', 'asc')
    );

    unsubRef.current = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          senderId: data.senderId,
          senderName: data.senderName,
          receiverId: data.receiverId,
          text: data.text || '',
          imageUrl: data.imageUrl,
          conversationId: data.conversationId,
          read: data.read || false,
          timestamp: data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
            : data.timestamp || '',
        } as ChatMessage;
      });
      setMessages(msgs);
    });

    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [activeContact, userProfile.uid]);

  const sendMessage = async () => {
    if ((!inputText.trim() && !imageFile) || !activeContact || isSending || isUploadingImage) return;
    setIsSending(true);

    try {
      let imageUrl = '';
      if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
        setUploadedImageUrl(null);
        setImageFile(null);
      } else if (imageFile) {
        const storageRef = ref(storage, `chat/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
        setImageFile(null);
      }

      const convId = getConversationId(userProfile.uid, activeContact.uid);
      await addDoc(collection(db, 'messages'), {
        senderId: userProfile.uid,
        senderName: userProfile.displayName,
        receiverId: activeContact.uid,
        text: inputText.trim(),
        imageUrl: imageUrl || null,
        conversationId: convId,
        read: false,
        createdAt: serverTimestamp(),
      });
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const roleColors: Record<string, string> = {
    'student': 'from-blue-500 to-blue-700',
    'teacher': 'from-green-500 to-green-700',
    'admin': 'from-purple-500 to-purple-700',
    'super-admin': 'from-red-500 to-red-700',
  };

  const roleLabels: Record<string, string> = {
    'student': 'Talaba',
    'teacher': 'O\'qituvchi',
    'admin': 'Admin',
    'super-admin': 'Super Admin',
  };

  /* ── If in a conversation ── */
  if (activeContact) {
    return (
      <div className="flex flex-col h-[calc(100vh-160px)]" style={{ background: 'var(--theme-bg)' }}>
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--theme-card)] border-b border-[var(--theme-border)]">
          <button
            onClick={() => setActiveContact(null)}
            className="text-[var(--theme-text-muted)] p-1"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>

          <div className="relative">
            <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm', roleColors[activeContact.role] || 'from-gray-500 to-gray-700')}>
              {activeContact.displayName[0].toUpperCase()}
            </div>
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--theme-card)]',
              activeContact.isOnline ? 'bg-green-400' : 'bg-gray-400'
            )} />
          </div>

          <div className="flex-1">
            <p className="font-bold text-sm text-[var(--theme-text)]">{activeContact.displayName}</p>
            <p className="text-xs text-[var(--theme-text-muted)]">
              {activeContact.isOnline ? '🟢 Online' : '⚪ Offline'} • {roleLabels[activeContact.role]}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 hide-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-3">💬</div>
              <p className="text-sm font-bold text-[var(--theme-text)]">{activeContact.displayName} bilan suhbat</p>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1">Birinchi xabar yuboring!</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isMe = msg.senderId === userProfile.uid;
            const showTime = idx === 0 || messages[idx-1].senderId !== msg.senderId;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex', isMe ? 'justify-end' : 'justify-start')}
              >
                <div className={cn('max-w-[78%] space-y-1', isMe ? 'items-end' : 'items-start', 'flex flex-col')}>
                  {showTime && !isMe && (
                    <span className="text-[10px] text-[var(--theme-text-muted)] px-2">{msg.senderName}</span>
                  )}
                  <div className={cn(
                    'px-3.5 py-2.5 rounded-2xl',
                    isMe
                      ? 'message-bubble-sent rounded-br-sm'
                      : 'message-bubble-received rounded-bl-sm'
                  )}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="" className="rounded-xl max-w-full mb-2 max-h-48 object-cover" />
                    )}
                    {msg.text && (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                    <p className={cn('text-[10px] mt-1', isMe ? 'text-white/60 text-right' : 'text-[var(--theme-text-muted)]')}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Image preview */}
        {imageFile && (
          <div className="px-4 py-2 bg-[var(--theme-card)] border-t border-[var(--theme-border)]">
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--theme-bg)] flex items-center justify-center">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs text-[var(--theme-text)] flex-1 truncate">
                {imageFile.name} {isUploadingImage && <span className="text-blue-500 font-semibold">(Yuklanmoqda...)</span>}
              </span>
              <button 
                onClick={() => { 
                  setImageFile(null); 
                  setUploadedImageUrl(null); 
                  setIsUploadingImage(false); 
                }} 
                disabled={isUploadingImage}
                className="text-red-400 text-xs disabled:opacity-40"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 bg-[var(--theme-card)] border-t border-[var(--theme-border)] flex items-end gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-[var(--theme-bg)] flex items-center justify-center text-[var(--theme-text-muted)] hover:text-blue-400 transition-colors flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

          <div className="flex-1 flex items-end bg-[var(--theme-bg)] rounded-2xl border border-[var(--theme-border)] px-3 py-2">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Xabar yozing..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] resize-none outline-none max-h-24"
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={(!inputText.trim() && !imageFile) || isSending || isUploadingImage}
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-40 transition-opacity"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ── Contact List ── */
  return (
    <div className="pb-24" style={{ background: 'var(--theme-bg)' }}>
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Foydalanuvchi qidirish..."
            className="w-full pl-10 pr-4 py-3 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl text-sm text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Contacts */}
      <div className="px-4 space-y-1.5 pt-1">
        {filteredContacts.length === 0 && searchQuery && (
          <div className="text-center py-10 text-[var(--theme-text-muted)]">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">"{searchQuery}" topilmadi</p>
          </div>
        )}

        {filteredContacts.length === 0 && !searchQuery && (
          <div className="text-center py-16 text-[var(--theme-text-muted)]">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-sm font-bold text-[var(--theme-text)]">Foydalanuvchilar yuklanmoqda...</p>
          </div>
        )}

        {filteredContacts.map((contact, idx) => (
          <motion.button
            key={contact.uid}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            onClick={() => setActiveContact(contact)}
            className="w-full flex items-center gap-3 p-3.5 bg-[var(--theme-card)] rounded-2xl border border-[var(--theme-border)] hover:border-blue-500/30 transition-all text-left"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={cn(
                'w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg',
                roleColors[contact.role] || 'from-gray-500 to-gray-700'
              )}>
                {contact.displayName[0].toUpperCase()}
              </div>
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--theme-card)]',
                contact.isOnline ? 'bg-green-400' : 'bg-gray-400'
              )} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--theme-text)] truncate">{contact.displayName}</span>
                <span className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
                  contact.role === 'teacher' ? 'bg-green-500/10 text-green-400' :
                  contact.role === 'admin' ? 'bg-purple-500/10 text-purple-400' :
                  contact.role === 'super-admin' ? 'bg-red-500/10 text-red-400' :
                  'bg-blue-500/10 text-blue-400'
                )}>
                  {roleLabels[contact.role]}
                </span>
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">@{contact.username}</p>
            </div>

            {/* Online status */}
            <div className="flex-shrink-0 text-right">
              <span className="text-xs text-[var(--theme-text-muted)]">
                {contact.isOnline ? '🟢' : '⚪'}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
