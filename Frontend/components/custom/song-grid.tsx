'use client';

import React from 'react';
import { Music, Play, ExternalLink } from 'lucide-react';
import type { Song } from '@/types';

interface SongGridProps {
  songs: Song[];
}

const FALLBACK_COLORS = ['#FACC55', '#FB58B4', '#3DD598', '#A78BFA', '#FCA5A5'];

const getRandomColor = (): string => {
  return FALLBACK_COLORS[Math.floor(Math.random() * FALLBACK_COLORS.length)];
};

export const SongGrid: React.FC<SongGridProps> = ({ songs }) => {
  return (
    <div className="w-full">
      <h3 className="text-3xl font-black uppercase text-black mb-6 flex items-center gap-3">
        <Music className="w-8 h-8" />
        Your Playlist
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {songs.map((song, index) => (
          <div
            key={`${song.track_name}-${index}`}
            className="bg-white border-[3px] border-black rounded-xl overflow-hidden shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:translate-y-[-2px] transition-all duration-200"
          >
            {song.album_art ? (
              <img
                src={song.album_art}
                alt={song.album_name}
                className="w-full h-48 object-cover border-b-[3px] border-black"
              />
            ) : (
              <div
                className="w-full h-48 border-b-[3px] border-black flex items-center justify-center"
                style={{ backgroundColor: getRandomColor() }}
              >
                <Music className="w-16 h-16 text-black" />
              </div>
            )}

            <div className="p-4">
              <h4 className="font-black text-lg text-black mb-1 line-clamp-1">
                {song.track_name}
              </h4>
              <p className="text-sm font-bold text-black/60 mb-3 line-clamp-1">
                {song.artists}
              </p>

              <a
                href={song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#FACC55] border-[2px] border-black rounded-lg px-4 py-2 font-black text-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] transition-all duration-200"
              >
                <Play className="w-4 h-4" fill="black" />
                Play on Spotify
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};