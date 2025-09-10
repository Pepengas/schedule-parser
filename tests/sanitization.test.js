const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function loadDom() {
  let html = fs.readFileSync(path.join(__dirname, '..', 'schedule-parser.html'), 'utf8');
  const idx = html.indexOf('<!DOCTYPE html>');
  if (idx !== -1) {
    html = html.slice(idx);
  }
  html = html.replace(/<script src="[^"]*"><\/script>/g, '');
  return new JSDOM(html, { runScripts: 'dangerously' });
}

describe('rendering', () => {
  const malicious = {
    day: 'Monday',
    time: '09:00-10:00',
    courseName: '<img src=x onerror=alert(1)>',
    professor: '<b>Prof</b>',
    room: '<script>alert(1)</script>',
    semester: 'Fall 2024',
    type: 'lecture'
  };

  test('renderListView escapes HTML', () => {
    const dom = loadDom();
    dom.window.scheduleData = [malicious];
    dom.window.getFilteredData = () => dom.window.scheduleData;
    dom.window.renderListView();
    const list = dom.window.document.getElementById('coursesList');
    expect(list.querySelector('img')).toBeNull();
    expect(list.querySelector('script')).toBeNull();
    expect(list.querySelector('b')).toBeNull();
    const text = list.textContent;
    expect(text).toContain(malicious.courseName);
    expect(text).toContain(malicious.professor);
    expect(text).toContain(malicious.room);
  });

  test('renderGridView escapes HTML', () => {
    const dom = loadDom();
    dom.window.scheduleData = [malicious];
    dom.window.getFilteredData = () => dom.window.scheduleData;
    dom.window.renderGridView();
    const grid = dom.window.document.getElementById('scheduleGrid');
    expect(grid.querySelector('img')).toBeNull();
    expect(grid.querySelector('script')).toBeNull();
    expect(grid.querySelector('b')).toBeNull();
    const text = grid.textContent;
    expect(text).toContain(malicious.courseName);
    expect(text).toContain(malicious.professor);
    expect(text).toContain(malicious.room);
  });
});
