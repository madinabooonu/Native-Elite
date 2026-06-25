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
// Client-side image compression utility to speed up image uploading
const compressImage = (file: File | Blob, maxWidth = 640, maxHeight = 640, quality = 0.6): Promise<Blob> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
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
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
  });
};

interface NewsFeedProps {
  userProfile: UserProfile;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ userProfile }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [preloadedFile, setPreloadedFile] = useState<File | null>(null);
  const [preloadedPreview, setPreloadedPreview] = useState<string | null>(null);
  const [preloadCamera, setPreloadCamera] = useState(false);

  const mainFileRef = useRef<HTMLInputElement>(null);

  // Subscribe to posts in real-time
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          createdAt: raw.createdAt && typeof raw.createdAt.toDate === 'function'
            ? raw.createdAt.toDate().toISOString()
            : raw.createdAt || new Date().toISOString(),
        } as Post;
      });
      setPosts(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Prefetch first 5 post images in background for instant viewing
  useEffect(() => {
    if (posts.length > 0) {
      const firstPosts = posts.slice(0, 5);
      firstPosts.forEach((post) => {
        if (post.imageUrl && !post.imageUrl.startsWith('data:')) {
          const img = new Image();
          img.src = post.imageUrl;
        }
      });
    }
  }, [posts]);

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

  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
      setPreloadedFile(compressedFile);
      setPreloadedPreview(URL.createObjectURL(compressedBlob));
      setShowCreate(true);
    } catch (err) {
      console.error("Error compressing image:", err);
      setPreloadedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreloadedPreview(reader.result as string);
        setShowCreate(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-24">
      {/* Create Post Action Box */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-2xl p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {userProfile.displayName[0].toUpperCase()}
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex-1 text-left text-[var(--theme-text-muted)] text-sm py-2 hover:text-[var(--theme-text)] transition-colors"
            >
              Dars jarayonidan nimalar ulashmoqchisiz?
            </button>
          </div>
          
          <div className="flex gap-2.5 pt-2 border-t border-[var(--theme-border)]/40">
            <button
              onClick={() => {
                setPreloadCamera(true);
                setShowCreate(true);
              }}
              className="flex-1 py-2.5 bg-blue-600/10 hover:bg-blue-600/15 text-blue-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              📷 Rasmga Olish
            </button>
            <button
              onClick={() => mainFileRef.current?.click()}
              className="flex-1 py-2.5 border border-[var(--theme-border)] hover:bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              🖼️ Galereya
            </button>
          </div>

          <input ref={mainFileRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageSelect} />
        </div>
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
            preloadedFile={preloadedFile}
            preloadedPreview={preloadedPreview}
            preloadCamera={preloadCamera}
            onClose={() => {
              setShowCreate(false);
              setPreloadedFile(null);
              setPreloadedPreview(null);
              setPreloadCamera(false);
            }}
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
  preloadedFile = null,
  preloadedPreview = null,
  preloadCamera = false,
  onClose,
}: {
  userProfile: UserProfile;
  preloadedFile?: File | null;
  preloadedPreview?: string | null;
  preloadCamera?: boolean;
  onClose: () => void;
}) => {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(preloadedFile);
  const [imagePreview, setImagePreview] = useState<string | null>(preloadedPreview);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // In-app live camera viewfinder states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const nativeCameraRef = useRef<HTMLInputElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Upload image to Firebase Storage in background immediately
  const uploadFileAsync = async (file: File) => {
    setIsUploadingImage(true);
    setUploadedImageUrl(null);
    try {
      const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
      const metadata = {
        cacheControl: 'public, max-age=31536000',
      };
      await uploadBytes(storageRef, file, metadata);
      const url = await getDownloadURL(storageRef);
      setUploadedImageUrl(url);
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Rasmni yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  useEffect(() => {
    if (preloadedFile) {
      uploadFileAsync(preloadedFile);
    }
  }, [preloadedFile]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
      setImageFile(compressedFile);
      setImagePreview(URL.createObjectURL(compressedBlob));
      uploadFileAsync(compressedFile);
    } catch (err) {
      console.error("Error compressing image:", err);
      // Fallback
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        uploadFileAsync(file);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start in-app webcam stream
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Kameraga ruxsat berilmadi yoki kamera topilmadi.');
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (preloadCamera) {
      startCamera();
    }
  }, [preloadCamera]);

  // Stop in-app webcam stream
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Snap photo from in-app webcam stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    
    // Scale down the captured webcam image if it's too large
    let width = video.videoWidth || 640;
    let height = video.videoHeight || 480;
    const maxDimension = 640;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
          stopCamera();
          uploadFileAsync(file);
        }
      }, 'image/jpeg', 0.6);
    }
  };

  const handleSubmit = async () => {
    if ((!caption.trim() && !imageFile && !imageUrlInput.trim()) || isUploading || isUploadingImage) return;
    setIsUploading(true);

    try {
      let imageUrl = imageUrlInput.trim();
      if (uploadedImageUrl) {
        imageUrl = uploadedImageUrl;
      } else if (imageFile) {
        const storageRef = ref(storage, `posts/${Date.now()}_${imageFile.name}`);
        const metadata = {
          cacheControl: 'public, max-age=31536000',
        };
        await uploadBytes(storageRef, imageFile, metadata);
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
        className="bg-[var(--theme-card)] rounded-t-3xl w-full max-w-[480px] max-h-[92vh] overflow-y-auto flex flex-col hide-scrollbar"
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
            disabled={(!caption.trim() && !imageFile && !imageUrlInput.trim()) || isUploading || isUploadingImage}
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
          rows={3}
          className="w-full px-5 text-[var(--theme-text)] text-sm bg-transparent placeholder-[var(--theme-text-muted)] resize-none outline-none mb-3"
        />

        {/* Direct Image URL input */}
        {!isCameraActive && (
          <div className="px-5 mb-4">
            <label className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1">Rasm URL manzili (ixtiyoriy)</label>
            <input
              type="text"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              placeholder="Internetdan to'g'ridan-to'g'ri rasm linkini joylang (masalan: https://...)"
              className="w-full px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-xs outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        )}

        {/* In-app Web Camera Viewfinder */}
        {isCameraActive && (
          <div className="relative mx-5 mb-4 rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-black aspect-video flex items-center justify-center shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
              >
                📸 Rasmga Tushirish
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold text-xs shadow-md cursor-pointer transition-all active:scale-95"
              >
                Yopish
              </button>
            </div>
          </div>
        )}

        {/* Image preview */}
        {!isCameraActive && (imagePreview || imageUrlInput.trim()) && (
          <div className="relative mx-5 mb-4 rounded-2xl overflow-hidden border border-[var(--theme-border)] bg-black/5 aspect-video flex items-center justify-center">
            <img src={imagePreview || imageUrlInput.trim()} alt="Post preview" className="w-full h-full object-contain rounded-2xl" />
            
            {imageFile && (
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] text-white font-mono z-10">
                {(imageFile.size / 1024).toFixed(1)} KB
              </div>
            )}

            {isUploadingImage && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-white text-xs font-semibold">Serverga yuklanmoqda...</span>
              </div>
            )}

            <button
              onClick={() => { 
                setImageFile(null); 
                setImagePreview(null); 
                setImageUrlInput(''); 
                setUploadedImageUrl(null);
                setIsUploadingImage(false);
              }}
              disabled={isUploadingImage}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/80 disabled:opacity-40"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        )}

        {/* Image source action buttons */}
        <div className="px-5 py-4 border-t border-[var(--theme-border)] flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={isCameraActive ? stopCamera : startCamera}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center whitespace-nowrap min-w-[120px]"
          >
            {isCameraActive ? "📷 Kamerani O'chirish" : "📷 Sayt kamerasini yoqish"}
          </button>
          <button
            type="button"
            onClick={() => nativeCameraRef.current?.click()}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center whitespace-nowrap min-w-[120px]"
          >
            📸 Telefon kamerasi
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-1 py-2.5 border border-[var(--theme-border)] hover:bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 text-center whitespace-nowrap min-w-[120px]"
          >
            🖼️ Galereyadan Tanlash
          </button>

          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <input ref={nativeCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
        </div>

        {/* Safe bottom area */}
        <div className="h-6" />
      </motion.div>
    </motion.div>
  );
};
