const inputCity = document.getElementById("search-city");
const autocomplete = new google.maps.places.Autocomplete(inputCity, {
    types: ["(cities)"]
});
const currentPlace = document.getElementById("header-visual__city");

// координаты Киева
const positions = {
           latPositions: '',
           lngPositions: '',
           sityFullName: 'Киев, Украина'
         };

const addsitySity = document.querySelector(".add-sity__sity");

google.maps.event.addListener(autocomplete, "place_changed", function () {
    // в этой переменной получаем объект город
    const place = autocomplete.getPlace();

    // -------------------- отладочный блок -------------------
    console.log(place);

    currentPlace.textContent = place.name;

    positions.latPositions = place.geometry.location.lat();
    positions.lngPositions = place.geometry.location.lng();
    positions.sityFullName = place.formatted_address;

    if(inputTime === undefined || weatherWay.start !== undefined) {
          weatherWay.start.lat = place.geometry.location.lat();
          weatherWay.start.lng = place.geometry.location.lng();
          weatherWay.start.sityName = place.name;
    }

    addsitySity.textContent = positions.sityFullName;

    console.log(place.formatted_address);
    getWeather(positions.latPositions, positions.lngPositions, 'ru');
})
