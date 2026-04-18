// Configuration for MindMirror Frontend
// Vercel deployment - API on same domain

const CONFIG = {
    // Local development
    DEV_API_URL: 'http://localhost:8000',

    // Vercel production - API on same domain (empty = relative URL)
    PROD_API_URL: '',

    // Get the appropriate API URL based on environment
    getApiUrl: function() {
        // Check if we're on localhost
        const isLocalhost = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';

        return isLocalhost ? this.DEV_API_URL : this.PROD_API_URL;
    }
};

// Set the global API_BASE_URL
window.API_BASE_URL = CONFIG.getApiUrl();
