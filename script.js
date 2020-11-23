import personsInClass from './persondata.js';

const main = document.getElementById('main');
const template = document.getElementById('template').content;
let templateCopy;
const apiUrl = 'https://api.github.com/users/'
let userData;
let projectData;
let languageData;


//-------------------PROGRAM FLOW-------------------

personsInClass.forEach((person) => {
  fetchData(person);
});



//-------------------FUNCTIONS-------------------

async function fetchData(person) {
  userData = await getData(apiUrl + person.userName);
  projectData = await getData(apiUrl + person.userName + '/repos');

  languageData = await getData(projectData[0].languages_url);  
  console.log(languageData);

  projectData.forEach(project => {
    languageData = await getData(project.languages_url); 
  });



  //createFedCard(respData, person);
}

async function getData(url) {
  const resp = await fetch(url);
  const respData = await resp.json();
  return respData;
}





function createFedCard(respData, person) { 
  templateCopy = document.importNode(template, true);

  templateCopy.querySelector('.name').textContent = `${person.firstName}  ${person.lastName}`;
  templateCopy.querySelector('.profile-image').src = `https://robohash.org/${person.firstName}.png`;
  templateCopy.querySelector('.github-link').href = `https://github.com/${person.userName}`;
  templateCopy.querySelector('.email').href = `mailto:${person.firstName}.${person.lastName}@hyperisland.se`;
  
  if (respData.location == null){
    templateCopy.querySelector('.location').textContent = "Sweden";
  } else {
    templateCopy.querySelector('.location').textContent = `${respData.location}`;
  }

  main.appendChild(templateCopy);
}



  
