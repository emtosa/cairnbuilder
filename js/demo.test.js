// js/demo.test.js for cairnbuilderweb
const { JSDOM } = require('jsdom');
jest.useFakeTimers();
describe('Cairn Builder Demo', () => {
  let window, document, timer, start, pause, reset, sessions, cairn, guide, confetti;
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllTimers();
    const dom = new JSDOM(`<!DOCTYPE html><div id="demo-timer"></div><button id="demo-start"></button><button id="demo-pause"></button><button id="demo-reset"></button><div id="demo-sessions"></div><svg id="demo-cairn"></svg><div id="demo-guide"></div><div id="demo-confetti"></div>`);
    window = dom.window;
    document = window.document;
    global.document = document;
    timer = document.getElementById('demo-timer');
    start = document.getElementById('demo-start');
    pause = document.getElementById('demo-pause');
    reset = document.getElementById('demo-reset');
    sessions = document.getElementById('demo-sessions');
    cairn = document.getElementById('demo-cairn');
    guide = document.getElementById('demo-guide');
    confetti = document.getElementById('demo-confetti');
  });
  it('renders timer and cairn', () => {
    require('./demo.js');
    expect(timer.textContent).toMatch(/\d{2}:\d{2}/);
    expect(cairn.children.length).toBeGreaterThan(0);
  });
  it('countdown starts on session start', () => {
    require('./demo.js');
    start.click();
    const initial = timer.textContent;
    jest.advanceTimersByTime(1200);
    expect(timer.textContent).not.toBe(initial);
  });
  it('pause and resume works', () => {
    require('./demo.js');
    start.click();
    pause.click();
    expect(pause.textContent).toMatch(/Resume/);
    pause.click();
    expect(pause.textContent).toMatch(/Pause/);
  });
  it('reset returns timer to initial', () => {
    require('./demo.js');
    start.click();
    reset.click();
    expect(timer.textContent).toMatch(/\d{2}:\d{2}/);
  });
});
