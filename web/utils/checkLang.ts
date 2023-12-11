/* eslint-disable no-console */
import * as process from 'process';
import de from '../lang/de.json';
import en from '../lang/en.json';

function traverse(
  obj: Record<string, string | Record<string, any>>,
  prefix = ''
) {
  const keys: string[] = [];
  const k = Object.keys(obj);
  k.forEach((kk) => {
    const newPrefix = prefix.length > 0 ? `${prefix}.${kk}` : kk;
    if (typeof obj[kk] === 'string') {
      keys.push(newPrefix);
    } else {
      keys.push(...traverse(obj[kk] as Record<string, any>, newPrefix));
    }
  });
  return keys;
}

const deList = traverse(de);
const enList = traverse(en);

let error = false;
if (deList.length !== enList.length) {
  const deisLonger = deList.length > enList.length;
  console.error(`${deisLonger ? 'de' : 'en'} lang is longer!`);
  error = true;
}

const diffEn = enList.filter((k) => !deList.includes(k));
const diffDe = deList.filter((k) => !enList.includes(k));

if (diffEn.length > 0) {
  console.error(
    `"${diffEn.join('", "')}" ${
      diffEn.length > 1 ? 'are' : 'is'
    } missing in de!`
  );
  error = true;
}
if (diffDe.length > 0) {
  console.error(
    `"${diffDe.join('", "')}" ${
      diffDe.length > 1 ? 'are' : 'is'
    } missing in en!`
  );
  error = true;
}

// TODO: add to CI
if (error) {
  process.exit(1);
}
