import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const PhotoUpload = ({ onPhotosChange }) => {
  const [previewUrls, setPreviewUrls] = useState([]);
  const [photos, setPhotos] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = [...photos, ...files].slice(0, 5);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, 5));
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    
    setPhotos(newPhotos);
    setPreviewUrls(newPreviewUrls);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors">
          <Upload size={20} />
          <span>Add Photos</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
            max="5"
          />
        </label>
        <span className="text-sm text-gray-500">
          {photos.length}/5 photos (Max 5MB each)
        </span>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove photo"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {previewUrls.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8">
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon size={48} className="mb-2" />
            <p>No photos selected</p>
            <p className="text-sm">Upload up to 5 photos</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;