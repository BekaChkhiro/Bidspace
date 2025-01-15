import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import BasicInformation from './editAuctions/BasicInformation';
import PriceInformation from './editAuctions/PriceInformation';
import TimeInformation from './editAuctions/TimeInformation';
import AdditionalInformation from './editAuctions/AdditionalInformation';
import UserInformation from './editAuctions/UserInformation';
import MessageBox from './editAuctions/MessageBox';

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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
        <aside className="fixed inset-y-0 left-0 w-full sm:w-[450px] lg:w-1/3 max-w-1/3 bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header - Improved mobile spacing */}
          <div className="flex items-center justify-between px-3 sm:px-6 lg:px-8 py-3 sm:py-6 border-b bg-gradient-to-r from-white via-gray-50/80 to-gray-100/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 truncate">
                აუქციონის დეტალები
              </h2>
              <div className="mt-1 sm:mt-2 flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                <p className="text-gray-500 flex items-center truncate">
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1 sm:mr-2 animate-[pulse_1.5s_ease-in-out_infinite]"></span>
                  ID: #{auction.id}
                </p>
                <span className="text-gray-300 hidden sm:inline">|</span>
                <p className="text-gray-500 truncate">
                  {auction.meta.start_time}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onClose(false)}
              className="p-2 -mr-1 sm:p-2.5 hover:bg-gray-100/80 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 hover:rotate-90"
              aria-label="Close sidebar"
            >
              <svg 
                className="w-5 h-5 sm:w-5 sm:h-5 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Improved mobile scrolling and spacing */}
          <div className="flex-1 overflow-y-auto sidebar-content overscroll-contain">
            <form onSubmit={handleSubmit} className="h-full">
              <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6 lg:space-y-8">
                {/* Featured Image Section - Improved mobile view */}
                {auction._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                  <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-sm group hover:shadow-lg transition-all duration-300" 
                       style={{ maxHeight: '180px', minHeight: '120px' }}>
                    <img 
                      src={auction._embedded['wp:featuredmedia'][0].source_url}
                      alt={auction.title.rendered}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 translate-y-0 sm:translate-y-2 sm:group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-white text-base sm:text-lg font-medium truncate text-shadow-sm">{auction.title.rendered}</h3>
                      <p className="text-gray-200 text-xs sm:text-sm mt-0.5 sm:mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 delay-100">{auction.meta.category}</p>
                    </div>
                  </div>
                )}

                <BasicInformation 
                  formData={formData}
                  setFormData={setFormData}
                  handleCategorySelect={handleCategorySelect}
                  handleCitySelect={handleCitySelect}
                  showOtherCity={showOtherCity}
                  showSazgvargaret={showSazgvargaret}
                  renderCategorySpecificFields={renderCategorySpecificFields}
                />

                <PriceInformation 
                  formData={formData}
                  setFormData={setFormData}
                />

                <TimeInformation 
                  formData={formData}
                  setFormData={setFormData}
                />

                <AdditionalInformation 
                  formData={formData}
                  setFormData={setFormData}
                />

                <UserInformation 
                  auction={auction}
                  setShowMessageBox={setShowMessageBox}
                />

                <MessageBox 
                  showMessageBox={showMessageBox}
                  setShowMessageBox={setShowMessageBox}
                  message={message}
                  setMessage={setMessage}
                />
              </div>

              {/* Submit Button - Improved mobile layout */}
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/90 border-t backdrop-blur-sm px-3 sm:px-6 lg:px-8 py-3 sm:py-4 mt-4 sm:mt-6">
                <div className="flex gap-2 sm:gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-500 text-white text-sm sm:text-base font-medium rounded-lg hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 active:scale-[0.98]"
                  >
                    დადასტურება
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-50 to-red-50/80 text-red-600 text-sm sm:text-base font-medium rounded-lg hover:from-red-100 hover:to-red-100/80 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 active:scale-[0.98]"
                  >
                    წაშლა
                  </button>
                </div>
              </div>
            </form>
          </div>
        </aside>
      </CSSTransition>
    </>
  );
};

export default EditAuctionSidebar;