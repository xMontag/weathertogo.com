function tomorrowTemplate() {

            const source   = document.getElementById("tomorrow-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.tomorrow.body);

            const today = document.querySelector('.tomorrow__main');
            const todayBlock = document.querySelector('.tomorrow__block');

            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html;
            } else {
                today.innerHTML += html;
            }

}

function tomorrowHeaderTemplate() {

            const source   = document.getElementById("tomorrow-header-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.tomorrow.header);

            const header = document.querySelector('.tomorrow__title');
            const headerBlock = document.querySelector('.tomorrow__header-block');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}
