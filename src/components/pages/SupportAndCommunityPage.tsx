import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Coffee, 
  Send, 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  LogIn, 
  Copy, 
  Check
} from 'lucide-react';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, User } from '../../config/firebase';
import { 
  fetchCommunityComments, 
  addCommunityComment, 
  upvoteCommunityComment, 
  CommunityComment 
} from '../../services/firebaseService';
import { supportConfig } from '../../config/supportConfig';

export const SupportAndCommunityPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New comment form
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [category, setCategory] = useState<'suggestion' | 'feedback' | 'bug' | 'question'>('suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Copied crypto state
  const [copiedCrypto, setCopiedCrypto] = useState(false);

  // Upvoted IDs state
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && u.displayName) {
        setAuthorName(u.displayName);
      }
    });

    const unsubscribeComments = fetchCommunityComments((data) => {
      setComments(data);
      setLoadingComments(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeComments();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Sign-in note:', err.message);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await addCommunityComment({
        authorName: authorName.trim() || 'Anonymous Developer',
        authorEmail: user?.email || undefined,
        authorPhotoUrl: user?.photoURL || undefined,
        content: commentText.trim(),
        category,
      });

      setCommentText('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setSubmitError(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (commentId: string) => {
    if (upvotedIds.has(commentId)) return;
    try {
      await upvoteCommunityComment(commentId);
      setUpvotedIds(prev => new Set(prev).add(commentId));
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const filteredComments = comments.filter(c => {
    if (filterCategory === 'all') return true;
    return c.category === filterCategory;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Community & Support
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Free software for indie developers and mobile engineering teams.
          </p>
        </div>

        <a
          href="mailto:support@appassetstudio.dev"
          className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Mail className="w-3.5 h-3.5 text-zinc-500" />
          <span>Contact Maintainer</span>
        </a>
      </div>

      {/* Support Info Box */}
      <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Free Developer Software</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {supportConfig.freeExplanation}
        </p>
      </div>

      {/* Voluntary Contribution Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
            Voluntary Sponsorship
          </h2>
          <span className="text-[11px] text-zinc-400 font-mono">Optional</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {supportConfig.donationOptions.map((opt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between space-y-3 shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                    {opt.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800">
                    {opt.recommendedAmount}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              {opt.url ? (
                <a
                  href={opt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 text-xs font-medium text-center transition-colors block"
                >
                  Support via {opt.name}
                </a>
              ) : (
                <button
                  onClick={() => {
                    if (opt.accountOrAddress) {
                      navigator.clipboard.writeText(opt.accountOrAddress);
                      setCopiedCrypto(true);
                      setTimeout(() => setCopiedCrypto(false), 2500);
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedCrypto ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCrypto ? 'Address Copied' : 'Copy Wallet Address'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Community Feedback & Suggestions */}
      <div className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              Community Feedback & Requests
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Submit feature requests, report store guideline updates, or suggest new presets.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            {(['all', 'suggestion', 'feedback', 'bug', 'question'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md capitalize text-[11px] font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Submission Form */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-zinc-500 uppercase font-semibold">
              Post Feedback
            </span>

            {user ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Signed in as {user.displayName || user.email}</span>
              </span>
            ) : (
              <button
                onClick={handleSignIn}
                className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline flex items-center gap-1 font-mono"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign in with Google (optional)</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Liam (Mobile Engineer)"
                  maxLength={50}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                  Topic Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-medium"
                >
                  <option value="suggestion">Feature Suggestion</option>
                  <option value="feedback">General Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="question">Question / Spec Help</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-zinc-400 uppercase mb-1">
                Message ({1000 - commentText.length} chars)
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your suggestion, recommend device models, or report an issue..."
                rows={3}
                maxLength={1000}
                required
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400"
              />
            </div>

            {submitError && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950 text-xs text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Feedback submitted successfully.</span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !commentText.trim()}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{isSubmitting ? 'Posting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Feedback Feed */}
        <div className="space-y-2.5">
          {loadingComments ? (
            <div className="p-6 text-center text-xs text-zinc-400 font-mono">
              Loading community comments...
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-800">
              No entries in this category yet.
            </div>
          ) : (
            filteredComments.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.authorPhotoUrl ? (
                      <img
                        src={c.authorPhotoUrl}
                        alt={c.authorName}
                        className="w-5 h-5 rounded-full border border-zinc-300 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-[9px]">
                        {c.authorName.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      {c.authorName}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {c.category}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>

                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {c.content}
                </p>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => handleUpvote(c.id)}
                    disabled={upvotedIds.has(c.id)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      upvotedIds.has(c.id)
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{c.upvotes}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};
