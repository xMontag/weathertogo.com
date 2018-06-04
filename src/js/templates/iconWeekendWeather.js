function iconWeekendWeather() {
  let skycons = new Skycons({"color": "#009587"});
  let icons = document.querySelectorAll(".weekend__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
}
