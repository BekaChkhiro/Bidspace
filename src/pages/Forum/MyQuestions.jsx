import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';

const MyQuestions = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

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

export default MyQuestions;