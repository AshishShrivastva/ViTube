import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut } from 'lucide-react';
import { logout } from '../../store/authSlice';
import conf from '../../conf/conf';

function LogoutBtn({ className = '' }: { className?: string }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            await axios.post(`${conf.backendUrl}/users/logout`, {}, {
                withCredentials: true 
            });
            dispatch(logout());
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    return (
        <button 
            onClick={logoutHandler}
            className={`flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 w-full text-left ${className}`}
        >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
        </button>
    );
}

export default LogoutBtn;