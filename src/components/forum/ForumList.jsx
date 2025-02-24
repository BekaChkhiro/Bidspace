import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';
import LikeButton from '../forum/LikeButton';
import ForumFilters from './ForumFilters';

const ForumList = ({ category }) => {
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
                        sortedData.sort((a, b) => (b._embedded?.replies?.[0]?.length || 0) - (a._embedded?.replies?.[0]?.length || 0));
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

    const renderPagination = () => {
        return (
            <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded ${
                        page === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    წინა
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                        pageNumber = i + 1;
                    } else if (page <= 3) {
                        pageNumber = i + 1;
                    } else if (page >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                    } else {
                        pageNumber = page - 2 + i;
                    }

                    return (
                        <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`px-3 py-1 rounded ${
                                page === pageNumber
                                    ? 'bg-blue-600 text-white'
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
                    className={`px-3 py-1 rounded ${
                        page === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
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
            <ForumFilters onSortChange={handleSortChange} sortBy={sortBy} />
            
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center bg-gray-50 rounded-lg py-12">
                        <p className="text-gray-500 text-lg">
                            ამ კატეგორიაში კითხვები არ არის
                        </p>
                        <Link
                            to="/forum/add-question"
                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            + დაამატე პირველი კითხვა
                        </Link>
                    </div>
                ) : (
                    <>
                        {posts.map(post => (
                            <div key={post.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        {post._embedded && post._embedded['wp:term'] && (
                                            <div className="mb-2">
                                                {post._embedded['wp:term'][0].map(term => (
                                                    <span 
                                                        key={term.id}
                                                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2"
                                                    >
                                                        {getCategoryLabel(term.slug)}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <h2 className="text-xl font-semibold mb-2">
                                            <Link 
                                                to={`/forum/post/${post.id}`} 
                                                className="text-gray-900 hover:text-blue-600"
                                            >
                                                {post.title.rendered}
                                            </Link>
                                        </h2>
                                    </div>
                                    <div className="ml-4">
                                        <LikeButton 
                                            postId={post.id}
                                            initialLikeCount={post.meta?.like_count || 0}
                                            initialLiked={post.meta?.user_has_liked || false}
                                        />
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 mb-3 flex items-center space-x-3">
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                        </svg>
                                        {post._embedded?.author?.[0]?.name}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                        </svg>
                                        {post._embedded?.replies?.[0]?.length || 0} კომენტარი
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                        {post.meta?.views_count || 0}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(post.date).toLocaleDateString('ka-GE')}</span>
                                </div>

                                <div 
                                    className="prose prose-sm max-w-none text-gray-600"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} 
                                />

                                <Link
                                    to={`/forum/post/${post.id}`}
                                    className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    სრულად ნახვა →
                                </Link>
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