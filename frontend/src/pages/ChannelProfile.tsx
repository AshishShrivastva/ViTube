import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { UserPlus, UserCheck } from 'lucide-react';
import Container from '../components/Container';
import Button from '../components/Button';
import conf from '../conf/conf';

interface ChannelProfile {
    _id: string;
    username: string;
    fullName: string;
    avatar: string;
    coverImage: string;
    subscribersCount: number;
    channelsSubscribedToCount: number;
    isSubscribed: boolean;
}

export default function ChannelProfile() {
    const { username } = useParams();
    const [channel, setChannel] = useState<ChannelProfile | null>(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state: any) => state.auth.userData);

    useEffect(() => {
        const fetchChannelData = async () => {
            try {
                // 1. Fetch Channel Stats (Profile Info)
                const channelRes = await axios.get(`${conf.backendUrl}/users/c/${username}`, {
                    withCredentials: true
                });
                const channelData = channelRes.data.data;
                setChannel(channelData);

                // 2. Fetch Channel Videos
                // We use the ID obtained from the first call to filter videos
                if (channelData._id) {
                     const videosRes = await axios.get(`${conf.backendUrl}/videos?userId=${channelData._id}`, {
                        withCredentials: true
                    });
                    // Handle response structure (checking for docs if paginated)
                    const videoData = videosRes.data.data;
                    setVideos(Array.isArray(videoData) ? videoData : videoData.docs || []); 
                }

            } catch (error) {
                console.error("Error fetching channel:", error);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchChannelData();
        }
    }, [username]);

    const handleSubscribe = async () => {
        if (!channel) return;
        
        // Optimistic UI Update (Instant visual feedback)
        setChannel((prev) => prev ? ({
            ...prev,
            isSubscribed: !prev.isSubscribed,
            subscribersCount: prev.isSubscribed ? prev.subscribersCount - 1 : prev.subscribersCount + 1
        }) : null);

        try {
            await axios.post(`${conf.backendUrl}/subscriptions/c/${channel._id}`, {}, { withCredentials: true });
        } catch (error) {
            // Revert on failure
            console.error("Subscription failed", error);
            // Optional: Revert state here if needed
        }
    };

    if (loading) return <div className="text-center mt-20 text-white">Loading Channel...</div>;
    if (!channel) return <div className="text-center mt-20 text-white">Channel not found</div>;

    return (
        <div className="w-full pb-10">
            {/* Cover Image Section */}
            <div className="relative w-full h-48 md:h-64 bg-gray-800 overflow-hidden">
                {channel.coverImage ? (
                    <img 
                        src={channel.coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-r from-gray-800 to-gray-900">
                        {/* Fallback pattern if no cover image */}
                        <div className="text-4xl font-bold opacity-10 uppercase tracking-widest">
                            {channel.username}
                        </div>
                    </div>
                )}
            </div>

            <Container>
                {/* Channel Header / Info */}
                <div className="flex flex-col md:flex-row items-start gap-6 -mt-12 md:-mt-16 mb-10 relative z-10 px-4 md:px-0">
                    {/* Avatar */}
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-[#121212] overflow-hidden bg-black flex-shrink-0">
                        <img 
                            src={channel.avatar} 
                            alt={channel.username} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 mt-2 md:mt-16">
                        <h1 className="text-3xl font-bold text-white">{channel.fullName}</h1>
                        <p className="text-gray-400 font-medium">@{channel.username}</p>
                        <div className="flex gap-4 text-sm text-gray-300 mt-3">
                            <span className='font-semibold text-white'>{channel.subscribersCount} <span className='text-gray-400 font-normal'>subscribers</span></span>
                            <span className='font-semibold text-white'>{videos.length} <span className='text-gray-400 font-normal'>videos</span></span>
                        </div>
                    </div>

                    {/* Subscribe Button */}
                    {currentUser?._id !== channel._id && (
                        <div className="mt-4 md:mt-16">
                            <Button 
                                onClick={handleSubscribe}
                                variant={channel.isSubscribed ? "outline" : "primary"}
                                className={`rounded-full flex items-center gap-2 px-6 ${channel.isSubscribed ? "bg-[#222] text-white border-gray-600 hover:bg-[#333]" : ""}`}
                            >
                                {channel.isSubscribed ? <UserCheck size={20} /> : <UserPlus size={20} />}
                                {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Content Tabs */}
                <div className="border-b border-gray-700 mb-6 mx-4 md:mx-0">
                    <button className="px-4 py-3 text-white border-b-2 border-purple-500 font-medium text-sm md:text-base">
                        Videos
                    </button>
                    {/* Future Tabs: Tweets, Playlists */}
                </div>

                {/* Video Grid */}
                {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-0">
                        {videos.map((video: any) => (
                            <div key={video._id} className="group cursor-pointer">
                                <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden mb-2 border border-white/5">
                                    <img 
                                        src={video.thumbnail} 
                                        alt={video.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                        {/* You can format duration here if backend sends it */}
                                        Video
                                    </span>
                                </div>
                                <h3 className="font-semibold text-white line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors">
                                    {video.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                    <span>{video.views} views</span>
                                    <span>•</span>
                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full py-20 text-center">
                        <p className="text-lg text-white font-semibold">No videos found</p>
                        <p className="text-gray-400">This channel hasn't posted any content yet.</p>
                    </div>
                )}
            </Container>
        </div>
    );
}