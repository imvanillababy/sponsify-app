import React from 'react';
import './Ad.css';
import video from '../asset/coc.mp4';

const Ad = ({ ispending, setispending }) => {

  const handleClose = () => {
    setispending(false); // Call setispending to close the ad
  };
  return (
    <>
      {ispending && (
        <div className={ispending ? 'overlay' : 'hidden'}>
          <button className="close-button" onClick={handleClose}>
             Sponsored By clash Royal
            </button>
          <div className="video-container">
            
            <video controls autoPlay className="video-player">
              <source src={video} type="video/mp4" />
              {/* Add additional <source> tags for other video formats (e.g., WebM, Ogg) */}
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
};

export default Ad;
