const isApiLoaded = () => window.google && window.google.maps && window.google.maps.places;

// NEW: Accept 'location' as a second parameter
export const searchPlaces = (query, location) => {
    return new Promise((resolve, reject) => {
        if (!isApiLoaded()) {
            reject(new Error("Google Maps API not loaded."));
            return;
        }

        const dummyNode = document.createElement('div');
        const service = new google.maps.places.PlacesService(dummyNode);

        // NEW: Combine query with location (e.g., "Museum" becomes "Museum in Paris")
        const fullQuery = location ? `${query} in ${location}` : query;

        const request = {
            query: fullQuery, // Use the combined string
            fields: ['name', 'formatted_address', 'rating', 'types', 'geometry']
        };

        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                const formattedResults = results.map(place => ({
                    name: place.name,
                    rating: place.rating || 'N/A',
                    address: place.formatted_address,
                    type: place.types ? place.types[0] : 'Place',
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                }));
                resolve(formattedResults);
            } else {
                console.warn('Search status:', status);
                resolve([]);
            }
        });
    });
};