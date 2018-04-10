function getWeatherWayFirst(lat, lng, time, lang) {
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

      // погода в дорогу - первый город
      weatherWay['start']['toDay']['header'] = new Header(myWeatherWay.hourly.data[0].time);
      const srcArrToDate = myWeatherWay.hourly.data.slice(0, 24);

      const dayPeriod = srcArrToDate[12];
      const nightPeriod = srcArrToDate[23];

      const srcArrToDateLite = [dayPeriod, nightPeriod];
      console.log(srcArrToDateLite);
      const periods = ['Днем', 'Ночью'];
      srcArrToDateLite.forEach((el, i) => weatherWay['start']['toDay'].body[i] = new WeatherStr(periods[i], el.icon, el.precipType, Math.round(el.temperature), el.summary));

      console.log(weatherWay);

      // получение даты из числа в ответе API
      function getDate(times) {

        let date = new Date(1000 * times);

        return date;
      }

      // Компилируем шаблон
       wayfullTemplateFirst(weatherWay['start']);

       // Иконки
       iconWayFull();

    } //if ends
  } //onready end
  const address = 'https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/606d16650a24656a795100b26c1b1a3e/' + lat + ',' + lng + ',' + time + '?extend=hourly&lang=ru&units=si';

  request.open('GET', address, true);
  request.send();

}
