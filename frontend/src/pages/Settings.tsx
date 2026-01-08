import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Save, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Container from '../components/Container';
import conf from '../conf/conf';
import { login } from '../store/authSlice'; // Import login to update Redux state

export default function Settings() {
    const dispatch = useDispatch();
    const currentUser = useSelector((state: any) => state.auth.userData);

    const [avatar, setAvatar] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    
    const [loadingAvatar, setLoadingAvatar] = useState(false);
    const [loadingCover, setLoadingCover] = useState(false);

    //Handle Avatar Update
    const handleAvatarUpdate = async () => {
        if (!avatar) return;
        setLoadingAvatar(true);
        
        const formData = new FormData();
        formData.append("avatar", avatar);

        try {
            const res = await axios.patch(`${conf.backendUrl}/users/avatar`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });

            const updatedUser = res.data.data;
            dispatch(login(updatedUser)); 
            
            alert("Avatar updated successfully!");
            setAvatar(null);
        } catch (error) {
            console.error("Error updating avatar:", error);
            alert("Failed to update avatar.");
        } finally {
            setLoadingAvatar(false);
        }
    };

    //Handle Cover Image Update
    const handleCoverUpdate = async () => {
        if (!coverImage) return;
        setLoadingCover(true);

        const formData = new FormData();
        formData.append("coverImage", coverImage);

        try {
            const res = await axios.patch(`${conf.backendUrl}/users/cover-image`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Update Redux
            const updatedUser = res.data.data;
            dispatch(login(updatedUser));

            alert("Cover Image updated successfully!");
            setCoverImage(null);
        } catch (error) {
            console.error("Error updating cover:", error);
            alert("Failed to update cover image.");
        } finally {
            setLoadingCover(false);
        }
    };

    return (
        <div className="w-full py-8">
            <Container>
                <div className="max-w-4xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link to={`/channel/${currentUser?.username}`} className="p-2 bg-[#121212] rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft size={20} className="text-white" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Channel Settings</h1>
                            <p className="text-gray-400 text-sm">Update your channel branding</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        
                        {/*Cover Image Section */}
                        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Cover Image</h2>
                            
                            <div className="relative w-full aspect-[3/1] bg-gray-800 rounded-xl overflow-hidden mb-4 group border border-dashed border-gray-600 hover:border-purple-500 transition-colors">
                                <img 
                                    src={coverImage ? URL.createObjectURL(coverImage) : currentUser?.coverImage} 
                                    alt="Cover" 
                                    className={`w-full h-full object-cover transition-opacity ${coverImage ? 'opacity-50' : 'opacity-100 group-hover:opacity-75'}`}
                                />
                                
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-white bg-black/50 p-4 rounded-xl backdrop-blur-sm">
                                        <Camera size={32} />
                                        <span className="text-sm font-medium">Change Cover</span>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && setCoverImage(e.target.files[0])}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/*Save Button for Cover*/}
                            {coverImage && (
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleCoverUpdate}
                                        disabled={loadingCover}
                                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        {loadingCover ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
                                        Save Cover
                                    </button>
                                </div>
                            )}
                        </div>

                        {/*Avatar Update Section */}
                        <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Profile Picture</h2>
                            
                            <div className="flex items-center gap-6">
                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-gray-600 hover:border-purple-500 group flex-shrink-0">
                                    <img 
                                        src={avatar ? URL.createObjectURL(avatar) : currentUser?.avatar} 
                                        alt="Avatar" 
                                        className={`w-full h-full object-cover transition-opacity ${avatar ? 'opacity-50' : 'opacity-100 group-hover:opacity-75'}`}
                                    />
                                    <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer bg-black/40 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && setAvatar(e.target.files[0])}
                                        />
                                    </label>
                                </div>

                                <div className="flex-1">
                                    <p className="text-gray-400 text-sm mb-4">
                                        Ideally a square image (JPEG/PNG). This will be displayed on your channel page and next to your comments.
                                    </p>

                                    {avatar && (
                                        <button 
                                            onClick={handleAvatarUpdate}
                                            disabled={loadingAvatar}
                                            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {loadingAvatar ? <Loader2 size={18} className="animate-spin"/> : <Save size={18} />}
                                            Save Avatar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </Container>
        </div>
    );
}