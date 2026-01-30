"use client"

import { useEffect, useRef } from 'react';
import { CalendarIcon, TrendingUpIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface AssessmentCardProps {
  id: string;
  name: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  score: number | null;
  updatedAt: string;
  systemDescription?: string;
  progress: number;
}

export function AssessmentCard({ id, name, status, score, updatedAt, systemDescription, progress }: AssessmentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(SVGSVGElement | null)[]>([]);

  useEffect(() => {
    const card = cardRef.current;
    const splash = splashRef.current;
    if (!card) return;

    // Entry animation
    card.style.opacity = '0';
    card.style.transform = 'translateY(60px)';
    
    requestAnimationFrame(() => {
      card.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });

    // Icon draw animation
    iconRefs.current.forEach((icon, index) => {
      if (icon) {
        const paths = icon.querySelectorAll('path, circle');
        paths.forEach((path) => {
          const length = (path as SVGGeometryElement).getTotalLength?.() || 60;
          (path as SVGPathElement).style.strokeDasharray = `${length}`;
          (path as SVGPathElement).style.strokeDashoffset = `${length}`;
          
          setTimeout(() => {
            (path as SVGPathElement).style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
            (path as SVGPathElement).style.strokeDashoffset = '0';
          }, 1000 + index * 180);
        });
      }
    });

    // Color splash float animation
    let splashAnim: number;
    let splashTime = 0;
    const animateSplash = () => {
      if (splash) {
        splashTime += 0.008;
        const x = Math.sin(splashTime) * 20;
        const y = Math.cos(splashTime) * 20;
        const scale = 1 + Math.sin(splashTime * 0.5) * 0.1;
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

      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = `
        perspective(1000px)
        translateX(${x * 0.03}px)
        translateY(${y * 0.03}px)
        rotateX(${-y * 0.01}deg)
        rotateY(${x * 0.01}deg)
      `;
    };

    const handleMouseLeave = () => {
      card.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
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
    <Link href={`/app/assessment/${id}`}>
      <div
        ref={cardRef}
        className="relative w-full p-8 bg-white/[0.04] rounded-[16px] backdrop-blur-md overflow-hidden cursor-pointer transition-all duration-500 group"
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
          className="absolute -top-[40px] -right-[40px] w-[120px] h-[120px] rounded-full blur-[40px] opacity-30 pointer-events-none mix-blend-screen"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #3b82f6, #60a5fa 60%, transparent 70%)'
          }}
        />

        {/* Name */}
        <div className="relative z-10 mb-4">
          <div className="text-2xl font-black leading-[0.95] tracking-tight text-white">
            {name}
          </div>
        </div>

        {/* Status Badge */}
        <div className="relative z-10 mt-3 mb-6">
          <Badge className="text-[10px] tracking-[3px] uppercase bg-blue-500/10 text-blue-400/70 border-blue-500/20 hover:bg-blue-500/20 font-normal">
            {status === 'COMPLETED' ? 'Completed' : 'In Progress'}
          </Badge>
        </div>

        {/* Info Items */}
        <div className="relative z-10 space-y-3.5 mb-6">
          <div className="flex items-center gap-2.5 text-xs text-white/80 group/item cursor-default">
            <CalendarIcon 
              ref={(el) => { iconRefs.current[0] = el; }}
              className="w-3 h-3 stroke-blue-400 opacity-65 flex-shrink-0" 
              strokeWidth={1.4}
            />
            <span className="relative transition-colors duration-300 group-hover/item:text-white">
              {new Date(updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {score !== null && (
            <div className="flex items-center gap-2.5 text-xs text-white/80 group/item cursor-default">
              <TrendingUpIcon 
                ref={(el) => { iconRefs.current[1] = el; }}
                className="w-3 h-3 stroke-blue-400 opacity-65 flex-shrink-0" 
                strokeWidth={1.4}
              />
              <span className="relative transition-colors duration-300 group-hover/item:text-white">
                Compliance Score: {score}%
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Progress</span>
            <span className="text-xs text-white/70 font-semibold">{progress}%</span>
          </div>
          <div className="relative h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%'
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
