new Vue({
    el: '#auction-app',
    data: {
        auctions: [],
        loading: true,
        error: null,
        placeholderImage: wpData.placeholder_image,
        heartIcon: wpData.heart_icon,
        interval: null,
        texts: {
            auctionsTitle: 'აუქციონები',
            loading: 'იტვირთება...',
            imageLoading: 'იტვირთება...',
            ticketPrice: 'ბილეთის ფასი',
            currentPrice: 'მიმდინარე ფასი',
            currency: 'ლარი',
            auctionWillStart: 'აუქციონი დაიწყება',
            auctionWillEnd: 'აუქციონი დასრულდება',
            auctionEnded: 'აუქციონი დასრულებულია',
            days: 'დღე',
            hours: 'საათი',
            minutes: 'წუთი',
            seconds: 'წამი',
            placeBid: 'განათავსე ბიდი',
            buyNow: 'მომენტალურად ყიდვა',
            noAuctionsFound: 'აუქციონები არ მოიძებნა.',
            ongoingAuction: 'მიმდინარე',
            plannedAuction: 'დაგეგმილი'
        }
    },
    mounted() {
        this.fetchAuctions();
        this.startTimer();
    },
    methods: {
        fetchAuctions() {
            axios.get(`${wpData.api_url}auction`)
                .then(response => {
                    this.auctions = response.data.map(auction => ({
                        id: auction.id,
                        title: auction.title.rendered,
                        link: auction.link,
                        auctionPrice: auction.meta.auction_price,
                        ticketPrice: auction.meta.ticket_price,
                        buyNow: auction.meta.buy_now,
                        featuredMediaId: auction.featured_media,
                        featuredImage: null,
                        imageLoading: true,
                        startTime: new Date(auction.meta.start_time),
                        endTime: new Date(auction.meta.due_time),
                        timeRemaining: 0,
                        endTimeRemaining: 0,
                        timerDays: 0,
                        timerHours: 0,
                        timerMinutes: 0,
                        timerSeconds: 0
                    }));
                    this.auctions.forEach(auction => {
                        this.fetchAuctionImage(auction);
                        this.updateAuctionTimer(auction);
                    });
                    this.loading = false;
                })
                .catch(error => {
                    console.error('Error fetching auctions:', error);
                    this.error = 'შეცდომა აუქციონების ჩატვირთვისას. გთხოვთ, სცადოთ მოგვიანებით.';
                    this.loading = false;
                });
        },
        fetchAuctionImage(auction) {
            if (!auction.featuredMediaId) {
                auction.imageLoading = false;
                return;
            }
            axios.get(`${wpData.api_url}media/${auction.featuredMediaId}`)
                .then(response => {
                    auction.featuredImage = response.data.source_url;
                })
                .catch(error => {
                    console.error(`Error fetching image for auction ${auction.id}:`, error);
                })
                .finally(() => {
                    auction.imageLoading = false;
                });
        },
        handleImageError(auction) {
            auction.featuredImage = this.placeholderImage;
        },
        startTimer() {
            this.interval = setInterval(() => {
                this.auctions.forEach(this.updateAuctionTimer);
            }, 1000);
        },
        updateAuctionTimer(auction) {
            const now = new Date();
            if (now < auction.startTime) {
                auction.timeRemaining = Math.floor((auction.startTime - now) / 1000);
                auction.endTimeRemaining = 0;
            } else if (now < auction.endTime) {
                auction.timeRemaining = 0;
                auction.endTimeRemaining = Math.floor((auction.endTime - now) / 1000);
            } else {
                auction.timeRemaining = 0;
                auction.endTimeRemaining = 0;
            }

            const remainingTime = auction.timeRemaining > 0 ? auction.timeRemaining : auction.endTimeRemaining;
            auction.timerDays = Math.floor(remainingTime / (60 * 60 * 24));
            auction.timerHours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
            auction.timerMinutes = Math.floor((remainingTime % (60 * 60)) / 60);
            auction.timerSeconds = remainingTime % 60;
        },
        getBadgeStyle(auction) {
            if (auction.endTimeRemaining > 0) {
                return {
                    backgroundColor: 'rgb(0, 174, 239)'
                };
            }
            return {
                backgroundColor: '#808080' // ნაცრისფერი
            };
        },
        getAuctionStatus(auction) {
            if (auction.endTimeRemaining > 0) {
                return this.texts.ongoingAuction;
            }
            return this.texts.plannedAuction;
        }
    },
    beforeDestroy() {
        clearInterval(this.interval);
    }
});