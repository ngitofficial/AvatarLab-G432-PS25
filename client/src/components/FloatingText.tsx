import React, { useState, useEffect } from 'react';

export const FloatingText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 50;
      const y = (clientY / window.innerHeight - 0.5) * 50;
      setPosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div
      className={`absolute text-white/70 font-handwriting text-lg transition-transform duration-300 ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        textShadow: '0 0 20px rgba(147, 51, 234, 0.5)'
      }}
    >
      {text}
    </div>
  );
};