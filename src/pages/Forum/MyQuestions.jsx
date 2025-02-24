import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';

const MyQuestions = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);
        const diffInMonths = Math.floor(diffInDays / 30);
        const diffInYears = Math.floor(diffInDays / 365);

        if (diffInSeconds < 60) return 'წამის წინ';
        if (diffInMinutes < 60) return `${diffInMinutes} წუთის წინ`;
        if (diffInHours < 24) return `${diffInHours} საათის წინ`;
        if (diffInDays < 30) return `${diffInDays} დღის წინ`;
        if (diffInMonths < 12) return `${diffInMonths} თვის წინ`;
        return `${diffInYears} წლის წინ`;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/wp-json/wp/v2/forum?author=${user.id}&_embed`);
                if (!response.ok) throw new Error('Failed to fetch posts');
                
                const data = await response.json();
                setPosts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user]);

    if (!user) {
        return (
            <div className="text-center p-8">
                <p>გთხოვთ გაიაროთ ავტორიზაცია თქვენი კითხვების სანახავად</p>
            </div>
        );
    }

    if (loading) return <div>იტვირთება...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">ჩემი კითხვები</h2>
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        თქვენ ჯერ არ დაგიმატებიათ კითხვები
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-white shadow rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-2">
                                <Link to={`/forum/post/${post.id}`} className="text-blue-600 hover:text-blue-800">
                                    {post.title.rendered}
                                </Link>
                            </h2>
                            <div className="text-sm text-gray-600 mb-4 flex items-center space-x-4">
                                <span>{formatRelativeTime(post.date)}</span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {post.comment_count || 0}
                                </span>
                                <span>•</span>
                                <span>{post.meta?.like_count || 0} მოწონება</span>
                                <span>•</span>
                                <span>{post.meta?.views_count || 0} ნახვა</span>
                            </div>
                            <div className="prose max-w-none"
                                 dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} 
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyQuestions;