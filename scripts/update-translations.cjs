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
    } else {
      target[key] = source[key];
    }
  }
  Object.assign(target || {}, source);
  return target;
}

const newEnFile = process.argv[2];
const newUrFile = process.argv[3];

if (newEnFile) {
  const newEn = JSON.parse(fs.readFileSync(newEnFile, 'utf-8'));
  deepMerge(enDict, newEn);
  fs.writeFileSync(enPath, JSON.stringify(enDict, null, 2));
}

if (newUrFile) {
  const newUr = JSON.parse(fs.readFileSync(newUrFile, 'utf-8'));
  deepMerge(urDict, newUr);
  fs.writeFileSync(urPath, JSON.stringify(urDict, null, 2));
}

console.log('Translations updated successfully.');
