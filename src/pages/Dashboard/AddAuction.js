import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const AddAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    city: '',
    address: '',
    starting_price: '',
    images: [],
    category: '',
    ticket_category: '',
    ticket_price: '',
    ticket_quantity: '',
    hall: '',
    row: '',
    place: '',
    sector: '',
    buy_now: '',
    min_bid_price: ''
  });

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
      postData.append('status', 'publish');
      
      Object.keys(formData).forEach(key => {
        if (key !== 'title' && key !== 'description' && key !== 'images') {
          postData.append(`meta[${key}]`, formData[key]);
        }
      });

      const response = await fetch('/wp-json/wp/v2/auction', {
        method: 'POST',
        headers: {
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: postData
      });

      if (!response.ok) throw new Error('Error creating auction');
      
      const auction = await response.json();

      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const imageData = new FormData();
          imageData.append('file', image);
          imageData.append('post', auction.id);
          
          await fetch('/wp-json/wp/v2/media', {
            method: 'POST',
            headers: {
              'X-WP-Nonce': wpApiSettings.nonce
            },
            body: imageData
          });
        }
      }

      alert('აუქციონი წარმატებით დაემატა');
      navigate('/dashboard/my-auctions');
    } catch (error) {
      console.error('Error adding auction:', error);
      alert('შეცდომა აუქციონის დამატებისას');
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">ახალი აუქციონის დამატება</h1>
      <div className="bg-white p-6 rounded-lg shadow max-h-screen overflow-y-hidden">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#6F7181]">სათაური</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">აღწერა</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#6F7181]">დაწყების დრო</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6F7181]">დასრულების დრო</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#6F7181]">ქალაქი</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6F7181]">მისამართი</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">საწყისი ფასი</label>
            <input
              type="number"
              name="starting_price"
              value={formData.starting_price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">კატეგორია</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">ბილეთის კატეგორია</label>
            <input
              type="text"
              name="ticket_category"
              value={formData.ticket_category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">ბილეთის ფასი</label>
            <input
              type="number"
              name="ticket_price"
              value={formData.ticket_price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">ბილეთის რაოდენობა</label>
            <input
              type="number"
              name="ticket_quantity"
              value={formData.ticket_quantity}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">დარბაზი</label>
            <input
              type="text"
              name="hall"
              value={formData.hall}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">რიგი</label>
            <input
              type="text"
              name="row"
              value={formData.row}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">ადგილი</label>
            <input
              type="text"
              name="place"
              value={formData.place}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">სექტორი</label>
            <input
              type="text"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">მაშინვე ყიდვა</label>
            <input
              type="text"
              name="buy_now"
              value={formData.buy_now}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">მინიმალური ლამაზების ფასი</label>
            <input
              type="number"
              name="min_bid_price"
              value={formData.min_bid_price}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border-[#E5E5E5] shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6F7181]">სურათები</label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <img src="/wp-content/themes/Bidspace Main Theme/icons/dashboard/plus_icon.svg" alt="Add Icon" />
              აუქციონის დამატება
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AddAuction;
