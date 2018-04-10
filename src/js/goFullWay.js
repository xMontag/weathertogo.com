const goWayFullLink = event => {
    //event.preventDefault();
    const wayfull = document.querySelector('.wayfull');
    console.log(wayfull.children);
    if(wayfull.children > 1) {
       wayfull.children.remove();
    }

    arrBlockSity.forEach(el => wayfull.append(el));

};

//lookWay.addEventListener("click", goWayFullLink);

