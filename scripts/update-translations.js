const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../src/locales/en.json');
const urPath = path.join(__dirname, '../src/locales/ur.json');

const enDict = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const urDict = JSON.parse(fs.readFileSync(urPath, 'utf-8'));

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
}

const newEn = process.argv[2] ? JSON.parse(process.argv[2]) : {};
const newUr = process.argv[3] ? JSON.parse(process.argv[3]) : {};

deepMerge(enDict, newEn);
deepMerge(urDict, newUr);

fs.writeFileSync(enPath, JSON.stringify(enDict, null, 2));
fs.writeFileSync(urPath, JSON.stringify(urDict, null, 2));

console.log('Translations updated successfully.');
