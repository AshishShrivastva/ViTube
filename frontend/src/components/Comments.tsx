import React, { useEffect, useState } from 'react';
import axios from 'axios';
import conf from '../conf/conf';
import CommentItem from './CommentItem';

interface CommentsProps {
    videoId: string;
}

function Comments({ videoId }: CommentsProps) {
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch Comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const res = await axios.get(`${conf.backendUrl}/comments/${videoId}`, { withCredentials: true });
                
                // --- FIX STARTS HERE ---
                const responseData = res.data.data;

                // Check if the response is an array (Standard list)
                if (Array.isArray(responseData)) {
                    setComments(responseData);
                } 
                // Check if the response is Paginated (has a 'docs' property)
                else if (responseData && Array.isArray(responseData.docs)) {
                    setComments(responseData.docs);
                } 
                // Fallback to empty array to prevent crashes
                else {
                    setComments([]);
                }
                // --- FIX ENDS HERE ---

            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [videoId]);

    // Handle Add Comment
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await axios.post(
                `${conf.backendUrl}/comments/${videoId}`, 
                { content: newComment },
                { withCredentials: true }
            );
            
            // Add the new comment to the top of the list safely
            setComments((prev) => {
                // Double check prev is an array before spreading
                if (!Array.isArray(prev)) return [res.data.data];
                return [res.data.data, ...prev];
            });

            setNewComment("");
        } catch (error: any) {
            console.error("Error adding comment:", error);
            // If unauthorized, alert the user
            if (error.response && error.response.status === 401) {
                alert("Session expired. Please login again.");
            }
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold text-white mb-6">
                {comments.length} Comments
            </h3>

            {/* Input Form */}
            <form onSubmit={handleAddComment} className="flex gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold border border-purple-500/30">
                    You
                </div>
                <div className="flex-1">
                    <input 
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-transparent border-b border-gray-700 focus:border-purple-500 outline-none text-white py-2 transition-colors placeholder-gray-500"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                        <button 
                            type="button" 
                            onClick={() => setNewComment("")}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={!newComment.trim()}
                            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Comment
                        </button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="flex flex-col gap-2">
                {loading ? (
                    <div className="text-gray-500 text-center py-4">Loading comments...</div>
                ) : comments.length > 0 ? (
                    comments.map((comment: any) => (
                        <CommentItem key={comment._id} comment={comment} />
                    ))
                ) : (
                    <div className="text-gray-500 text-center py-4">No comments yet. Be the first!</div>
                )}
            </div>
        </div>
    );
}

export default Comments;