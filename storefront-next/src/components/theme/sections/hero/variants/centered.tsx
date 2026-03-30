import React from 'react';
import type { HeroProps } from '../index';

export default function HeroCentered({ settings, blocks }: HeroProps) {
  const {
    backgroundImage = '',
    overlayOpacity = 40,
    height = 'medium',
  } = settings;

  const minHeight = height === 'small' ? '400px' : height === 'fullscreen' ? '100vh' : '600px';

  return (
    <section 
      className="relative w-full flex items-center justify-center overflow-hidden"
      style={{ minHeight }}
    >
      {/* Background */}
      {backgroundImage ? (
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      ) : (
        <div className="absolute inset-0 z-0 bg-slate-900" />
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 z-10 bg-black" 
        style={{ opacity: overlayOpacity / 100 }}
      />
      
      {/* Content */}
      <div className="container relative z-20 mx-auto px-4 flex flex-col items-center text-center">
        <div className="max-w-3xl flex flex-col items-center gap-6">
          {blocks.map((block) => {
            if (block.type === 'heading') {
              const Tag = block.settings.size || 'h1';
              const sizeClass = Tag === 'h1' ? 'text-4xl md:text-6xl font-black' : Tag === 'h2' ? 'text-3xl md:text-4xl font-bold' : 'text-2xl font-bold';
              return (
                <Tag key={block.id} className={`${sizeClass} text-white drop-shadow-lg`}>
                  {block.settings.text}
                </Tag>
              );
            }
            if (block.type === 'subtext') {
              return (
                <p key={block.id} className="text-lg md:text-xl text-slate-200 drop-shadow">
                  {block.settings.text}
                </p>
              );
            }
            if (block.type === 'button') {
              const isOutline = block.settings.style === 'outline';
              return (
                <a 
                  key={block.id} 
                  href={block.settings.link || '#'} 
                  className={`inline-block px-8 py-3.5 font-bold rounded-lg transition-all ${
                    isOutline 
                      ? 'border-2 border-white text-white hover:bg-white hover:text-slate-900' 
                      : 'bg-[var(--primary)] text-white hover:opacity-90 shadow-xl'
                  }`}
                >
                  {block.settings.label}
                </a>
              );
            }
            return null;
          })}
        </div>
      </div>
    </section>
  );
}
