// Handles all local storage operations
const STORAGE_KEY_USERS = 'travel_light_users';
const STORAGE_KEY_SESSION = 'travel_light_session';

export const getStoredUsers = () => {
    const users = localStorage.getItem(STORAGE_KEY_USERS);
    return users ? JSON.parse(users) : [];
};

export const saveUser = (user) => {
    const users = getStoredUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const setSession = (user) => {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user)); // [cite: 17]
};

export const getSession = () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SESSION));
};

export const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
};