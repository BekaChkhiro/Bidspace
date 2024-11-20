// File: wp-content/themes/your-theme/js/api-key-utils.js

const apiKeyUtils = {
  getApiKey() {
      return new Promise((resolve, reject) => {
          axios.get('/wp-json/wp-api-security/v1/get-key', {
              withCredentials: true
          })
          .then(response => {
              resolve(response.data.api_key);
          })
          .catch(error => {
              console.error('Error fetching API key:', error);
              reject(error);
          });
      });
  },

  setApiKeyHeader(apiKey) {
      axios.defaults.headers.common['X-API-Key'] = apiKey;
  }
};

export default apiKeyUtils;