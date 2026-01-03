import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Search, Menu, Upload } from 'lucide-react';
import Logo from '../Logo';
import Button from '../Button';

function Header() {
    const authStatus = useSelector((state: any) => state.auth.status);
    const userData = useSelector((state: any) => state.auth.userData);
    const navigate = useNavigate();

    // 1. Local state for the search input
    const [searchTerm, setSearchTerm] = useState("");

    // 2. Handle Search Submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent full page reload
        if (searchTerm.trim()) {
            // Navigate to Home page with the query parameter
            navigate(`/?query=${encodeURIComponent(searchTerm.trim())}`);

            setSearchTerm("");
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-[#0F0F0F]/80 backdrop-blur-md border-b border-white/10 z-50 px-4 flex items-center justify-between">
            {/* Left: Logo & Mobile Menu */}
            <div className="flex items-center gap-4">
                <button 
                    type="button" 
                    aria-label="Toggle Menu" 
                    className="md:hidden text-gray-300 hover:text-white"
                >
                    <Menu size={24} />
                </button>
                <Link to="/">
                    <Logo />
                </Link>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
                {/* Wrapped in form to support Enter key submission */}
                <form onSubmit={handleSearch} className="relative w-full">
                    <input 
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#121212] border border-white/10 rounded-full py-2 pl-4 pr-10 text-gray-300 focus:outline-none focus:border-purple-500 transition-all"
                    />
                    <button 
                        type="submit" 
                        aria-label="Search" 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500"
                    >
                        <Search size={20} />
                    </button>
                </form>
            </div>

            {/* Right: User Actions */}
            <div className="flex items-center gap-4">
                {authStatus ? (
                    <>
                        <Button 
                            className="hidden md:flex items-center gap-2"
                            onClick={() => navigate("/add-video")}
                        >
                            <Upload size={18} /> <span>Upload</span>
                        </Button>
                        <Link to={`/channel/${userData?.username}`}>
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-purple-500/50 p-0.5 cursor-pointer hover:scale-105 transition-transform">
                                <img 
                                    src={userData?.avatar} 
                                    alt="User Avatar" 
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </Link>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button>Sign Up</Button>
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;