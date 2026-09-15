import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export interface CommentItem {
  id?: string;
  authorName: string;
  authorEmail?: string;
  authorUid?: string;
  authorPhoto?: string;
  content: string;
  category: 'feedback' | 'feature_request' | 'bug_report' | 'question';
  votes: number;
  createdAt: any;
  isVerifiedUser: boolean;
}

const COMMENTS_COLLECTION = 'comments';
const LAST_SUBMIT_KEY = 'appasset_last_comment_time';
const RATE_LIMIT_SECONDS = 15; // 15s cooldown to prevent spam

// Basic sanitization against XSS
export function sanitizeInput(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

// Basic anti-spam check
export function checkIsSpam(text: string): { isSpam: boolean; reason?: string } {
  const lower = text.toLowerCase();
  const spamKeywords = [
    'casino', 'viagra', 'cryptocurrency airdrop', 'free followers', 
    'telegram bot', 'whatsapp +', 'click here to win', 't.me/'
  ];
  
  for (const kw of spamKeywords) {
    if (lower.includes(kw)) {
      return { isSpam: true, reason: `Disallowed promotional term detected.` };
    }
  }

  // Check for repeated characters spam (e.g. "aaaaa...")
  if (/(.)\1{9,}/.test(text)) {
    return { isSpam: true, reason: 'Excessive character repetition detected.' };
  }

  return { isSpam: false };
}

export function subscribeToComments(
  onUpdate: (comments: CommentItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: CommentItem[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<CommentItem, 'id'>)
      }));
      onUpdate(items);
    }, (error) => {
      console.warn('Firestore subscription notice (using local fallback if offline):', error);
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (error: any) {
    console.warn('Could not initialize firestore subscription:', error);
    return () => {};
  }
}

export async function submitComment(data: {
  content: string;
  category: 'feedback' | 'feature_request' | 'bug_report' | 'question';
  customAuthorName?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Rate limiting
  const lastSubmit = localStorage.getItem(LAST_SUBMIT_KEY);
  const now = Date.now();
  if (lastSubmit) {
    const elapsedSec = (now - parseInt(lastSubmit, 10)) / 1000;
    if (elapsedSec < RATE_LIMIT_SECONDS) {
      const remaining = Math.ceil(RATE_LIMIT_SECONDS - elapsedSec);
      return { success: false, error: `Please wait ${remaining}s before posting another comment.` };
    }
  }

  // Length validation
  const cleanContent = sanitizeInput(data.content);
  if (!cleanContent || cleanContent.length < 3) {
    return { success: false, error: 'Comment must be at least 3 characters long.' };
  }
  if (cleanContent.length > 1000) {
    return { success: false, error: 'Comment cannot exceed 1,000 characters.' };
  }

  // Spam heuristics
  const spamCheck = checkIsSpam(cleanContent);
  if (spamCheck.isSpam) {
    return { success: false, error: spamCheck.reason || 'Content flagged as automated spam.' };
  }

  const currentUser = auth.currentUser;
  const authorName = currentUser?.displayName || data.customAuthorName || 'Mobile Developer';

  try {
    await addDoc(collection(db, COMMENTS_COLLECTION), {
      authorName: sanitizeInput(authorName),
      authorEmail: currentUser?.email || '',
      authorUid: currentUser?.uid || 'guest',
      authorPhoto: currentUser?.photoURL || '',
      content: cleanContent,
      category: data.category,
      votes: 0,
      createdAt: serverTimestamp(),
      isVerifiedUser: !!currentUser
    });

    localStorage.setItem(LAST_SUBMIT_KEY, now.toString());
    return { success: true };
  } catch (err: any) {
    console.error('Error adding comment to Firestore:', err);
    return { success: false, error: err.message || 'Failed to post comment.' };
  }
}

export async function upvoteComment(commentId: string): Promise<boolean> {
  const votedKey = `appasset_voted_${commentId}`;
  if (localStorage.getItem(votedKey)) {
    return false; // already voted
  }

  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, {
      votes: increment(1)
    });
    localStorage.setItem(votedKey, '1');
    return true;
  } catch (err) {
    console.error('Failed to upvote:', err);
    return false;
  }
}

// Aliases for component convenience
export type CommunityComment = CommentItem & { upvotes?: number; authorPhotoUrl?: string };

export function fetchCommunityComments(
  onUpdate: (comments: CommunityComment[]) => void,
  onError?: (err: Error) => void
): () => void {
  return subscribeToComments((items) => {
    onUpdate(items.map(i => ({ 
      ...i, 
      upvotes: i.votes,
      authorPhotoUrl: i.authorPhoto 
    })));
  }, onError);
}

export async function addCommunityComment(data: {
  authorName: string;
  authorEmail?: string;
  authorPhotoUrl?: string;
  content: string;
  category: 'suggestion' | 'feedback' | 'bug' | 'question';
}): Promise<{ success: boolean; error?: string }> {
  const catMap: Record<string, 'feedback' | 'feature_request' | 'bug_report' | 'question'> = {
    suggestion: 'feature_request',
    feedback: 'feedback',
    bug: 'bug_report',
    question: 'question'
  };

  const res = await submitComment({
    content: data.content,
    category: catMap[data.category] || 'feedback',
    customAuthorName: data.authorName
  });

  if (!res.success) {
    throw new Error(res.error || 'Failed to submit comment');
  }
  return res;
}

export const upvoteCommunityComment = upvoteComment;

