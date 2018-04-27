const firstSity = document.querySelector(".js-firstSity");
const secondSity = document.querySelector(".js-secondSity");
const thirdSity = document.querySelector(".js-thirdSity");
const fourthSity = document.querySelector(".js-fourthSity");
const fifthSity = document.querySelector(".js-fifthSity");

const citysFavorite = {

           firstSity: {
             sityFullName: 'Киев, Украина',
             sityName: 'Киев',
             lat: '50.4501',
             lng: '30.523400000000038'
           },

            secondSity: {
             sityFullName: 'Днипро, Днепропетровская область, Украина',
             sityName: 'Днипро',
             lat: '48.46471700000001',
             lng: '35.04618299999993'
           },

           thirdSity: {
             sityFullName: 'Львов, Львовская область, Украина',
             sityName: 'Львов',
             lat: '49.83968300000001',
             lng: '24.029717000000005'
           },

           fourthSity: {
             sityFullName: 'Харьков, Харьковская область, Украина',
             sityName: 'Харьков',
             lat: '49.9935',
             lng: '36.230383000000074'
           },

           fifthSity: {
             sityFullName: 'Одесса, Одесская область, Украина',
             sityName: 'Одесса',
             lat: '46.482526',
             lng: '30.723309500000028'
           }

         };

const addLocStorStart = () => {

  let arrListCitys = [];
  let lsLen = localStorage.length;
  if(lsLen > 0){
      for(let i = 0; i < lsLen; i++){
        let key = localStorage.key(i);
        arrListCitys.push(JSON.parse(localStorage.getItem(key)));
      }
  }

  const sortNames = arrListCitys.reduce(
    (o, v, count) => {

        let index = o.findIndex(el => el.count < v.count);
        return ((index > -1) ? o.splice(index, 0, v) : o.push(v)), o;

    }, []);

  changeFavoriteCitys(sortNames);

};

addLocStorStart();

const addLocStor = () => {

  if(localStorage.getItem(positions.sityName) !== null) {
     positions.count = JSON.parse(localStorage.getItem(positions.sityName)).count + 1;
  } else {
     positions.count = 1;
  }

  localStorage.setItem(positions.sityName,  JSON.stringify(positions));

  let arrListCitys = [];
  let lsLen = localStorage.length;
  if(lsLen > 0){
      for(let i = 0; i < lsLen; i++){
        let key = localStorage.key(i);
        arrListCitys.push(JSON.parse(localStorage.getItem(key)));
      }
  }

  const sortNames = arrListCitys.reduce(
    (o, v, count) => {

        let index = o.findIndex(el => el.count < v.count);
        return ((index > -1) ? o.splice(index, 0, v) : o.push(v)), o;

    }, []);

  console.log(sortNames);

  changeFavoriteCitys(sortNames);

};

