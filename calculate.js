const { getPropertiesAtLength } = require('svg-path-properties');
const { svgPathProperties } = require('svg-path-properties');

const path =
  'M20 136C46.5 136 40.3691 37.002 60.2016 37.002C80.034 37.002 84.3794 107 99.249 107C114.119 107 117.5 37.002 141 37.002';
const properties = new svgPathProperties(path);
const length = properties.getTotalLength();

let closestPct = 0;
let minDistance = Infinity;

for (let i = 0; i <= 1000; i++) {
  const pct = i / 1000;
  const point = properties.getPointAtLength(length * pct);
  const dist = Math.sqrt(Math.pow(point.x - 42, 2) + Math.pow(point.y - 83, 2));
  if (dist < minDistance) {
    minDistance = dist;
    closestPct = pct;
  }
}

console.log('Closest percentage:', closestPct);
console.log('Distance:', minDistance);
const p = properties.getPointAtLength(length * closestPct);
console.log('Point:', p.x, p.y);
