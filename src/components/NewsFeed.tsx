import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../lib/firebase';
import {
  collection, addDoc, getDocs, onSnapshot, orderBy, query,
  updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Post, PostComment, UserProfile } from '../types';

/* ═══════════════════════════════════
   NEWS FEED – Instagram/FB-like
═══════════════════════════════════ */
interface NewsFeedProps {
  userProfile: UserProfile;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ userProfile }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  // Subscribe to posts in real-time
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          authorId: raw.authorId,
          authorName: raw.authorName,
          authorAvatar: raw.authorAvatar,
          authorRole: raw.authorRole,
          caption: raw.caption,
          imageUrl: raw.imageUrl,
          likes: raw.likes || [],
          comments: raw.comments || [],
          createdAt: raw.createdAt instanceof Timestamp
            ? raw.createdAt.toDate().toISOString()
            : raw.createdAt || new Date().toISOString(),
        } as Post;
      });
      setPosts(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLike = async (postId: string, liked: boolean) => {
    const ref2 = doc(db, 'posts', postId);
    if (liked) {
      await updateDoc(ref2, { likes: arrayRemove(userProfile.uid) });
    } else {
      await updateDoc(ref2, { likes: arrayUnion(userProfile.uid) });
    }
  };

  const handleComment = async (postId: string, text: string) => {
    const comment: PostComment = {
      id: Math.random().toString(36).slice(2, 11),
      authorId: userProfile.uid,
      authorName: userProfile.displayName,
      text,
      createdAt: new Date().toISOString(),
    };
    const ref2 = doc(db, 'posts', postId);
    await updateDoc(ref2, { comments: arrayUnion(comment) });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return `${diff}s oldin`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m oldin`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h oldin`;
    return d.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pb-24">
      {/* Create Post Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => setShowCreate(true)}
          className="w-full flex items-center gap-3 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl px-4 py-3 hover:border-blue-500/40 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userProfile.displayName[0].toUpperCase()}
          </div>
          <span className="text-[var(--theme-text-muted)] text-sm">Dars jarayonidan rasm ulashing...</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-blue-500 font-semibold">📷 Post</span>
          </div>
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4 px-4 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--theme-card)] rounded-2xl overflow-hidden border border-[var(--theme-border)]">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full shimmer" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-32 rounded shimmer" />
                  <div className="h-2 w-20 rounded shimmer" />
                </div>
              </div>
              <div className="h-48 shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-full rounded shimmer" />
                <div className="h-3 w-3/4 rounded shimmer" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {!isLoading && (
        <>
          {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-lg font-bold text-[var(--theme-text)]">Hali post yo'q</h3>
              <p className="text-sm text-[var(--theme-text-muted)] mt-2">Birinchi bo'lib dars jarayonidan rasm ulashing!</p>
            </div>
          )}

          <div className="space-y-4 px-4 pt-2">
            {posts.map((post, idx) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={userProfile}
                onLike={handleLike}
                onComment={handleComment}
                formatTime={formatTime}
                animDelay={idx * 0.1}
              />
            ))}
          </div>
        </>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreate && (
          <CreatePostModal
            userProfile={userProfile}
            onClose={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Post Card ─── */
const PostCard = ({
  post,
  currentUser,
  onLike,
  onComment,
  formatTime,
  animDelay,
}: {
  post: Post;
  currentUser: UserProfile;
  onLike: (id: string, liked: boolean) => void;
  onComment: (id: string, text: string) => void;
  formatTime: (iso: string) => string;
  animDelay: number;
}) => {
  const isLiked = post.likes.includes(currentUser.uid);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleColors: Record<string, string> = {
    'student': 'bg-blue-500/10 text-blue-400',
    'teacher': 'bg-green-500/10 text-green-400',
    'admin': 'bg-purple-500/10 text-purple-400',
    'super-admin': 'bg-red-500/10 text-red-400',
  };
  const roleLabels: Record<string, string> = {
    'student': 'Talaba',
    'teacher': 'O\'qituvchi',
    'admin': 'Admin',
    'super-admin': 'Super Admin',
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    await onComment(post.id, commentText.trim());
    setCommentText('');
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.4 }}
      className="post-card rounded-2xl overflow-hidden"
    >
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="relative">
          {post.authorAvatar ? (
            <img src={post.authorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {post.authorName[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[var(--theme-text)] truncate">{post.authorName}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[post.authorRole] || 'bg-gray-500/10 text-gray-400'}`}>
              {roleLabels[post.authorRole] || post.authorRole}
            </span>
          </div>
          <p className="text-xs text-[var(--theme-text-muted)]">{formatTime(post.createdAt)}</p>
        </div>
        <button className="text-[var(--theme-text-muted)] p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm text-[var(--theme-text)] leading-relaxed">{post.caption}</p>
        </div>
      )}

      {/* Image */}
      {post.imageUrl && (
        <div className="overflow-hidden">
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full object-cover max-h-[400px]"
            loading="lazy"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4 mb-3">
          {/* Like */}
          <button
            onClick={() => onLike(post.id, isLiked)}
            className={`flex items-center gap-1.5 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-[var(--theme-text-muted)]'}`}
          >
            <motion.div
              key={isLiked ? 'liked' : 'unliked'}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {isLiked ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              )}
            </motion.div>
            <span className="text-sm font-semibold">{post.likes.length}</span>
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-[var(--theme-text-muted)] transition-colors hover:text-[var(--theme-text)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span className="text-sm font-semibold">{post.comments.length}</span>
          </button>

          {/* Share */}
          <button className="flex items-center gap-1.5 text-[var(--theme-text-muted)] ml-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>

        {/* Like count */}
        {post.likes.length > 0 && (
          <p className="text-xs font-bold text-[var(--theme-text)] mb-2">
            {post.likes.length} ta yoqdi
          </p>
        )}

        {/* Comments section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mb-3 max-h-60 overflow-y-auto pr-1 hide-scrollbar">
                {post.comments.map((c) => (
                  <div key={c.id} className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {c.authorName[0].toUpperCase()}
                    </div>
                    <div className="bg-[var(--theme-bg)] rounded-xl px-3 py-2 flex-1">
                      <span className="font-bold text-xs text-[var(--theme-text)]">{c.authorName} </span>
                      <span className="text-xs text-[var(--theme-text-muted)]">{c.text}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Add comment */}
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {currentUser.displayName[0].toUpperCase()}
                </div>
                <div className="flex-1 flex items-center bg-[var(--theme-bg)] rounded-full border border-[var(--theme-border)] px-3 py-1.5">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    placeholder="Izoh qo'shing..."
                    className="flex-1 bg-transparent text-xs text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] outline-none"
                  />
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmitting}
                    className="text-blue-500 font-bold text-xs disabled:opacity-40 transition-opacity ml-2"
                  >
                    Jo'nat
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

/* ─── Create Post Modal ─── */
const CreatePostModal = ({
  userProfile,
  onClose,
}: {
  userProfile: UserProfile;
  onClose: () => void;
}) => {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if ((!caption.trim() && !imageFile) || isUploading) return;
    setIsUploading(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, 'posts'), {
        authorId: userProfile.uid,
        authorName: userProfile.displayName,
        authorAvatar: userProfile.avatarUrl || null,
        authorRole: userProfile.role,
        caption: caption.trim(),
        imageUrl,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      console.error('Post yaratishda xato:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-[var(--theme-card)] rounded-t-3xl w-full max-w-[480px] overflow-hidden"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[var(--theme-border)] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--theme-border)]">
          <button onClick={onClose} className="text-[var(--theme-text-muted)] font-medium text-sm">Bekor</button>
          <h3 className="font-bold text-[var(--theme-text)]">Yangi Post</h3>
          <button
            onClick={handleSubmit}
            disabled={(!caption.trim() && !imageFile) || isUploading}
            className="text-blue-500 font-bold text-sm disabled:opacity-40"
          >
            {isUploading ? 'Jo\'natilmoqda...' : 'Ulashish'}
          </button>
        </div>

        {/* Author */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {userProfile.displayName[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-sm text-[var(--theme-text)]">{userProfile.displayName}</p>
            <p className="text-xs text-[var(--theme-text-muted)]">Barcha uchun ko'rinadi</p>
          </div>
        </div>

        {/* Caption input */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Dars jarayonidan nima ulashmoqchisiz?"
          rows={4}
          className="w-full px-5 text-[var(--theme-text)] text-sm bg-transparent placeholder-[var(--theme-text-muted)] resize-none outline-none"
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mx-5 mb-4 rounded-2xl overflow-hidden">
            <img src={imagePreview} alt="" className="w-full max-h-60 object-cover rounded-2xl" />
            <button
              onClick={() => { setImageFile(null); setImagePreview(null); }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Image button */}
        <div className="px-5 py-4 border-t border-[var(--theme-border)]">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-blue-500 font-semibold text-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Rasm qo'shish
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </div>

        {/* Safe bottom area */}
        <div className="h-6" />
      </motion.div>
    </motion.div>
  );
};
