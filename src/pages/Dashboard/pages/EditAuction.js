import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { DateTimePicker } from '../../../components/ui/date-time-picker';
import mainLogo from '../../../images/bidspace_logo.png';

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
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
  const [showOtherCity, setShowOtherCity] = useState(false);
  const [showSazgvargaret, setShowSazgvargaret] = useState(false);

  useEffect(() => {
    fetchAuctionData();
  }, [id]);

  useEffect(() => {
    // Set initial states for city and category selections
    if (formData.city) {
      setShowOtherCity(formData.city === 'skhva_qalaqebi');
      setShowSazgvargaret(formData.city === 'sazgvargaret');
    }
  }, [formData.city]);

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
      <div key={field} className="mt-4">
        <label htmlFor={field} className="block text-sm font-medium text-gray-700">
          {field === 'hall' ? 'დარბაზი' : 
           field === 'row' ? 'რიგი' :
           field === 'place' ? 'ადგილი' :
           field === 'sector' ? 'სექტორი' : field}
        </label>
        <Input
          id={field}
          name={field}
          value={formData[field]}
          onChange={handleChange}
          required
          className="mt-1 block w-full"
        />
      </div>
    ));
  };

  const updatePreview = () => {
    return {
      title: formData.title || 'აუქციონის სათაური',
      category: formData.category || 'არ არის არჩეული',
      startDate: formData.start_date || 'არ არის მითითებული',
      ticketPrice: formData.ticket_price || '0',
      auctionPrice: formData.auction_price || '0',
      image: formData.featured_image ? 
        (typeof formData.featured_image === 'string' ? formData.featured_image : URL.createObjectURL(formData.featured_image)) 
        : '/images/placeholder.jpg'
    };
  };

  const preview = updatePreview();

  const fetchAuctionData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/wp-json/wp/v2/auction/${id}`, {
        headers: {
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (!response.ok) {
        throw new Error('აუქციონის მონაცემების ჩატვირთვა ვერ მოხერხდა');
      }

      const data = await response.json();

      if (!data || data.author !== user?.id) {
        navigate('/dashboard/my-auctions');
        throw new Error('თქვენ არ გაქვთ ამ აუქციონის რედაქტირების უფლება');
      }

      // Fetch featured image if exists
      let featured_image = null;
      if (data.featured_media) {
        const mediaResponse = await fetch(`/wp-json/wp/v2/media/${data.featured_media}`);
        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          featured_image = mediaData.source_url;
        }
      }

      // Ensure category and ticket_category are set correctly
      const category = data.meta.category || data.meta.ticket_category;
      
      setFormData({
        title: data.title.rendered || '',
        category: category || '',
        ticket_category: category || '',
        start_date: data.meta.start_date || '',
        city: data.meta.city || '',
        ticket_price: data.meta.ticket_price || '',
        ticket_quantity: data.meta.ticket_quantity || '',
        hall: data.meta.hall || '',
        row: data.meta.row || '',
        place: data.meta.place || '',
        sector: data.meta.sector || '',
        start_time: data.meta.start_time || '',
        due_time: data.meta.due_time || '',
        auction_price: data.meta.auction_price || '',
        buy_now: data.meta.buy_now || '',
        min_bid_price: data.meta.min_bid_price || '',
        ticket_information: data.meta.ticket_information || '',
        skhva_qalaqebi: data.meta.skhva_qalaqebi || '',
        sazgvargaret: data.meta.sazgvargaret || '',
        featured_image: featured_image
      });

      // Set city-specific states
      setShowOtherCity(data.meta.city === 'skhva_qalaqebi');
      setShowSazgvargaret(data.meta.city === 'sazgvargaret');
    } catch (error) {
      setError(error.message);
      console.error('Error fetching auction:', error);
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
    setUnsavedChanges(true);
    setError(null);
  };

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

  const validateForm = () => {
    const errors = [];
    
    // Required fields validation
    const requiredFields = {
      title: 'სათაური',
      category: 'კატეგორია',
      start_date: 'დაწყების თარიღი',
      city: 'ქალაქი',
      ticket_price: 'ბილეთის ფასი',
      ticket_quantity: 'ბილეთების რაოდენობა',
      start_time: 'დაწყების დრო',
      due_time: 'დასრულების დრო',
      auction_price: 'აუქციონის ფასი',
      min_bid_price: 'მინიმალური ბიდი',
      ticket_information: 'ბილეთის ინფორმაცია'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors.push(`${label} სავალდებულოა`);
      }
    });

    // Category-specific validation
    if (formData.category === 'თეატრი-კინო' || formData.category === 'მოგზაურობა') {
      if (!formData.hall?.trim()) errors.push('დარბაზი სავალდებულოა');
      if (!formData.row?.trim()) errors.push('რიგი სავალდებულოა');
      if (!formData.place?.trim()) errors.push('ადგილი სავალდებულოა');
    } else if (formData.category === 'სპორტი') {
      if (!formData.sector?.trim()) errors.push('სექტორი სავალდებულოა');
      if (!formData.row?.trim()) errors.push('რიგი სავალდებულოა');
      if (!formData.place?.trim()) errors.push('ადგილი სავალდებულოა');
    }

    // City validation
    if (formData.city === 'skhva_qalaqebi' && !formData.skhva_qalaqebi?.trim()) {
      errors.push('გთხოვთ მიუთითოთ ქალაქი');
    }
    if (formData.city === 'sazgvargaret' && !formData.sazgvargaret?.trim()) {
      errors.push('გთხოვთ მიუთითოთ ქვეყანა');
    }

    // Price validation
    const prices = {
      ticket_price: parseFloat(formData.ticket_price),
      auction_price: parseFloat(formData.auction_price),
      min_bid_price: parseFloat(formData.min_bid_price),
      buy_now: parseFloat(formData.buy_now)
    };

    if (isNaN(prices.ticket_price) || prices.ticket_price <= 0) {
      errors.push('ბილეთის ფასი უნდა იყოს დადებითი რიცხვი');
    }
    if (isNaN(prices.auction_price) || prices.auction_price <= 0) {
      errors.push('აუქციონის ფასი უნდა იყოს დადებითი რიცხვი');
    }
    if (isNaN(prices.min_bid_price) || prices.min_bid_price <= 0) {
      errors.push('მინიმალური ბიდი უნდა იყოს დადებითი რიცხვი');
    }
    if (prices.min_bid_price >= prices.auction_price) {
      errors.push('მინიმალური ბიდი უნდა იყოს აუქციონის ფასზე ნაკლები');
    }
    if (prices.buy_now && prices.buy_now <= prices.auction_price) {
      errors.push('ახლავე ყიდვის ფასი უნდა იყოს აუქციონის ფასზე მეტი');
    }
    if (prices.auction_price <= prices.ticket_price) {
      errors.push('აუქციონის ფასი უნდა იყოს ბილეთის ფასზე მეტი');
    }

    // Date validation
    const startTime = new Date(formData.start_time);
    const dueTime = new Date(formData.due_time);
    const now = new Date('2024-12-19T19:05:37+04:00');

    if (startTime < now) {
      errors.push('დაწყების დრო უნდა იყოს მომავალში');
    }
    if (dueTime <= startTime) {
      errors.push('დასრულების დრო უნდა იყოს დაწყების დროზე გვიან');
    }

    // Ticket quantity validation
    const ticketQty = parseInt(formData.ticket_quantity);
    if (isNaN(ticketQty) || ticketQty <= 0) {
      errors.push('ბილეთების რაოდენობა უნდა იყოს დადებითი რიცხვი');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    
    if (errors.length > 0) {
      setError(errors);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Create FormData object
      const postData = new FormData();
      
      // Add content and title
      postData.append('title', formData.title);
      postData.append('content', formData.ticket_information || '');
      postData.append('status', 'publish');

      // Add all meta fields
      const metaFields = {
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
        skhva_qalaqebi: formData.skhva_qalaqebi,
        sazgvargaret: formData.sazgvargaret
      };

      // Append each meta field individually
      Object.entries(metaFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          postData.append(`meta[${key}]`, value.toString());
        }
      });

      // Handle featured image
      if (formData.featured_image instanceof File) {
        postData.append('featured_media', formData.featured_image);
      }

      console.log('Submitting auction update with data:', Object.fromEntries(postData));

      const response = await fetch(`/wp-json/wp/v2/auction/${id}`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': wpApiSettings.nonce,
        },
        body: postData
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', responseData);
        throw new Error(responseData.message || 'შეცდომა აუქციონის განახლებისას');
      }

      console.log('Success response:', responseData);

      if (responseData.id) {
        // Refetch the auction data to ensure we have the latest version
        await fetchAuctionData();
        
        setSuccessMessage(
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <h2 className="text-2xl font-bold mt-4 mb-2">წარმატებით განახლდა!</h2>
              <p className="text-gray-600 mb-6">თქვენი აუქციონი წარმატებით განახლდა</p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => {
                    window.location.reload();
                    window.location.href = `/auction/${id}`;
                  }} 
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                >
                  ნახეთ აუქციონი
                </button>
                <button 
                  onClick={() => {
                    window.location.reload();
                    window.location.href = '/dashboard/my-auctions';
                  }} 
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                >
                  ჩემი აუქციონები
                </button>
              </div>
            </div>
          </div>
        );
        setUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error updating auction:', error);
      setError([error.message]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AEEF]"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-row -mx-3 justify-between gap-6 h-full">
        {/* Left side - Form */}
        <div className="w-full lg:w-8/12 px-3 h-[80vh] overflow-y-auto pr-5">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">კატეგორია</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {['თეატრი-კინო', 'ივენთები', 'სპორტი', 'მოგზაურობა'].map(category => (
                  <button
                    key={category}
                    type="button"
                    className={`p-4 border-2 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                      formData.category === category 
                      ? 'bg-[#00AEEF] border-[#00AEEF] text-white' 
                      : 'border-gray-200 text-gray-700 hover:border-[#00AEEF] hover:text-[#00AEEF]'
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {renderCategorySpecificFields()}

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
              <label className="block text-sm font-medium text-gray-700 mb-2">ქალაქი</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'tbilisi', label: 'თბილისი' },
                  { value: 'batumi', label: 'ბათუმი' },
                  { value: 'kutaisi', label: 'ქუთაისი' },
                  { value: 'skhva_qalaqebi', label: 'სხვა ქალაქები' },
                  { value: 'sazgvargaret', label: 'საზღვარგარეთ' }
                ].map(city => (
                  <button
                    key={city.value}
                    type="button"
                    className={`px-4 py-2 rounded-md transition-all duration-300 ${
                      formData.city === city.value 
                      ? 'bg-[#00AEEF] text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleCitySelect(city.value)}
                  >
                    {city.label}
                  </button>
                ))}
              </div>

              {showOtherCity && (
                <Input
                  id="skhva_qalaqebi"
                  name="skhva_qalaqebi"
                  value={formData.skhva_qalaqebi}
                  onChange={handleChange}
                  placeholder="ჩაწერეთ ქალაქი"
                  className="mt-2"
                />
              )}

              {showSazgvargaret && (
                <Input
                  id="sazgvargaret"
                  name="sazgvargaret"
                  value={formData.sazgvargaret}
                  onChange={handleChange}
                  placeholder="ჩაწერეთ ქვეყანა"
                  className="mt-2"
                />
              )}
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

            <div className="mt-4">
              <label htmlFor="featured_image" className="block text-sm font-medium text-gray-700">მთავარი სურათი</label>
              {formData.featured_image ? (
                <div className="mt-2 relative">
                  <img
                    src={typeof formData.featured_image === 'string' ? formData.featured_image : URL.createObjectURL(formData.featured_image)}
                    alt={formData.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, featured_image: null }));
                      setUnsavedChanges(true);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <label
                    htmlFor="featured_image"
                    className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-[#00AEEF] transition-colors duration-200"
                  >
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-600">სურათის ატვირთვა</span>
                    </div>
                    <Input
                      type="file"
                      id="featured_image"
                      name="featured_image"
                      onChange={(e) => {
                        handleChange(e);
                        setUnsavedChanges(true);
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className={`mt-4 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white transition-colors duration-200 ${
                saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#00AEEF] hover:bg-[#0096cc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00AEEF]'
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ინახება...
                </>
              ) : 'განახლება'}
            </button>
          </form>
        </div>

        {/* Right side - Preview */}
        <div className="w-full lg:w-4/12 px-6 border-l">
          <h2 className="text-2xl font-bold mb-6">აუქციონის დეტალები</h2>
          <div className="bg-white rounded-2xl p-4 shadow-lg flex flex-col justify-between sticky top-0">
            <div className="relative h-[180px]">
              {formData.featured_image ? (
                <img
                  src={typeof formData.featured_image === 'string' ? formData.featured_image : URL.createObjectURL(formData.featured_image)}
                  alt={formData.title}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
                  <img
                    src={mainLogo}
                    alt="Bidspace Logo"
                    className="w-32 opacity-50"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between gap-6 items-center mt-4">
              <h4 className="text-lg font-bold">{formData.title || 'აუქციონის სათაური'}</h4>
            </div>
            <div className="flex justify-between gap-6 items-center mt-4">
              <div className="w-1/2 flex flex-col items-start">
                <h5 className="text-black font-normal text-lg">ბილეთის ფასი</h5>
                <span className="text-black font-normal text-lg">{formData.ticket_price || '0'}₾</span>
              </div>
              <div className="w-1/2 flex flex-col items-start">
                <h5 className="text-black font-normal text-lg">მიმდინარე ფასი</h5>
                <span className="text-black font-normal text-lg" style={{ color: '#00AEEF' }}>
                  {formData.auction_price || '0'}₾
                </span>
              </div>
            </div>
            <p className="mt-4">კატეგორია: {formData.category || 'არ არის არჩეული'}</p>
            <p>დაწყების თარიღი: {formData.start_date || 'არ არის მითითებული'}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditAuction;