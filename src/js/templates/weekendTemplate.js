function saturdayHeaderTemplate() {

            const source   = document.getElementById("saturday-header-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.saturday.header);

            const header = document.querySelector('.js-saturday__title');
            const headerBlock = document.querySelector('.saturday__header-block');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}

function saturdayTemplate() {

            const source   = document.getElementById("saturday-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.saturday.body);

            const today = document.querySelector('.saturday__main');
            const todayBlock = document.querySelector('.saturday__block');

            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html;
            } else {
                today.innerHTML += html;
            }

}

function sundayHeaderTemplate() {

            const source   = document.getElementById("sunday-header-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.sunday.header);

            const header = document.querySelector('.js-sunday__title');
            const headerBlock = document.querySelector('.sunday__header-block');

            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html;
            } else {
                header.innerHTML += html;
            }

}

function sundayTemplate() {

            const source   = document.getElementById("sunday-template").innerHTML;
            const template = Handlebars.compile(source);

            const html = template(weather.weekend.sunday.body);

            const today = document.querySelector('.sunday__main');
            const todayBlock = document.querySelector('.sunday__block');

            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html;
            } else {
                today.innerHTML += html;
            }

}

function sundayHide() {
    const sundayHideBlock = document.querySelector('.js-sunday');
    sundayHideBlock.classList.add('js-sunday--none');
}
