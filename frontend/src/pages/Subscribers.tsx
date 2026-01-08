import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { UserCheck } from 'lucide-react';
import Container from '../components/Container';
import conf from '../conf/conf';
import { Link } from 'react-router-dom';

export default function Subscribers() {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state: any) => state.auth.userData);

    useEffect(() => {
        const fetchSubscribers = async () => {
            if (!currentUser?._id) return;
            try {
                const res = await axios.get(`${conf.backendUrl}/subscriptions/c/${currentUser._id}`, {
                    withCredentials: true
                });
                setSubscribers(res.data.data || []);
            } catch (error) {
                console.error("Error fetching subscribers:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscribers();
    }, [currentUser]);

    if (loading) return <div className="text-center mt-20 text-white">Loading your fans...</div>;

    return (
        <div className="w-full py-8">
            <Container>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">My Subscribers</h1>
                    <p className="text-gray-400 text-sm">{subscribers.length} people follow you</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subscribers.length > 0 ? (
                        subscribers.map((item: any) => {
                            // Robustly find the user object (handles different backend structures)
                            const fan = item.subscriber || item.owner || item; 

                            if (!fan || !fan.username) return null;

                            return (
                                <div key={item._id || fan._id} className="bg-[#121212] border border-white/10 rounded-xl p-4 flex flex-col items-center text-center hover:border-white/20 transition-colors">
                                    <Link to={`/channel/${fan.username}`} className="mb-3">
                                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-purple-500/30 p-0.5">
                                            <img 
                                                src={fan.avatar} 
                                                alt={fan.username} 
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </div>
                                    </Link>
                                    
                                    <h3 className="font-bold text-white text-lg">{fan.fullName}</h3>
                                    <p className="text-gray-400 text-sm mb-4">@{fan.username}</p>

                                    <Link 
                                        to={`/channel/${fan.username}`}
                                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-purple-400 rounded-lg text-sm font-medium transition-colors block"
                                    >
                                        View Channel
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                                <UserCheck size={40} />
                            </div>
                            <p className="text-xl text-white font-bold mb-2">No subscribers yet</p>
                            <p className="text-gray-400">
                                Keep creating great content and they will come!
                            </p>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}