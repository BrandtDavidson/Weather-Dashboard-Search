// TODO:

// geo API (openWeather): http://api.openweathermap.org/geo/1.0/direct?q=Tucson,,US&limit=5&appid=e79dd9d55d402ba24cf3a98e8d1934a3

// my OpenWeather API Key (please don't use): e79dd9d55d402ba24cf3a98e8d1934a3

// example api url: https://api.openweathermap.org/data/2.5/onecall?lat=33.44&lon=-94.04&exclude=hourly,daily&appid=e79dd9d55d402ba24cf3a98e8d1934a3

// jquery standard naming for easier js

var stickyCities = $("#cityPinnedlist");
var apiKey = "e79dd9d55d402ba24cf3a98e8d1934a3";
var cities = [];
var getGeoCodeUrl = (cityName) =>
  `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},,US&limit=5&appid=${apiKey}`;

var getWeatherURL = (lat,lon) => 
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${apiKey}&units=imperial`;

const CITY_STORAGE_KEY = "cityWatchList";

// Ensure city input and list are correctly stored in localStore for the pinnedList

function getCityWatchList() {
  var cityWatchList = JSON.parse(localStorage.getItem(CITY_STORAGE_KEY));

  if (cityWatchList === null) {
    cityWatchList = [];
  }
  return cityWatchList;
}

function setCityWatchList(cityWatchList) {
  localStorage.setItem(CITY_STORAGE_KEY, JSON.stringify(cityWatchList));
}


function populateForecastData(element, cityName, date, temp, weatherData) {
    element.find('.city .city_name').text(cityName);
    element.find('.city .date').text(date.format('L'));
    element.find('.city .icon').text('');
    element.find('.temp').text(temp);
    element.find('.wind').text(weatherData.wind_speed);
    element.find('.humidity').text(weatherData.humidity);
    element.find('.uv').text(weatherData.uvi);

    var uviClass = 'low';

    if (weatherData.uvi > 2) {
        if (weatherData.uvi > 5) {
            if (weatherData.uvi > 7) {
                if (weatherData.uvi > 10) {
                    uviClass = 'extreme';
                } else {
                    uviClass = 'very_high';
                } 
            } else {
                uviClass = 'high';
            }
        } else {
            uviClass = 'moderate';
        }
    } 

    element.find('.uv').addClass(uviClass);

}


function populateCity(cityName, weatherData) {
    populateForecastData($('#currentDayWeather'), cityName, moment(), weatherData.current.temp, weatherData.current);

    weatherData.daily.slice(1,5).forEach((dailyWeatherData, i) => {
        console.log(dailyWeatherData);
        // clone(), this is to prevent cloning the same id over again for each card
        var forecast = $('#forecastPrototype').clone().attr('id', `daily-forecast-${i}`);

    

        populateForecastData(forecast, cityName, moment(dailyWeatherData.dt * 1000),dailyWeatherData.temp.day, dailyWeatherData);

        $('#boxesFiveDay').append(forecast);
    });


    $('#currentCityWeather').show();
}


function selectCity(city) {
  console.log(city);
  $.ajax(getGeoCodeUrl(city)).then((response) => {
    $.ajax(getWeatherURL(response[0].lat, response[0].lon)).then((weatherResponse)=> {
        populateCity(response[0].name, weatherResponse);
    });
  });
}

function pageRefresh() {
  $("#cityPinnedList").empty();

  getCityWatchList().forEach((city) => {
    var cityAppend = $('<li><span class="badge badge-primary">' + city + '<span></li>');
    cityAppend.on("click", function () {
      selectCity(city);
    });
    $("#cityPinnedList").append(cityAppend);
  });
}

function cityLog() {
  localStorage.setItem("inputtedCity", JSON.stringify(inputtedCity));
}

$(document).ready(function () {
  pageRefresh();
  $('#currentCityWeather').hide();

  $("#pinCity").on("click", function (event) {
    event.preventDefault();
    var cityWatchList = getCityWatchList();
    var cityName = $("#cityInputField").val().trim();
    if (cityName === "") {
      return;
    }

    if (cityWatchList.indexOf(cityName) === -1) {
      cityWatchList.push(cityName);
      setCityWatchList(cityWatchList);
    }

    selectCity(cityName);

    pageRefresh();

  });
});
