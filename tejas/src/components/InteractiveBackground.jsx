import React, { useEffect, useRef } from 'react';

export default function InteractiveBackground({ theme }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let particles = [];
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // Scale number of particles based on screen size
      const numberOfParticles = Math.min(80, Math.floor((canvas.width * canvas.height) / 20000));
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          color: Math.random() > 0.4 ? '#10b981' : '#22d3ee', // Emerald or Cyan
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const isDark = theme === 'dark';
      
      // Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce/Wrap boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        // Make particles slightly transparent/glowing
        ctx.globalAlpha = isDark ? 0.35 : 0.22;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Adjust colors for light/dark mode
            if (isDark) {
              ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 * (1 - dist / 110)})`; // fading soft emerald
            } else {
              ctx.strokeStyle = `rgba(15, 23, 42, ${0.05 * (1 - dist / 110)})`; // fading soft dark-gray
            }
            
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw mouse-to-particle interactive connections
      if (mouseRef.current.x !== null && mouseRef.current.y !== null) {
        particles.forEach((p) => {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseRef.current.radius) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
            
            const alpha = (1 - dist / mouseRef.current.radius) * 0.2;
            if (isDark) {
              ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`; // glowing electric green
            } else {
              ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`; // green
            }
            
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
