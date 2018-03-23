function headerTemplate() {
            
            const source   = document.getElementById("header-template").innerHTML;
            const template = Handlebars.compile(source);
            
            const html = template(weather.now);
           
            const header = document.querySelector('.header-visual__js-block');
            const headerBlock = document.querySelector('.header-visual__js-templ');
    
            if(header.innerHTML !== '') {
               headerBlock.remove();
               header.innerHTML += html; 
            } else {
                header.innerHTML += html;
            }        
                    
}
