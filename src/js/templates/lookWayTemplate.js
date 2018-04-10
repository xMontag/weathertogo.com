function wayfullTemplateFirst(start) {

            if(positionsAddCity['tempWays'] !== undefined) {

                let tempWay = document.querySelector(".js-way");

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", "js-way");
                positionsAddCity['tempWays'] = document.querySelector('.js-way');

                tempWay.after(block);
                block.innerHTML += html;
                tempWay.remove();

            } else {

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", "js-way");
                positionsAddCity['tempWays'] = document.querySelector('.js-way');
                wayfull.append(block);

                block.innerHTML += html;

            }

}

function wayfullTemplate(start) {
            if(positionsAddCity[`tempWays_${positionsAddCity.count}`] !== undefined) {

                let tempWay = document.querySelector(`.js-way_${positionsAddCity.count}`);

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", `js-way_${positionsAddCity.count}`);
                positionsAddCity[`tempWays_${positionsAddCity.count}`] = document.querySelector(`.js-way_${positionsAddCity.count}`);

                tempWay.after(block);
                block.innerHTML += html;
                tempWay.remove();

            } else {

                const source   = document.getElementById("wayfull-template").innerHTML;
                const template = Handlebars.compile(source);

                const html = template(start);

                const wayfull = document.querySelector('.wayfull');
                const block = document.createElement('div');
                block.classList.add("wayfull__block", `js-way_${positionsAddCity.count}`);
                positionsAddCity[`tempWays_${positionsAddCity.count}`] = document.querySelector(`.js-way_${positionsAddCity.count}`);
                wayfull.append(block);

                block.innerHTML += html;

            }

}
