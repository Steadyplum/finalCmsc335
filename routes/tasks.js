const express = require('express');
const router = express.Router();
const axios = require('axios');


router.get("/today", async (req, res) => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = daysOfWeek[new Date().getDay()];
    
    try {
        const weatherUrl = `http://api.weatherstack.com/current?access_key=${process.env.WEATHER_API_KEY}&query=Baltimore`;
        const response = await axios.get(weatherUrl);
        const data = response.data;
        const tasks = await req.app.locals.collection.find({}).toArray();
        const todayTasks = tasks.filter(task => 
            Array.isArray(task.days) && task.days.includes(today)
        );
        todayTasks.sort((a, b) => {
            const timeA = a.time || "23:59";
            const timeB = b.time || "23:59";
            return timeA.localeCompare(timeB);
        });
        res.render("today", { 
            tasks: todayTasks,
            today: today,
            weather: data.current
        });
    } catch (e) {
        console.error(e);
    }
});

router.get("/weather", async (req, res) => {
    try {
        const weatherUrl = `http://api.weatherstack.com/current?access_key=${process.env.WEATHER_API_KEY}&query=Baltimore`;
        const response = await axios.get(weatherUrl);
        const data = response.data;
        res.render("weather", { weather: data.current });
    } catch (e) {
        console.error(e);
    }
});

router.get("/weekly", async (req, res) => {
    try {
        const tasks = await req.app.locals.collection.find({}).toArray();
        tasks.sort((a, b) => {
            const timeA = a.time || "23:59";
            const timeB = b.time || "23:59";
            return timeA.localeCompare(timeB);
        });
        res.render("weekly", { 
            tasks: tasks,
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        });
    } catch (e) {
        console.error(e);
    }
});

module.exports = router;
