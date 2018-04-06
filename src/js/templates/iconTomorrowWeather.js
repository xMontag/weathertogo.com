function iconTomorowWeather() {
  let skycons = new Skycons({"color": "#8f496c"});
  let icons = document.querySelectorAll(".tomorrow__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
}
