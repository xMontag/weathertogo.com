function getWeatherWayFirst(lat, lng, time, lang) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {

    if (this.readyState == 4 && this.status == 200) {

      const myWeatherWay = JSON.parse(this.responseText);

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

      // погода в дорогу - первый город
      this.time = time;
      const amendment = 39600; // разница времени между 2 API
      const dailyNow = this.time + amendment;
      const dailyCountDay = Math.round((dailyNow - myWeatherWay.daily[0].dt)/86400); // 86400 - количество секунд в 24 часах

      weatherWay['start']['toDay']['header'] = new Header(myWeatherWay.daily[dailyCountDay].dt);

      const srcArrToDate = myWeatherWay.daily[dailyCountDay];

      const dayPeriod = {
        time: srcArrToDate.dt,
        icon: srcArrToDate.weather[0].icon,
        precipType: srcArrToDate.weather[0].main,
        temperature: srcArrToDate.temp.day,
        summary: srcArrToDate.weather[0].description
      };
      const nightPeriod = {
        time: srcArrToDate.dt,
        icon: srcArrToDate.weather[0].icon,
        precipType: srcArrToDate.weather[0].main,
        temperature: srcArrToDate.temp.night,
        summary: srcArrToDate.weather[0].description
      };

      const srcArrToDateLite = [dayPeriod, nightPeriod];

      const periods = ['Днем', 'Ночью'];
      srcArrToDateLite.forEach((el, i) => weatherWay['start']['toDay'].body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));

      // получение даты из числа в ответе API
      function getDate(times) {

        let date = new Date(1000 * times);

        return date;
      }
console.log(weatherWay);
      // Компилируем шаблон
       wayfullTemplateFirst(weatherWay['start']);

       // Иконки
       iconWayFull();

    } //if ends
  } //onready end

  // const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + ',' + time + '?extend=hourly&lang=ru&units=si';

  const address = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&lang=${lang}&units=metric&appid=1f2df059e0dcefe5b9990d6851316f83`;
//console.log(address);
  request.open('GET', address, true);
  request.send();

}
