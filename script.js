const bg = document.querySelector('.bg');
const searchbtn = document.querySelector('#searchbtn');
const searchbox = document.querySelector('#searchbox');

const currTemp = document.querySelector('#currTemp');
const tempDesc = document.querySelector('#tempDesc');
const place = document.querySelector('#location');
const feelsLike = document.querySelector('#feelsLike');
const pressure = document.querySelector('#pressure');
const wind = document.querySelector('#wind');
const humidity = document.querySelector('#humidity');
const maxTemp = document.querySelector('#maxTemp');
const minTemp = document.querySelector('#minTemp');
const cityTime = document.querySelector('#cityTime');

const API_KEY = "50a08e64e3d25eee4a6c42ce2747606b";
const URL1 = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}&q=`;
const URL2 = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${API_KEY}&q=`;

async function getLiveData(url1){
    try{
        const rawData = await fetch(url1);
        const data = await rawData.json();
        triggerLiveChanges(data);
    }
    catch(err){
        console.error("Unable to fetch live data!", err);
        searchBarError();
    }
}

async function getFutureData(url2){
    try{
        const rawData = await fetch(url2);
        const data = await rawData.json();
        triggerFutureChanges(data);
    }
    catch(err){
        console.error("Unable to fetch future data!", err);
        searchBarError();
    }
}

const changeBG = (val) => {
    val = Number(val);
    if(val == 800){
        bg.setAttribute('src', '/Resources/Videos/clear.mp4');
    }
    else if(val>=200 && val<=299) {
        bg.setAttribute('src', '/Resources/Videos/thunderstorm.mp4');
    }
    else if(val>=300 && val<=599) {
        bg.setAttribute('src', '/Resources/Videos/rain.mp4');
    }
    else if(val>=600 && val<=699) {
        bg.setAttribute('src', '/Resources/Videos/snow.mp4');
    }
    else if(val>=700 && val<=799) {
        bg.setAttribute('src', '/Resources/Videos/fog.mp4');
    }
    else if(val>=801 && val<=899) {
        bg.setAttribute('src', '/Resources/Videos/cloud.mp4');
    }
};
const changeTemp = (val) => currTemp.innerText = Math.round(val) + "°C";
const changeTempDesc = (val) => tempDesc.innerText = val[0].toUpperCase() + val.slice(1);
const changeLocation = (val1, val2) => place.innerText = `${val1}, ${val2}`;
const changeFeelsLike = (val) => feelsLike.innerText = val + "°C";
const changePressure = (val) => pressure.innerText = val + ' hPa';
const changeWind = (val) => wind.innerText = val + ' m/s';
const changeHumidity = (val) => humidity.innerText = val + '%';
const changeMaxTemp = (val) => maxTemp.innerText = val + "°C";
const changeMinTemp = (val) => minTemp.innerText = val + "°C";
const changeCityTime = (unixUTC, timezoneOffset) => {
    const localTimestamp = (unixUTC + timezoneOffset) * 1000;
    const localTime = new Date(localTimestamp);
    const timeStr = localTime.toISOString().substring(11, 16);
    cityTime.innerText = timeStr;
};

const changeHour = (hours) => {
    for(let i=0; i<5; i++){
        document.querySelector(`#hour${i+1}`).innerText = hours[i];
    }
};
const changeHourlyTemp = (hourlyTemp) => {
    for(let i=0; i<5; i++){
        document.querySelector(`#h${i+1}`).innerText = hourlyTemp[i] + "°C";
    }
};
const changeHourlyImg = (hourlyTempCodes) => {
    for(let i=0; i<5; i++){
        changeIMG(hourlyTempCodes[i], document.querySelector(`#h-img${i+1}`));
    }
};
const changeDate = (dates) => {
    for(let i=0; i<5; i++){
        document.querySelector(`#date${i+1}`).innerText = dates[i];
    }
};
const changeDailyTemp = (dailyTemp) => {
    for(let i=0; i<5; i++){
        document.querySelector(`#d${i+1}`).innerText = dailyTemp[i] + "°C";
    }
};
const changeDailyImg = (dailyTempCodes) => {
    for(let i=0; i<5; i++){
        changeIMG(dailyTempCodes[i], document.querySelector(`#d-img${i+1}`));
    }
};

const changeIMG = (code, elem) => {
    code = Number(code);
    if(code == 800){
        elem.setAttribute('src', '/Resources/SVGs/clear.png');
    }
    else if(code>=200 && code<=299) {
        elem.setAttribute('src', '/Resources/SVGs/thunderstorm.png');
    }
    else if(code>=300 && code<=599) {
        elem.setAttribute('src', '/Resources/SVGs/rain.png');
    }
    else if(code>=600 && code<=699) {
        elem.setAttribute('src', '/Resources/SVGs/snow.png');
    }
    else if(code>=700 && code<=799) {
        elem.setAttribute('src', '/Resources/SVGs/fog.png');
    }
    else if(code>=801 && code<=899) {
        elem.setAttribute('src', '/Resources/SVGs/cloud.png');
    }
};

