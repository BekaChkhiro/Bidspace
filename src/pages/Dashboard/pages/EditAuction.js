import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardNav from '../components/DashboardNav';
import { useAuth } from '../../../context/AuthContext';

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    city: '',
    address: '',
    starting_price: '',
    images: []
  });

  useEffect(() => {
    fetchAuctionData();
  }, [id]);

  const fetchAuctionData = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${id}`);
      const data = await response.json();

      if (data.author !== user.id) {
        alert('თქვენ არ გაქვთ ამ აუქციონის რედაქტირების უფლება');
        navigate('/dashboard/my-auctions');
        return;
      }

      setFormData({
        title: data.title.rendered,
        description: data.content.rendered,
        start_time: data.meta.start_time,
        end_time: data.meta.end_time,
        city: data.meta.city,
        address: data.meta.address,
        starting_price: data.meta.starting_price,
        images: []
      });
    } catch (error) {
      console.error('Error fetching auction:', error);
      alert('შეცდომა აუქციონის მონაცემების ჩატვირთვისას');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('content', formData.description);
      
      // მეტა ველების განახლება
      Object.keys(formData).forEach(key => {
        if (key !== 'title' && key !== 'description' && key !== 'images') {
          postData.append(`meta[${key}]`, formData[key]);
        }
      });

      const response = await fetch(`/wp-json/wp/v2/auction/${id}`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: postData
      });

      if (!response.ok) throw new Error('Error updating auction');

      // ახალი სურათების ატვირთვა
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const imageData = new FormData();
          imageData.append('file', image);
          imageData.append('post', id);
          
          await fetch('/wp-json/wp/v2/media', {
            method: 'POST',
            headers: {
              'X-WP-Nonce': wpApiSettings.nonce
            },
            body: imageData
          });
        }
      }

      alert('აუქციონი წარმატებით განახლდა');
      navigate('/dashboard/my-auctions');
    } catch (error) {
      console.error('Error updating auction:', error);
      alert('შეცდომა აუქციონის განახლებისას');
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <DashboardNav />
        <div className="flex-1 p-8">
          <p>იტვირთება...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <DashboardNav />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">აუქციონის რედაქტირება</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">სათაური</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">აღწერა</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">დაწყების დრო</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">დასრულების დრო</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">ქალაქი</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">მისამართი</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">საწყისი ფასი</label>
              <input
                type="number"
                name="starting_price"
                value={formData.starting_price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ახალი სურათები</label>
              <input
                type="file"
                name="images"
                onChange={handleImageChange}
                multiple
                accept="image/*"
                className="mt-1 block w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                აუქციონის განახლება
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAuction;