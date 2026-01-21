'use client';

import React from 'react';

interface MoodCardProps {
  emotion: string;
  confidence: number;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: 'bg-[#FACC55]',
  sad: 'bg-[#FB58B4]',
  angry: 'bg-[#FF6B6B]',
  neutral: 'bg-[#3DD598]',
  surprise: 'bg-[#A78BFA]',
  fear: 'bg-[#FB58B4]',
  disgust: 'bg-[#FCA5A5]',
};

export const MoodCard: React.FC<MoodCardProps> = ({ emotion, confidence }) => {
  const emotionColor = EMOTION_COLORS[emotion.toLowerCase()] || 'bg-[#3DD598]';

  return (
    <div className="bg-white border-[3px] border-black rounded-2xl p-8 shadow-[6px_6px_0px_0px_#000] w-full max-w-md">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-black/60 mb-2">
            Detected Emotion
          </p>
          <h2 className="text-5xl font-black uppercase text-black">
            {emotion}
          </h2>
        </div>

        <div 
          className={`${emotionColor} border-[2px] border-black px-6 py-3 rounded-full shadow-[3px_3px_0px_0px_#000]`}
        >
          <p className="text-lg font-black text-black">
            {Math.round(confidence * 100)}% CONFIDENT
          </p>
        </div>
      </div>
    </div>
  );
};