import React, { useState, useEffect } from 'react';

function AuctionImage({ mediaId }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!mediaId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/wp-json/wp/v2/media/${mediaId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const imageData = await response.json();
        setImageUrl(imageData.source_url);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching image:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchImage();
  }, [mediaId]);

  if (loading) {
    return <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg"></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">სურათის ჩატვირთვა ვერ მოხერხდა</div>;
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <div>
      <img 
        src={imageUrl} 
        alt="აუქციონის სურათი"
        className="w-full mx-auto rounded-lg shadow-lg max-h-72"
        loading="lazy"
      />
    </div>
  );
}

export default AuctionImage;