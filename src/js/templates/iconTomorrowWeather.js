function iconTomorowWeather() {
  let skycons = new Skycons({"color": "#009587"});
  let icons = document.querySelectorAll(".tomorrow__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
}
