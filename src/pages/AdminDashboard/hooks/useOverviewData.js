import { useState, useEffect } from 'react';
import { statsConfig } from '../config/statsConfig';

export const useOverviewData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // მოცემული მონაცემები (მომავალში API-დან მოვა)
  const mockData = {
    recentSales: [
      {
        name: 'გიორგი მაისურაძე',
        email: 'giorgi@email.com',
        amount: '+₾1,999.00'
      },
      {
        name: 'ნინო კაპანაძე',
        email: 'nino@email.com',
        amount: '+₾39.00'
      },
      {
        name: 'ლევან ბერიძე',
        email: 'levan@email.com',
        amount: '+₾299.00'
      },
      {
        name: 'თამარ დვალი',
        email: 'tamar@email.com',
        amount: '+₾99.00'
      },
      {
        name: 'ანა გიორგაძე',
        email: 'ana@email.com',
        amount: '+₾39.00'
      }
    ]
  };

  // მონაცემების ჩატვირთვის იმიტაცია
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // აქ მომავალში API call იქნება
        await new Promise(resolve => setTimeout(resolve, 500));
        setData(mockData);
      } catch (error) {
        console.error('Error loading overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    loading,
    stats: statsConfig,
    recentSales: data?.recentSales || []
  };
};
