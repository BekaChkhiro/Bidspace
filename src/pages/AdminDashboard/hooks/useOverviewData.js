import { useState, useEffect } from 'react';
import { getChartData, chartOptions } from '../config/chartConfig';
import { statsConfig } from '../config/statsConfig';

export const useOverviewData = () => {
  const [dateRange, setDateRange] = useState('იან 20, 2024 - თებ 09, 2024');
  const [loading, setLoading] = useState(false);

  // მოცემული მონაცემები (მომავალში API-დან მოვა)
  const mockData = {
    dates: ['24 დეკ', '25 დეკ', '26 დეკ', '27 დეკ', '28 დეკ', '29 დეკ', '30 დეკ'],
    values: [12, 19, 15, 25, 22, 30, 18],
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
    setLoading(true);
    // აქ მომავალში API call იქნება
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return {
    loading,
    dateRange,
    setDateRange,
    chartData: getChartData(mockData.dates, mockData.values),
    chartOptions,
    stats: statsConfig,
    recentSales: mockData.recentSales
  };
};
