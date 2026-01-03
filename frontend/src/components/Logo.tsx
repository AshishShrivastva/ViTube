import React from 'react';
import { Play } from 'lucide-react';

export default function Logo({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 font-bold text-xl ${className}`}>
            <div className="p-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg shadow-purple-500/30">
                <Play fill="white" size={20} className="text-white ml-0.5" />
            </div>
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                ViTube
            </span>
        </div>
    );
}