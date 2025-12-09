import { getSession, clearSession } from './utils/storage.js';
import { loginUser, registerUser } from './modules/auth.js';
import { createTrip, getTrips, deleteTrip, updateTrip, addActivity, setTripBudget, addExpense } from './modules/trips.js';
import { searchPlaces } from './modules/places.js';
import { getWeather } from './modules/weather.js';

const app = document.getElementById('app');
const userControls = document.getElementById('user-controls');

// --- APP INITIALIZATION ---
const init = () => {
    const currentUser = getSession();
    if (currentUser) {
        renderDashboard(currentUser);
    } else {
        renderLanding();
    }
};

// --- VIEW RENDERERS ---

const renderLanding = () => {
    // UPDATED: Now includes Hero Text and centralized structure [cite: 4]
    app.innerHTML = `
        <div class="landing-container fade-in">
            <div class="hero-text">
                <h1>Plan Your Next Adventure</h1>
                <p>Build itineraries, track budgets, and discover new places—all in one simple tool.</p>
            </div>
            <div class="form-card">
                <h2 id="form-title">Welcome Back</h2>
                <form id="auth-form">
                    <div class="input-group">
                        <input type="email" id="email" placeholder="Email Address" required aria-label="Email">
                    </div>
                    <div class="input-group">
                        <input type="password" id="password" placeholder="Password" required aria-label="Password">
                    </div>
                    <button type="submit" class="btn-primary" id="submit-btn">Login to Account</button>
                </form>
                <div style="margin-top: 1rem; text-align: center;">
                    <p style="font-size: 0.9rem; color: #666;">
                        No account yet? <button id="toggle-auth" class="btn-link">Register now</button>
                    </p>
                </div>
            </div>
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
                            <button class="btn-secondary view-trip-btn" data-id="${trip.id}">View</button>
                            <button class="btn-secondary edit-trip-btn" data-id="${trip.id}">Edit</button>
                            <button class="btn-danger delete-btn" data-id="${trip.id}">Delete</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div id="trip-modal" class="modal hidden">
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <h3 id="modal-title">New Adventure</h3>
                    <form id="trip-form">
                        <input type="hidden" id="edit-trip-id">
                        <input type="text" id="destination" placeholder="Destination (e.g., Paris)" required>
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

const renderTripDetails = async (trip) => {
    const budget = trip.budget || 0;
    const expenses = trip.expenses || [];
    const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
    const remaining = budget - totalSpent;
    const percent = budget > 0 ? (totalSpent / budget) * 100 : 0;
    const barColor = percent > 90 ? '#e63946' : percent > 75 ? '#E9C46A' : '#2A9D8F'; 

    const activities = trip.activities ? trip.activities.sort((a, b) => a.day - b.day) : [];

    app.innerHTML = `
        <div class="trip-details fade-in">
            <div class="details-header">
                <button id="back-btn" class="btn-secondary">← Back to Trips</button>
                <div>
                    <h1>${trip.destination}</h1>
                    <p>${trip.startDate} - ${trip.endDate}</p>
                    <button onclick="window.print()" class="btn-secondary" style="margin-top:0.5rem; font-size: 0.8rem;">🖨️ Print Itinerary</button>
                </div>
                <div id="weather-widget" class="weather-widget"><p>Loading weather...</p></div>
            </div>

            <div class="content-grid">
                <div class="main-column">
                    <div class="itinerary-preview">
                        <h3>My Itinerary</h3>
                        ${activities.length === 0 
                            ? '<p>No activities added yet.</p>' 
                            : `<ul class="activity-list">${activities.map(a => `<li><strong>Day ${a.day}:</strong> ${a.name} <span style="font-size:0.9em;color:#666;">(${a.type})</span></li>`).join('')}</ul>`
                        }
                    </div>

                    <div class="search-section">
                        <h3>Find Places in ${trip.destination}</h3>
                        <div class="search-bar">
                            <input type="text" id="place-query" placeholder="Search hotels, food, museums...">
                            <button id="search-btn" class="btn-primary">Search</button>
                        </div>
                        <div id="search-results" class="results-grid"></div>
                    </div>
                </div>

                <div class="side-column">
                    <div class="budget-card">
                        <h3>Trip Budget</h3>
                        ${budget === 0 
                            ? `<div class="set-budget-form">
                                 <input type="number" id="budget-input" placeholder="Total Budget ($)">
                                 <button id="save-budget-btn" class="btn-primary">Set Budget</button>
                               </div>`
                            : `
                                <div class="budget-display">
                                    <div class="budget-stats"><span>Spent: $${totalSpent}</span><span>Total: $${budget}</span></div>
                                    <div class="progress-bar-container">
                                        <div class="progress-fill" style="width: ${Math.min(percent, 100)}%; background-color: ${barColor}"></div>
                                    </div>
                                    <p style="text-align:right; font-size:0.9rem;">Remaining: $${remaining}</p>
                                    <hr style="margin: 1rem 0; border:0; border-top:1px solid #eee;">
                                    <h4>Add Expense</h4>
                                    <form id="expense-form">
                                        <input type="text" id="expense-title" placeholder="Item (e.g. Flight)" required>
                                        <input type="number" id="expense-amount" placeholder="Amount" required>
                                        <select id="expense-cat">
                                            <option value="Food">Food</option><option value="Transport">Transport</option>
                                            <option value="Stay">Accommodation</option><option value="Other">Other</option>
                                        </select>
                                        <button type="submit" class="btn-secondary" style="width:100%">Add</button>
                                    </form>
                                    <ul class="expense-list">
                                        ${expenses.map(e => `<li>${e.title} <span class="price">-$${e.amount}</span></li>`).join('')}
                                    </ul>
                                </div>
                            `
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    updateNav(getSession());
    attachTripDetailEvents(trip);
    
    // Fetch Weather
    const weatherData = await getWeather(trip.destination);
    const weatherWidget = document.getElementById('weather-widget');
    if (weatherData && weatherWidget) {
        weatherWidget.innerHTML = `
            <div class="weather-current">
                <img src="${weatherData.current.icon}" alt="Weather">
                <div>
                    <span class="temp">${weatherData.current.temp}°C</span>
                    <span class="condition">${weatherData.current.condition}</span>
                </div>
            </div>
        `;
    } else if (weatherWidget) { weatherWidget.innerHTML = `<p>Unavailable</p>`; }
};

// --- HELPER FUNCTIONS ---

const updateNav = (user) => {
    if (!user) { userControls.innerHTML = ''; return; }
    userControls.innerHTML = `<span style="margin-right:1rem;">${user.email}</span><button id="logout-btn" class="btn-secondary">Logout</button>`;
    document.getElementById('logout-btn').addEventListener('click', () => { clearSession(); init(); });
};

// --- EVENT HANDLERS ---

const attachAuthEvents = () => {
    let isLogin = true;
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-auth');
    if (toggleBtn) toggleBtn.addEventListener('click', () => {
        isLogin = !isLogin;
        document.getElementById('form-title').innerText = isLogin ? 'Welcome Back' : 'Join Us';
        document.getElementById('submit-btn').innerText = isLogin ? 'Login' : 'Sign Up';
        toggleBtn.innerText = isLogin ? 'Create Account' : 'Back to Login';
    });
    if (form) form.addEventListener('submit', (e) => {
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
    if (modal) {
        document.getElementById('open-trip-modal').onclick = () => {
            document.getElementById('modal-title').innerText = "New Adventure";
            document.getElementById('trip-form').reset();
            document.getElementById('edit-trip-id').value = '';
            modal.classList.remove('hidden');
        };
        document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');
        document.getElementById('trip-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const tripData = {
                destination: document.getElementById('destination').value,
                startDate: document.getElementById('start-date').value,
                endDate: document.getElementById('end-date').value,
                description: document.getElementById('description').value
            };
            const editId = document.getElementById('edit-trip-id').value;
            editId ? updateTrip({ id: Number(editId), ...tripData }) : createTrip(tripData);
            renderDashboard(getSession());
        });
    }
    const grid = document.querySelector('.trips-grid');
    if (grid) grid.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-trip-btn')) {
            const id = Number(e.target.dataset.id);
            const trip = getTrips().find(t => t.id === id);
            if (trip) renderTripDetails(trip);
        }
        if (e.target.classList.contains('delete-btn')) {
            const id = Number(e.target.dataset.id);
            if (confirm('Are you sure?')) { deleteTrip(id); renderDashboard(getSession()); }
        }
        if (e.target.classList.contains('edit-trip-btn')) {
            const id = Number(e.target.dataset.id);
            const trip = getTrips().find(t => t.id === id);
            if (trip) {
                document.getElementById('modal-title').innerText = "Edit Trip";
                document.getElementById('edit-trip-id').value = trip.id;
                document.getElementById('destination').value = trip.destination;
                document.getElementById('start-date').value = trip.startDate;
                document.getElementById('end-date').value = trip.endDate;
                document.getElementById('description').value = trip.description;
                document.getElementById('trip-modal').classList.remove('hidden');
            }
        }
    });
};

