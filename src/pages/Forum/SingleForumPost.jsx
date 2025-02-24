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
    const [viewIncremented, setViewIncremented] = React.useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postResponse, commentsResponse] = await Promise.all([
                    fetch(`/wp-json/wp/v2/forum/${postId}?_embed`),
                    fetch(`/wp-json/wp/v2/comments?post=${postId}&_embed&order=desc`)
                ]);

                if (!postResponse.ok) throw new Error('კითხვის ჩატვირთვა ვერ მოხერხდა');
                if (!commentsResponse.ok) throw new Error('კომენტარების ჩატვირთვა ვერ მოხერხდა');

                const postData = await postResponse.json();
                const commentsData = await commentsResponse.json();

                setPost(postData);
                setComments(commentsData);

                // Increment view count only once when post is first loaded
                if (!viewIncremented) {
                    try {
                        const viewResponse = await fetch(`/wp-json/bidspace/v1/forum/${postId}/view`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-WP-Nonce': wpApiSettings.nonce
                            }
                        });
                        
                        if (viewResponse.ok) {
                            const viewData = await viewResponse.json();
                            setPost(prev => ({
                                ...prev,
                                meta: { ...prev.meta, views_count: viewData.views_count }
                            }));
                            setViewIncremented(true);
                        }
                    } catch (viewError) {
                        console.error('Error incrementing view count:', viewError);
                    }
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [postId]);

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!user || !comment.trim()) return;

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

            if (!response.ok) throw new Error('კომენტარის დამატება ვერ მოხერხდა');

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

    if (loading) return (
        <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
            {error}
        </div>
    );

    if (!post) return (
        <div className="text-center p-8">
            <p>პოსტი ვერ მოიძებნა</p>
        </div>
    );

    return (
        <div className="w-full">
            <article className="bg-white shadow rounded-lg p-6 mb-6">
            <button
                onClick={() => navigate(-1)}
                className="w-full pb-4 border-b mb-4 text-[#00aff0] flex items-center"
            >
                ← უკან დაბრუნება
            </button>
                {post.featured_image_url && (
                    <div className="relative h-64 mb-6 overflow-hidden rounded-lg">
                        <img 
                            src={post.featured_image_url}
                            alt={post.title.rendered}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {post._embedded && post._embedded['wp:term'] && (
                    <div className="mb-4">
                        {post._embedded['wp:term'][0].map(term => (
                            <span 
                                key={term.id}
                                className="inline-block bg-[#00aff0] text-white text-sm px-3 py-1 rounded-full mr-2"
                            >
                                {getCategoryLabel(term.slug)}
                            </span>
                        ))}
                    </div>
                )}

                <h1 className="text-3xl font-bold mb-4" dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            {post._embedded?.author?.[0]?.avatar_urls?.['48'] && (
                                <img 
                                    src={post._embedded.author[0].avatar_urls['48']}
                                    alt={post._embedded.author[0].name}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                            )}
                            <div>
                                <div className="font-medium">
                                    {post._embedded?.author?.[0]?.name}
                                </div>
                                <time className="text-sm text-gray-500">
                                    {formatRelativeTime(post.date)}
                                </time>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center text-gray-500">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{post.meta?.views_count || 0}</span>
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00aff0] focus:border-transparent"
                            rows="3"
                            placeholder="დაწერეთ კომენტარი..."
                            required
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={submitting || !comment.trim()}
                                className={`bg-[#00aff0] text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    (submitting || !comment.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {submitting ? 'იგზავნება...' : 'კომენტარის დამატება'}
                            </button>
                        </div>
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
                                    <div className="flex items-center">
                                        {comment._embedded?.author?.[0]?.avatar_urls?.['48'] && (
                                            <img 
                                                src={comment._embedded.author[0].avatar_urls['48']}
                                                alt={comment._embedded.author[0].name}
                                                className="w-8 h-8 rounded-full mr-2"
                                            />
                                        )}
                                        <div>
                                            <span className="font-semibold text-gray-900">
                                                {comment._embedded?.author?.[0]?.name}
                                            </span>
                                            <span className="text-gray-500 text-sm ml-2">
                                                {formatRelativeTime(comment.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    className="prose prose-sm max-w-none text-gray-700 pl-10"
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