import React, { useState } from 'react';

const WeatherScreen = () => {
  const [currentWeather, setCurrentWeather] = useState({
    name: 'Mathura',
    temperature: 25,
    humidity: 60,
    description: 'Clear sky',
    icon: 'https://openweathermap.org/img/wn/01d.png',
  });

  const [forecast, setForecast] = useState([
    { time: '12:00 PM', temperature: 26, icon: 'https://openweathermap.org/img/wn/01d.png' },
    { time: '03:00 PM', temperature: 28, icon: 'https://openweathermap.org/img/wn/01d.png' },
    { time: '06:00 PM', temperature: 24, icon: 'https://openweathermap.org/img/wn/01d.png' },
    { time: '09:00 PM', temperature: 22, icon: 'https://openweathermap.org/img/wn/01d.png' },
  ]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    
    setTimeout(() => {
      setCurrentWeather({
        name: 'Mathura',
        temperature: 26,
        humidity: 55,
        description: 'Sunny',
        icon: 'https://openweathermap.org/img/wn/01d.png',
      });
      setForecast([
        { time: '12:00 PM', temperature: 27, icon: 'https://openweathermap.org/img/wn/01d.png' },
        { time: '03:00 PM', temperature: 29, icon: 'https://openweathermap.org/img/wn/01d.png' },
        { time: '06:00 PM', temperature: 25, icon: 'https://openweathermap.org/img/wn/01d.png' },
        { time: '09:00 PM', temperature: 23, icon: 'https://openweathermap.org/img/wn/01d.png' },
      ]);
      setLoading(false);
    }, 2000); // Simulated delay of 2 seconds
  };

  if (loading) return <div>Loading weather...</div>;

  return (
    <div className="p-4 bg-white flex flex-col items-center space-y-4">
      <h2 className="text-2xl font-semibold">Weather in {currentWeather.name}</h2>
      <div className="text-lg">
        <p>Temperature: {currentWeather.temperature}°C</p>
        <p>Humidity: {currentWeather.humidity}%</p>
        <p>Weather: {currentWeather.description}</p>
        <img src={currentWeather.icon} alt={currentWeather.description} className="w-16 h-16" />
      </div>

      <button
        onClick={handleRefresh}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full"
      >
        Refresh Weather
      </button>

      <div className="w-full mt-4">
        <h3 className="text-xl font-semibold">Next 4 Hours Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {forecast.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <p>{item.time}</p>
              <img src={item.icon} alt="weather" className="w-12 h-12" />
              <p>{item.temperature}°C</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherScreen;
