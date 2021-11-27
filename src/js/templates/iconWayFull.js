function iconWayFull() {
  let skycons = new Skycons({"color": "#009587"});
  let icons = document.querySelectorAll(".wayfull__precip canvas");

  icons.forEach(function(elem) {
    skycons.add(elem, skyconType(elem.className));
  });

  skycons.play();
  console.log(skycons);
}
