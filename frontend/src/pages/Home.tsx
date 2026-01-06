import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useSearchParams } from 'react-router-dom'; // Import useSearchParams
import Container from '../components/Container';
import conf from '../conf/conf';
import { Loader2 } from 'lucide-react';

interface Video {
    _id: string;
    videoFile: string;
    thumbnail: string;
    title: string;
    duration: number;
    views: number;
    owner: {
        username: string;
        avatar: string;
        fullName: string;
    };
    createdAt: string;
}

export default function Home() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // 1. Get the query from URL
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query"); 

    useEffect(() => {
        setLoading(true);
        setError(false);

        // 2. Construct URL based on whether a search query exists
        const url = query 
            ? `${conf.backendUrl}/videos?query=${query}` // Send search query to backend
            : `${conf.backendUrl}/videos`;               // Default fetch

        axios.get(url, { withCredentials: true }) 
            .then((res) => {
                // Handle different response structures
                const videoList = res.data.data.docs || res.data.data; 
                setVideos(videoList || []);
            })
            .catch((err) => {
                console.error("Error fetching videos:", err);
                setError(true);
            })
            .finally(() => setLoading(false));
    }, [query]); // 3. Re-run whenever the query changes

    if (loading) {
        return (
            <div className="w-full h-[50vh] flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500" size={40} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center mt-20 text-white">
                <h2 className="text-xl font-bold mb-2">Login Required</h2>
                <p className="text-gray-400 mb-4">Please login to view the video feed.</p>
                <Link to="/login" className="px-4 py-2 bg-purple-600 rounded-lg">Go to Login</Link>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="w-full py-8 text-center">
                <Container>
                    <div className="flex flex-col items-center justify-center min-h-[50vh]">
                        {/* 4. Update Empty State for Search Results */}
                        {query ? (
                            <>
                                <h1 className="text-2xl font-bold text-white mb-2">No results found</h1>
                                <p className="text-gray-400 mb-6">We couldn't find any videos matching "{query}"</p>
                                <Link to="/" className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
                                    Clear Search
                                </Link>
                            </>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-white mb-2">No videos yet</h1>
                                <p className="text-gray-400 mb-6">Be the first to upload content!</p>
                                <Link to="/add-video" className="px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-all">
                                    Upload Video
                                </Link>
                            </>
                        )}
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="w-full py-8">
            <Container>
                {/* Optional: Show what user is searching for */}
                {query && (
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl text-white font-semibold">
                            Search results for <span className="text-purple-400">"{query}"</span>
                        </h2>
                        <Link to="/" className="text-sm text-gray-400 hover:text-white">Clear</Link>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                        <Link key={video._id} to={`/video/${video._id}`} className="group">
                            <div className="bg-[#121212] rounded-xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="relative aspect-video">
                                    <img 
                                        src={video.thumbnail} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover"
                                    />
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                        {formatDuration(video.duration)}
                                    </span>
                                </div>
                                <div className="p-4 flex gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                                        <img src={video.owner?.avatar} alt={video.owner?.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                                            {video.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">{video.owner?.fullName}</p>
                                        <div className="text-gray-500 text-xs mt-1">
                                            {video.views} views • {timeAgo(video.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>
        </div>
    );
}

// Updated Helper functions
function formatDuration(seconds: any) {
    // 1. Ensure we are working with a number (handles strings or undefined)
    const totalSeconds = Number(seconds);

    // 2. If duration is missing, invalid, or zero, return 0:00
    if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) {
        return "0:00";
    }

    // 3. For videos between 0 and 1 second, always show 0:01
    // This prevents very short clips from looking empty.
    if (totalSeconds > 0 && totalSeconds < 1) {
        return "0:01";
    }

    // 4. Use Math.round for seconds to get the closest integer (e.g., 2.7s -> 3s)
    const roundedTotalSeconds = Math.round(totalSeconds);
    const min = Math.floor(roundedTotalSeconds / 60);
    const sec = roundedTotalSeconds % 60;

    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function timeAgo(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = (now.getTime() - date.getTime()) / 1000;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}