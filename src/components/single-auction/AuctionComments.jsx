import React, { useState } from 'react';

const AuctionComments = ({ comments = {}, currentUserName, onSubmitComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [localComments, setLocalComments] = useState(comments);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!window.bidspaceSettings?.userId) {
        setError('გთხოვთ გაიაროთ ავტორიზაცია');
        return;
      }
  
      if (!window.bidspaceSettings?.restNonce) {
        setError('ავტორიზაციის ტოკენი არ არის ვალიდური. გთხოვთ განაახლოთ გვერდი');
        return;
      }

      // Create optimistic comment
      const optimisticComment = {
        comment_author: window.bidspaceSettings.userId,
        comment_author_name: currentUserName,
        comment_date: new Date().toISOString(),
        comment_area: newComment.trim()
      };

      // Add optimistic comment to local state
      setLocalComments(prev => ({
        ...prev,
        [`temp-${Date.now()}`]: optimisticComment
      }));
      
      // Clear input
      setNewComment('');

      // Actually submit the comment
      await onSubmitComment(newComment);
      
    } catch (err) {
      console.error('Comment submission error:', err);
      // Revert optimistic update on error
      setLocalComments(comments);
      
      if (err.message.includes('not authenticated') || err.message.includes('გაიაროთ ავტორიზაცია')) {
        setError('გთხოვთ გაიაროთ ავტორიზაცია');
      } else if (err.message.includes('token')) {
        setError('ავტორიზაციის ტოკენი არ არის ვალიდური. გთხოვთ განაახლოთ გვერდი');
      } else {
        setError('კომენტარის დამატება ვერ მოხერხდა. გთხოვთ სცადოთ თავიდან');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    const diffInSeconds = Math.floor(diff / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'ახლახანს';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} წუთის წინ`;
    } else if (diffInHours < 24) {
      return `${diffInHours} საათის წინ`;
    } else if (diffInDays < 7) {
      return `${diffInDays} დღის წინ`;
    } else {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('ka-GE', options);
    }
  };

  // Update localComments when props comments change
  React.useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const sortedComments = Object.values(localComments).sort((a, b) => 
    new Date(b.comment_date) - new Date(a.comment_date)
  );

  return (
    <div className="p-10 bg-white rounded-2xl">
      <h2 className="font-bold text-lg">კომენტარები</h2>
      <div className="flex flex-col gap-8 mt-6">
        {/* Comment Form */}
        <div className="p-4 bg-gray-100 rounded-xl">
          <form onSubmit={handleSubmit} className="flex flex-col justify-between gap-3">
            <span className="m-0">{currentUserName}</span>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded-xl"
              rows="3"
              placeholder="დაწერეთ კომენტარი..."
              disabled={isSubmitting}
            />
            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}
            <div className="flex gap-6 items-center">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className={`text-center px-4 py-3 bg-[#00AEEF] text-sm text-white rounded-xl ${
                  (isSubmitting || !newComment.trim()) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'იგზავნება...' : 'დაამატე კომენტარი'}
              </button>
              {newComment.trim().length > 0 && !isSubmitting && (
                <button
                  type="button"
                  onClick={() => setNewComment('')}
                  className="text-center text-sm"
                >
                  გაუქმება
                </button>
              )}
            </div>
          </form>
        </div>

        <hr />

        {/* Comments List */}
        {sortedComments.length > 0 ? (
          <div className="mb-4 overflow-y-auto max-h-[300px]">
            {sortedComments.map((comment, index) => (
              <div
                key={index}
                className="hover:bg-gray-100 hover:rounded-xl hover:m-2 hover:mt-0 hover:ml-0 hover:p-1 hover:pl-3 cursor-pointer"
              >
                <div className="flex gap-2 justify-start items-center my-4">
                  <span className="font-bold text-sm">
                    {comment.comment_author_name}
                  </span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                  <p className="text-sm text-gray-600">
                    {formatDate(comment.comment_date)}
                  </p>
                </div>
                <p>{comment.comment_area}</p>
              </div>))}
          </div>
        ) : (
          <div className="mb-4">
            <p>ჯერ არ არის კომენტარები.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionComments;