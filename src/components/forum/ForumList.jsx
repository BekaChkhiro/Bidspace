import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';
import LikeButton from '../forum/LikeButton';
import ForumFilters from './ForumFilters';

const ForumList = ({ category, title }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('date');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { user } = useAuth();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const url = category 
                    ? `/wp-json/wp/v2/forum?forum_category=${category}&_embed&orderby=${sortBy}&page=${page}&per_page=10`
                    : `/wp-json/wp/v2/forum?_embed&orderby=${sortBy}&page=${page}&per_page=10`;
                
                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch posts');
                
                const data = await response.json();
                const totalPagesHeader = response.headers.get('X-WP-TotalPages');
                setTotalPages(parseInt(totalPagesHeader) || 1);
                
                let sortedData = [...data];
                switch (sortBy) {
                    case 'likes':
                        sortedData.sort((a, b) => (b.meta?.like_count || 0) - (a.meta?.like_count || 0));
                        break;
                    case 'views':
                        sortedData.sort((a, b) => (b.meta?.views_count || 0) - (a.meta?.views_count || 0));
                        break;
                    case 'comments':
                        sortedData.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
                        break;
                    default: // 'date'
                        sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
                }
                
                setPosts(sortedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [category, sortBy, page]);

    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        setPage(1); // Reset to first page when sorting changes
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

    const renderPagination = () => {
        return (
            <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-6">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-2 sm:px-3 py-1 rounded text-sm sm:text-base ${
                        page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#00aff0] text-white'
                    }`}
                >
                    წინა
                </button>
                
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 3) {
                        pageNumber = i + 1;
                    } else if (page <= 2) {
                        pageNumber = i + 1;
                    } else if (page >= totalPages - 1) {
                        pageNumber = totalPages - 2 + i;
                    } else {
                        pageNumber = page - 1 + i;
                    }

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`px-2 sm:px-3 py-1 rounded text-sm sm:text-base ${
                                page === pageNumber
                                    ? 'bg-[#00aff0] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {pageNumber}
                        </button>
                    );
                })}
                
                <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-2 sm:px-3 py-1 rounded text-sm sm:text-base ${
                        page === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#00aff0] text-white'
                    }`}
                >
                    შემდეგი
                </button>
            </div>
        );
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

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                    <ForumFilters onSortChange={handleSortChange} sortBy={sortBy} />
                </div>
            </div>
            
            <div className="grid gap-4">
                {posts.length === 0 ? (
                    <div className="text-center bg-gray-50 rounded-lg py-8 sm:py-12">
                        <p className="text-gray-500 text-base sm:text-lg">
                            ამ კატეგორიაში კითხვები არ არის
                        </p>
                        <Link
                            to="/forum/add-question"
                            className="inline-block mt-4 px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-md hover:bg-blue-700 transition-colors"
                        >
                            + დაამატე პირველი კითხვა
                        </Link>
                    </div>
                ) : (
                    <>
                        {posts.map(post => (
                            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                                <Link to={`/forum/post/${post.id}`} className="block">
                                    {post.featured_image_url && (
                                        <div className="relative h-32 sm:h-48 overflow-hidden">
                                            <img 
                                                src={post.featured_image_url}
                                                alt={post.title.rendered}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </Link>
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
                                        <div className="flex items-center space-x-3">
                                            {post._embedded?.author?.[0]?.avatar_urls?.['48'] && (
                                                <img 
                                                    src={post._embedded.author[0].avatar_urls['48']}
                                                    alt={post._embedded.author[0].name}
                                                    className="w-10 h-10 rounded-full border-2 border-gray-100"
                                                />
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {post._embedded?.author?.[0]?.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatRelativeTime(post.date)}
                                                </div>
                                            </div>
                                        </div>
                                        <LikeButton 
                                            postId={post.id}
                                            initialLikeCount={post.meta?.like_count || 0}
                                            initialLiked={post.meta?.user_has_liked || false}
                                        />
                                    </div>

                                    <Link to={`/forum/post/${post.id}`} className="block group">
                                        <h2 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-[#00aff0] transition-colors">
                                            {post.title.rendered}
                                        </h2>
                                        <div 
                                            className="prose prose-sm max-w-none text-gray-600 line-clamp-2 mb-4"
                                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} 
                                        />
                                    </Link>

                                    <div className="flex items-center justify-between">
                                        {post._embedded && post._embedded['wp:term'] && (
                                            <div className="flex flex-wrap gap-2">
                                                {post._embedded['wp:term'][0].map(term => (
                                                    <span 
                                                        key={term.id}
                                                        className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                                                    >
                                                        {getCategoryLabel(term.slug)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center space-x-4">
                                            <span className="flex items-center text-gray-500 text-sm">
                                                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                {post.comment_count || 0}
                                            </span>
                                            <span className="flex items-center text-gray-500 text-sm">
                                                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                {post.meta?.views_count || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default ForumList;