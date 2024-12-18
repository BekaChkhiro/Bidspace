import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { DateTimePicker } from '../../../components/ui/date-time-picker';

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    ticket_category: '',
    start_date: '',
    city: '',
    ticket_price: '',
    ticket_quantity: '',
    hall: '',
    row: '',
    place: '',
    sector: '',
    start_time: '',
    due_time: '',
    auction_price: '',
    buy_now: '',
    min_bid_price: '',
    ticket_information: '',
    skhva_qalaqebi: '',
    sazgvargaret: '',
    featured_image: null
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
        category: data.meta.category,
        ticket_category: data.meta.ticket_category,
        start_date: data.meta.start_date,
        city: data.meta.city,
        ticket_price: data.meta.ticket_price,
        ticket_quantity: data.meta.ticket_quantity,
        hall: data.meta.hall,
        row: data.meta.row,
        place: data.meta.place,
        sector: data.meta.sector,
        start_time: data.meta.start_time,
        due_time: data.meta.due_time,
        auction_price: data.meta.auction_price,
        buy_now: data.meta.buy_now,
        min_bid_price: data.meta.min_bid_price,
        ticket_information: data.meta.ticket_information,
        skhva_qalaqebi: data.meta.skhva_qalaqebi,
        sazgvargaret: data.meta.sazgvargaret,
        featured_image: data.meta.featured_image && typeof data.meta.featured_image === 'string' ? data.meta.featured_image : null
      });
    } catch (error) {
      console.error('Error fetching auction:', error);
      alert('შეცდომა აუქციონის მონაცემების ჩატვირთვისას');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'featured_image' && files?.length) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const postData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'featured_image' && formData[key]) {
          postData.append('featured_image', formData[key]);
        } else if (key !== 'featured_image') {
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

      alert('აუქციონი წარმატებით განახლდა');
      navigate('/dashboard/my-auctions');
    } catch (error) {
      console.error('Error updating auction:', error);
      alert('შეცდომა აუქციონის განახლებისას');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-row -mx-3 justify-between gap-6" style={{ height: '100%' }}>
        {/* Left side - Form */}
        <div className="w-full lg:w-8/12 px-3 scrollable-content">
          <h2 className="text-2xl font-bold mb-6">აუქციონის რედაქტირება</h2>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">გთხოვთ გაასწოროთ შემდეგი შეცდომები:</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {typeof error === 'string' ? (
                      <p>{error}</p>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1">
                        {error.split('\n').map((err, index) => (
                          <li key={index}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {successMessage}

          <form onSubmit={handleSubmit} className="space-y-6" id="edit-auction-form">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">სათაური</label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">კატეგორია</label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">დაწყების თარიღი</label>
              <DateTimePicker
                id="start_date"
                date={formData.start_date}
                setDate={(value) => handleChange({ target: { name: 'start_date', value } })}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">ქალაქი</label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700">ბილეთის ფასი</label>
              <Input
                type="number"
                id="ticket_price"
                name="ticket_price"
                value={formData.ticket_price}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="ticket_quantity" className="block text-sm font-medium text-gray-700">ბილეთების რაოდენობა</label>
              <Input
                type="number"
                id="ticket_quantity"
                name="ticket_quantity"
                value={formData.ticket_quantity}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="hall" className="block text-sm font-medium text-gray-700">დარბაზი</label>
              <Input
                id="hall"
                name="hall"
                value={formData.hall}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="row" className="block text-sm font-medium text-gray-700">რიგი</label>
              <Input
                id="row"
                name="row"
                value={formData.row}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="place" className="block text-sm font-medium text-gray-700">ადგილი</label>
              <Input
                id="place"
                name="place"
                value={formData.place}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700">სექტორი</label>
              <Input
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">დაწყების დრო</label>
              <DateTimePicker
                id="start_time"
                date={formData.start_time}
                setDate={(value) => handleChange({ target: { name: 'start_time', value } })}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="due_time" className="block text-sm font-medium text-gray-700">დასრულების დრო</label>
              <DateTimePicker
                id="due_time"
                date={formData.due_time}
                setDate={(value) => handleChange({ target: { name: 'due_time', value } })}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="auction_price" className="block text-sm font-medium text-gray-700">აუქციონის ფასი</label>
              <Input
                type="number"
                id="auction_price"
                name="auction_price"
                value={formData.auction_price}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="min_bid_price" className="block text-sm font-medium text-gray-700">მინიმალური ბიდი</label>
              <Input
                type="number"
                id="min_bid_price"
                name="min_bid_price"
                value={formData.min_bid_price}
                onChange={handleChange}
                required
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="buy_now" className="block text-sm font-medium text-gray-700">ახლავე ყიდვის ფასი</label>
              <Input
                type="number"
                id="buy_now"
                name="buy_now"
                value={formData.buy_now}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="ticket_information" className="block text-sm font-medium text-gray-700">ბილეთის ინფორმაცია</label>
              <Textarea
                id="ticket_information"
                name="ticket_information"
                value={formData.ticket_information}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">მთავარი სურათი</label>
              <Input
                type="file"
                id="featured_image"
                name="featured_image"
                onChange={handleChange}
                accept="image/*"
                className="mt-1 block w-full"
              />
            </div>

            <button
              type="submit"
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              განახლება
            </button>
          </form>
        </div>

        {/* Right side - Preview */}
        <div className="w-full lg:w-4/12 px-6 border-l">
          <h2 className="text-2xl font-bold mb-6">ვიზუალი</h2>
          <div id="auction-preview" className="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between">
            <div className="relative" style={{ height: '180px' }}>
              <img
                id="preview-image"
                src={formData.featured_image ? (typeof formData.featured_image === 'string' ? formData.featured_image : URL.createObjectURL(formData.featured_image)) : '/images/placeholder.jpg'}
                alt="Preview"
                className="w-full h-full object-cover rounded-xl"
              />
              <div id="preview-status" className="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-sm bg-gray-500">
                სტატუსი
              </div>
            </div>
            <div className="flex justify-between gap-6 items-center mt-4">
              <h4 id="preview-title" className="text-lg font-bold">{formData.title || 'აუქციონის სათაური'}</h4>
              <img src="/icons/heart_icon.svg" alt="heart icon" />
            </div>
            <div className="flex justify-between gap-6 items-center mt-4">
              <div className="w-1/2 flex flex-col items-start">
                <h5 className="text-black font-normal text-lg">ბილეთის ფასი</h5>
                <span id="preview-ticket-price" className="text-black font-normal text-lg">{formData.ticket_price || '0'}₾</span>
              </div>
              <div className="w-1/2 flex flex-col items-start">
                <h5 className="text-black font-normal text-lg">მიმდინარე ფასი</h5>
                <span id="preview-auction-price" className="text-black font-normal text-lg" style={{ color: '#00AEEF' }}>
                  {formData.auction_price || '0'}₾
                </span>
              </div>
            </div>
            <p className="mt-4">კატეგორია: {formData.category || 'არ არის არჩეული'}</p>
            <p>დაწყების თარიღი: {formData.start_date || 'არ არის მითითებული'}</p>
          </div>
        </div>
      </div>

      <style>{`
        .category-btn {
          padding: 10px 20px;
          margin: 5px;
          background-color: #f0f0f0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        .category-btn.active {
          background-color: #00AEEF;
          color: white;
        }
        .scrollable-content {
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          padding-right: 20px;
        }
        .scrollable-content::-webkit-scrollbar {
          width: 6px;
        }
        .scrollable-content::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .scrollable-content::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .city-btn {
          padding: 8px 16px;
          background-color: #f0f0f0;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .city-btn.active {
          background-color: #00AEEF;
          color: white;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default EditAuction;