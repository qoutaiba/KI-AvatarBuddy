import React from 'react';
import { MediaItem } from '../MediaItem/MediaItem';
import './MediaPanel.css';
import { extractYouTubeId } from '../HelperFunctions/Youtube';

interface MediaPanelProps {
  media: MediaItem[] | null;
}

export const MediaPanel: React.FC<MediaPanelProps> = ({ media }) => {
  if (!media || media.length === 0) {
    return (
      <div className="media-panel empty">
        <p>Kein Lernmaterial geladen</p>
      </div>
    );
  }

   return (
    <div className="media-panel">
      {media.map((item) => (
        <div key={item.id} className="media-item">
          <h4 className="media-title">{item.title}</h4>

          {item.isImage() && (
            <img src={item.sourceUrl} alt={item.title} className="media-content" />
          )}

            {item.isVideo() && (
            <div className="media-content video-wrapper">
              <iframe
                width="100%"
                height="200"
                src={`https://www.youtube.com/embed/${extractYouTubeId(
                  item.sourceUrl
                )}`}
                title={item.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}

          {item.description && (
            <p className="media-description">{item.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};