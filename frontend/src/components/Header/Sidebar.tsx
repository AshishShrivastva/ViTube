import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ThumbsUp, History, Film, FolderHeart, UserCheck, MessageSquare, Settings} from 'lucide-react';
import LogoutBtn from './LogoutBtn';
import { useSelector } from 'react-redux';

function Sidebar() {
    const username = useSelector((state: any) => state.auth.userData?.username);

    const navItems = [
        { name: 'Home', url: '/', icon: <Home size={20} /> },
        { name: 'Tweets', url: '/tweets', icon: <MessageSquare size={20} /> }, 
        { name: 'Liked Videos', url: '/liked-videos', icon: <ThumbsUp size={20} /> },
        { name: 'History', url: '/history', icon: <History size={20} /> },
        { name: 'My Content', url: '/my-content', icon: <Film size={20} /> },
        { name: 'Playlists', url: '/playlists', icon: <FolderHeart size={20} /> },
        { name: 'Subscribers', url: '/subscribers', icon: <UserCheck size={20} /> },
        { name: 'Settings', url: '/settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside className="w-64 h-screen bg-[#0F0F0F] border-r border-white/10 hidden md:flex flex-col fixed left-0 top-16 z-40 pt-4">
            <div className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.url}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive 
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" 
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        {item.icon}
                        <span className="font-medium">{item.name}</span>
                    </NavLink>
                ))}
            </div>
            <div className="p-4 border-t border-white/10 mb-16">
                 <LogoutBtn />
            </div>
        </aside>
    );
}

export default Sidebar;