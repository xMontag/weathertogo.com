function iconWeather () {
  let nowWeather = weather.now.icon;
  const skycons = new Skycons({"color": "#fcf9e3"});
  let icon = document.querySelector(".header-visual__icon");

  if (nowWeather === "clear-day") {
    icon.id="clear-day";
    skycons.add("clear-day", Skycons.PARTLY_CLOUDY_DAY);
  }else if (nowWeather === "clear-night") {
    icon.id="clear-night";
    skycons.add("clear-night", Skycons.CLEAR_NIGHT);
  }else if (nowWeather === "rain") {
    icon.id="rain";
    skycons.add("rain", Skycons.RAIN);
  }else if (nowWeather === "snow") {
    icon.id="snow";
    skycons.add("snow", Skycons.SNOW);
  }else if (nowWeather === "sleet") {
    icon.id="sleet";
    skycons.add("sleet", Skycons.SLEET);
  }else if (nowWeather === "wind") {
    icon.id="wind";
    skycons.add("wind", Skycons.WIND);
  }else if (nowWeather === "fog") {
    icon.id="fog";
    skycons.add("fog", Skycons.FOG);
  }else if (nowWeather === "cloudy") {
    icon.id="cloudy";
    skycons.add("cloudy", Skycons.CLOUDY);
  }else if (nowWeather === "partly-cloudy-day") {
    icon.id="partly-cloudy-day";
    skycons.add("partly-cloudy-day", Skycons.PARTLY_CLOUDY_DAY);
  }else if (nowWeather === "partly-cloudy-night") {
    icon.id="partly-cloudy-night";
    skycons.add("partly-cloudy-night", Skycons.PARTLY_CLOUDY_NIGHT);
  }
  skycons.play();

}
