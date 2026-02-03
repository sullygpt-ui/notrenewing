'use client';

import { useEffect, useRef } from 'react';

export function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    // Color palette matching our indigo theme
    const colors = [
      { r: 99, g: 102, b: 241 },   // indigo-500
      { r: 139, g: 92, b: 246 },   // violet-500
      { r: 236, g: 72, b: 153 },   // pink-500
      { r: 14, g: 165, b: 233 },   // sky-500
      { r: 79, g: 70, b: 229 },    // indigo-600
    ];

    const blobs = colors.map((color, i) => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      radius: 200 + Math.random() * 200,
      color,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      phase: i * 0.5,
    }));

    const animate = () => {
      time += 0.005;
      
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      // Clear with dark background
      ctx.fillStyle = '#0c0a1d';
      ctx.fillRect(0, 0, width, height);

      // Update and draw blobs
      blobs.forEach((blob, i) => {
        // Smooth movement
        blob.x += blob.vx + Math.sin(time + blob.phase) * 0.5;
        blob.y += blob.vy + Math.cos(time + blob.phase * 1.3) * 0.5;

        // Bounce off edges softly
        if (blob.x < -blob.radius) blob.x = width + blob.radius;
        if (blob.x > width + blob.radius) blob.x = -blob.radius;
        if (blob.y < -blob.radius) blob.y = height + blob.radius;
        if (blob.y > height + blob.radius) blob.y = -blob.radius;

        // Draw gradient blob
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        );
        
        const { r, g, b } = blob.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.15)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      // Add subtle noise overlay
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const gray = Math.random() * 255;
        ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
