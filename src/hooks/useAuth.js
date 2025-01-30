import { useState, useEffect } from 'react';

export const useAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Get the current user data from WordPress
                const response = await fetch('/wp-json/wp/v2/users/me', {
                    credentials: 'include',
                    headers: {
                        'X-WP-Nonce': window.wpApiSettings?.nonce
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    return { user, isAuthenticated: !!user };
};
