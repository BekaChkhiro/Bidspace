import React, { useState, useEffect } from 'react';
import filterIcon from '../../../components/assets/icons/auction/filter.svg';

const AuctionArchiveMainFilter = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  // ფილტრების საწყისი მნიშვნელობის წაკითხვა localStorage-დან
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('auctionFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      categories: [],
      city: '',
      auctionPrice: {
        min: '',
        max: ''
      },
      instantPrice: {
        min: '',
        max: ''
      }
    };
  });

  // ფილტრების შენახვა localStorage-ში როცა იცვლება
  useEffect(() => {
    localStorage.setItem('auctionFilters', JSON.stringify(filters));
  }, [filters]);

  // გაუქმების ფუნქცია - localStorage-დან წაშლა
  const handleReset = () => {
    localStorage.removeItem('auctionFilters');
    setFilters({
      categories: [],
      city: '',
      auctionPrice: {
        min: '',
        max: ''
      },
      instantPrice: {
        min: '',
        max: ''
      }
    });
    setIsOpen(false);
  };

  // დავამატოთ ფილტრაციის ფუნქცია
  const handleFilter = () => {
    console.log('Sending filters:', filters); // დებაგისთვის
    onFilterChange(filters);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div 
        className='w-40 flex justify-center items-center gap-2 bg-white rounded-full p-2 cursor-pointer'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>ფილტრი</span>
        <img src={filterIcon} alt='Filter Icon' />
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 p-6 bg-white rounded-lg shadow-lg w-[800px] z-50 transition-all duration-200 ease-in-out animate-slideDown">
          <div className="grid grid-cols-2 gap-8">
            {/* კატეგორია */}
            <div>
              <h3 className="font-medium mb-4">კატეგორია</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'teatri-kino', label: 'თეატრი-კინო' },
                  { value: 'iventebi', label: 'ივენთები' },
                  { value: 'sporti', label: 'სპორტი' },
                  { value: 'mogzauroba', label: 'მოგზაურობა' },
                  { value: 'vip', label: 'VIP' },
                  { value: 'yvela-auqcioni', label: 'ყველა აუქციონი' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    className={`px-4 py-2 rounded-full border transition-colors ${
                      filters.categories.includes(value)
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        categories: prev.categories.includes(value)
                          ? prev.categories.filter(c => c !== value)
                          : [...prev.categories, value]
                      }));
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ფალაქი */}
            <div>
              <h3 className="font-medium mb-4">ქალაქი</h3>
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
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-200 hover:border-black'
                    }`}
                    onClick={() => setFilters(prev => ({ ...prev, city: value }))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* ფასების რეინჯი */}
            <div className="col-span-2 space-y-4">
              <div>
                <h3 className="font-medium mb-4">აუქციონის ფასი</h3>
                <div className="flex gap-4">
                  <input 
                    type="number" 
                    placeholder="მინ." 
                    className="border rounded p-2 w-full"
                    value={filters.auctionPrice.min}
                    onChange={(e) => setFilters(prev => ({ ...prev, auctionPrice: { ...prev.auctionPrice, min: e.target.value } }))}
                  />
                  <input 
                    type="number" 
                    placeholder="მაქს." 
                    className="border rounded p-2 w-full"
                    value={filters.auctionPrice.max}
                    onChange={(e) => setFilters(prev => ({ ...prev, auctionPrice: { ...prev.auctionPrice, max: e.target.value } }))}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-4">მომენტალურად შესყიდვის ფასი</h3>
                <div className="flex gap-4">
                  <input 
                    type="number" 
                    placeholder="მინ." 
                    className="border rounded p-2 w-full"
                    value={filters.instantPrice.min}
                    onChange={(e) => setFilters(prev => ({ ...prev, instantPrice: { ...prev.instantPrice, min: e.target.value } }))}
                  />
                  <input 
                    type="number" 
                    placeholder="მაქს." 
                    className="border rounded p-2 w-full"
                    value={filters.instantPrice.max}
                    onChange={(e) => setFilters(prev => ({ ...prev, instantPrice: { ...prev.instantPrice, max: e.target.value } }))}
                  />
                </div>
              </div>
            </div>

            {/* ღილაკები */}
            <div className="col-span-2 flex gap-4 mt-4">
              <button className="w-1/2 py-2 bg-gray-200 rounded-lg" onClick={handleReset}>გაუქმება</button>
              <button 
                className="w-1/2 py-2 bg-black text-white rounded-lg" 
                onClick={handleFilter}
              >
                ფილტრი
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionArchiveMainFilter;
