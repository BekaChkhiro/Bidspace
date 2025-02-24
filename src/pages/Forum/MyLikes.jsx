import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';

const MyLikes = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchLikedPosts = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch posts that the user has liked
                const response = await fetch(`/wp-json/wp/v2/forum?_embed&liked_by=${user.id}`);
                if (!response.ok) throw new Error('Failed to fetch liked posts');
                
                const data = await response.json();
                setPosts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedPosts();
    }, [user]);

    if (!user) {
        return (
            <div className="text-center p-8">
                <p>გთხოვთ გაიაროთ ავტორიზაცია მოწონებული პოსტების სანახავად</p>
            </div>
        );
    }

    if (loading) return <div>იტვირთება...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">მოწონებული პოსტები</h2>
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        თქვენ ჯერ არ მოგწონებიათ არცერთი პოსტი
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
                                <span>ავტორი: {post._embedded?.author?.[0]?.name}</span>
                                <span>•</span>
                                <span>{new Date(post.date).toLocaleDateString('ka-GE')}</span>
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

export default MyLikes;