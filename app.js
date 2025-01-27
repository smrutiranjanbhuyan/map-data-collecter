const mongoose = require("mongoose");
const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World");
});

mongoose
  .connect(process.env.URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const weatherSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  humidity: Number,
  description: String,
  feels_like: Number,
  temp_min: Number,
  temp_max: Number,
  pressure: Number,
  sea_level: Number,
  grnd_level: Number,
  windSpeed: Number,
  windDeg: Number,
  dewPoint: Number,
  sunriseTime: Number,
  sunsetTime: Number,
  cloudCover: Number,
  visibility: Number,
  timestamp: { type: Date, default: Date.now },
});

const Weather = mongoose.model("Weather", weatherSchema);

const apiKey = process.env.API_KEY;
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";

const cities = [
  "Angul",
  "Balangir",
  "Balasore",
  "Bargarh",
  "Bhadrak",
  "Cuttack",
  "Deogarh",
  "Dhenkanal",
  "Gajapati",
  "Ganjam",
  "Jagatsinghpur",
  "Jajpur",
  "Jharsuguda",
  "Kendrapara",
  "Khordha",
  "Koraput",
  "Malkangiri",
  "Nayagarh",
  "Nuapada",
  "Puri",
  "Rayagada",
  "Sambalpur",
  "Subarnapur",
  "Sundargarh",
];

async function fetchWeatherData(city) {
  try {
    const response = await axios.get(`${apiUrl}${city}&appid=${apiKey}`);
    const data = response.data;
    // console.log(`Fetched weather data for ${city}`);

    const weatherData = new Weather({
      city: city,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      feels_like: data.main.feels_like,
      temp_min: data.main.temp_min,
      temp_max: data.main.temp_max,
      pressure: data.main.pressure,
      sea_level: data.main.sea_level,
      grnd_level: data.main.grnd_level,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      dewPoint: data.main.dew_point,
      sunriseTime: data.sys.sunrise,
      sunsetTime: data.sys.sunset,
      cloudCover: data.clouds.all,
      visibility: data.visibility,
    });

    await weatherData.save();
    // console.log(`Weather data for ${city} saved successfully.`);
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error.message);
  }
}

cron.schedule("0 * * * *", () => {
  cities.forEach((city) => {
    fetchWeatherData(city);
  });
});


app.get("/", (req, res) => {
  res.send("Weather data automation service running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
