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
            className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                isLiked 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${!user ? 'cursor-not-allowed opacity-50' : ''}`}
        >
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${isLiked ? 'fill-blue-600' : 'fill-gray-600'}`}
                viewBox="0 0 20 20"
            >
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{likeCount}</span>
        </button>
    );
};

export default LikeButton;