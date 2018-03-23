const inputCity = document.getElementById("search-city");
const autocomplete = new google.maps.places.Autocomplete(inputCity, {
    types: ["(cities)"]
});

// координаты Киева
const positions = {
           latPositions: '',
           lngPositions: ''
         };

google.maps.event.addListener(autocomplete, "place_changed", function () {
    // в этой переменной получаем объект город
    const place = autocomplete.getPlace();

    // -------------------- отладочный блок -------------------
    console.log(place);

    const currentPlace = document.getElementById("header-visual__city");
    currentPlace.textContent = place.name;

    positions.latPositions = place.geometry.location.lat();
    positions.lngPositions = place.geometry.location.lng();
    getWeather(positions.latPositions, positions.lngPositions, 'ru');
})
