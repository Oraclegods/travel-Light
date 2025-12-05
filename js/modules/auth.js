import { getStoredUsers, saveUser, setSession } from '../utils/storage.js';

export const registerUser = (email, password) => {
    const users = getStoredUsers();
    const exists = users.find(u => u.email === email);
    
    if (exists) {
        throw new Error('User already exists');
    }

    const newUser = {
        id: Date.now(),
        email,
        password, // In a real app, hash this!
        trips: [] // [cite: 18]
    };

    saveUser(newUser);
    setSession(newUser);
    return newUser;
};

export const loginUser = (email, password) => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        setSession(user); // [cite: 17]
        return user;
    } else {
        throw new Error('Invalid credentials');
    }
};