const firstSity = document.querySelector(".js-firstSity");
const secondSity = document.querySelector(".js-secondSity");
const thirdSity = document.querySelector(".js-thirdSity");
const fourthSity = document.querySelector(".js-fourthSity");
const fifthSity = document.querySelector(".js-fifthSity");

function jsFirstSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = firstSity.textContent;
    getWeather(50.4501, 30.523400000000038, 'ru');
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = '50.4501';
        weatherWay.start.lng = '30.523400000000038';
        weatherWay.start.sityName = 'Киев';

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsSecondSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = secondSity.textContent;
    getWeather(48.46471700000001, 35.04618299999993, 'ru');
    positions.sityFullName = 'Днипро, Днепропетровская область, Украина';
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = '48.46471700000001';
        weatherWay.start.lng = '35.04618299999993';
        weatherWay.start.sityName = 'Днипро';

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsThirdSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = thirdSity.textContent;
    getWeather(49.83968300000001, 24.029717000000005, 'ru');
    positions.sityFullName = 'Львов, Львовская область, Украина';
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = '49.83968300000001';
        weatherWay.start.lng = '24.029717000000005';
        weatherWay.start.sityName = 'Львов';

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsFourthSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = fourthSity.textContent;
    getWeather(49.9935, 36.230383000000074, 'ru');
    positions.sityFullName = 'Харьков, Харьковская область, Украина';
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = '49.9935';
        weatherWay.start.lng = '36.230383000000074';
        weatherWay.start.sityName = 'Харьков';

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsFifthSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = fifthSity.textContent;
    getWeather(46.482526, 30.723309500000028, 'ru');
    positions.sityFullName = 'Одесса, Одесская область, Украина';
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = '46.482526';
        weatherWay.start.lng = '30.723309500000028';
        weatherWay.start.sityName = 'Одесса';

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

firstSity.addEventListener("click", jsFirstSity);
secondSity.addEventListener("click", jsSecondSity);
thirdSity.addEventListener("click", jsThirdSity);
fourthSity.addEventListener("click", jsFourthSity);
fifthSity.addEventListener("click", jsFifthSity);