const attachTripDetailEvents = (trip) => {
    document.getElementById('back-btn').addEventListener('click', () => renderDashboard(getSession()));

    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) searchBtn.addEventListener('click', async () => {
        const query = document.getElementById('place-query').value;
        const resultsContainer = document.getElementById('search-results');
        if (!query) return;

        // ANIMATION: Show Loading Spinner 
        resultsContainer.innerHTML = '<div class="loader"></div>';
        
        try {
            const places = await searchPlaces(query, trip.destination);
            if (places.length === 0) { resultsContainer.innerHTML = `<p>No results found.</p>`; return; }
            resultsContainer.innerHTML = places.map(place => `
                <div class="place-card fade-in">
                    <h4>${place.name}</h4>
                    <p><strong>Type:</strong> ${place.type}</p>
                    <p>⭐ ${place.rating}</p>
                    <button class="btn-primary add-to-itinerary"
                        data-name="${place.name}" data-type="${place.type}" data-address="${place.address}">
                        Add to Itinerary
                    </button>
                </div>
            `).join('');
        } catch (error) { resultsContainer.innerHTML = '<p>Error fetching places.</p>'; }
    });

    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) resultsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-itinerary')) {
            const btn = e.target;
            const day = prompt(`Add "${btn.dataset.name}" to which day? (Enter number)`);
            if (day && parseInt(day) > 0) {
                addActivity(trip.id, { name: btn.dataset.name, type: btn.dataset.type, day: parseInt(day) });
                renderTripDetails(getTrips().find(t => t.id === trip.id));
            }
        }
    });

    const saveBudgetBtn = document.getElementById('save-budget-btn');
    if (saveBudgetBtn) saveBudgetBtn.addEventListener('click', () => {
        const amount = document.getElementById('budget-input').value;
        if (amount) {
            setTripBudget(trip.id, amount);
            renderTripDetails(getTrips().find(t => t.id === trip.id));
        }
    });

    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense(trip.id, {
            title: document.getElementById('expense-title').value,
            amount: document.getElementById('expense-amount').value,
            category: document.getElementById('expense-cat').value
        });
        renderTripDetails(getTrips().find(t => t.id === trip.id));
    });
};

document.addEventListener('DOMContentLoaded', init);