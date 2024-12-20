const API = {
    baseUrl: '/wp-json',
    
    async getAuctions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${this.baseUrl}/wp/v2/auction?${queryString}`);
        if (!response.ok) throw new Error('Failed to fetch auctions');
        return response.json();
    },
    
    async getAuction(id) {
        const response = await fetch(`${this.baseUrl}/wp/v2/auction/${id}`);
        if (!response.ok) throw new Error('Failed to fetch auction');
        return response.json();
    }
};

window.BidSpaceAPI = API; 