import { getStoredUsers, getSession, setSession } from '../utils/storage.js';

export const getTrips = () => {
    const user = getSession();
    return user.trips || [];
};

export const createTrip = (tripData) => {
    // 1. Get current session
    const currentUser = getSession();
    
    // 2. Create Trip Object
    const newTrip = {
        id: Date.now(), // Simple unique ID
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        description: tripData.description,
        activities: [] // Placeholder for next week
    };

    // 3. Update current user object
    if (!currentUser.trips) currentUser.trips = [];
    currentUser.trips.push(newTrip);

    // 4. Update "Database" (All Users)
    const allUsers = getStoredUsers();
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        localStorage.setItem('travel_light_users', JSON.stringify(allUsers));
    }

    // 5. Update Session
    setSession(currentUser);

    return newTrip;
};

export const deleteTrip = (tripId) => {
    const currentUser = getSession();
    currentUser.trips = currentUser.trips.filter(t => t.id !== tripId);
    
    // Save changes
    const allUsers = getStoredUsers();
    const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        allUsers[userIndex] = currentUser;
        localStorage.setItem('travel_light_users', JSON.stringify(allUsers));
    }
    setSession(currentUser);
};