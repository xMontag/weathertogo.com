const inputCity = document.getElementById("search-city");
const autocomplete = new google.maps.places.Autocomplete(inputCity, {
    types: ["(cities)"]
});
google.maps.event.addListener(autocomplete, "place_changed", function () {
    const place = autocomplete.getPlace();


    console.log(place); // --------------------
})