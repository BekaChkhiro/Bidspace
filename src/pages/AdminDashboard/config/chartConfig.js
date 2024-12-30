export const getChartData = (dates, values) => ({
  labels: dates,
  datasets: [
    {
      label: 'დამატებული აუქციონები',
      data: values,
      backgroundColor: '#000000',
      borderRadius: 4,
    }
  ]
});

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        font: {
          size: 12
        }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `${context.dataset.label}: ${context.raw} აუქციონი`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 5,
        callback: value => `${value} აუქც.`
      }
    }
  }
};
