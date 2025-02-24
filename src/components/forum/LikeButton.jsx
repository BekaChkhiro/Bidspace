import React, { useState } from 'react';
import { useAuth } from '../../components/core/context/AuthContext';

const LikeButton = ({ postId, initialLikeCount = 0, initialLiked = false }) => {
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const handleLike = async () => {
        if (!user || isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/wp-json/bidspace/v1/forum/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce
                }
            });
            if (!response.ok) throw new Error('Failed to toggle like');
            const data = await response.json();
            setLikeCount(data.like_count);
            setIsLiked(data.user_has_liked);
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={!user || isLoading}
            className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${
                !user ? 'cursor-not-allowed opacity-50' : ''
            }`}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-6 w-6 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
            >
                <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" 
                />
            </svg>
            <span className={`text-sm ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                {likeCount}
            </span>
        </button>
    );
};

export default LikeButton;