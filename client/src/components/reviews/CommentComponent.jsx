import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const Comment = ({ comment, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { getAuthHeader } = useAuth();

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({ content: editedContent })
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setIsEditing(false);
        if (onUpdate) {
          onUpdate(updatedComment);
        }
      }
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  return isEditing ? (
    <form onSubmit={handleEditSubmit} className="pl-4 border-l-2 border-gray-200">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Edit Comment
        </label>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-2 border rounded min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>
      <div className="mt-2 space-x-2">
        <button 
          type="submit" 
          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md"
        >
          Cancel
        </button>
      </div>
    </form>
  ) : (
    <div className="pl-4 border-l-2 border-gray-200">
      <p className="text-gray-700 break-words">{comment.content}</p>
      <div className="mt-1 text-sm text-gray-500 flex flex-wrap gap-2">
        <span>{comment.user_name}</span>
        <span>•</span>
        <span>{new Date(comment.created_at).toLocaleDateString()}</span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default Comment;