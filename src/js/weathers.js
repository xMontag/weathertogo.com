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

      // погода сейчас
      weather.now.icon = myWeather.currently.icon;
      weather.now.description = myWeather.currently.summary;
      if(myWeather.currently.temperature > 0) {
         weather.now.temperature = `+${Math.round(myWeather.currently.temperature)}`;
      } else {
         weather.now.temperature = Math.round(myWeather.currently.temperature);
      }

      // погода сегодня
      const nextDayIndex = 24 - getDate(myWeather.hourly.data[0].time).getHours();
      weather.today.header = new Header(myWeather.hourly.data[0].time);
      const srcArrToday = myWeather.hourly.data.slice(0, nextDayIndex + 1);

      // погода сегодня - шаг 2 часа
      let arrToday = [];

      srcArrToday.forEach((el, i) => arrToday[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));

      weather.today.body = arrToday.filter(n => n.title % 2 === 0).map(el => new WeatherStr(el.title + ':00', el.icon, el.precipType, el.temperature, el.description));

      weather.today.body[weather.today.body.length - 1].title = '24:00';

      // погода завтра
      weather.tomorrow.header = new Header(myWeather.hourly.data[nextDayIndex].time);
      const srcArrTomorrow = myWeather.hourly.data.slice(nextDayIndex, nextDayIndex + 25);
      const nightPeriod = srcArrTomorrow[2];
      const morningPeriod = srcArrTomorrow[8];
      const dayPeriod = srcArrTomorrow[14];
      const eveningPeriod = srcArrTomorrow[20];
      const srcArrTomorrowLite = [nightPeriod, morningPeriod, dayPeriod, eveningPeriod];
      const periods = ['Ночь', 'Утро', 'День', 'Вечер'];
      srcArrTomorrowLite.forEach((el, i) => weather.tomorrow.body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));
      /*srcArrTomorrow.forEach((el, i) => weather.tomorrow.body[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit', minute: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));*/

      // погода на выходные
      let dayWeek = getDate(myWeather.hourly.data[0].time).getDay();
      //let dayWeek = 6;


      let daysBeforeSaturday;
      if(dayWeek < 6) {
         daysBeforeSaturday = 5 - dayWeek;
      } else if(dayWeek === 6) {
         daysBeforeSaturday = 6;
      }

      let daysBeforeSunday;
      if(dayWeek < 6) {
         daysBeforeSunday = 6 - dayWeek;
      } else if(dayWeek === 6) {
          daysBeforeSunday = 0;
          sundayHide();
      }

      let saturdayHours = nextDayIndex + daysBeforeSaturday*24;
      let sundayHours = nextDayIndex + daysBeforeSunday*24;
      weather.weekend.saturday.header = new Header(myWeather.hourly.data[saturdayHours].time);
      weather.weekend.sunday.header = new Header(myWeather.hourly.data[sundayHours].time);

      // погода на выходные - Суббота
      let srcArrSaturday;
      if(daysBeforeSaturday !== 6) {
         srcArrSaturday = myWeather.hourly.data.slice(saturdayHours, saturdayHours + 24);
      } else {
          srcArrSaturday = myWeather.hourly.data.slice(saturdayHours - nextDayIndex, saturdayHours - nextDayIndex + 24);
      }

      const nightSaturday = srcArrSaturday[2];
      const morningSaturday = srcArrSaturday[8];
      const daySaturday = srcArrSaturday[14];
      const eveningSaturday = srcArrSaturday[20];
      const srcArrSaturdayLite = [nightSaturday, morningSaturday, daySaturday, eveningSaturday];
      srcArrSaturdayLite.forEach((el, i) => weather.weekend.saturday.body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));
      /*srcArrSaturday.forEach((el, i) => weather.weekend.saturday.body[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit', minute: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));*/

      // погода на выходные - Воскресенье
      const srcArrSunday = myWeather.hourly.data.slice(sundayHours, sundayHours + 24);
      const nightSunday = srcArrSunday[2];
      const morningSunday = srcArrSunday[8];
      const daySunday = srcArrSunday[14];
      const eveningSunday = srcArrSunday[20];
      const srcArrSundayLite = [nightSunday, morningSunday, daySunday, eveningSunday];
      if(dayWeek !== 0) {
          srcArrSundayLite.forEach((el, i) => weather.weekend.sunday.body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));
        } else {
          srcArrSunday.forEach((el, i) => weather.weekend.sunday.body[i] = new WeatherStr(getDate(el.time).toLocaleString(lang, {hour: '2-digit', minute: '2-digit'}), el.icon, el.precipType, Math.round(el.temperature), el.summary));
        }

      console.log(weather);
      console.log(myWeather);


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
       todayHeaderTemplate()
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
  const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + '?extend=hourly&lang=ru&units=si';
  //console.log(address);
  request.open('GET', address, true);
  request.send();

    //return weather;
}
