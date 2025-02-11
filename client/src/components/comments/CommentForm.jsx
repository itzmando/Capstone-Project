import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, AlertCircle } from 'lucide-react';

const CommentForm = ({ reviewId, onCommentSubmitted }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { isLoggedIn, getAuthHeader } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ content: content.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      const data = await response.json();
      setContent('');
      if (onCommentSubmitted) {
        onCommentSubmitted(data);
      }
      window.dispatchEvent(new Event('userContentUpdated'));
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.message || 'Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        Please log in to leave a comment.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          min-h-[80px] resize-y"
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" size={16} />
              <span>Posting...</span>
            </>
          ) : (
            'Post Comment'
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;