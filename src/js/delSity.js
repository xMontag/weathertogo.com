const deleteSityBlock = event => {

  if(event.target.classList.contains("add-sity__del")) {
     event.target.parentNode.remove();
  }
  //console.log(event.target);
  };

htmlCityBlock.addEventListener("click", deleteSityBlock);