const triggerLiveChanges = (liveData) => {
    changeTemp(liveData.main.temp);
    changeTempDesc(liveData.weather[0].description);
    changeFeelsLike(liveData.main.feels_like);
    changePressure(liveData.main.pressure);
    changeWind(liveData.wind.speed);
    changeHumidity(liveData.main.humidity);
    changeMaxTemp(liveData.main.temp_max);
    changeMinTemp(liveData.main.temp_min);
    changeCityTime(liveData.dt, liveData.timezone);
    changeBG(liveData.weather[0].id);
    changeLocation(liveData.name, liveData.sys.country);
};

const triggerFutureChanges = (futureData) => {
    // ---------- HOURLY FORECAST ----------
    const timezoneOffset = futureData.city.timezone;
    const currentUTC = Math.floor(Date.now() / 1000);
    const cityCurrentTime = currentUTC + timezoneOffset;
    const futureList = futureData.list.filter(item => (item.dt + timezoneOffset) >= cityCurrentTime);
    const nextFive = futureList.slice(0, 5);

    const hours = [], hourlyTemp = [], hourlyTempCodes = [];

    nextFive.forEach(entry => {
        const utcTime = new Date((entry.dt + timezoneOffset) * 1000);
        const hour = utcTime.getUTCHours().toString().padStart(2, "0");
        const minutes = utcTime.getUTCMinutes().toString().padStart(2, "0");
        hours.push(`${hour}:${minutes}`);
        hourlyTemp.push(Math.round(entry.main.temp));
        hourlyTempCodes.push(entry.weather[0].id);
    });

    changeHour(hours);
    changeHourlyTemp(hourlyTemp);
    changeHourlyImg(hourlyTempCodes);

    // ---------- DAILY FORECAST ----------
    const dailyAggregates = {};
    const daysToShow = 5;
    const targetDates = [];

    for (let d = 1; d <= daysToShow; d++) {
        const date = new Date(Date.now() + d * 86400000);
        const cityDate = new Date(date.getTime() + timezoneOffset * 1000);
        const dateKey = cityDate.toISOString().slice(0, 10);
        targetDates.push(dateKey);
        dailyAggregates[dateKey] = { sum: 0, count: 0, codes: [] };
    }

    for (let forecastItem of futureData.list) {
        const forecastDate = new Date((forecastItem.dt + timezoneOffset) * 1000).toISOString().slice(0, 10);
        if (dailyAggregates[forecastDate]) {
            dailyAggregates[forecastDate].sum += forecastItem.main.temp;
            dailyAggregates[forecastDate].count++;
            dailyAggregates[forecastDate].codes.push(forecastItem.weather[0].id);
        }
    }

    const dailyAvgTemps = [], formattedDates = [], dailyTempCodes = [];
    targetDates.forEach(dateKey => {
        const aggregate = dailyAggregates[dateKey];
        if (aggregate.count > 0) {
            const avg = parseFloat((aggregate.sum / aggregate.count).toFixed(2));
            dailyAvgTemps.push(avg);
            const codes = aggregate.codes;
            const dominantCode = codes.sort((a, b) =>
                codes.filter(v => v === a).length - codes.filter(v => v === b).length
            ).pop();
            dailyTempCodes.push(dominantCode);
        } else {
            dailyAvgTemps.push(null);
            dailyTempCodes.push(null);
        }
        formattedDates.push(`${dateKey.slice(8, 10)}/${dateKey.slice(5, 7)}`);
    });

    changeDate(formattedDates);
    changeDailyTemp(dailyAvgTemps);
    changeDailyImg(dailyTempCodes);
};

const searchBarError = () => {
    searchbox.classList.add('error');
    setTimeout(() => searchbox.classList.remove('error'), 1000);
};

const defaultCity = "Kolkata";
async function main(city = defaultCity){
    const url1 = URL1 + city.trim();
    const url2 = URL2 + city.trim();
    getLiveData(url1);
    getFutureData(url2);
}

async function initWeather(){
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        console.log("Geolocation not supported, using default city.");
        main(defaultCity);
    }
}

async function successCallback(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const url1 = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const url2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    
    getLiveData(url1);
    getFutureData(url2);
}

function errorCallback(error) {
    console.warn("Location access denied or unavailable:", error.message);
    main(defaultCity);
}

searchbtn.addEventListener('click', () => main(searchbox.value));
document.addEventListener('keypress', (event) => {
    if((event.key === 'Enter') && (searchbox.value.trim() !== "")){
        main(searchbox.value);
    }
});
window.addEventListener('load', initWeather);