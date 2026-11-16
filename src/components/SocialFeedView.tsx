import React, { useState } from 'react';
import { Heart, MessageCircle, Send } from 'lucide-react';
import type { LanguageCode, SocialPost } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface SocialFeedViewProps {
  language: LanguageCode;
  posts: SocialPost[];
  onCreatePost: (payload: {
    category: SocialPost['category'];
    content: string;
    metricSummary?: string;
  }) => Promise<void>;
  onLikePost: (id: string) => Promise<void>;
  onCommentPost: (id: string, text: string) => Promise<void>;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  language,
  posts,
  onCreatePost,
  onLikePost,
  onCommentPost,
}) => {
  const t = TRANSLATIONS[language];
  const [category, setCategory] = useState<SocialPost['category']>('Milestone');
  const [content, setContent] = useState('');
  const [metricSummary, setMetricSummary] = useState('');
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onCreatePost({
      category,
      content: content.trim(),
      metricSummary: metricSummary.trim() || undefined,
    });
    setContent('');
    setMetricSummary('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 [text-wrap:balance]">
          {t.sections.socialHeadline}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Share verified training milestones, match innings, and completed coaching certifications with the community.
        </p>
      </div>

      {/* Create Achievement Post */}
      <form
        onSubmit={handlePublish}
        className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700">Share Achievement Update</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SocialPost['category'])}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-900"
          >
            <option value="Milestone">Milestone</option>
            <option value="Match Highlight">Match Highlight</option>
            <option value="Certification">Certification</option>
            <option value="Training Clip">Training Clip</option>
          </select>
        </div>

        <textarea
          rows={3}
          required
          placeholder="What milestone, VR drill score, or match performance did you achieve today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
        />

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Optional verified metric (e.g., 141 km/h peak release)"
            value={metricSummary}
            onChange={(e) => setMetricSummary(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 whitespace-nowrap shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Post to Feed</span>
          </button>
        </div>
      </form>

      {/* Feed Stream */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-emerald-700">
                  {post.category} · {post.timestamp}
                </div>
                <h2 className="text-base font-semibold text-slate-900 mt-0.5">{post.authorName}</h2>
                <div className="text-xs text-slate-500">{post.authorRole}</div>
              </div>
              {post.metricSummary && (
                <div className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 rounded-md px-2.5 py-1 tabular-nums">
                  {post.metricSummary}
                </div>
              )}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>

            <div className="flex items-center gap-5 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => onLikePost(post.id)}
                className={`inline-flex items-center gap-1.5 font-semibold transition-colors ${
                  post.likedByMe ? 'text-emerald-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                <span className="font-mono tabular-nums">{post.likes}</span>
                <span>Celebrate</span>
              </button>

              <div className="inline-flex items-center gap-1.5 text-slate-600">
                <MessageCircle className="h-4 w-4" />
                <span className="font-mono tabular-nums">{post.comments.length}</span>
                <span>Comments</span>
              </div>
            </div>

            {post.comments.length > 0 && (
              <div className="space-y-2 pt-2">
                {post.comments.map((c) => (
                  <div key={c.id} className="rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs">
                    <span className="font-semibold text-slate-900">{c.author}</span>{' '}
                    <span className="text-slate-400">· {c.timestamp}</span>
                    <p className="text-slate-700 mt-0.5">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const text = (commentDrafts[post.id] || '').trim();
                if (!text) return;
                await onCommentPost(post.id, text);
                setCommentDrafts((prev) => ({ ...prev, [post.id]: '' }));
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentDrafts[post.id] || ''}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Reply
              </button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
};
