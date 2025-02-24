import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';
import LikeButton from '../../components/forum/LikeButton';

const SingleForumPost = () => {
    const { postId } = useParams();
    const [post, setPost] = React.useState(null);
    const [comments, setComments] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [comment, setComment] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [postResponse, commentsResponse] = await Promise.all([
                    fetch(`/wp-json/wp/v2/forum/${postId}?_embed`),
                    fetch(`/wp-json/wp/v2/comments?post=${postId}&_embed`)
                ]);

                if (!postResponse.ok) throw new Error('Failed to fetch post');
                if (!commentsResponse.ok) throw new Error('Failed to fetch comments');

                const postData = await postResponse.json();
                const commentsData = await commentsResponse.json();

                setPost(postData);
                setComments(commentsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId]);

    // Add view count increment when post is loaded
    useEffect(() => {
        const incrementViewCount = async () => {
            if (!postId) return;
            
            try {
                await fetch(`/wp-json/bidspace/v1/forum/${postId}/view`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': wpApiSettings.nonce
                    }
                });
            } catch (error) {
                console.error('Error incrementing view count:', error);
            }
        };

        incrementViewCount();
    }, [postId]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            const response = await fetch('/wp-json/wp/v2/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wpApiSettings.nonce
                },
                body: JSON.stringify({
                    post: parseInt(postId),
                    content: comment,
                    author: user.id
                })
            });

            if (!response.ok) throw new Error('Failed to submit comment');

            const newComment = await response.json();
            setComments(prev => [newComment, ...prev]);
            setComment('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getCategoryLabel = (categorySlug) => {
        const categories = {
            'cinema-theatre': 'კინო-თეატრი',
            'events': 'ივენთები',
            'sports': 'სპორტი',
            'travel': 'მოგზაურობა'
        };
        return categories[categorySlug] || categorySlug;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
            Error: {error}
        </div>
    );

    if (!post) return (
        <div className="text-center p-8">
            <p>პოსტი ვერ მოიძებნა</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
            >
                ← უკან დაბრუნება
            </button>

            <article className="bg-white shadow rounded-lg p-6 mb-6">
                {post._embedded && post._embedded['wp:term'] && (
                    <div className="mb-4">
                        {post._embedded['wp:term'][0].map(term => (
                            <span 
                                key={term.id}
                                className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mr-2"
                            >
                                {getCategoryLabel(term.slug)}
                            </span>
                        ))}
                    </div>
                )}

                <h1 className="text-3xl font-bold mb-4">{post.title.rendered}</h1>
                
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            <span className="text-gray-700">{post._embedded?.author?.[0]?.name}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <time className="text-gray-600">
                            {new Date(post.date).toLocaleDateString('ka-GE')}
                        </time>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-600">{post.meta?.views_count || 0}</span>
                        </div>
                        <LikeButton 
                            postId={post.id}
                            initialLikeCount={post.meta?.like_count || 0}
                            initialLiked={post.meta?.user_has_liked || false}
                        />
                    </div>
                </div>

                <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content.rendered }} 
                />
            </article>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">კომენტარები</h2>

                {user ? (
                    <form onSubmit={handleSubmitComment} className="mb-6">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="დაწერეთ კომენტარი..."
                            required
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`mt-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                submitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {submitting ? 'იგზავნება...' : 'კომენტარის დამატება'}
                        </button>
                    </form>
                ) : (
                    <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
                        <p className="text-gray-600">კომენტარის დასატოვებლად გთხოვთ გაიაროთ ავტორიზაცია</p>
                    </div>
                )}

                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            კომენტარები არ არის
                        </p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-semibold text-gray-900">
                                            {comment._embedded?.author?.[0]?.name}
                                        </span>
                                        <span className="text-gray-500 text-sm ml-2">
                                            {new Date(comment.date).toLocaleDateString('ka-GE')}
                                        </span>
                                    </div>
                                </div>
                                <div 
                                    className="prose prose-sm max-w-none text-gray-700"
                                    dangerouslySetInnerHTML={{ __html: comment.content.rendered }} 
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SingleForumPost;