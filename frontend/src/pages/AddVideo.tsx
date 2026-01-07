import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UploadCloud, Loader2, Image as ImageIcon, Video, X } from 'lucide-react'; // Added icons
import Container from '../components/Container';
import Button from '../components/Button';
import Input from '../components/Input';
import conf from '../conf/conf';

export default function AddVideo() {
    const { register, handleSubmit, watch, setValue } = useForm(); // Added watch & setValue
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    // Watch files to show preview/name
    const videoFile = watch("videoFile");
    const thumbnail = watch("thumbnail");

    const publishVideo = async (data: any) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("description", data.description);
            formData.append("videoFile", data.videoFile[0]);
            formData.append("thumbnail", data.thumbnail[0]);

            await axios.post(`${conf.backendUrl}/videos/`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                   if (progressEvent.total) {
                       const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                       setUploadProgress(percent);
                   }
                }
            });
            navigate("/"); 
        } catch (error: any) {
            console.error("Error uploading video:", error);
            // Show alert if unauthorized
            alert(error.response?.data?.message || "Upload Failed! Please Logout and Login again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-8 w-full">
            <Container>
                <div className="max-w-3xl mx-auto bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-white">Upload New Video</h2>
                    </div>

                    {loading && (
                        <div className="mb-6 space-y-2">
                             <div className="flex justify-between text-xs text-gray-400">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                             </div>
                             <div className="bg-white/5 rounded-full h-2 overflow-hidden">
                                <div className="bg-purple-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(publishVideo)} className="space-y-6">
                        
                        {/* Video Input Area */}
                        <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors cursor-pointer relative group">
                            <input 
                                type="file" 
                                accept="video/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                {...register("videoFile", { required: true })}
                            />
                            {/* Logic: Show Filename if selected, else show Icon */}
                            {videoFile && videoFile[0] ? (
                                <div className="text-purple-400 flex flex-col items-center">
                                    <Video size={40} className="mb-2" />
                                    <p className="font-semibold">{videoFile[0].name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Click to change</p>
                                </div>
                            ) : (
                                <div className="space-y-2 pointer-events-none">
                                    <UploadCloud className="mx-auto text-gray-400 group-hover:text-purple-500 transition-colors" size={32} />
                                    <p className="text-sm font-medium text-gray-300">Select Video File</p>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Input Area */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Thumbnail</label>
                            <div className="relative">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer"
                                    {...register("thumbnail", { required: true })}
                                />
                                {/* Preview Thumbnail if selected */}
                                {thumbnail && thumbnail[0] && (
                                    <div className="mt-4 w-32 aspect-video rounded-lg overflow-hidden border border-white/10">
                                        <img 
                                            src={URL.createObjectURL(thumbnail[0])} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Input label="Title" placeholder="Video Title" {...register("title", { required: true })} />
                        <Input label="Description" placeholder="Description" {...register("description", { required: true })} />

                        <Button type="submit" className="w-full py-3" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "Publish Video"}
                        </Button>
                    </form>
                </div>
            </Container>
        </div>
    );
}