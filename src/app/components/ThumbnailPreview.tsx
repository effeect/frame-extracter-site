'use client';

import React from 'react';

interface ThumbnailGalleryProps {
  thumbnails: string[];
}

const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({ thumbnails }) => {
  if (thumbnails.length === 0) return null;

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>🖼️ Preview Thumbnails</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {thumbnails.map((src, i) => (
          <img key={i} src={src} alt={`Frame ${i + 1}`} width={100} style={{ borderRadius: '4px' }} />
        ))}
      </div>
    </div>
  );
};

export default ThumbnailGallery;