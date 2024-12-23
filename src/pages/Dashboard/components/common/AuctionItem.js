import React from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaUndo } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../context/AuthContext';
import MapIcon from '../../../../icons/auction/location.svg';
import DateIcon from '../../../../icons/auction/date_icon.svg';
import EditIcon from '../../../../assets/icons/dashboard/edit-icon.svg';

const AuctionItem = ({ 
  auction, 
  status, 
  onDeleteClick,
  editLink,
  editText = 'რედაქტირება',
  showStatus = true,
  isArchived = false,
  onRestoreClick,
}) => {
  const renderActions = () => {
    if (isArchived) {
      return (
        <button 
          onClick={() => onRestoreClick(auction.id)}
          className="text-white bg-[#00AEEF] flex items-center gap-2 p-2 rounded-xl"
        >
          <FaUndo className="w-4 h-4" />
          აღდგენა
        </button>
      );
    }

    return (
      <>
        <Link 
          to={editLink || `/dashboard/edit-auction/${auction.id}`}
          className="text-white bg-[#00AEEF] flex items-center gap-2 p-2 rounded-xl"
        >
          <img src={EditIcon} className='w-5 h-5' alt="edit icon" />
          {editText}
        </Link>
        <button 
          onClick={() => onDeleteClick(auction.id)}
          className="text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 p-2 rounded-xl"
        >
          <FaTrash className="w-4 h-4" />
          წაშლა
        </button>
      </>
    );
  };

  return (
    <div 
      className={`w-full flex flex-col gap-4 p-4 rounded-2xl ${
        status === 'planned' 
          ? 'bg-[#FFF4DE] border-2 border-[#FDB022]' 
          : 'bg-[#E5ECF6]'
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{auction.title.rendered}</h3>
        {showStatus && status === 'planned' && (
          <span className="px-3 py-1 bg-[#FDB022] text-white rounded-full text-sm">
            დაგეგმილი
          </span>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div className="w-2/6 flex justify-start gap-3">
          <img src={DateIcon} alt="date icon" />
          <span className="text-[#6F7181]">{auction.meta?.due_time || 'თარიღი არ არის'}</span>
        </div>
        <div className="w-1/5 flex justify-start gap-3">
          <img src={MapIcon} alt="map icon" />
          <span className="text-[#6F7181]">{auction.meta?.city || 'მდებარეობა არ არის'}</span>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        {renderActions()}
      </div>
    </div>
  );
};

export default AuctionItem;
