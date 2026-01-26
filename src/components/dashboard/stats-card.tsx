"use client"

import { useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
}

export function StatsCard({ title, value, subtitle, icon: Icon }: StatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const splash = splashRef.current;
    if (!card) return;

    // Entry animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });

    // Color splash float animation
    let splashAnim: number;
    let splashTime = 0;
    const animateSplash = () => {
      if (splash) {
        splashTime += 0.008;
        const x = Math.sin(splashTime) * 15;
        const y = Math.cos(splashTime) * 15;
        const scale = 1 + Math.sin(splashTime * 0.5) * 0.08;
        splash.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      }
      splashAnim = requestAnimationFrame(animateSplash);
    };
    animateSplash();

    // Magnetic interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = `
        perspective(1000px)
        translateX(${x * 0.05}px)
        translateY(${y * 0.05}px)
        rotateX(${-y * 0.02}deg)
        rotateY(${x * 0.02}deg)
      `;
    };

    const handleMouseLeave = () => {
      card.style.transition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) translateX(0) translateY(0) rotateX(0) rotateY(0)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(splashAnim);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative w-full p-5 bg-white/[0.04] rounded-[16px] backdrop-blur-md overflow-hidden cursor-default transition-all duration-500 group"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-[16px] border border-transparent bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 bg-[length:200%_100%] animate-border-flow" 
             style={{ 
               WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
               WebkitMaskComposite: 'xor',
               maskComposite: 'exclude',
               padding: '1px'
             }} 
        />
      </div>
      
      {/* Static Border */}
      <div className="absolute inset-0 rounded-[16px] border border-white/[0.06] pointer-events-none" />
      {/* Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E")`
        }}
      />

      {/* Color Splash */}
      <div 
        ref={splashRef}
        className="absolute -top-[30px] -right-[30px] w-[100px] h-[100px] rounded-full blur-[35px] opacity-25 pointer-events-none mix-blend-screen"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #3b82f6, #60a5fa 60%, transparent 70%)'
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider">
          {title}
        </h3>
        <div className="p-1.5 rounded-lg bg-blue-500/10 backdrop-blur-sm">
          <Icon className="h-3.5 w-3.5 text-blue-400" strokeWidth={2} />
        </div>
      </div>

      {/* Value */}
      <div className="relative z-10 mb-1.5">
        <div className="text-3xl font-black text-white tracking-tight">
          {value}
        </div>
      </div>

      {/* Subtitle */}
      <div className="relative z-10">
        <p className="text-[10px] text-white/50 font-medium">
          {subtitle}
        </p>
      </div>

      {/* Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
    </div>
  );
}
