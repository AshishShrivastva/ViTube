import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Pencil, Trash2, Eye, ThumbsUp } from 'lucide-react';
import Container from '../components/Container';
import conf from '../conf/conf';
import { Link } from 'react-router-dom';
import EditVideoModal from '../components/EditVideoModal'; 

export default function MyContent() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [editingVideo, setEditingVideo] = useState<any>(null);

    const currentUser = useSelector((state: any) => state.auth.userData);

    useEffect(() => {
        const fetchMyVideos = async () => {
            try {
                const res = await axios.get(`${conf.backendUrl}/dashboard/videos`, {
                    withCredentials: true
                });
                
                const data = res.data.data;
                setVideos(Array.isArray(data) ? data : data.docs || []);
            } catch (error) {
                console.error("Error fetching my content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyVideos();
    }, []);

    const handleDelete = async (videoId: string) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        
        try {
            await axios.delete(`${conf.backendUrl}/videos/${videoId}`, { withCredentials: true });
            setVideos((prev) => prev.filter((video: any) => video._id !== videoId));
        } catch (error) {
            console.error("Error deleting video:", error);
            alert("Could not delete video");
        }
    };

    const handleTogglePublish = async (videoId: string, currentStatus: boolean) => {
        try {
            await axios.patch(`${conf.backendUrl}/videos/toggle/publish/${videoId}`, {}, { withCredentials: true });
            setVideos((prev: any) => prev.map((video: any) => 
                video._id === videoId ? { ...video, isPublished: !currentStatus } : video
            ));
        } catch (error) {
            console.error("Error toggling publish status:", error);
        }
    };

    const handleVideoUpdated = (updatedVideo: any) => {
        setVideos((prev: any) => prev.map((video: any) => 
            video._id === updatedVideo._id ? { ...video, ...updatedVideo } : video
        ));
    };

    if (loading) return <div className="text-center mt-20 text-white">Loading Dashboard...</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">My Content</h1>
                    <Link to="/add-video" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                        + New Video
                    </Link>
                </div>

                <div className="bg-[#121212] rounded-xl border border-white/10 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-sm font-semibold text-gray-300">
                        <div className="col-span-6">Video</div>
                        <div className="col-span-2 text-center">Visibility</div>
                        <div className="col-span-2 text-center">Date</div>
                        <div className="col-span-2 text-center">Actions</div>
                    </div>

                    {videos.length > 0 ? (
                        videos.map((video: any) => (
                            <div key={video._id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-none items-center hover:bg-white/5 transition-colors">
                                
                                <div className="col-span-6 flex gap-4">
                                    <div className="w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h3 className="text-white font-medium line-clamp-1" title={video.title}>{video.title}</h3>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{video.description}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Eye size={12}/> {video.views}</span>
                                            <span className="flex items-center gap-1"><ThumbsUp size={12}/> {video.likesCount || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 flex justify-center">
                                    <button 
                                        onClick={() => handleTogglePublish(video._id, video.isPublished)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                            video.isPublished 
                                            ? "border-green-500/50 text-green-500 bg-green-500/10" 
                                            : "border-orange-500/50 text-orange-500 bg-orange-500/10"
                                        }`}
                                    >
                                        {video.isPublished ? "Public" : "Private"}
                                    </button>
                                </div>

                                <div className="col-span-2 text-center text-sm text-gray-400">
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </div>

                                <div className="col-span-2 flex justify-center gap-3">
                                    <button 
                                        onClick={() => handleDelete(video._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" 
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    
                                    <button 
                                        onClick={() => setEditingVideo(video)} 
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors" 
                                        title="Edit Video"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No videos found. Upload your first video!
                        </div>
                    )}
                </div>

                {editingVideo && (
                    <EditVideoModal 
                        video={editingVideo} 
                        onClose={() => setEditingVideo(null)} 
                        onUpdate={handleVideoUpdated} 
                    />
                )}

            </Container>
        </div>
    );
}