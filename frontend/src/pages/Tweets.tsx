import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Send, ThumbsUp, Trash2, Pencil, X, Check } from 'lucide-react';
import Container from '../components/Container';
import conf from '../conf/conf';

export default function Tweets() {
    const [tweets, setTweets] = useState<any[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    
    // For Editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");

    const currentUser = useSelector((state: any) => state.auth.userData);

    // Fetch Tweets Feed (Community Feed)
    useEffect(() => {
        const fetchTweets = async () => {
            if (!currentUser?._id) return;
            try {
                // Fetching the Feed (Subscribed posts + My posts)
                const res = await axios.get(`${conf.backendUrl}/tweets/feed`,
                    {
                     withCredentials: true
                     });
                setTweets(res.data.data || []);
            } catch (error) {
                console.error("Error fetching tweets:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTweets();
    }, [currentUser]);

    // Create Tweet
    const handleAddTweet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        try {
            const res = await axios.post(`${conf.backendUrl}/tweets`, { content }, { withCredentials: true });
            
            // Backend returns the created tweet. 
            // Note: The backend response might not have the populated 'owner' object immediately 
            // unless we populate it in the create controller. 
            // For a quick UI fix, we manually attach current user details to the new tweet in state.
            const newTweet = {
                ...res.data.data,
                owner: currentUser, // Manually attach owner for immediate display
                likesCount: 0,
                isLiked: false
            };

            setTweets((prev) => [newTweet, ...prev]);
            setContent("");
        } catch (error) {
            console.error("Error creating tweet:", error);
        }
    };

    // Delete Tweet
    const handleDelete = async (tweetId: string) => {
        if (!window.confirm("Delete this tweet?")) return;
        try {
            await axios.delete(`${conf.backendUrl}/tweets/${tweetId}`, { withCredentials: true });
            setTweets((prev) => prev.filter((t) => t._id !== tweetId));
        } catch (error) {
            console.error("Error deleting tweet:", error);
        }
    };

    // Toggle Like (NEW FEATURE)
    const handleLike = async (tweetId: string) => {
        // 1. Optimistic UI Update (Instant feedback)
        setTweets((prev) => prev.map((t) => {
            if (t._id === tweetId) {
                return {
                    ...t,
                    isLiked: !t.isLiked,
                    likesCount: t.isLiked ? t.likesCount - 1 : t.likesCount + 1
                };
            }
            return t;
        }));

        // 2. API Call
        try {
            await axios.post(`${conf.backendUrl}/likes/toggle/t/${tweetId}`, {}, { withCredentials: true });
        } catch (error) {
            console.error("Error liking tweet:", error);
            // Revert on error (optional)
        }
    };

    // Start Editing
    const startEditing = (tweet: any) => {
        setEditingId(tweet._id);
        setEditContent(tweet.content);
    };

    // Save Edit
    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        try {
            await axios.patch(`${conf.backendUrl}/tweets/${editingId}`, { content: editContent }, { withCredentials: true });
            
            // Update UI
            setTweets((prev) => prev.map((t) => 
                t._id === editingId ? { ...t, content: editContent } : t
            ));
            setEditingId(null);
        } catch (error) {
            console.error("Error updating tweet:", error);
        }
    };

    if (loading) return <div className="text-center mt-20 text-white">Loading Community Feed...</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Community Posts</h1>
                        <p className="text-gray-400 text-sm">See what's happening with the channels you follow.</p>
                    </div>

                    {/* Create Tweet Form */}
                    <div className="bg-[#121212] border border-white/10 rounded-xl p-4 mb-8">
                        <form onSubmit={handleAddTweet} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                {/* Current User Avatar (You are writing the tweet) */}
                                <img 
                                    src={currentUser?.avatar || "https://via.placeholder.com/40"} 
                                    alt="User" 
                                    className="w-full h-full object-cover" 
                                />
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="What's on your mind?"
                                    className="w-full bg-transparent text-white border-b border-gray-700 focus:border-purple-500 outline-none resize-none min-h-[80px] p-2 transition-colors placeholder-gray-500"
                                />
                                <div className="flex justify-end mt-2">
                                    <button 
                                        type="submit"
                                        disabled={!content.trim()}
                                        className="bg-purple-600 text-white px-6 py-2 rounded-full font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        Post
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Tweets List */}
                    <div className="flex flex-col gap-4">
                        {tweets.length > 0 ? (
                            tweets.map((tweet: any) => {
                                // Check if the logged-in user owns this tweet
                                const isOwner = currentUser?._id === tweet.owner?._id;

                                return (
                                <div key={tweet._id} className="bg-[#121212] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                                            {/* --- FIX 1: Use TWEET OWNER Avatar --- */}
                                            <img 
                                                src={tweet.owner?.avatar || "https://via.placeholder.com/40"} 
                                                alt={tweet.owner?.username} 
                                                className="w-full h-full object-cover" 
                                            />
                                        </div>
                                        
                                        <div className="flex-1">
                                            {/* Header: Name + Date */}
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    {/* --- FIX 2: Use TWEET OWNER Name --- */}
                                                    <h3 className="font-semibold text-white">{tweet.owner?.fullName}</h3>
                                                    <span className="text-xs text-gray-400">@{tweet.owner?.username} • {new Date(tweet.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                
                                                {/* Actions (Edit/Delete) - ONLY IF OWNER */}
                                                {isOwner && editingId !== tweet._id && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => startEditing(tweet)}
                                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full transition-colors"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(tweet._id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Area */}
                                            {editingId === tweet._id ? (
                                                <div className="mt-3">
                                                    <textarea 
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full bg-black/30 text-white border border-purple-500/50 rounded-lg p-3 outline-none focus:border-purple-500 min-h-[100px]"
                                                    />
                                                    <div className="flex gap-2 mt-2 justify-end">
                                                        <button 
                                                            onClick={() => setEditingId(null)}
                                                            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-300 hover:text-white"
                                                        >
                                                            <X size={14} /> Cancel
                                                        </button>
                                                        <button 
                                                            onClick={handleUpdate}
                                                            className="flex items-center gap-1 px-4 py-1 text-sm bg-purple-600 text-white rounded-full hover:bg-purple-700"
                                                        >
                                                            <Check size={14} /> Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-gray-200 mt-2 whitespace-pre-wrap leading-relaxed">
                                                    {tweet.content}
                                                </p>
                                            )}

                                            {/* Like Interaction */}
                                            <div className="mt-4 flex gap-4">
                                                <button 
                                                    onClick={() => handleLike(tweet._id)}
                                                    className={`flex items-center gap-2 transition-colors group ${tweet.isLiked ? "text-purple-500" : "text-gray-400 hover:text-purple-500"}`}
                                                >
                                                    <ThumbsUp 
                                                        size={18} 
                                                        className="group-hover:scale-110 transition-transform"
                                                        fill={tweet.isLiked ? "currentColor" : "none"}
                                                    />
                                                    <span className="text-sm">{tweet.likesCount || 0} Likes</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )})
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No tweets found in your feed. Subscribe to some channels!
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    );
}