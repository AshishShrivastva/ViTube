import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, Loader2 } from 'lucide-react';
import conf from '../conf/conf';

interface EditVideoModalProps {
    video: any;
    onClose: () => void;
    onUpdate: (updatedVideo: any) => void;
}

export default function EditVideoModal({ video, onClose, onUpdate }: EditVideoModalProps) {
    const [title, setTitle] = useState(video.title);
    const [description, setDescription] = useState(video.description);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        if (thumbnail) {
            formData.append("thumbnail", thumbnail);
        }

        try {
            const res = await axios.patch(
                `${conf.backendUrl}/videos/${video._id}`,
                formData,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );
            
            onUpdate(res.data.data); // Update the list in the parent
            onClose(); // Close modal
        } catch (error) {
            console.error("Error updating video:", error);
            alert("Failed to update video. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-white font-semibold text-lg">Edit Video</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Thumbnail Preview/Upload */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Thumbnail</label>
                        <label className="block relative aspect-video rounded-xl overflow-hidden border border-dashed border-gray-600 hover:border-purple-500 cursor-pointer group">
                            <img 
                                src={thumbnail ? URL.createObjectURL(thumbnail) : video.thumbnail} 
                                alt="Thumbnail" 
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                                <Upload size={24} className="mb-2" />
                                <span className="text-xs font-medium">Click to change</span>
                            </div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                    if (e.target.files?.[0]) setThumbnail(e.target.files[0]);
                                }}
                            />
                        </label>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Title</label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none"
                            placeholder="Video Title"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm text-gray-400">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-purple-500 outline-none min-h-[100px] resize-none"
                            placeholder="Tell viewers about your video"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}