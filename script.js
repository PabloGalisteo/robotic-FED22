import personsInClass from './persondata.js';

const main = document.getElementById('main');
const template = document.getElementById('template').content;
let templateCopy;

personsInClass.forEach((person) => {
  templateCopy = document.importNode(template, true);

  templateCopy.querySelector(
    '.name'
  ).textContent = `${person.firstName}  ${person.lastName}`;
  templateCopy.querySelector(
    '.profile-image'
  ).src = `https://robohash.org/${person.firstName}.png`;
  templateCopy.querySelector(
    '.github-link'
  ).href = `https://github.com/${person.userName}`;
  templateCopy.querySelector(
    '.email'
  ).href = `mailto:${person.firstName}.${person.lastName}@hyperisland.se`;

  main.appendChild(templateCopy);
});
