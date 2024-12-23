import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashboardLayout from '../components/layout/DashboardLayout';
import AuctionItem from '../components/common/AuctionItem';
import { useAuth } from '../../../components/core/context/AuthContext';
import useCustomToast from '../../../components/toast/CustomToast';
import locationIcon from '../../../components/assets/icons/auction/location.svg';
import dateIcon from '../../../components/assets/icons/auction/date_icon.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';

const MyAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, auctionId: null, title: '' });
  const { user } = useAuth();
  const toast = useCustomToast();

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const fetchMyAuctions = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/auction?author=${user.id}`);
      const data = await response.json();
      console.log('Received auctions data:', data);
      setAuctions(data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const startTime = auction.meta?.start_time ? new Date(auction.meta.start_time) : null;
    const dueTime = auction.meta?.due_time ? new Date(auction.meta.due_time) : null;

    console.log('Auction:', {
      title: auction.title.rendered,
      startTime,
      dueTime,
      now
    });

    if (startTime && now < startTime) {
      return 'planned';
    }
    
    if (dueTime && now < dueTime) {
      if (!startTime || now >= startTime) {
        return 'active';
      }
    }

    return 'ended';
  };

  const handleDeleteClick = (auctionId) => {
    const auction = auctions.find(a => a.id === auctionId);
    setDeleteModal({ show: true, auctionId, title: auction.title.rendered });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/wp-json/wp/v2/auction/${deleteModal.auctionId}`, {
        method: 'DELETE',
        headers: {
          'X-WP-Nonce': wpApiSettings.nonce
        }
      });

      if (response.ok) {
        toast("აუქციონი წარმატებით წაიშალა");
        fetchMyAuctions();
      }
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast("შეცდომა აუქციონის წაშლისას");
    } finally {
      setDeleteModal({ show: false, auctionId: null, title: '' });
    }
  };

  const renderDeleteModal = () => {
    if (!deleteModal.show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-semibold mb-4">აუქციონის წაშლა</h3>
          <p className="text-gray-600 mb-6">ნამდვილად გსურთ აუქციონის წაშლა?</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setDeleteModal({ show: false, auctionId: null, title: '' })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg"
            >
              გაუქმება
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
            >
              წაშლა
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAuctionsList = () => {
    const groupedAuctions = {
      planned: auctions.filter(auction => getAuctionStatus(auction) === 'planned'),
      active: auctions.filter(auction => getAuctionStatus(auction) === 'active'),
      ended: auctions.filter(auction => getAuctionStatus(auction) === 'ended')
    };

    const renderSection = (auctions, title, status) => {
      if (auctions.length === 0) return null;
      
      return (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.map(auction => (
              <AuctionItem
                key={auction.id}
                auction={auction}
                status={status}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
        </div>
      );
    };

    return (
      <div>
        {renderSection(groupedAuctions.planned, 'დაგეგმილი აუქციონები', 'planned')}
        {renderSection(groupedAuctions.active, 'მიმდინარე აუქციონები', 'active')}
        {renderSection(groupedAuctions.ended, 'დასრულებული აუქციონები', 'ended')}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">ჩემი აუქციონები</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        {loading ? (
          <div className="text-center">
            <p className="text-[#6F7181]">იტვირთება...</p>
          </div>
        ) : auctions.length > 0 ? (
          renderAuctionsList()
        ) : (
          <div className="border p-4 rounded">
            <p className="text-[#6F7181]">ჯერ არ გაქვთ აუქციონები</p>
          </div>
        )}
      </div>
      {renderDeleteModal()}
    </DashboardLayout>
  );
};

export default MyAuctions;