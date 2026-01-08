import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Container from '../components/Container';
import conf from '../conf/conf';
import { Link } from 'react-router-dom';

export default function LikedVideos() {
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                const res = await axios.get(`${conf.backendUrl}/likes/videos`, {
                    withCredentials: true
                });
                // The backend usually returns an array of like documents, 
                // where the actual video info is inside a nested 'video' object.
                setLikedVideos(res.data.data || []);
            } catch (error) {
                console.error("Error fetching liked videos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLikedVideos();
    }, []);

    if (loading) return <div className="text-center mt-20 text-white">Loading your favorites...</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Liked Videos</h1>
                    <p className="text-gray-400 text-sm">{likedVideos.length} videos</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {likedVideos.length > 0 ? (
                        likedVideos.map((item: any) => {
                            // Handle case where 'item' is the like document and 'item.video' is the actual video
                            const video = item.video || item; 
                            if (!video) return null;

                            return (
                                <Link key={item._id} to={`/video/${video._id}`} className="group">
                                    <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden mb-3 border border-white/5">
                                        <img 
                                            src={video.thumbnail} 
                                            alt={video.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                            Video
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                            {/* Optional: Owner Avatar if available */}
                                            <img 
                                                src={video.owner?.avatar || "https://via.placeholder.com/40"} 
                                                alt="avatar" 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                                                {video.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 mt-1">{video.owner?.fullName || "Unknown"}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                <span>{video.views} views</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <p className="text-xl text-white font-bold mb-2">No liked videos yet</p>
                            <p className="text-gray-400 mb-6">Videos you like will appear here.</p>
                            <Link to="/" className="text-purple-400 hover:text-purple-300">
                                Go to Home
                            </Link>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}