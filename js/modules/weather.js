// js/modules/weather.js

// FIX 1: Put your actual key here inside the quotes
const API_KEY = 'ef29025c1d6d48de8f7140228250512'; 
const BASE_URL = 'https://api.weatherapi.com/v1';

export const getWeather = async (city) => {
    try {
        // FIX 2: Use the API_KEY variable correctly
        const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=3&aqi=no`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data not found');
        
        const data = await response.json();
        
        return {
            current: {
                temp: data.current.temp_c, // Celsius
                condition: data.current.condition.text,
                icon: data.current.condition.icon
            },
            forecast: data.forecast.forecastday.map(day => ({
                date: day.date,
                maxTemp: day.day.maxtemp_c,
                minTemp: day.day.mintemp_c,
                condition: day.day.condition.text,
                icon: day.day.condition.icon
            }))
        };
    } catch (error) {
        console.error("Weather API Error:", error);
        return null;
    }
};