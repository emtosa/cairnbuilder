(function () {
  'use strict';

  const MODES = { '1min': 60, '25min': 1500 };

  const STONE_FILLS = [
    '#a8a29e', '#8d8580', '#c4c0bc', '#78716c', '#b8b2ae', '#6a6460',
  ];
  const STONE_SHAPES = [
    { w: 90, h: 20, rx: 10 }, { w: 78, h: 18, rx: 9 },  { w: 86, h: 22, rx: 11 },
    { w: 70, h: 17, rx: 8 },  { w: 82, h: 19, rx: 9 },  { w: 74, h: 21, rx: 10 },
  ];

  const SVG_W  = 120;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  let timeLeft = 60, totalTime = 60, tickInterval = null;
  let running = false, paused = false, sessions = 0;
  let stones = [];

  function init() {
    const $timer    = document.getElementById('demo-timer');
    const $start    = document.getElementById('demo-start');
    const $pause    = document.getElementById('demo-pause');
    const $reset    = document.getElementById('demo-reset');
    const $sessions = document.getElementById('demo-sessions');
    const $cairn    = document.getElementById('demo-cairn');
    const $guide    = document.getElementById('demo-guide');
    const $confetti = document.getElementById('demo-confetti');

    // ----- helpers -----

    function pad(n) { return String(n).padStart(2, '0'); }

    function renderTimer() {
      const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
      $timer.textContent = `${pad(m)}:${pad(s)}`;
    }

    function showControls(started) {
      $start.style.display = started ? 'none' : 'inline-flex';
      $pause.style.display = $reset.style.display = started ? 'inline-flex' : 'none';
    }

    function guideState(state) {
      $guide.className = `demo-guide guide-${state}`;
    }

    function pickStone(i) {
      return { ...STONE_SHAPES[i % STONE_SHAPES.length], fill: STONE_FILLS[i % STONE_FILLS.length] };
    }

    // ----- cairn rendering -----

    function renderCairn(animateLast) {
      const GAP  = 3;
      const totalH = stones.reduce((sum, s) => sum + s.h + GAP, 0) + 16;
      const svgH = Math.max(160, totalH);

      $cairn.setAttribute('viewBox', `0 0 ${SVG_W} ${svgH}`);
      $cairn.setAttribute('height', String(svgH));
      $cairn.innerHTML = '';

      let y = svgH - 8;
      stones.forEach((st, i) => {
        y -= st.h;
        const rect = document.createElementNS(SVG_NS, 'rect');
        rect.setAttribute('x',      String((SVG_W - st.w) / 2));
        rect.setAttribute('y',      String(y));
        rect.setAttribute('width',  String(st.w));
        rect.setAttribute('height', String(st.h));
        rect.setAttribute('rx',     String(st.rx));
        rect.setAttribute('fill',   st.fill);

        if (animateLast && i === stones.length - 1) {
          // Start far above, then drop into place
          rect.style.transform = `translateY(-${svgH + 40}px)`;
          $cairn.appendChild(rect);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            rect.style.transition = 'transform 0.6s cubic-bezier(.2,1.6,.4,1)';
            rect.style.transform  = 'translateY(0)';
          }));
        } else {
          $cairn.appendChild(rect);
        }
        y -= GAP;
      });
    }

    // ----- confetti -----

    function spawnConfetti() {
      const palette = ['#e07b39', '#78716c', '#a8a29e', '#d6d3d1', '#57534e', '#fdf0e8'];
      for (let i = 0; i < 32; i++) {
        const p = document.createElement('div');
        p.className = 'demo-confetti-p';
        p.style.cssText = [
          `left:${10 + Math.random() * 80}%`,
          `background:${palette[i % palette.length]}`,
          `animation-delay:${(Math.random() * 0.5).toFixed(2)}s`,
          `animation-duration:${(0.7 + Math.random() * 0.7).toFixed(2)}s`,
          `width:${6 + (Math.random() * 6 | 0)}px`,
          `height:${5 + (Math.random() * 6 | 0)}px`,
          `border-radius:${Math.random() > 0.5 ? '50%' : '2px'}`,
        ].join(';');
        $confetti.appendChild(p);
      }
      setTimeout(() => { $confetti.innerHTML = ''; }, 2400);
    }

    // ----- timer logic -----

    function tick() {
      if (timeLeft <= 0) {
        clearInterval(tickInterval);
        running = false;

        sessions++;
        $sessions.textContent = `🪨 ${sessions} session${sessions !== 1 ? 's' : ''} today`;

        stones.push(pickStone(stones.length));
        renderCairn(true);
        guideState('dance');
        spawnConfetti();

        timeLeft = totalTime;
        renderTimer();
        showControls(false);
        $pause.textContent = 'Pause';

        setTimeout(() => guideState('idle'), 2200);
        return;
      }
      timeLeft--;
      renderTimer();
    }

    // ----- event listeners -----

    $start.addEventListener('click', () => {
      if (running) return;
      running = true;
      paused  = false;
      showControls(true);
      guideState('wave');
      tickInterval = setInterval(tick, 1000);
    });

    $pause.addEventListener('click', () => {
      if (paused) {
        paused = false;
        $pause.textContent = 'Pause';
        guideState('wave');
        tickInterval = setInterval(tick, 1000);
      } else {
        paused = true;
        $pause.textContent = '▶ Resume';
        clearInterval(tickInterval);
        guideState('idle');
      }
    });

    $reset.addEventListener('click', () => {
      clearInterval(tickInterval);
      running = paused = false;
      timeLeft = totalTime;
      renderTimer();
      showControls(false);
      $pause.textContent = 'Pause';
      guideState('idle');
    });

    document.querySelectorAll('.demo-speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (running) return;
        document.querySelectorAll('.demo-speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        totalTime = MODES[btn.dataset.mode];
        timeLeft  = totalTime;
        renderTimer();
      });
    });

    // ----- bootstrap -----
    stones = [pickStone(0)];
    renderCairn(false);
    renderTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
