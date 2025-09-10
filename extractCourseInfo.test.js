const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

// Extract the extractCourseInfo function from the HTML file
// Vercel requires an index.html file, so the main HTML was renamed accordingly
const html = fs.readFileSync('./index.html', 'utf8');
const match = html.match(/function extractCourseInfo\(line, day, timeSlots\) {([\s\S]*?)return courses;\n\s*}/);
if (!match) {
  throw new Error('extractCourseInfo function not found');
}
const script = match[0] + '\nmodule.exports = extractCourseInfo;';

const context = { module: { exports: {} } };
vm.runInNewContext(script, context);
const extractCourseInfo = context.module.exports;

// Test line with "αιθ." pattern
const lineWithPrefix = 'ΔΟΚΙΜΗ ΜΑΘΗΜΑΤΟΣ αιθ. 101';
const resultPrefix = extractCourseInfo(lineWithPrefix, 'ΔΕΥΤΕΡΑ', ['10:00-12:00']);
assert.strictEqual(resultPrefix[0].room, '101');

// Test line with parentheses pattern
const lineWithParens = 'ΔΟΚΙΜΗ ΜΑΘΗΜΑΤΟΣ (202)';
const resultParens = extractCourseInfo(lineWithParens, 'ΔΕΥΤΕΡΑ', ['10:00-12:00']);
assert.strictEqual(resultParens[0].room, '202');

console.log('All tests passed');
