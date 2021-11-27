let weather = {
        now: {
          icon: '',
          temperature: '',
          description: ''
        },
        today: {
          header: {},
          body: []
        },
        tomorrow: {
          header: {},
          body: []
        },
        weekend: {
          saturday: {
            header: {},
            body: []
          },
          sunday: {
            header: {},
            body: []
            }
          }
        }

// Загружаем погоду в Киеве (по умолчанию)
getWeather(50.4501, 30.523400000000038, 'ru');

function getWeather(lat, lng, lang) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    //console.log(this.readyState == 4 && this.status == 200);
    if (this.readyState == 4 && this.status == 200) {

      function Header(time) {
        let date = getDate(time);
        this.weekday = date.toLocaleString(lang, {weekday: 'long'});
        this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric'});
        //this.date = date.toLocaleString(lang, {day: '2-digit', month: 'long', year: 'numeric', hour: 'numeric', minute: 'numeric'});
      }

      function WeatherStr(title, icon, precipType, temperature, description) {
        this.title = title;
        this.icon = icon;
        this.precipType = precipType;
        if(temperature > 0) {
           this.temperature = '+' + Math.round(temperature);
        } else {
           this.temperature = Math.round(temperature);
        }

        this.description = description;
      }

      const myWeather = JSON.parse(this.responseText);
      //console.log(myWeather.current.weather[0].icon);

      // погода сейчас
      weather.now.icon = myWeather.current.weather[0].icon;
      weather.now.description = myWeather.current.weather[0].description;
      if(myWeather.current.temp > 0) {
         weather.now.temperature = `+${Math.round(myWeather.current.temp)}`;
      } else {
         weather.now.temperature = Math.round(myWeather.current.temp);
      }

      // погода сегодня
      const nextDayIndex = 24 - getDate(myWeather.hourly[0].dt).getHours();

      weather.today.header = new Header(myWeather.hourly[0].dt);

      const srcArrToday = myWeather.hourly.slice(0, nextDayIndex + 1);

      // погода сегодня - шаг 2 часа
      let arrToday = [];

      srcArrToday.forEach((el, i) => arrToday[i] = new WeatherStr(getDate(el.dt).toLocaleString(lang, {hour: '2-digit'}), el.weather[0].icon, el.weather[0].main, Math.round(el.temp), el.weather[0].description));

      weather.today.body = arrToday.filter(n => n.title % 2 === 0).map(el => new WeatherStr(el.title + ':00', el.icon, el.precipType, el.temperature, el.description));

      weather.today.body[weather.today.body.length - 1].title = '24:00';

      // погода завтра
      weather.tomorrow.header = new Header(myWeather.hourly[nextDayIndex].dt);
      const srcArrTomorrow = myWeather.hourly.slice(nextDayIndex, nextDayIndex + 25);
      const nightPeriod = srcArrTomorrow[2];
      const morningPeriod = srcArrTomorrow[8];
      const dayPeriod = srcArrTomorrow[14];
      const eveningPeriod = srcArrTomorrow[20];
      const srcArrTomorrowLite = [nightPeriod, morningPeriod, dayPeriod, eveningPeriod];
      const periods = ['Ночь', 'Утро', 'День', 'Вечер'];
      srcArrTomorrowLite.forEach((el, i) => weather.tomorrow.body[i] = new WeatherStr(periods[i], el.weather[0].icon, el.weather[0].main, Math.round(el.temp), el.weather[0].description));
      /*srcArrTomorrow.forEach((el, i) => weather.tomorrow.body[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit', minute: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));*/

      // погода на выходные
      let dayWeek = getDate(myWeather.hourly[0].dt).getDay();
      //let dayWeek = 6;

      let daysBeforeSaturday;
      if(dayWeek < 6) {
         daysBeforeSaturday = 6 - dayWeek;
      } else if(dayWeek === 6) {
         daysBeforeSaturday = 0;
      }

      let daysBeforeSunday;
      if(dayWeek < 7) {
         daysBeforeSunday = 7 - dayWeek;
      } else if(dayWeek === 0) {
          daysBeforeSunday = 0;
          sundayHide();
      }

      let saturdayHours = nextDayIndex + daysBeforeSaturday*24;
      let sundayHours = nextDayIndex + daysBeforeSunday*24;

      weather.weekend.saturday.header = new Header(myWeather.daily[daysBeforeSaturday].dt);
      weather.weekend.sunday.header = new Header(myWeather.daily[daysBeforeSunday].dt);

      // погода на выходные - Суббота
      let srcArrSaturday = myWeather.daily[daysBeforeSaturday];

      const nightSaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.night,
        summary: srcArrSaturday.weather[0].description
      };
      const morningSaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.morn,
        summary: srcArrSaturday.weather[0].description
      };
      const daySaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.day,
        summary: srcArrSaturday.weather[0].description
      };
      const eveningSaturday = {
        time: srcArrSaturday.dt,
        icon: srcArrSaturday.weather[0].icon,
        precipType: srcArrSaturday.weather[0].main,
        temperature: srcArrSaturday.temp.eve,
        summary: srcArrSaturday.weather[0].description
      };
      const srcArrSaturdayLite = [nightSaturday, morningSaturday, daySaturday, eveningSaturday];

      srcArrSaturdayLite.forEach((el, i) => weather.weekend.saturday.body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));
      /*srcArrSaturday.forEach((el, i) => weather.weekend.saturday.body[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit', minute: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));*/

      // погода на выходные - Воскресенье
      const srcArrSunday = myWeather.daily[daysBeforeSunday];

      const nightSunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.night,
        summary: srcArrSunday.weather[0].description
      };
      const morningSunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.morn,
        summary: srcArrSunday.weather[0].description
      };
      const daySunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.day,
        summary: srcArrSunday.weather[0].description
      };
      const eveningSunday = {
        time: srcArrSunday.dt,
        icon: srcArrSunday.weather[0].icon,
        precipType: srcArrSunday.weather[0].main,
        temperature: srcArrSunday.temp.eve,
        summary: srcArrSunday.weather[0].description
      };
      const srcArrSundayLite = [nightSunday, morningSunday, daySunday, eveningSunday];

      srcArrSundayLite.forEach((el, i) => weather.weekend.sunday.body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));

      // получение даты из числа в ответе API
      function getDate(time) {

        let date = new Date(1000 * time);

        return date;
      }

      //иконка в хедере
      iconWeather();
      //текст "Сейчас за окном"
      textWeather();

      // Компилируем шаблоны
       headerTemplate();
       todayHeaderTemplate();
       todayTemplate();
       tomorrowHeaderTemplate();
       tomorrowTemplate();
       saturdayHeaderTemplate();
       saturdayTemplate();
       sundayHeaderTemplate();
       sundayTemplate();

       // Иконки в page
       iconTodayWeather();
       iconTomorowWeather();
       iconWeekendWeather();

    } //if ends
  } //onready end

  //const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + '?extend=hourly&lang=' + lang + '&units=si';

  const address = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&lang=${lang}&units=metric&appid=1f2df059e0dcefe5b9990d6851316f83`;

  request.open('GET', address, true);
  request.send();

    //return weather;
}

