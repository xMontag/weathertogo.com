addsitySity.textContent = positions.sityFullName;

const addCity = document.getElementById("add-city");

const autocompleteAddCity = new google.maps.places.Autocomplete(addCity, {
    types: ["(cities)"]
});

const positionsAddCity = {
           sityFullName: '',
           lengthArrSity: 1
         };

const htmlCityBlock = document.querySelector(".js-add-sity__block");

function addCityBlock(address, length) {

  let datepickerID = `datepicker_${length}`;

   const itemCity = document.createElement('div');
   itemCity.classList.add("add-sity__str");
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
        },
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            weekdays      : ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
            weekdaysShort : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
        }
    });

}

google.maps.event.addListener(autocompleteAddCity, "place_changed", function () {
    // в этой переменной получаем объект город
    const placeAddCity = autocompleteAddCity.getPlace();

    // -------------------- отладочный блок -------------------
    //console.log(placeAddCity);

    //const cityStrs = document.querySelectorAll(".add-sity__str");
    addCityBlock(placeAddCity.formatted_address, positionsAddCity.lengthArrSity)
    addCity.classList.add("js-none");

    positionsAddCity.lengthArrSity += 1;
})

// Добавляем блок с новым городом
const addCityButton = document.querySelector(".add-sity__button");

const addCityInput = event => {
    event.preventDefault();
    addCity.classList.remove("js-none");
    addCity.value = '';
};

addCityButton.addEventListener("click", addCityInput);
