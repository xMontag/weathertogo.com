function todayTemplate() {
            
            const source   = document.getElementById("today-template").innerHTML;
            const template = Handlebars.compile(source);
            
            const html = template(weather.today.body);
            
            const today = document.querySelector('.today__main');
            const todayBlock = document.querySelector('.today__block');
    
            if(today.innerHTML !== '') {
               todayBlock.remove();
               today.innerHTML += html; 
            } else {
                today.innerHTML += html;
            }        
                       
}

function todayHeaderTemplate() {
    
            const source   = document.getElementById("today-header-template").innerHTML;
            const template = Handlebars.compile(source);
            
            const html = template(weather.today.header);
            
            const header = document.querySelector('.today__title');
            const headerBlock = document.querySelector('.today__header-block');
    
            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html; 
            } else {
                header.innerHTML += html;
            }
    
}