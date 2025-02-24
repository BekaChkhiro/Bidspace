import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ForumList = ({ category }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/wp-json/wp/v2/forum?_embed&forum_category=${category}`);
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
    }, [category]);

    if (loading) return <div>იტვირთება...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    if (posts.length === 0) {
        return (
            <div className="text-center text-gray-500 py-8">
                ამ კატეგორიაში ჯერ არ არის კითხვები
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2">
                        <Link to={`/forum/post/${post.id}`} className="text-blue-600 hover:text-blue-800">
                            {post.title.rendered}
                        </Link>
                    </h3>
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
            ))}
        </div>
    );
};

export default ForumList;