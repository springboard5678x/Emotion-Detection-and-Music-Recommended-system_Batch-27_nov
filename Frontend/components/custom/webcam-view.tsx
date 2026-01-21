'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Camera } from 'lucide-react';

interface WebcamViewProps {
  onCapture?: (imageBase64: string) => void;
}

export const WebcamView = React.forwardRef<
  { capture: () => string | null; stop: () => void },
  WebcamViewProps
>(({ onCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const enableCamera = async () => {
    setIsActive(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
      });
      setStream(mediaStream);
    } catch (err) {
      setError('Camera access denied or unavailable');
      console.error('Camera error:', err);
      setIsActive(false);
    }
  };

  React.useImperativeHandle(ref, () => ({
    capture: () => {
      if (!videoRef.current || !canvasRef.current) return null;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return null;

      canvas.width = 48;
      canvas.height = 48;
      // Draw the video frame scaled to 48x48
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, 48, 48);

      const imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Captured Base64 Payload:', imageBase64.substring(0, 50) + '...');
      if (onCapture) onCapture(imageBase64);
      return imageBase64;
    },
    stop: () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsActive(false);
      }
    }
  }));

  if (!stream || error) {
    return (
      <div className="w-full max-w-2xl border-[3px] border-dashed border-black rounded-[2.5rem] p-3 bg-white">
        <div className="aspect-video w-full bg-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-black">
          <div className="bg-white p-4 rounded-full border-[2px] border-black">
            {error ? <AlertCircle className="w-8 h-8 text-black" /> : <Camera className="w-8 h-8 text-black" />}
          </div>
          <div className="text-center flex flex-col items-center gap-2">
            <p className="font-black text-xl uppercase">{error ? 'Camera Error' : 'Camera is Off'}</p>
            {error && <p className="font-bold text-black/50 text-sm">{error}</p>}

            <button
              onClick={enableCamera}
              className="mt-2 bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-[#FB58B4] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            >
              {error ? 'Try Again' : 'Enable Camera'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="border-[3px] border-black rounded-[2.5rem] p-3 bg-white">
        <div className="aspect-video w-full bg-black rounded-[2rem] overflow-hidden relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});

WebcamView.displayName = 'WebcamView';