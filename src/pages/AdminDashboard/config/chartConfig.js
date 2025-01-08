export const getChartData = (dates, values) => ({
  labels: dates,
  datasets: [
    {
      label: 'დამატებული აუქციონები',
      data: values,
      backgroundColor: '#3b82f6', // blue-500
      hoverBackgroundColor: '#2563eb', // blue-600
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 24,
      maxBarThickness: 32
    }
  ]
});

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      top: 10,
      right: 16,
      bottom: 10,
      left: 16
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      align: 'end',
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 20,
        font: {
          size: 12,
          family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
        }
      }
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: {
        x: 12,
        y: 8
      },
      titleFont: {
        size: 13,
        weight: '600'
      },
      bodyFont: {
        size: 12
      },
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.raw} აუქციონი`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11
        },
        color: '#6B7280' // gray-500
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(243, 244, 246, 1)', // gray-100
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        stepSize: 5,
        padding: 10,
        color: '#6B7280', // gray-500
        font: {
          size: 11
        },
        callback: value => `${value} აუქც.`
      }
    }
  }
};
