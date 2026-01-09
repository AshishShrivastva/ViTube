import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from '../components/Container';
import conf from '../conf/conf';
import { Trash2, PlayCircle, XCircle } from 'lucide-react'; // Added XCircle icon

export default function PlaylistDetail() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylist = async () => {
            try {
                const res = await axios.get(`${conf.backendUrl}/playlists/${playlistId}`, {
                    withCredentials: true
                });
                setPlaylist(res.data.data);
            } catch (error) {
                console.error("Error fetching playlist:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylist();
    }, [playlistId]);

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this WHOLE playlist?")) return;
        try {
            await axios.delete(`${conf.backendUrl}/playlists/${playlistId}`, { withCredentials: true });
            navigate("/playlists");
        } catch (error) {
            console.error("Error deleting playlist:", error);
        }
    };

    const handleRemoveVideo = async (videoId: string, e: React.MouseEvent) => {
        e.preventDefault(); // Stop the click from opening the video
        e.stopPropagation(); // Double safety
        
        if (!confirm("Remove this video from playlist?")) return;

        try {
            await axios.patch(
                `${conf.backendUrl}/playlists/remove/${videoId}/${playlistId}`, 
                {}, 
                { withCredentials: true }
            );

            setPlaylist((prev: any) => ({
                ...prev,
                videos: prev.videos.filter((video: any) => video._id !== videoId)
            }));

        } catch (error) {
            console.error("Error removing video:", error);
            alert("Failed to remove video");
        }
    };

    if (loading) return <div className="text-center mt-20 text-white">Loading Playlist...</div>;
    if (!playlist) return <div className="text-center mt-20 text-white">Playlist not found</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="flex justify-between items-start mb-8 bg-[#121212] p-6 rounded-2xl border border-white/10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{playlist.name}</h1>
                        <p className="text-gray-400">{playlist.description}</p>
                        <p className="text-sm text-purple-400 mt-2 font-medium">
                            {playlist.videos.length} videos
                        </p>
                    </div>
                    <button 
                        onClick={handleDeletePlaylist}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors text-sm font-medium"
                        title="Delete Entire Playlist"
                    >
                        <Trash2 size={16} /> Delete Playlist
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    {playlist.videos.length > 0 ? (
                        playlist.videos.map((video: any) => (
                            <Link 
                                key={video._id} 
                                to={`/video/${video._id}`} 
                                className="relative flex gap-4 bg-[#121212] p-3 rounded-xl border border-white/5 hover:border-purple-500/50 transition-colors group"
                            >
                                <div className="relative w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                                        <PlayCircle className="text-white" size={24} />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center flex-1">
                                    <h3 className="text-white font-semibold text-lg line-clamp-1 group-hover:text-purple-400 transition-colors">
                                        {video.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">{video.owner?.fullName}</p>
                                    <p className="text-gray-500 text-xs mt-1">{video.views} views</p>
                                </div>

                                <button 
                                    onClick={(e) => handleRemoveVideo(video._id, e)}
                                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                    title="Remove from playlist"
                                >
                                    <XCircle size={20} />
                                </button>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            This playlist is empty.
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}