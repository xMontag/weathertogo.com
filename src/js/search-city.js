const inputCity = document.getElementById("search-city");
const autocomplete = new google.maps.places.Autocomplete(inputCity, {
    types: ["(cities)"]
});
google.maps.event.addListener(autocomplete, "place_changed", function () {
    // в этой переменной получаем объект город
    const place = autocomplete.getPlace();

    // -------------------- отладочный блок -------------------
    //console.log(place);
    const currentPlace = document.getElementById("header-visual__city");
    currentPlace.textContent = place.name;
})
