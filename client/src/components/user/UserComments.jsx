import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, Trash2, Edit, ExternalLink, AlertCircle } from 'lucide-react';

const UserComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const { user, isLoggedIn, getAuthHeader } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchUserComments();
  }, [isLoggedIn, navigate]);

  const fetchUserComments = async () => {
    try {
      const response = await fetch('/api/users/comments', {
        headers: getAuthHeader()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data);
    } catch (error) {
      setError('Failed to load comments. Please try again later.');
      console.error('Error fetching user comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const handleEditSubmit = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ content: editContent })
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      const updatedComment = await response.json();
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: updatedComment.content }
          : comment
      ));
      setEditingComment(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="text-purple-600" />
            My Comments
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-purple-100">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {comments.map(comment => (
            <div 
              key={comment.id} 
              className="bg-white rounded-xl shadow-sm border border-purple-100 hover:border-purple-200 transition-all p-6"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-grow min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                      {comment.review_title || 'Review'}
                    </h2>
                    <p className="text-sm text-purple-600 truncate">
                      {comment.place_name || 'Location'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/place/${comment.place_id}`)}
                      className="text-gray-600 hover:text-purple-600 transition-colors p-2 rounded-lg hover:bg-purple-50"
                      title="View Place"
                    >
                      <ExternalLink size={20} />
                    </button>
                    <button
                      onClick={() => handleEditClick(comment)}
                      className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="Edit Comment"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Delete Comment"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[100px] resize-y"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingComment(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSubmit(comment.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-700 break-words">{comment.content}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{new Date(comment.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {comments.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-purple-100 mt-6">
            <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Comments Yet</h3>
            <p className="mt-2 text-gray-500">
              You haven't made any comments yet. Start exploring places and sharing your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserComments;