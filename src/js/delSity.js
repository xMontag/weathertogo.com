const deleteSityBlock = event => {

  if(event.target.classList.contains("add-sity__del")) {

     if(event.target.parentNode.classList.contains("js-count_0")) {
        event.target.parentNode.remove();
        delete weatherWay['start'];

        let tempWay = document.querySelector(".js-way");
        tempWay.remove();

     } else {

        let classesSity = event.target.parentNode.classList;
        let classCount = classesSity[1];
        let arrClassCount = classCount.split("_");
        let count = arrClassCount[1];
        delete weatherWay[`start_${count}`];

        let tempWay = document.querySelector(`.js-way_${count}`);
        tempWay.remove();

        event.target.parentNode.remove();
     }

  }

  };

htmlCityBlock.addEventListener("click", deleteSityBlock);
