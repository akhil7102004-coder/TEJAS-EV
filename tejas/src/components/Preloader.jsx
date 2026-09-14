import React, { useState } from 'react';
import introVideo from '../assets/0912.mp4';

export default function Preloader({ onComplete }) {
  const [fadeOut, setFadeOut] = useState(false);

  const finishLoading = () => {
    setFadeOut(true);
    window.setTimeout(onComplete, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden bg-black transition-opacity duration-700 ease-in-out ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        className="h-full w-full object-cover"
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={finishLoading}
        onError={onComplete}
        aria-label="TEJAS introduction"
      />
    </div>
  );
}
