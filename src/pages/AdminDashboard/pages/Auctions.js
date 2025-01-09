import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
} from '../../../components/dropdown-menu';
import '../styles/sidebar.css';

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

// Error Message Component
const ErrorMessage = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
    <strong className="font-bold">შეცდომა!</strong>
    <span className="block sm:inline"> {message}</span>
  </div>
);

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
};

// Search Input Component
const SearchInput = ({ value, onChange }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="ძებნა..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
    <svg
      className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  </div>
);

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

// Status Badge Component
const StatusBadge = ({ startTime, dueTime }) => {
  const now = new Date();
  const start = new Date(startTime);
  const due = new Date(dueTime);

  if (now < start) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        დაგეგმილი
      </span>
    );
  } else if (now >= start && now <= due) {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        აქტიური
      </span>
    );
  } else {
    return (
      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
        დასრულებული
      </span>
    );
  }
};

StatusBadge.propTypes = {
  startTime: PropTypes.string.isRequired,
  dueTime: PropTypes.string.isRequired,
};

const EditAuctionSidebar = ({ auction, onClose }) => {
  if (!auction) return null;

  useEffect(() => {
    // Disable scrolling when sidebar is open
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when sidebar is closed
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const [formData, setFormData] = useState({
    title: auction.title.rendered || '',
    category: auction.meta.category || '',
    ticket_category: auction.meta.ticket_category || '',
    start_date: auction.meta.start_date || '',
    city: auction.meta.city || '',
    ticket_price: auction.meta.ticket_price || '',
    ticket_quantity: auction.meta.ticket_quantity || '',
    hall: auction.meta.hall || '',
    row: auction.meta.row || '',
    place: auction.meta.place || '',
    sector: auction.meta.sector || '',
    start_time: auction.meta.start_time || '',
    due_time: auction.meta.due_time || '',
    auction_price: auction.meta.auction_price || '',
    buy_now: auction.meta.buy_now || '',
    min_bid_price: auction.meta.min_bid_price || '',
    ticket_information: auction.meta.ticket_information || '',
    skhva_qalaqebi: auction.meta.skhva_qalaqebi || '',
    sazgvargaret: auction.meta.sazgvargaret || ''
  });

  const [showOtherCity, setShowOtherCity] = useState(auction.meta.city === 'skhva_qalaqebi');
  const [showSazgvargaret, setShowSazgvargaret] = useState(auction.meta.city === 'sazgvargaret');

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCitySelect = (city) => {
    setFormData(prev => ({
      ...prev,
      city,
      skhva_qalaqebi: '',
      sazgvargaret: ''
    }));
    setShowOtherCity(city === 'skhva_qalaqebi');
    setShowSazgvargaret(city === 'sazgvargaret');
  };

  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category,
      ticket_category: category
    }));
  };

  const renderCategorySpecificFields = () => {
    if (!formData.category) return null;

    const fields = {
      'თეატრი-კინო': ['hall', 'row', 'place'],
      'სპორტი': ['sector', 'row', 'place'],
      'მოგზაურობა': ['hall', 'row', 'place']
    };

    const requiredFields = fields[formData.category] || [];
    
    return requiredFields.map(field => (
      <div key={field}>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          {field === 'hall' ? 'დარბაზი' : 
           field === 'row' ? 'რიგი' :
           field === 'place' ? 'ადგილი' :
           field === 'sector' ? 'სექტორი' : field}
        </label>
        <input
          type="text"
          value={formData[field]}
          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    ));
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.title) errors.title = 'სათაური სავალდებულოა';
    if (!data.category) errors.category = 'კატეგორია სავალდებულოა';
    if (!data.city) errors.city = 'ქალაქი სავალდებულოა';
    if (!data.ticket_price) errors.ticket_price = 'ბილეთის ფასი სავალდებულოა';
    if (!data.start_time) errors.start_time = 'დაწყების დრო სავალდებულოა';
    if (!data.due_time) errors.due_time = 'დასრულების დრო სავალდებულოა';
    return Object.keys(errors).length ? errors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validationErrors = validateForm(formData);
    if (validationErrors) {
      setError('გთხოვთ შეავსოთ ყველა სავალდებულო ველი');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${auction.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        },
        body: JSON.stringify({
          title: formData.title,
          meta: {
            category: formData.category,
            ticket_category: formData.ticket_category,
            start_date: formData.start_date,
            city: formData.city,
            ticket_price: formData.ticket_price,
            ticket_quantity: formData.ticket_quantity,
            hall: formData.hall,
            row: formData.row,
            place: formData.place,
            sector: formData.sector,
            start_time: formData.start_time,
            due_time: formData.due_time,
            auction_price: formData.auction_price,
            buy_now: formData.buy_now,
            min_bid_price: formData.min_bid_price,
            ticket_information: formData.ticket_information,
            skhva_qalaqebi: formData.skhva_qalaqebi,
            sazgvargaret: formData.sazgvargaret
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update auction');
      }

      onClose(true);
    } catch (error) {
      console.error('Error updating auction:', error);
      setError('აუქციონის განახლება ვერ მოხერხდა');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('ნამდვილად გსურთ აუქციონის წაშლა?')) {
      return;
    }

    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${auction.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete auction');
      }

      onClose(true);
    } catch (error) {
      console.error('Error deleting auction:', error);
      alert('აუქციონის წაშლა ვერ მოხერხდა');
    }
  };

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <>
      <CSSTransition
        in={true}
        appear={true}
        timeout={300}
        classNames="overlay"
        unmountOnExit
      >
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => onClose(false)}
        />
      </CSSTransition>
      
      <CSSTransition
        in={true}
        appear={true}
        timeout={300}
        classNames="sidebar-left"
        unmountOnExit
      >
        <div className="fixed inset-y-0 left-0 w-[650px] max-w-full bg-white shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b bg-gradient-to-r from-white via-gray-50/80 to-gray-100/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">აუქციონის დეტალები</h2>
              <div className="mt-2 flex items-center space-x-4">
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2 animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                  ID: #{auction.id}
                </p>
                <span className="text-gray-300">|</span>
                <p className="text-sm text-gray-500">
                  {auction.meta.start_time}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onClose(false)}
              className="p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 hover:rotate-90"
            >
              <svg 
                className="w-5 h-5 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto sidebar-content">
            <form onSubmit={handleSubmit} className="h-full">
              <div className="px-8 py-6 space-y-8">
                {/* Featured Image Section */}
                {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden shadow-sm group hover:shadow-lg transition-all duration-300" style={{ maxHeight: '200px' }}>
                    <img 
                      src={auction._embedded['wp:featuredmedia'][0].source_url}
                      alt={auction.title.rendered}
                      className="object-cover w-full h-full max-h-[200px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white text-lg font-medium truncate text-shadow-sm">{auction.title.rendered}</h3>
                      <p className="text-gray-200 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{auction.meta.category}</p>
                    </div>
                  </div>
                )}

                {/* Basic Information Section */}
                <div className="space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center space-x-2 pb-4 border-b border-gray-200">
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h4 className="text-lg font-semibold text-gray-900">ძირითადი ინფორმაცია</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        სათაური
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                        placeholder="შეიყვანეთ აუქციონის სათაური"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          კატეგორია
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => handleCategorySelect(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                        >
                          <option value="">აირჩიეთ კატეგორია</option>
                          <option value="თეატრი-კინო">თეატრი-კინო</option>
                          <option value="სპორტი">სპორტი</option>
                          <option value="მოგზაურობა">მოგზაურობა</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ქალაქი
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) => handleCitySelect(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                        >
                          <option value="">აირჩიეთ ქალაქი</option>
                          <option value="თბილისი">თბილისი</option>
                          <option value="ბათუმი">ბათუმი</option>
                          <option value="ქუთაისი">ქუთაისი</option>
                          <option value="სხვა_ქალაქები">სხვა ქალაქები</option>
                          <option value="საზღვარგარეთ">საზღვარგარეთ</option>
                        </select>
                      </div>
                    </div>

                    {showOtherCity && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          სხვა ქალაქი
                        </label>
                        <input
                          type="text"
                          value={formData.skhva_qalaqebi}
                          onChange={(e) => setFormData({...formData, skhva_qalaqebi: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                          placeholder="შეიყვანეთ ქალაქის სახელი"
                        />
                      </div>
                    )}

                    {showSazgvargaret && (
                      <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          საზღვარგარეთ
                        </label>
                        <input
                          type="text"
                          value={formData.sazgvargaret}
                          onChange={(e) => setFormData({...formData, sazgvargaret: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                          placeholder="შეიყვანეთ ქვეყნის სახელი"
                        />
                      </div>
                    )}

                    {renderCategorySpecificFields()}
                  </div>
                </div>

                {/* Price Information Section */}
                <div className="space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">ფასები</h4>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">მიუთითეთ აუქციონის ფასები</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ბილეთის ფასი
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.ticket_price}
                          onChange={(e) => setFormData({...formData, ticket_price: e.target.value})}
                          className="form-input w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                          placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ბილეთების რაოდენობა
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.ticket_quantity}
                          onChange={(e) => setFormData({...formData, ticket_quantity: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                          ცალი
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        საწყისი ფასი
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.auction_price}
                          onChange={(e) => setFormData({...formData, auction_price: e.target.value})}
                          className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                          placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ახლავე ყიდვის ფასი
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.buy_now}
                          onChange={(e) => setFormData({...formData, buy_now: e.target.value})}
                          className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                          placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        მინიმალური ბიჯი
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.min_bid_price}
                          onChange={(e) => setFormData({...formData, min_bid_price: e.target.value})}
                          className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                          placeholder="0.00"
                        />
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">₾</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Information Section */}
                <div className="space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">დრო</h4>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">მიუთითეთ აუქციონის დაწყებისა და დასრულების დრო</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        დაწყების დრო
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={formData.start_time}
                          onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                          className="form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        დასრულების დრო
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={formData.due_time}
                          onChange={(e) => setFormData({...formData, due_time: e.target.value})}
                          className="form-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-6 bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-900">დამატებითი ინფორმაცია</h4>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">მიუთითეთ ბილეთის შესახებ დამატებითი ინფორმაცია</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ბილეთის ინფორმაცია
                    </label>
                    <textarea
                      value={formData.ticket_information}
                      onChange={(e) => setFormData({...formData, ticket_information: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400 resize-none"
                      placeholder="შეიყვანეთ დამატებითი ინფორმაცია ბილეთის შესახებ..."
                    />
                  </div>
                </div>

                {/* User Information Section */}
                <div className="space-y-6 border-t border-gray-200 pt-8 mt-8">
                  <div className="pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">მომხმარებლის ინფორმაცია</h4>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">აუქციონის გამომქვეყნებელი მომხმარებლის დეტალები</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50/80 to-white/80 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-gray-100/80 shadow-sm">
                    {/* User Avatar and Name */}
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
                        <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 text-lg">{auction.author_name || 'უცნობი მომხმარებელი'}</h5>
                        <p className="text-sm text-gray-500 mt-0.5">ID: {auction.author}</p>
                      </div>
                    </div>

                    {/* User Details Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">ელ-ფოსტა</label>
                        <p className="mt-1 text-sm text-gray-900">{auction.author_email || 'არ არის მითითებული'}</p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">ტელეფონი</label>
                        <p className="mt-1 text-sm text-gray-900">{auction.author_phone || 'არ არის მითითებული'}</p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">რეგისტრაციის თარიღი</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {auction.author_registered 
                            ? new Date(auction.author_registered).toLocaleDateString('ka-GE')
                            : 'არ არის მითითებული'
                          }
                        </p>
                      </div>
                      <div className="bg-white/60 p-4 rounded-xl border border-gray-100">
                        <label className="block text-sm font-medium text-gray-500">სტატუსი</label>
                        <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          აქტიური
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => {/* Handle view profile */}}
                      >
                        <svg className="w-4 h-4 mr-2 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        პროფილის ნახვა
                      </button>
                      <button
                        type="button"
                        className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        onClick={() => setShowMessageBox(!showMessageBox)}
                      >
                        <svg className="w-4 h-4 mr-2 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        შეტყობინების გაგზავნა
                      </button>
                    </div>

                    {/* Message Box */}
                    <CSSTransition
                      in={showMessageBox}
                      timeout={300}
                      classNames={{
                        enter: 'transition-all duration-300 ease-out',
                        enterFrom: 'opacity-0 transform -translate-y-2',
                        enterTo: 'opacity-100 transform translate-y-0',
                        leave: 'transition-all duration-200 ease-in',
                        leaveFrom: 'opacity-100 transform translate-y-0',
                        leaveTo: 'opacity-0 transform -translate-y-2'
                      }}
                      unmountOnExit
                    >
                      <div className="mt-4 animate-fadeIn">
                        <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                              </svg>
                              <h6 className="text-sm font-medium text-gray-900">შეტყობინების გაგზავნა</h6>
                            </div>
                            <button
                              onClick={() => setShowMessageBox(false)}
                              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            >
                              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="relative">
                            <textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="დაწერეთ შეტყობინება..."
                              rows={4}
                              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400 resize-none text-sm bg-white/80"
                            />
                            <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-br from-transparent to-white/5"></div>
                          </div>
                          <div className="mt-3 flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => setShowMessageBox(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                            >
                              გაუქმება
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-[0.98] active:scale-[0.97]"
                              onClick={() => {
                                // Handle message send
                                setMessage('');
                                setShowMessageBox(false);
                              }}
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              გაგზავნა
                            </button>
                          </div>
                        </div>
                      </div>
                    </CSSTransition>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/90 border-t backdrop-blur-sm px-8 py-4 mt-8">
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white text-base font-medium rounded-xl hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[0.99] active:scale-[0.97] shadow-lg hover:shadow-xl relative overflow-hidden group"
                  >
                    <span className="relative z-10">დადასტურება</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-green-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></div>
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 py-3 bg-gradient-to-r from-red-50 to-red-50/80 text-red-600 text-base font-medium rounded-xl hover:from-red-100 hover:to-red-100/80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[0.99] active:scale-[0.97] border border-red-200 hover:border-red-300 relative overflow-hidden group"
                  >
                    <span className="relative z-10">წაშლა</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-100/80 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"></div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CSSTransition>
    </>
  );
};

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const auctionsPerPage = 10;

  // Filter auctions based on search term
  const filteredAuctions = auctions.filter(auction => 
    auction.title.rendered.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current auctions for pagination
  const indexOfLastAuction = currentPage * auctionsPerPage;
  const indexOfFirstAuction = indexOfLastAuction - auctionsPerPage;
  const currentAuctions = filteredAuctions.slice(indexOfFirstAuction, indexOfLastAuction);
  const totalPages = Math.ceil(filteredAuctions.length / auctionsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ka-GE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      console.error('Date formatting error:', e);
      return dateString;
    }
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/wp-json/wp/v2/auction/?per_page=100&_embed');
      
      if (!response.ok) {
        throw new Error('აუქციონების ჩატვირთვა ვერ მოხერხდა');
      }
      
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">აუქციონები</h2>
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                აუქციონი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                სტატუსი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ფასი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                თარიღი
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                მოქმედება
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentAuctions.map((auction) => (
              <tr key={auction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-md overflow-hidden">
                      {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                        <img 
                          src={auction._embedded['wp:featuredmedia'][0].source_url}
                          alt={auction.title.rendered}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {auction.title.rendered}
                      </div>
                      <div className="text-sm text-gray-500">ID: #{auction.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge startTime={auction.meta.start_time} dueTime={auction.meta.due_time} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ₾{auction.meta.auction_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(auction.meta.start_time)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedAuction(auction);
                      setIsEditSidebarOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-50 text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    ნახვა
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              წინა
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              შემდეგი
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                ნაჩვენებია <span className="font-medium">{indexOfFirstAuction + 1}</span> - <span className="font-medium">
                  {Math.min(indexOfLastAuction, filteredAuctions.length)}
                </span> / <span className="font-medium">{filteredAuctions.length}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => paginate(index + 1)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === index + 1
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                    currentPage === totalPages ? 'cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {isEditSidebarOpen && (
        <EditAuctionSidebar
          auction={selectedAuction}
          onClose={(wasUpdated) => {
            setIsEditSidebarOpen(false);
            setSelectedAuction(null);
            if (wasUpdated) {
              fetchAuctions();
            }
          }}
        />
      )}
    </div>
  );
};

export default Auctions;
