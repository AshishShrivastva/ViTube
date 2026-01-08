import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Container from '../components/Container';
import conf from '../conf/conf';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

export default function History() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${conf.backendUrl}/users/history`, {
                    withCredentials: true
                });
                
                // Robust data handling
                const responseData = res.data.data;
                if (Array.isArray(responseData)) {
                    setHistory(responseData);
                } else if (responseData && Array.isArray(responseData.docs)) {
                    setHistory(responseData.docs);
                } else {
                    setHistory([]);
                }

            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const handleClearHistory = async () => {
        if (!history.length) return;
        
        // Browser confirmation
        const confirmed = window.confirm("Are you sure you want to clear your entire watch history?");
        if (!confirmed) return;

        try {
            await axios.delete(`${conf.backendUrl}/users/history`, { withCredentials: true });
            // Update UI instantly
            setHistory([]); 
        } catch (error) {
            console.error("Error clearing history:", error);
            alert("Failed to clear history");
        }
    }

    if (loading) return <div className="text-center mt-20 text-white">Loading history...</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Watch History</h1>
                        <p className="text-gray-400 text-sm">{history.length} videos watched</p>
                    </div>
                    {history.length > 0 && (
                        <button 
                            onClick={handleClearHistory}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors text-sm font-medium"
                        >
                            <Trash2 size={16} />
                            Clear History
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {history.length > 0 ? (
                        history.map((item: any) => {
                            // Extract video object safely
                            const video = item.video || item; 

                            if (!video || !video._id) return null;

                            return (
                                <Link key={video._id} to={`/video/${video._id}`} className="group">
                                    <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden mb-3 border border-white/5">
                                        <img 
                                            src={video.thumbnail} 
                                            alt={video.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
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
                                            <p className="text-sm text-gray-400 mt-1">{video.owner?.fullName}</p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <p className="text-xl text-white font-bold mb-2">No history yet</p>
                            <p className="text-gray-400 mb-6">Videos you watch will appear here.</p>
                            <Link to="/" className="text-purple-400 hover:text-purple-300">
                                Start Watching
                            </Link>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}