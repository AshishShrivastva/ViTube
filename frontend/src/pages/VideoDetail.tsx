import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ThumbsUp, UserPlus, UserCheck, Share2, FolderPlus } from 'lucide-react'; // Added FolderPlus
import Container from '../components/Container';
import Button from '../components/Button';
import conf from '../conf/conf';
import Comments from '../components/Comments';
import { Link } from 'react-router-dom';
import PlaylistModal from '../components/PlaylistModal'; // Added Import

interface VideoDetail {
    _id: string;
    videoFile: string;
    title: string;
    description: string;
    views: number;
    createdAt: string;
    owner: {
        _id: string;
        username: string;
        fullName: string;
        avatar: string;
    };
    isSubscribed: boolean;
    likesCount: number;
    isLiked: boolean;
}

export default function VideoDetail() {
    const { videoId } = useParams();
    const [video, setVideo] = useState<VideoDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribed, setSubscribed] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);

    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    
    const currentUser = useSelector((state: any) => state.auth.userData);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await axios.get(`${conf.backendUrl}/videos/${videoId}`, {
                    withCredentials: true 
                });
                const data = res.data.data;
                setVideo(data);
                setSubscribed(data.isSubscribed);
                setLiked(data.isLiked);
                setLikesCount(data.likesCount || 0);
            } catch (error) {
                console.error("Error fetching video:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);

    const handleSubscribe = async () => {
        if (!video) return;
        setSubscribed((prev) => !prev); 
        try {
            await axios.post(`${conf.backendUrl}/subscriptions/c/${video.owner._id}`, {}, { withCredentials: true });
        } catch (error) {
            setSubscribed((prev) => !prev);
        }
    };

    const handleLike = async () => {
        if (!video) return;
        setLiked((prev) => !prev);
        setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
        
        try {
            await axios.post(`${conf.backendUrl}/likes/toggle/v/${video._id}`, {}, { withCredentials: true });
        } catch (error) {
            setLiked((prev) => !prev);
            setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
        }
    };

    if (loading) return <div className="text-center mt-20 text-white">Loading Player...</div>;
    if (!video) return <div className="text-center mt-20 text-white">Video not found!</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3"> 
                        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
                            <video 
                                src={video.videoFile} 
                                controls 
                                autoPlay 
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="mt-4">
                            <h1 className="text-2xl font-bold text-white">{video.title}</h1>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
                                <div className="flex items-center gap-4">
                                    <Link to={`/channel/${video.owner.username}`} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-purple-500/50 group-hover:border-purple-400 transition-colors">
                                            <img src={video.owner.avatar} alt={video.owner.username} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-lg group-hover:text-purple-400 transition-colors">
                                                {video.owner.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-400">@{video.owner.username}</p>
                                        </div>
                                    </Link>
                                    
                                    {currentUser?._id !== video.owner._id && (
                                        <Button 
                                            onClick={handleSubscribe}
                                            variant={subscribed ? "outline" : "primary"}
                                            className={`ml-4 rounded-full flex items-center gap-2 ${subscribed ? "bg-white/10" : ""}`}
                                        >
                                            {subscribed ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                            {subscribed ? "Subscribed" : "Subscribe"}
                                        </Button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center bg-[#121212] border border-white/10 rounded-full overflow-hidden">
                                        <button 
                                            onClick={handleLike}
                                            aria-label="Like video"
                                            className={`flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors ${liked ? "text-purple-500" : "text-white"}`}
                                        >
                                            <ThumbsUp size={20} fill={liked ? "currentColor" : "none"} />
                                            <span className="font-medium">{likesCount}</span>
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setShowPlaylistModal(true)}
                                        aria-label="Save to playlist"
                                        title="Save"
                                        className="p-2.5 bg-[#121212] border border-white/10 rounded-full hover:bg-white/10 text-white"
                                    >
                                        <FolderPlus size={20} />
                                    </button>
        
                                    <button 
                                        aria-label="Share video"
                                        title="Share"
                                        className="p-2.5 bg-[#121212] border border-white/10 rounded-full hover:bg-white/10 text-white"
                                    >
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-[#121212] rounded-xl p-4 text-sm text-gray-300">
                            <div className="flex gap-2 font-semibold text-white mb-2">
                                <span>{video.views} Views</span>
                                <span>•</span>
                                <span>{new Date(video.createdAt).toDateString()}</span>
                            </div>
                            <p className="whitespace-pre-wrap">{video.description}</p>
                        </div>

                        <div className="mt-8">
                            <Comments videoId={video._id} />
                        </div>
                    </div>
                </div>

                {showPlaylistModal && (
                    <PlaylistModal 
                        videoId={video._id} 
                        onClose={() => setShowPlaylistModal(false)} 
                    />
                )}
                
            </Container>
        </div>
    );
}