import { getSession, clearSession } from './utils/storage.js';
import { loginUser, registerUser } from './modules/auth.js';
import { createTrip, getTrips, deleteTrip } from './modules/trips.js';

const app = document.getElementById('app');
const userControls = document.getElementById('user-controls');

const init = () => {
    const currentUser = getSession();
    if (currentUser) {
        renderDashboard(currentUser);
    } else {
        renderLanding();
    }
};

// --- VIEWS ---

const renderLanding = () => {
    app.innerHTML = `
        <div class="fade-in form-container">
            <h2 id="form-title">Welcome Back</h2>
            <form id="auth-form">
                <input type="email" id="email" placeholder="Email" required aria-label="Email">
                <input type="password" id="password" placeholder="Password" required aria-label="Password">
                <button type="submit" class="btn-primary" id="submit-btn">Login</button>
            </form>
            <p>
                <button id="toggle-auth" class="btn-link">Create Account</button>
            </p>
        </div>
    `;
    attachAuthEvents();
};

const renderDashboard = (user) => {
    const trips = getTrips();
    
    app.innerHTML = `
        <div class="dashboard fade-in">
            <div class="dashboard-header">
                <h2>My Trips</h2>
                <button class="btn-primary" id="open-trip-modal">+ Create Trip</button>
            </div>
            
            <div class="trips-grid">
                ${trips.length === 0 ? '<p>No trips yet. Plan your next adventure!</p>' : ''}
                ${trips.map(trip => `
                    <div class="trip-card fade-in">
                        <h3>${trip.destination}</h3>
                        <p class="trip-dates">${trip.startDate} to ${trip.endDate}</p>
                        <p>${trip.description}</p>
                        <div class="card-actions">
                            <button class="btn-secondary" onclick="alert('Manage functionality coming next week!')">Manage</button>
                            <button class="btn-danger delete-btn" data-id="${trip.id}">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div id="trip-modal" class="modal hidden">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3>New Adventure</h3>
                    <form id="trip-form">
                        <input type="text" id="destination" placeholder="Destination (e.g., Tokyo)" required>
                        <input type="date" id="start-date" required>
                        <input type="date" id="end-date" required>
                        <textarea id="description" placeholder="Trip goals..."></textarea>
                        <button type="submit" class="btn-primary">Save Trip</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    updateNav(user);
    attachDashboardEvents();
};

const updateNav = (user) => {
    userControls.innerHTML = `
        <span>${user.email}</span>
        <button id="logout-btn" class="btn-secondary">Logout</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
        clearSession();
        init();
    });
};

// --- EVENT HANDLERS ---

const attachAuthEvents = () => {
    let isLogin = true;
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-auth');

    toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        document.getElementById('form-title').innerText = isLogin ? 'Welcome Back' : 'Join Us';
        document.getElementById('submit-btn').innerText = isLogin ? 'Login' : 'Sign Up';
        toggleBtn.innerText = isLogin ? 'Create Account' : 'Back to Login';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            const user = isLogin ? loginUser(email, password) : registerUser(email, password);
            renderDashboard(user);
        } catch (err) { alert(err.message); }
    });
};

const attachDashboardEvents = () => {
    const modal = document.getElementById('trip-modal');
    const openBtn = document.getElementById('open-trip-modal');
    const closeBtn = document.querySelector('.close-modal');

    // Open/Close Modal
    openBtn.onclick = () => modal.classList.remove('hidden');
    closeBtn.onclick = () => modal.classList.add('hidden');

    // Handle Trip Creation
    document.getElementById('trip-form').addEventListener('submit', (e) => {
        e.preventDefault();
        createTrip({
            destination: document.getElementById('destination').value,
            startDate: document.getElementById('start-date').value,
            endDate: document.getElementById('end-date').value,
            description: document.getElementById('description').value
        });
        renderDashboard(getSession()); // Re-render to show new trip
    });

    // Handle Deletion (Event Delegation)
    document.querySelector('.trips-grid').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = Number(e.target.dataset.id);
            if(confirm('Delete this trip?')) {
                deleteTrip(id);
                renderDashboard(getSession());
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', init);