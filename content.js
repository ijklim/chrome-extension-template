// This script loads automatically when the webpage is loaded and document is ready
console.log('Loading content.js in webpage console');

// Randomly changes background color of webpage
const min = 10000000;
const max = 16777215;
document.body.style.backgroundColor = '#' + Math.floor(Math.random() * (max - min) + min).toString(16);
