import React, { useState, useRef } from 'react';

export default function TiltCard({ children, className = "", maxTilt = 8, scale = 1.02 }) {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Relative mouse position within card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Centered percentage (-0.5 to 0.5)
    const pctX = (x / rect.width) - 0.5;
    const pctY = (y / rect.height) - 0.5;

    // Tilt rotation calculations
    const rotX = (-pctY * maxTilt).toFixed(2);
    const rotY = (pctX * maxTilt).toFixed(2);

    setCoords({ x: rotX, y: rotY, mouseX: x, mouseY: y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const cardStyle = {
    transform: isHovered 
      ? `perspective(1000px) rotateX(${coords.x}deg) rotateY(${coords.y}deg) scale(${scale})` 
      : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    transition: isHovered ? 'none' : 'transform 0.5s ease, box-shadow 0.5s ease',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={cardStyle}
      className={`glass-card p-6 border-white/5 relative overflow-hidden group ${isHovered ? 'shadow-glass-glow border-emerald-500/20' : ''} ${className}`}
    >
      {/* Mouse spotlight overlay */}
      {isHovered && (
        <div 
          className="absolute pointer-events-none rounded-full blur-[80px]"
          style={{
            left: `${coords.mouseX - 60}px`,
            top: `${coords.mouseY - 60}px`,
            width: '120px',
            height: '120px',
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
          }}
        ></div>
      )}
      
      {/* Visual content slot */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
