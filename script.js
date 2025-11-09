const bg = document.querySelector('.bg');
const searchbtn = document.querySelector('#searchbtn');
const searchbox = document.querySelector('#searchbox');

const currTemp = document.querySelector('#currTemp');
const tempDesc = document.querySelector('#tempDesc');
const feelsLike = document.querySelector('#feelsLike');
const pressure = document.querySelector('#pressure');
const wind = document.querySelector('#wind');
const humidity = document.querySelector('#humidity');
const maxTemp = document.querySelector('#maxTemp');
const minTemp = document.querySelector('#minTemp');
const cityTime = document.querySelector('#cityTime');

const defaultCity = "Kolkata";
// Get your own key please! :)
const API_KEY = "e3c604123ea3290088442bcbabc77d33";
const URL1 = `https://api.openweathermap.org/data/2.5/weather?units=metric&appid=${API_KEY}&q=`;
const URL2 = `https://api.openweathermap.org/data/2.5/forecast?units=metric&appid=${API_KEY}&q=`;

//Async function for Live Data
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

//Async function for Future Data
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

//Distrete Change Functions
const changeBG = (val) => {
    val = Number(val);
    if(val == 800){
        bg.setAttribute('src', '/Resources/Videos/sunny.mp4')
    }
    else if(val>=200 && val<=299) {
        bg.setAttribute('src', '/Resources/Videos/thunderStorm.mp4')
    }
    else if(val>=300 && val<=599) {
        bg.setAttribute('src', '/Resources/Videos/rain.mp4')
    }
    else if(val>=600 && val<=699) {
        bg.setAttribute('src', '/Resources/Videos/snow.mp4')
    }
    else if(val>=700 && val<=799) {
        bg.setAttribute('src', '/Resources/Videos/foggy.mp4')
    }
    else if(val>=801 && val<=899) {
        bg.setAttribute('src', '/Resources/Videos/cloudy.mp4')
    }
}
const changeTemp = (val) => {
    currTemp.innerText = Math.round(val) + "°C";
}
const changeTempDesc = (val) => {
    const formatVal = val[0].toUpperCase() + val.slice(1, val.length);
    tempDesc.innerText = formatVal;
}
const changeFeelsLike = (val) => {
    feelsLike.innerText = val + "°C";
}
const changePressure = (val) => {
    pressure.innerText = val + ' hPa';
}
const changeWind = (val) => {
    wind.innerText = val + ' m/s';
}
const changeHumidity = (val) => {
    humidity.innerText = val + '%';
}
const changeMaxTemp = (val) => {
    maxTemp.innerText = val + "°C";
}
const changeMinTemp = (val) => {
    minTemp.innerText = val + "°C";
}
const changeCityTime = (unixUTC, timezoneOffset) => {
    const localTimestamp = (unixUTC + timezoneOffset) * 1000;
    const localTime = new Date(localTimestamp);
    const timeStr = localTime.toISOString().substring(11, 16);
    cityTime.innerText = timeStr;
};
const changeDate = (dates) => {
    for(let i=0; i<5; i++){
        let currElem = `date${i+1}`;
        let elem = document.querySelector(`#${currElem}`);
        elem.innerText = dates[i];
    }
}
const changeDailyTemp = (dailyTemp) => {
    for(let i=0; i<5; i++){
        let currElem = `d${i+1}`;
        let elem = document.querySelector(`#${currElem}`);
        elem.innerText = dailyTemp[i] + "°C";
    }
}
const changeHour = (hours) => {
    for(let i=0; i<5; i++){
        let currElem = `hour${i+1}`;
        let elem = document.querySelector(`#${currElem}`);
        elem.innerText = hours[i];
    }
}
const changeHourlyTemp = (hourlyTemp) => {
    for(let i=0; i<5; i++){
        let currElem = `h${i+1}`;
        let elem = document.querySelector(`#${currElem}`);
        elem.innerText = hourlyTemp[i] + "°C";
    }
}

//Executes all the individual live-data changes for the website
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
}

//Executes all the individual future-data changes for the website
const triggerFutureChanges = (futureData) => {
    // ---------- HOURLY FORECAST ----------
    const timezoneOffset = futureData.city.timezone;
    const currentUTC = Math.floor(Date.now() / 1000);
    const cityCurrentTime = currentUTC + timezoneOffset;
    const futureList = futureData.list.filter(item => (item.dt + timezoneOffset) >= cityCurrentTime);
    const nextFive = futureList.slice(0, 5);
    const hours = [];
    const hourlyTemp = [];

    nextFive.forEach(entry => {
        const utcTime = new Date((entry.dt + timezoneOffset) * 1000);
        const hour = utcTime.getUTCHours().toString().padStart(2, "0");
        const minutes = utcTime.getUTCMinutes().toString().padStart(2, "0");
        const timeText = `${hour}:${minutes}`;
        const temp = Math.round(entry.main.temp);
        hours.push(timeText);
        hourlyTemp.push(temp);
    });

    changeHour(hours);
    changeHourlyTemp(hourlyTemp);


    // ---------- DAILY FORECAST ----------
    const dailyAggregates = {};
    const daysToShow = 5;
    const targetDates = [];
    
    for (let d = 1; d <= daysToShow; d++) {
        const date = new Date(Date.now() + d * 86400000);
        const cityDate = new Date(date.getTime() + timezoneOffset * 1000);
        const dateKey = cityDate.toISOString().slice(0, 10);
        targetDates.push(dateKey);
        dailyAggregates[dateKey] = { sum: 0, count: 0 };
    }

    for (let i = 0; i < futureData.list.length; i++) {
        const forecastItem = futureData.list[i];
        const forecastDate = new Date((forecastItem.dt + timezoneOffset) * 1000)
            .toISOString()
            .slice(0, 10);
        if (dailyAggregates[forecastDate]) {
            dailyAggregates[forecastDate].sum += forecastItem.main.temp;
            dailyAggregates[forecastDate].count += 1;
        }
    }

    const dailyAvgTemps = [];
    const formattedDates = [];

    targetDates.forEach(dateKey => {
        const aggregate = dailyAggregates[dateKey];
        if (aggregate && aggregate.count > 0) {
            let average = aggregate.sum / aggregate.count;
            average = parseFloat(average.toFixed(2));
            dailyAvgTemps.push(average);
        } else {
            dailyAvgTemps.push(null);
        }
        formattedDates.push(`${dateKey.slice(8, 10)}/${dateKey.slice(5, 7)}`);
    });

    changeDate(formattedDates);
    changeDailyTemp(dailyAvgTemps);
};

//Triggers an animation for the search bar
const searchBarError = () => {
    searchbox.classList.add('error');
    setTimeout(() => {
        searchbox.classList.remove('error');
    }, 1000);
} 

//Main trigger for the entire website
async function main(){
    let city = searchbox.value;
    if(city.trim() === ""){
        city = defaultCity;
        searchbox.setAttribute('placeholder', 'Kolkata');
    }
    const url1 = URL1 + city.trim();
    const url2 = URL2 + city.trim();

    try{
        await getLiveData(url1);
        await getFutureData(url2);
    }
    catch{}
}

//Triggers on pressing search button
searchbtn.addEventListener('click', main);

// Triggers when load
main();