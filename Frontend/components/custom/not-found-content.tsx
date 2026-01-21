'use client';

import { HomeButton } from './home-button';

export function NotFoundContent() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-0 text-center relative overflow-hidden">
            {/* Floating Background Blobs (Home/Vibes Style) */}
            <div className="fixed -top-12 -left-12 w-64 h-64 bg-[#FACC55] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob -z-10" />
            <div className="fixed top-0 -right-4 w-64 h-64 bg-[#A78BFA] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000 -z-10" />
            <div className="fixed -bottom-8 left-20 w-64 h-64 bg-[#FB58B4] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000 -z-10" />
            <div className="fixed bottom-40 right-20 w-48 h-48 bg-[#4ECDC4] rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000 -z-10" />

            <div className="w-full relative flex flex-col items-center justify-start pt-10 md:pt-4">

                {/* GIF Layer */}
                <div className="w-full h-[400px] md:h-[500px] bg-[url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')] bg-center bg-no-repeat relative z-10 mix-blend-multiply pointer-events-none transform -translate-y-10">
                </div>

                {/* Text Layer */}
                <div className="w-full text-center z-0 -mt-32 mb-4">
                    {/* Glitchy 404 */}
                    <div className="relative inline-block">
                        <h1 className="text-[80px] md:text-[100px] font-black leading-none tracking-tighter select-none">
                            404
                        </h1>
                        <div className="absolute top-0 left-0 w-full h-full text-[80px] md:text-[100px] font-black leading-none tracking-tighter text-[#FF6B6B] opacity-50 translate-x-[4px] translate-y-[4px] -z-10 animate-pulse">
                            404
                        </div>
                        <div className="absolute top-0 left-0 w-full h-full text-[80px] md:text-[100px] font-black leading-none tracking-tighter text-[#4ECDC4] opacity-50 translate-x-[-4px] translate-y-[-4px] -z-10 animate-pulse animation-delay-75">
                            404
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mt-2 text-black/80">
                        Page Not Found
                    </h2>
                </div>

                {/* Content/Button Layer */}
                <div className="relative z-20 flex flex-col items-center gap-4 px-4 text-center">
                    <p className="text-base md:text-lg text-gray-600 font-medium max-w-2xl bg-[#FFF8F0]/80 backdrop-blur-sm px-4 rounded-xl border-2 border-transparent leading-relaxed">
                        Oops! It looks like you've wandered into the void. <br className="hidden md:block" />
                        This page doesn't exist or has been moved to another dimension.
                    </p>

                    <div className="pt-2">
                        <HomeButton />
                    </div>
                </div>
            </div>


        </div>
    );
}
