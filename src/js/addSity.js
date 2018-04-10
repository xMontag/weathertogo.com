addsitySity.textContent = positions.sityFullName;

const addCity = document.getElementById("add-city");

const autocompleteAddCity = new google.maps.places.Autocomplete(addCity, {
    types: ["(cities)"]
});

const positionsAddCity = {
           sityFullName: '',
           sityName: '',
           lengthArrSity: 1,
           lat: '',
           lng: '',
           count: ''
         };

const htmlCityBlock = document.querySelector(".js-add-sity__block");

function addCityBlock(address, length) {

  let datepickerID = `datepicker_${length}`;

   const itemCity = document.createElement('div');
   itemCity.classList.add("add-sity__str", `js-count_${length}`);
   let cityText = `

        <p class="add-sity__sity">${address}</p>
        <p class="add-sity__arrival">приезд/отъезд</p>
        <p class="add-sity__date">
            <input type="text" class="js-calendar" id="${datepickerID}" placeholder="Дата">
        </p>
        <p class="add-sity__del"></p>

`;

  itemCity.innerHTML += cityText;
  htmlCityBlock.append(itemCity);

  let pickers = {};
  let pickerName = `picker_${length}`;

  pickers[`picker_${length}`] = new Pikaday({
        field: document.getElementById(datepickerID),
        firstDay: 1,
        format: 'D.MM.YYYY',
        onSelect: function() {
            this.getMoment().format('Do MM.YYYY');
            let inputTimes = document.getElementById(datepickerID);
            positionsAddCity.count = length;
            getWeatherWay(weatherWay[`start_${length}`]['lat'], weatherWay[`start_${length}`]['lng'], dateConvert(inputTimes.value), 'ru');
            console.log(inputTimes.value);
        },
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            weekdays      : ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
            weekdaysShort : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
        }
    });

   weatherWay[`start_${length}`] = {};
   weatherWay[`start_${length}`]['lat'] = positionsAddCity.lat;
   weatherWay[`start_${length}`]['lng'] = positionsAddCity.lng;
   weatherWay[`start_${length}`]['sityName'] = positionsAddCity.sityName;
   weatherWay[`start_${length}`]['toDay'] = {};
   weatherWay[`start_${length}`]['toDay']['header'] = {};
   weatherWay[`start_${length}`]['toDay']['body'] = [];

   console.log(weatherWay);
}

google.maps.event.addListener(autocompleteAddCity, "place_changed", function () {
    // в этой переменной получаем объект город
    const placeAddCity = autocompleteAddCity.getPlace();

    // -------------------- отладочный блок -------------------
    //console.log(placeAddCity);

    positionsAddCity.lat = placeAddCity.geometry.location.lat();
    positionsAddCity.lng = placeAddCity.geometry.location.lng();
    positionsAddCity.sityName = placeAddCity.name;

    addCityBlock(placeAddCity.formatted_address, positionsAddCity.lengthArrSity);

    addCity.classList.add("js-none");

    positionsAddCity.lengthArrSity += 1;
})

// Добавляем блок с новым городом
const addCityButton = document.querySelector(".add-sity__button");

const addCityInput = event => {
    event.preventDefault();
    const addSityBlock = document.querySelector(".js-add-sity__block");
    const arrNotEmpty = document.querySelectorAll(".js-calendar");

    if(addSityBlock.children.length === 0) {
       addCity.classList.remove("js-none");
       addCity.value = '';
    } else if(arrNotEmpty[arrNotEmpty.length - 1].value === '' && arrNotEmpty !== undefined) {
       alert('Добавьте дату у последнего города');
    } else {
       addCity.classList.remove("js-none");
       addCity.value = '';
    }

};

addCityButton.addEventListener("click", addCityInput);