function changeFavoriteCitys(arr) {

  if(arr.length > 0) {

     if(arr[0]['count'] > 1) {
         citysFavorite.firstSity.sityFullName = arr[0]['sityFullName'];
         citysFavorite.firstSity.sityName = arr[0]['sityName'];
         citysFavorite.firstSity.lat = arr[0]['latPositions'];
         citysFavorite.firstSity.lng = arr[0]['lngPositions'];
         firstSity.textContent = citysFavorite.firstSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Днипро' && arr.length === 1) {
       secondSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Львов' && arr.length === 1) {
       thirdSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Харьков' && arr.length === 1) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 1) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 1) {

     if(arr[1]['count'] > 1) {
         citysFavorite.secondSity.sityFullName = arr[1]['sityFullName'];
         citysFavorite.secondSity.sityName = arr[1]['sityName'];
         citysFavorite.secondSity.lat = arr[1]['latPositions'];
         citysFavorite.secondSity.lng = arr[1]['lngPositions'];
         secondSity.textContent = citysFavorite.secondSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Львов' && arr.length === 2) {
       thirdSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Львов' && arr.length === 2) {
       thirdSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Харьков' && arr.length === 2) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Харьков' && arr.length === 2) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 2) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Одесса' && arr.length === 2) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 2) {

     if(arr[2]['count'] > 1) {
         citysFavorite.thirdSity.sityFullName = arr[2]['sityFullName'];
         citysFavorite.thirdSity.sityName = arr[2]['sityName'];
         citysFavorite.thirdSity.lat = arr[2]['latPositions'];
         citysFavorite.thirdSity.lng = arr[2]['lngPositions'];
         thirdSity.textContent = citysFavorite.thirdSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Харьков' && arr.length === 3) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Харьков' && arr.length === 3) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.thirdSity.sityName === 'Харьков' && arr.length === 3) {
       fourthSity.textContent = '';
    }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 3) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Одесса' && arr.length === 3) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.thirdSity.sityName === 'Одесса' && arr.length === 3) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 3) {

     if(arr[3]['count'] > 1) {
         citysFavorite.fourthSity.sityFullName = arr[3]['sityFullName'];
         citysFavorite.fourthSity.sityName = arr[3]['sityName'];
         citysFavorite.fourthSity.lat = arr[3]['latPositions'];
         citysFavorite.fourthSity.lng = arr[3]['lngPositions'];
         fourthSity.textContent = citysFavorite.fourthSity.sityName;
     }

    if(citysFavorite.firstSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.secondSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.thirdSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

    if(citysFavorite.fourthSity.sityName === 'Одесса' && arr.length === 4) {
       fifthSity.textContent = '';
    }

  }

  if(arr.length > 4) {

     if(arr[4]['count'] > 1) {
         citysFavorite.fifthSity.sityFullName = arr[4]['sityFullName'];
         citysFavorite.fifthSity.sityName = arr[4]['sityName'];
         citysFavorite.fifthSity.lat = arr[4]['latPositions'];
         citysFavorite.fifthSity.lng = arr[4]['lngPositions'];
         fifthSity.textContent = citysFavorite.fifthSity.sityName;
     }

  }

}

function jsFirstSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = firstSity.textContent;
    getWeather(citysFavorite.firstSity.lat, citysFavorite.firstSity.lng, 'ru');
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.firstSity.lat;
        weatherWay.start.lng = citysFavorite.firstSity.lng;
        weatherWay.start.sityName = citysFavorite.firstSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsSecondSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = secondSity.textContent;
    getWeather(citysFavorite.secondSity.lat, citysFavorite.secondSity.lng, 'ru');
    positions.sityFullName = citysFavorite.secondSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.secondSity.lat;
        weatherWay.start.lng = citysFavorite.secondSity.lng;
        weatherWay.start.sityName = citysFavorite.secondSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsThirdSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = thirdSity.textContent;
    getWeather(citysFavorite.thirdSity.lat, citysFavorite.thirdSity.lng, 'ru');
    positions.sityFullName = citysFavorite.thirdSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.thirdSity.lat;
        weatherWay.start.lng = citysFavorite.thirdSity.lng;
        weatherWay.start.sityName = citysFavorite.thirdSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsFourthSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = fourthSity.textContent;
    getWeather(citysFavorite.fourthSity.lat, citysFavorite.fourthSity.lng, 'ru');
    positions.sityFullName = citysFavorite.fourthSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.fourthSity.lat;
        weatherWay.start.lng = citysFavorite.fourthSity.lng;
        weatherWay.start.sityName = citysFavorite.fourthSity.sityName;

        if(inputTime !== undefined) {
           getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        }

    }

}

function jsFifthSity(evt) {
    evt.preventDefault();
    currentPlace.textContent = fifthSity.textContent;
    getWeather(citysFavorite.fifthSity.lat, citysFavorite.fifthSity.lng, 'ru');
    positions.sityFullName = citysFavorite.fifthSity.sityFullName;
    addsitySity.textContent = positions.sityFullName;
    if(weatherWay.start !== undefined) {
        weatherWay.start.lat = citysFavorite.fifthSity.lat;
        weatherWay.start.lng = citysFavorite.fifthSity.lng;
        weatherWay.start.sityName = citysFavorite.fifthSity.sityName;

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
