class ApiClient {
  constructor() {
    this.baseUrl = '/wp-json/wp/v2';
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-WP-Nonce': window.wpApiSettings?.nonce,
      ...options.headers
    };

    const config = {
      ...options,
      headers,
      credentials: 'include'
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (response.status === 401) {
        // Trigger auth refresh or redirect to login
        const event = new CustomEvent('auth:required');
        window.dispatchEvent(event);
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new ApiClient();
