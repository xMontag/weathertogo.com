let weatherWay = {

   start: {

        lat: '50.4501', // Киев
        lng: '30.523400000000038', // Киев
        sityName: 'Киев',
        toDay: {
          header: {},
          body: []
        }

   }

}

function dateConvert(timeCalendar) {

 let arrTimeCalendar = timeCalendar.split(".");
 let dayTime = arrTimeCalendar[0];
 let monthTime = arrTimeCalendar[1] - 1;
 let yearTime = arrTimeCalendar[2];

  let date = new Date(yearTime, monthTime, dayTime);
  let time = date.getTime() / 1000;
  return time;
}

function getWeatherWay(lat, lng, time, lang) {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {

    if (this.readyState == 4 && this.status == 200) {

      const myWeatherWay = JSON.parse(this.responseText);
      console.log(myWeatherWay);

      function Header(times) {
        let date = getDate(times);
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

      // погода в дорогу - все города после первого
      weatherWay[`start_${positionsAddCity.count}`]['toDay']['header'] = new Header(myWeatherWay.hourly.data[0].time);
      const srcArrToDate = myWeatherWay.hourly.data.slice(0, 24);

      const dayPeriod = srcArrToDate[12];
      const nightPeriod = srcArrToDate[23];

      const srcArrToDateLite = [dayPeriod, nightPeriod];
      console.log(srcArrToDateLite);
      const periods = ['Днем', 'Ночью'];
      srcArrToDateLite.forEach((el, i) => weatherWay[`start_${positionsAddCity.count}`]['toDay'].body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));

      console.log(weatherWay);

      // получение даты из числа в ответе API
      function getDate(times) {

        let date = new Date(1000 * times);

        return date;
      }

      // Компилируем шаблон
       wayfullTemplate(weatherWay[`start_${positionsAddCity.count}`]);

       // Иконки
       iconWayFull();

    } //if ends
  } //onready end
  const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + ',' + time + '?extend=hourly&lang=ru&units=si';

  request.open('GET', address, true);
  request.send();

}
