import React from 'react';
import { ThumbsUp, MoreVertical } from 'lucide-react';

interface CommentProps {
    comment: {
        _id: string;
        content: string;
        owner?: {
            fullName: string;
            username: string;
            avatar: string;
        };
        createdAt: string;
    };
}

function CommentItem({ comment }: CommentProps) {
    return (
        // Added 'group' class here so the options menu hover effect works!
        <div className="flex gap-4 py-4 border-b border-white/10 last:border-none group">
            
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                <img 
                    src={comment?.owner?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                    alt={comment?.owner?.username || "user"} 
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">
                        {comment?.owner?.fullName || comment?.owner?.username}
                    </span>
                    <span className="text-xs text-gray-400">
                        @{comment?.owner?.username || "anonymous"} • {new Date(comment?.createdAt).toLocaleDateString()}
                    </span>
                </div>
                
                <p className="text-sm text-gray-200 mb-2">
                    {comment?.content}
                </p>

                {/* Actions (Like/Reply) */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                        <ThumbsUp size={14} />
                        <span>0</span>
                    </button>
                    <button className="text-xs font-medium text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-white/10">
                        Reply
                    </button>
                </div>
            </div>

            {/* Options Menu */}
            <button className="self-start p-1 hover:bg-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={16} />
            </button>
        </div>
    );
}

export default CommentItem;