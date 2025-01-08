import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
} from '../../../components/dropdown-menu';
import '../styles/sidebar.css';

const AuctionDetailsSidebar = ({ auction, onClose }) => {
  if (!auction) return null;

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
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={onClose}
        />
      </CSSTransition>

      <CSSTransition
        in={true}
        appear={true}
        timeout={300}
        classNames="sidebar"
        unmountOnExit
      >
        <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-xl z-50">
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">აუქციონის დეტალები</h2>
                <button 
                  onClick={onClose} 
                  className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Featured Image */}
                {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={auction._embedded['wp:featuredmedia'][0].source_url}
                      alt={auction.title.rendered}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}

                {/* Title */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">სათაური</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">{auction.title.rendered}</p>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">სტატუსი</h3>
                  <div className="mt-1">
                    {getAuctionStatus(auction)}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">საწყისი ფასი</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">₾{auction.meta.auction_price}</p>
                </div>

                {/* Dates */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">დაწყების დრო</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(auction.meta.start_time).toLocaleString('ka-GE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">დასრულების დრო</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(auction.meta.due_time).toLocaleString('ka-GE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {auction.content && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">აღწერა</h3>
                    <div 
                      className="mt-2 prose prose-sm max-w-none text-gray-900" 
                      dangerouslySetInnerHTML={{ __html: auction.content.rendered }} 
                    />
                  </div>
                )}

                {/* Meta Information */}
                {auction.meta && Object.entries(auction.meta)
                  .filter(([key]) => !['auction_price', 'start_time', 'due_time'].includes(key))
                  .map(([key, value]) => (
                    <div key={key}>
                      <h3 className="text-sm font-medium text-gray-500">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      <p className="mt-1 text-sm text-gray-900">{value}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  );
};

const EditAuctionSidebar = ({ auction, onClose }) => {
  if (!auction) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      alert('აუქციონის განახლება ვერ მოხერხდა');
    }
  };

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
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => onClose(false)}
        />
      </CSSTransition>
      
      <CSSTransition
        in={true}
        appear={true}
        timeout={300}
        classNames="sidebar"
        unmountOnExit
      >
        <div className="fixed inset-y-0 left-0 w-[600px] bg-white shadow-2xl z-50">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b bg-white sticky top-0 z-10 shadow-sm">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">აუქციონის რედაქტირება</h2>
                <p className="mt-1 text-sm text-gray-500 flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                  ID: #{auction.id}
                </p>
              </div>
              <button 
                onClick={() => onClose(false)}
                className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
              >
                <svg 
                  className="w-6 h-6 text-gray-500" 
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
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="px-8 py-6 space-y-10">
                  {/* Featured Image Section */}
                  {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                    <div className="relative aspect-w-16 aspect-h-9 bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                      <img 
                        src={auction._embedded['wp:featuredmedia'][0].source_url}
                        alt={auction.title.rendered}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  )}

                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h4 className="text-lg font-semibold text-gray-900">ძირითადი ინფორმაცია</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">შეავსეთ აუქციონის ძირითადი დეტალები</p>
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
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
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
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
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
                  <div className="space-y-6">
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
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
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400"
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
                  <div className="space-y-6">
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
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <h4 className="text-lg font-semibold text-gray-900">მომხმარებლის ინფორმაცია</h4>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">აუქციონის გამომქვეყნებელი მომხმარებლის დეტალები</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      {/* User Avatar and Name */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{auction.author_name || 'უცნობი მომხმარებელი'}</h5>
                          <p className="text-sm text-gray-500">ID: {auction.author}</p>
                        </div>
                      </div>

                      {/* User Details Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">ელ-ფოსტა</label>
                          <p className="mt-1 text-sm text-gray-900">{auction.author_email || 'არ არის მითითებული'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">ტელეფონი</label>
                          <p className="mt-1 text-sm text-gray-900">{auction.author_phone || 'არ არის მითითებული'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">რეგისტრაციის თარიღი</label>
                          <p className="mt-1 text-sm text-gray-900">
                            {auction.author_registered 
                              ? new Date(auction.author_registered).toLocaleDateString('ka-GE')
                              : 'არ არის მითითებული'
                            }
                          </p>
                        </div>
                        <div>
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
                          className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          onClick={() => {/* Handle view profile */}}
                        >
                          <svg className="w-4 h-4 mr-2 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="relative top-px">პროფილის ნახვა</span>
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                          onClick={() => {/* Handle send message */}}
                        >
                          <svg className="w-4 h-4 mr-2 transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span className="relative top-px">შეტყობინების გაგზავნა</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="sticky bottom-0 bg-white border-t px-8 py-4 shadow-lg">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-blue-600 text-white text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[0.99] active:scale-[0.97]"
                  >
                    შენახვა
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  );
};

const Auctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/wp-json/wp/v2/auction/?per_page=100&_embed');
      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }
      const data = await response.json();
      setAuctions(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('ნამდვილად გსურთ აუქციონის წაშლა?')) {
      return;
    }

    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${auctionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete auction');
      }

      setAuctions(auctions.filter(auction => auction.id !== auctionId));
    } catch (error) {
      console.error('Error deleting auction:', error);
      alert('აუქციონის წაშლა ვერ მოხერხდა');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ka-GE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const startTime = new Date(auction.meta.start_time);
    const dueTime = new Date(auction.meta.due_time);

    if (now < startTime) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        დაგეგმილი
      </span>;
    } else if (now >= startTime && now <= dueTime) {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        აქტიური
      </span>;
    } else {
      return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
        დასრულებული
      </span>;
    }
  };

  const filteredAuctions = auctions.filter(auction => 
    auction?.title?.rendered?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">აუქციონები</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="ძებნა..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md"
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
            {filteredAuctions.map((auction) => (
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
                  {getAuctionStatus(auction)}
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
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-50 text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200 mr-2"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    რედაქტირება
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAuction(auction);
                      setIsSidebarOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-50 text-gray-600 rounded-md hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 border border-gray-200 mr-2 group relative"
                  >
                    <svg className="w-4 h-4 mr-1.5 transition-colors duration-200 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="relative top-px">ნახვა</span>
                  </button>
                  <button
                    onClick={() => handleDeleteAuction(auction.id)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-gray-50 text-gray-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-all duration-200 border border-gray-200"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    წაშლა
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isSidebarOpen && (
        <AuctionDetailsSidebar
          auction={selectedAuction}
          onClose={() => {
            setIsSidebarOpen(false);
            setSelectedAuction(null);
          }}
        />
      )}

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
