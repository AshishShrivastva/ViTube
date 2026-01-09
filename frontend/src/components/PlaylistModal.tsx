import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux'; // <--- Import this
import { X, Plus, Check } from 'lucide-react';
import conf from '../conf/conf';

interface PlaylistModalProps {
    videoId: string;
    onClose: () => void;
}

export default function PlaylistModal({ videoId, onClose }: PlaylistModalProps) {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Get the current user from Redux (The reliable source of truth!)
    const currentUser = useSelector((state: any) => state.auth.userData);

    // Fetch current user's playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            // If Redux hasn't loaded the user yet, don't run the fetch
            if (!currentUser?._id) return;

            try {
                // Use the ID from Redux
                const res = await axios.get(`${conf.backendUrl}/playlists/user/${currentUser._id}`, { 
                    withCredentials: true 
                });
                setPlaylists(res.data.data || []);
            } catch (err) {
                console.error("Error fetching playlists:", err);
            }
        };
        fetchPlaylists();
    }, [currentUser]); // Run this whenever currentUser changes

    const handleCreateAndAdd = async () => {
        if (!newPlaylistName.trim()) return;
        try {
            const res = await axios.post(`${conf.backendUrl}/playlists`, {
                name: newPlaylistName,
                description: "Created from video player"
            }, { withCredentials: true });
            
            const newPlaylist = res.data.data;
            
            await axios.patch(`${conf.backendUrl}/playlists/add/${videoId}/${newPlaylist._id}`, {}, { withCredentials: true });
            
            alert(`Saved to ${newPlaylistName}`);
            onClose();
        } catch (err) {
            console.error("Error creating playlist:", err);
            alert("Failed to create playlist");
        }
    };

    const handleTogglePlaylist = async (playlistId: string) => {
        try {
            // Backend "addVideoToPlaylist" adds the video. 
            // Note: If your backend supports "toggle" (remove if exists), that's even better.
            // But standard add is fine for now.
            await axios.patch(`${conf.backendUrl}/playlists/add/${videoId}/${playlistId}`, {}, { withCredentials: true });
            alert("Video added to playlist!");
            onClose();
        } catch (err) {
            console.error("Error updating playlist:", err);
            alert("Could not update playlist (Video might already be there)");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-white font-semibold text-lg">Save to playlist</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* List of Playlists */}
                <div className="p-4 max-h-60 overflow-y-auto space-y-2">
                    {playlists.length > 0 ? (
                        playlists.map((playlist) => (
                            <button 
                                key={playlist._id} 
                                onClick={() => handleTogglePlaylist(playlist._id)}
                                className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors text-left group"
                            >
                                <span className="text-gray-200 group-hover:text-white font-medium">{playlist.name}</span>
                                {/* This Plus icon indicates 'Add to this list' */}
                                <Plus size={16} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 text-sm py-4">No playlists found</p>
                    )}
                </div>

                {/* Create New Playlist Section */}
                <div className="p-4 border-t border-white/10 bg-white/5">
                    {!showCreateForm ? (
                        <button 
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium w-full py-2"
                        >
                            <Plus size={18} /> Create new playlist
                        </button>
                    ) : (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2">
                            <input 
                                type="text"
                                placeholder="Enter playlist name..."
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                autoFocus
                                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-purple-500"
                            />
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => setShowCreateForm(false)} 
                                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateAndAdd} 
                                    disabled={!newPlaylistName.trim()}
                                    className="px-4 py-1.5 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                                >
                                    Create & Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}