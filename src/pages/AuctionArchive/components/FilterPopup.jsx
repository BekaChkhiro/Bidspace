import React, { useState, useRef, useEffect } from 'react';

const FilterPopup = ({ onClose, onApply, currentFilters }) => {
  const [filters, setFilters] = useState(currentFilters);
  const popupRef = useRef(null);

  // Add scroll lock effect
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleCityChange = (value) => {
    setFilters(prev => ({ ...prev, city: value }));
  };

  const handlePriceRangeChange = (type, range) => {
    setFilters(prev => ({ ...prev, [type]: { min: range.min, max: range.max } }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // Update the hasActiveFilters function to remove buyNow check
  const hasActiveFilters = () => {
    return Boolean(
      filters.city || 
      (filters.auctionPrice?.min !== undefined && filters.auctionPrice?.max !== undefined)
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
        onClick={onClose}
      />
      <button 
        onClick={onClose} 
        className="fixed left-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden 
          w-10 h-10 flex items-center justify-center bg-white rounded-full 
          shadow-lg z-50 text-black"
        style={{ bottom: '440px' }}
      >
        ✕
      </button>
      <div ref={popupRef} className="fixed md:absolute md:top-full left-0 right-0 md:left-auto 
        h-[440px] md:h-auto bottom-0 md:bottom-auto md:mt-2 p-5 
        bg-white md:rounded-2xl md:border-gray-200
        z-50 w-full md:w-1/3 
        transition-all duration-300 ease-out transform md:transform-none
        translate-y-0 md:translate-y-0 
        rounded-t-2xl md:rounded-2xl
        overflow-y-auto
        md:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:hidden">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <h2 className="text-sm font-medium">ფილტრი</h2>
        </div>

        {/* ქალაქი */}
        <div className="mb-4">
          <label className="block mb-2">ქალაქი</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'tbilisi', label: 'თბილისი' },
              { value: 'batumi', label: 'ბათუმი' },
              { value: 'kutaisi', label: 'ქუთაისი' },
              { value: 'skhva_qalaqebi', label: 'სხვა ქალაქები' },
              { value: 'sazgvargaret', label: 'საზღვარგარეთ' }
            ].map(({ value, label }) => (
              <button
                key={value}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  filters.city === value
                    ? 'bg-black text-white border-black md:text-sm text-xs'
                    : 'bg-white text-black border-gray-200 hover:border-black text-sm'
                }`}
                onClick={() => handleCityChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* აუქციონის ფასი */}
        <div className="mb-4">
          <label className="block mb-2">აუქციონის ფასი</label>
          <div className="flex flex-wrap gap-2">
            {[
              { min: 0, max: 100, label: '0 - 100' },
              { min: 100, max: 300, label: '100 - 300' },
              { min: 300, max: 600, label: '300 - 600' },
              { min: 600, max: 1000, label: '600 - 1000' },
              { min: 1000, max: Infinity, label: '1000+' }
            ].map(({ min, max, label }) => (
              <button
                key={label}
                className={`px-4 py-2 rounded-full border transition-colors ${
                  filters.auctionPrice?.min === min && filters.auctionPrice?.max === max
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-200 hover:border-black'
                }`}
                onClick={() => handlePriceRangeChange('auctionPrice', { min, max })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 md:mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 
                    hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            გაუქმება
          </button>
          <button
            onClick={hasActiveFilters() ? handleApply : undefined}
            disabled={!hasActiveFilters()}
            className={`flex-1 px-4 py-2.5 text-sm rounded-xl text-white transition-colors duration-200 font-medium
                      ${hasActiveFilters() 
                        ? 'bg-gray-900 hover:bg-black cursor-pointer' 
                        : 'bg-gray-300 cursor-not-allowed'}`}
          >
            არჩევა
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterPopup;