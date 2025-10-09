const api = async (url: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem('token');
    
    // FIX: Use Headers constructor to correctly handle different header types
    // and avoid TypeScript errors when spreading `options.headers`.
    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'An API error occurred');
        }

        if (response.status === 204) { // No Content
            return null;
        }

        return response.json();
    } catch (error) {
        console.error(`API call to ${url} failed:`, error);
        throw error;
    }
};

export default api;