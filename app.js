const Express = require("express");
const Axios = require("axios");
const { default: axios } = require("axios");
const BodyParser = require("body-parser");

const app = Express();
app.use(Express.static("public"));
app.use(BodyParser.urlencoded({extended: false}));
app.set("view engine", "ejs");

const port = 3000;

function formatEpochToDate(epochtime){
    var date = new Date(epochtime);
    const options = {
        weekday: "long", day: "numeric", month: "long"
      };
    return date.toLocaleString("en", options);
}

function getCurrentData(response){
    var currentData = {
        date: formatEpochToDate(response.location.localtime_epoch),
        currentCity: response.location.name,
        region: response.location.region,
        currentTemp: response.current.temp_c,
        currentIconURL: response.current.condition.icon,
        feelsLike: response.current.feelslike_c,
        currentCondition: response.current.condition.text,
        windSpeed: response.current.wind_kph,
        humidity: response.current.humidity,
        visibility: response.current.vis_km,
        uvIndex: response.current.uv,
        sunrise: response.forecast.forecastday[0].astro.sunrise,
        sunset: response.forecast.forecastday[0].astro.sunset,
    };

    // console.log(currentData);

    return currentData;
}

function getForecastData(response){
    var forecastData = [];
    var forecast = response.forecast.forecastday;

    for(var i = 0; i < forecast.length; i++){
        var currentDay = forecast[i];
        var forecastDate;
        if(i === 0){
            forecastDate = "Today";
        }
        else{
            forecastDate = currentDay.date;
        }
        var maxTemp = parseInt(currentDay.day.maxtemp_c);
        var minTemp = parseInt(currentDay.day.mintemp_c);
        var forecastTemp = maxTemp + "°C---" + minTemp + "°C";
        var forecastIconURL = currentDay.day.condition.icon;
        forecastData.push({
            forecastDate: forecastDate,
            forecastTemp: forecastTemp,
            forecastIconURL: forecastIconURL,
        });
    }

    //console.log(forecastData);

    return forecastData;
}

app.post("/weatherwide", (req, res)=>{
    const cityName = req.body.cityName;
    if(!cityName){
        res.redirect("/");
        return;
    }
    // console.log(cityName);
    const baseURL = "https://api.weatherapi.com/v1/forecast.json?";
    const key = "key=fc271c1b16a14d5c895171441232107";
    const query = "q=" + cityName;
    const URL = baseURL + key + "&" + query;

    axios.get(URL).then((response)=>{
        var statusCode = response.status;
        console.log("Status Code: " + statusCode);


        var currentData = getCurrentData(response.data); 
        var forecastData = getForecastData(response.data);
        var weatherData = {
            current: currentData,
            forecast: forecastData
        }
        res.render("index", weatherData);

    }).catch((error)=>{
        var statusCode = error.response.status;
        if(statusCode >= 400 && statusCode <= 500){
            res.sendFile(__dirname + "/error.html");
        }
    });
});

app.get("/", (req, res)=>{
    res.sendFile(__dirname + "/search.html");
});

app.post("/", (req, res)=>{
    res.redirect("/");
});

app.listen(port, ()=>{
    console.log(`WeatherWide app listening on port: ${port}`);
});
