import personsInClass from './persondata.js';
const apiUrl = 'https://api.github.com/users/'
const colorThief = new ColorThief();
let successfulLoop = false;



//-------------------PROGRAM FLOW-------------------


Promise.all(personsInClass.map(async (person, index) => {
  let userData = await fetchUserData(person);
  createFedCard(userData, person);
  let color = fetchColorData(index);
  let projectData = await fetchProjectData(person);
  let experienceArray = await createExperience(projectData, color);
  experienceArray = convertToPercent(experienceArray);
  createProgressBar(experienceArray, index);
  createLanguageText(experienceArray, index);
})); 



//-------------------FUNCTIONS-------------------
class Experience {
  constructor(language, bytes, color) {
    this.language = language;
    this.bytes = bytes;
    this.color = color;
  }
} 


async function getData(url) {
  const resp = await fetch(url);
  const respData = await resp.json();
  return respData;
}


async function fetchUserData(person) {
  return await getData(apiUrl + person.userName);
};


function createFedCard(userData, person) { 
  const template = document.getElementById('template').content;
  let templateCopy = document.importNode(template, true);

  templateCopy.querySelector('.name').textContent = `${person.firstName}  ${person.lastName}`;
  templateCopy.querySelector('.profile-image').src = `https://robohash.org/${person.firstName}.png`;
  templateCopy.querySelector('.github-link').href = `https://github.com/${person.userName}`;
  let emailFirstName = person.firstName;
  emailFirstName = emailFirstName.replace(' ', '.');
  emailFirstName = emailFirstName.replace('é', 'e');
  let emailLastName = person.lastName;
  emailLastName = emailLastName.replace(' ', '.');
  emailLastName = emailLastName.replace('-', '');
  emailLastName = emailLastName.replace('é', 'e');
  emailLastName = emailLastName.replace('á', 'a');
  emailLastName = emailLastName.replace('ä', 'a');
  emailLastName = emailLastName.replace('Å', 'A');
  emailLastName = emailLastName.replace('ö', 'o');
  templateCopy.querySelector('.email').href = `mailto:${emailFirstName}.${emailLastName}@hyperisland.se`;


  if (userData.location == null){
    templateCopy.querySelector('.location').textContent = "Sweden";
  } else {
    templateCopy.querySelector('.location').textContent = `${userData.location}`;
  }         
  const main = document.getElementById('main');
  main.appendChild(templateCopy);
}


function fetchColorData(index) {
  const imgElement = document.querySelectorAll('.profile-image');
  return colorThief.getPalette(imgElement[index]);
}


async function fetchProjectData(person) {
  return await getData(apiUrl + person.userName + '/repos'); 
};


async function createExperience(projectData, color){
  let experienceArray = [];
  await Promise.all(projectData.map(async project => {
    let languageData = await getData(project.languages_url);
    let languageValues = Object.values(languageData);
    let languageKeys = Object.keys(languageData); 
    
    if (languageValues.length > 0) { //if project does not contain any languages
      languageKeys.forEach((language, index) => {
        if (experienceArray.length == 0){ //for first project of the person
          experienceArray.push(new Experience(language,languageValues[index],color[index]));
        } else {
          experienceArray.forEach(experience => {
            if(language == experience.language && successfulLoop == false) {
              experience.bytes += languageValues[index];
              successfulLoop = true;
            }
          });
          if (successfulLoop == false){
            experienceArray.push(new Experience(language,languageValues[index],color[index]));
          }
          successfulLoop = false;
        }
      });
    }
  }))

  return experienceArray;
}


function convertToPercent(experienceArray){
  let sum = 0;
  let percentage = 0;

  experienceArray.forEach(experience => {
    sum += experience.bytes;
  });

  experienceArray.forEach(experience => {
    percentage = Math.round((experience.bytes / sum) * 1000) / 10;
    experience.bytes = percentage;
  })

  return experienceArray;
}


function createProgressBar(experienceArray, index) {
  const progressTemplate = document.getElementById('progress-template').content;

  experienceArray.forEach(experience => {
    let progressTemplateCopy = document.importNode(progressTemplate, true);
    progressTemplateCopy.querySelector('.progress-bar').style.width = experience.bytes + "%";
    progressTemplateCopy.querySelector('.progress-bar').style.background = `rgb(${experience.color[0]}, ${experience.color[1]}, ${experience.color[2]})`;

    let backgroundBar = document.querySelectorAll(".background-bar");
    backgroundBar[index].appendChild(progressTemplateCopy);
  });
}


function createLanguageText(experienceArray, index) {
  const languageTemplate = document.getElementById('language-template').content;

  experienceArray.forEach(experience => {
    let languageTemplateCopy = document.importNode(languageTemplate, true);
    languageTemplateCopy.querySelector('.dot').style.background = `rgb(${experience.color[0]}, ${experience.color[1]}, ${experience.color[2]})`;
    languageTemplateCopy.querySelector('.text').textContent = experience.language;
    languageTemplateCopy.querySelector('.procent').textContent = experience.bytes + "%";

    let textContainer = document.querySelectorAll(".text-container");
    textContainer[index].appendChild(languageTemplateCopy);
  });
}

