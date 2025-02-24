import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';

const MyResponses = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchComments = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/wp-json/wp/v2/comments?author=${user.id}&post_type=forum&_embed`);
                if (!response.ok) throw new Error('Failed to fetch comments');
                
                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [user]);

    if (!user) {
        return (
            <div className="text-center p-8">
                <p>გთხოვთ გაიაროთ ავტორიზაცია თქვენი პასუხების სანახავად</p>
            </div>
        );
    }

    if (loading) return <div>იტვირთება...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">ჩემი პასუხები</h2>
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        თქვენ ჯერ არ გაგიციათ პასუხები
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-white shadow rounded-lg p-6">
                            <div className="text-sm text-gray-600 mb-2">
                                პასუხი თემაზე:{' '}
                                <Link 
                                    to={`/forum/post/${comment.post}`} 
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {comment._embedded?.post?.[0]?.title?.rendered}
                                </Link>
                            </div>
                            <div className="prose max-w-none mb-2"
                                 dangerouslySetInnerHTML={{ __html: comment.content.rendered }} 
                            />
                            <div className="text-sm text-gray-500">
                                {new Date(comment.date).toLocaleDateString('ka-GE')}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyResponses;