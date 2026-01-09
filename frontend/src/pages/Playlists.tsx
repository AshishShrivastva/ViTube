import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FolderHeart, Plus } from 'lucide-react';
import Container from '../components/Container';
import conf from '../conf/conf';
import { Link } from 'react-router-dom';

export default function Playlists() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state: any) => state.auth.userData);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!currentUser?._id) return;
            try {
                // Fetch playlists for the logged-in user
                const res = await axios.get(`${conf.backendUrl}/playlists/user/${currentUser._id}`, {
                    withCredentials: true
                });
                setPlaylists(res.data.data || []);
            } catch (error) {
                console.error("Error fetching playlists:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylists();
    }, [currentUser]);

    if (loading) return <div className="text-center mt-20 text-white">Loading collections...</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Playlists</h1>
                        <p className="text-gray-400 text-sm">{playlists.length} collections</p>
                    </div>
                    {/* We can add a Create Button here later if needed */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.length > 0 ? (
                        playlists.map((playlist: any) => (
                            <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="group">
                                <div className="relative aspect-video bg-[#121212] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center group-hover:border-purple-500/50 transition-all">
                                    {/* If playlist has videos, show the first video's thumbnail */}
                                    {/* (Assuming backend sends a 'videos' array inside) */}
                                    <div className="text-purple-500 bg-purple-500/10 p-4 rounded-full">
                                        <FolderHeart size={40} />
                                    </div>
                                    
                                    {/* Overlay for count */}
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                        Playlist
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-white font-semibold line-clamp-1 group-hover:text-purple-400 transition-colors">
                                        {playlist.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                                        {playlist.description || "No description"}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <FolderHeart size={40} />
                            </div>
                            <p className="text-xl text-white font-bold mb-2">No playlists yet</p>
                            <p className="text-gray-400 mb-6">Save videos to a playlist to see them here.</p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}