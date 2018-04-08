const controls = document.querySelector(".page__menu");
const links = controls.querySelectorAll(".menu__link");
const addSity = document.querySelector(".add-sity");
const wayfull = document.querySelector(".wayfull");
const lookWay = document.querySelector(".add-sity__look")
const pages = document.querySelectorAll(".js-page");
const arrLinks = [links[0].textContent, links[1].textContent, links[2].textContent, links[3].textContent];
const buttonWay = document.querySelector(".button-way__button");

const activeLink = {
  node: pages[0]
};

function setActiveLink(e) {
  e.preventDefault();
  Array.from(links, elem => elem.classList.remove("menu__link--active"));
  let elem = e.target;

  if (!elem.classList.contains("menu__link")) {
    return false;
  }

  elem.classList.add("menu__link--active");

  activeLink.node = pages[arrLinks.indexOf(elem.textContent)];
  activeLink.node.classList.add("js-block");
  wayfull.classList.remove("js-block");
}

function goAddWay() {
  let elem = links[3];
  if(!elem.classList.contains("menu__link--active")) {
     Array.from(links, elem => elem.classList.remove("menu__link--active"));
     elem.classList.add("menu__link--active");
  }
  activeLink.node.classList.remove("js-block");
  activeLink.node = pages[3];
  activeLink.node.classList.add("js-block");
  wayfull.classList.remove("js-block");

}

const removeActiveLink = event => {
    event.preventDefault();

       activeLink.node.classList.remove("js-block");

};

const activeWayFullLink = event => {
    event.preventDefault();
    addSity.classList.remove("js-block");
    wayfull.classList.add("js-block");
};


buttonWay.addEventListener("click", goAddWay);
controls.addEventListener("click", removeActiveLink);
controls.addEventListener("click", setActiveLink);
lookWay.addEventListener("click", activeWayFullLink);
