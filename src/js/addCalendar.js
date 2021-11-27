let inputTime;

// var disable = false;
let picker = new Pikaday({
        field: document.getElementById('datepicker'),
        firstDay: 1,
        format: 'D.MM.YYYY',
       /*  disableDayFn: function(theDate) {
          return disable = !disable;
       }, */
        onSelect: function() {
            this.getMoment().format('Do MM.YYYY');
            inputTime = document.getElementById('datepicker');
            getWeatherWayFirst(weatherWay.start.lat, weatherWay.start.lng, dateConvert(inputTime.value), 'ru');
        },
        i18n: {
            previousMonth : 'Previous Month',
            nextMonth     : 'Next Month',
            months        : ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
            weekdays      : ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
            weekdaysShort : ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
        }
    });

