import personsInClass from './persondata.js';

const main = document.getElementById('main');
const template = document.getElementById('template').content;
let templateCopy;
const apiUrl = 'https://api.github.com/users/'
//let userData;
//let projectData;
let languageData;
let languageValues;
let languageKeys;
const colorThief = new ColorThief();
let successfulLoop = false;
let bytesSum;



//-------------------PROGRAM FLOW-------------------


personsInClass.forEach(async person => {
  
  let userData = await fetchUserData(person);
  createFedCard(userData, person);
  let color = fetchColorData();
  let projectData = await fetchProjectData(person);
  let experienceArray = await createExperience(projectData, color);
  convertToPercent (experienceArray);
  //await createProgressBar(experienceArray);
  //await createLanguageText(experienceArray);
});
 



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
  templateCopy = document.importNode(template, true);

  templateCopy.querySelector('.name').textContent = `${person.firstName}  ${person.lastName}`;
  templateCopy.querySelector('.profile-image').src = `https://robohash.org/${person.firstName}.png`;
  templateCopy.querySelector('.github-link').href = `https://github.com/${person.userName}`;
  templateCopy.querySelector('.email').href = `mailto:${person.firstName}.${person.lastName}@hyperisland.se`;
  
  if (userData.location == null){
    templateCopy.querySelector('.location').textContent = "Sweden";
  } else {
    templateCopy.querySelector('.location').textContent = `${userData.location}`;
  }
  main.appendChild(templateCopy);
}


function fetchColorData(){
  const imgElement = document.querySelector('.profile-image');
  return colorThief.getPalette(imgElement);
}


async function fetchProjectData(person) {
  return await getData(apiUrl + person.userName + '/repos'); 
};


async function createExperience(projectData, color){
  let experienceArray = [];
  await Promise.all(projectData.map(async project => {
    languageData = await getData(project.languages_url);
    languageValues = Object.values(languageData);
    languageKeys = Object.keys(languageData); 
    
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
  
  console.log(experienceArray);
  //console.log(experienceArray[0].bytes);
  // let testingArray = [
  //   {
  //     name: "Elin",
  //     number: 2
  //   },
  //   {
  //     name: "Hi",
  //     number: 3
  //   },
  //   {
  //     name: "Hello",
  //     number: 4
  //   }
  // ]
  // console.log(testingArray);
  // console.log(testingArray[0].name);
  experienceArray.forEach(experience => {
    console.log(experience.bytes);
  });
}












  
