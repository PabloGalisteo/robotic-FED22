import personsInClass from './persondata.js';
const apiUrl = 'https://api.github.com/users/';
const encodedToken = 'ZDQ4YWQ2YTA5ZjA5YjVmNjY3OTg5OGQ4NDA2MTM5ZmVhMGIxNjUyYwo=';
const apiOptions = 
{
  cache: 'force-cache',
  headers: {
    'Authorization': `token ${decodeToken(encodedToken)}`
  }
}
const colorThief = new ColorThief();
let successfulLoop = false;




//-------------------PROGRAM FLOW-------------------

personsInClass.forEach(person => {
  displaySkeletonCard()
});

personsInClass.forEach(person => {
  let userData = fetchUserData(person);
  createFedCard(userData, person);
})




//-------------------FUNCTIONS-------------------
function displaySkeletonCard() {
  const skeletonCardTemplate = document.getElementById('skeleton-card-template').content;
  let skeletonCardTemplateCopy = document.importNode(skeletonCardTemplate, true);
  document.querySelector('.skeleton-main').appendChild(skeletonCardTemplateCopy);
};

class Experience {
  constructor(language, bytes, color) {
    this.language = language;
    this.bytes = bytes;
    this.color = color;
  }
} 


async function getData(url) {
  try {
    const resp = await fetch(url, apiOptions);
    const respData = await resp.json();
    return respData;
  } catch {
    document.getElementById('main').innerHTML = 'Oops..! Something went wrong, please try again later.'
  }
  
}


function decodeToken(encodedToken) {
  return window.atob(encodedToken);
}


function fetchUserData(person) {
  return getData(apiUrl + person.userName);
};


function createFedCard(userData, person) { 
  const template = document.getElementById('template').content;
  let templateCopy = document.importNode(template, true);

  templateCopy.querySelector('.name').textContent = `${person.firstName}  ${person.lastName}`;
  templateCopy.querySelector('.profile-image').src = `https://robohash.org/${person.firstName}.png`;
  templateCopy.querySelector('.profile-image').id = `profile-${person.lastName}`;

  templateCopy.querySelector('.profile-image').addEventListener('load', async function (){
    let color = await fetchColorData(person);
    let projectData = await fetchProjectData(person);
    let experienceArray = await createExperience(projectData, color, person.firstName);
    experienceArray = convertToPercent(experienceArray);
    experienceArray = checkForOther(experienceArray, person);
    createProgressBar(experienceArray, person);
    createLanguageText(experienceArray, person);
    showContent();
  })

  templateCopy.querySelector('.github-link').href = `https://github.com/${person.userName}`;
  templateCopy.querySelector('.background-bar').id = `bar-${person.lastName}`;
  templateCopy.querySelector('.text-container').id = `text-${person.lastName}`;
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


function fetchColorData(person) {
  const imgElement = document.getElementById(`profile-${person.lastName}`);
  return colorThief.getPalette(imgElement, 20);
}


function fetchProjectData(person) {
  return getData(apiUrl + person.userName + '/repos'); 
};


async function createExperience(projectData, color, person){
  let experienceArray = [];
  await Promise.all(projectData.map(async project => {
    let languageData = await getData(project.languages_url);
    let languageValues = Object.values(languageData);
    let languageKeys = Object.keys(languageData); 
    
    if (languageValues.length > 0) { //if project contains languages
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


function checkForOther(experienceArray){
  let sumOfOther = 0; 
  let sumFunction = function(total, currentExperience){
    return total + currentExperience.bytes;
  }

  sumOfOther = Math.round(experienceArray.filter(experience=>experience.bytes < 1).reduce(sumFunction, 0)*10) / 10;
  experienceArray = experienceArray.filter(experience=>experience.bytes > 1);

  if(sumOfOther > 0){
    experienceArray.splice()
    experienceArray.push(new Experience("Other",sumOfOther,[54,51,74]));
  }
  return experienceArray;
}


function createProgressBar(experienceArray, person) {
  const progressTemplate = document.getElementById('progress-template').content;

  experienceArray.forEach(experience => {
    let progressTemplateCopy = document.importNode(progressTemplate, true);
    progressTemplateCopy.querySelector('.progress-bar').style.width = experience.bytes + "%";
    progressTemplateCopy.querySelector('.progress-bar').style.background = `rgb(${experience.color[0]}, ${experience.color[1]}, ${experience.color[2]})`;

    let backgroundBar = document.getElementById(`bar-${person.lastName}`);
    backgroundBar.appendChild(progressTemplateCopy);
  });
}


function createLanguageText(experienceArray, person) {
  const languageTemplate = document.getElementById('language-template').content;

  experienceArray.forEach(experience => {
    let languageTemplateCopy = document.importNode(languageTemplate, true);
    languageTemplateCopy.querySelector('.dot').style.background = `rgb(${experience.color[0]}, ${experience.color[1]}, ${experience.color[2]})`;
    languageTemplateCopy.querySelector('.text').textContent = experience.language;
    languageTemplateCopy.querySelector('.procent').textContent = experience.bytes + "%";

    let textContainer = document.getElementById(`text-${person.lastName}`);
    textContainer.appendChild(languageTemplateCopy);
  });
}

function showContent(){
  document.getElementById('content').style.display = 'block';
  document.getElementById('skeleton').style.display = 'none';
}

