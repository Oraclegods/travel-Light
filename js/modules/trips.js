import { getStoredUsers, getSession, setSession } from '../utils/storage.js';

export const getTrips = () => {
    const user = getSession();
    return user.trips || [];
};

export const createTrip = (tripData) => {
    const currentUser = getSession();
    
    const newTrip = {
        id: Date.now(),
        destination: tripData.destination,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        description: tripData.description,
        activities: [],
        expenses: [],
        budget: 0
    };

    if (!currentUser.trips) currentUser.trips = [];
    currentUser.trips.push(newTrip);

    saveUserChanges(currentUser);
    return newTrip;
};

// NEW: Function to handle Editing
export const updateTrip = (updatedTrip) => {
    const user = getSession();
    const index = user.trips.findIndex(t => t.id === updatedTrip.id);
    
    if (index !== -1) {
        // Keep existing activities/expenses, only update details
        user.trips[index] = {
            ...user.trips[index], // Keep old data (like ID)
            ...updatedTrip,       // Overwrite with new form data
            activities: user.trips[index].activities, // Protect these arrays
            expenses: user.trips[index].expenses,
            budget: user.trips[index].budget
        };

        saveUserChanges(user);
        return true;
    }
    return false;
};

export const deleteTrip = (tripId) => {
    const currentUser = getSession();
    currentUser.trips = currentUser.trips.filter(t => t.id !== tripId);
    saveUserChanges(currentUser);
};

export const addActivity = (tripId, activity) => {
    const user = getSession();
    const trip = user.trips.find(t => t.id === tripId);

    if (trip) {
        if (!trip.activities) trip.activities = [];
        trip.activities.push({ id: Date.now(), ...activity });
        saveUserChanges(user);
        return true;
    }
    return false;
};

export const setTripBudget = (tripId, amount) => {
    const user = getSession();
    const trip = user.trips.find(t => t.id === tripId);
    
    if (trip) {
        trip.budget = Number(amount);
        saveUserChanges(user);
        return true;
    }
    return false;
};

export const addExpense = (tripId, expense) => {
    const user = getSession();
    const trip = user.trips.find(t => t.id === tripId);
    
    if (trip) {
        if (!trip.expenses) trip.expenses = [];
        trip.expenses.push({ id: Date.now(), ...expense });
        saveUserChanges(user);
        return true;
    }
    return false;
};

// Helper to save to localStorage
const saveUserChanges = (user) => {
    const allUsers = getStoredUsers();
    const userIndex = allUsers.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
        allUsers[userIndex] = user;
        localStorage.setItem('travel_light_users', JSON.stringify(allUsers));
    }
    setSession(user);
};