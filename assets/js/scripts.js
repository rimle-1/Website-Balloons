// ---- BUBBLES ----
(function () {
  const canvas = document.getElementById('bubblesCanvas');
  const ctx = canvas.getContext('2d');

  let W, H;
  const mouse = { x: -999, y: -999 };
  const REPEL_RADIUS = 200;
  const REPEL_STRENGTH = 3.5;

  // Две точки-источника (доли от ширины/высоты экрана)
  const SOURCES = [
    { rx: 0.25, ry: 1.0 }, // левая — 25% от левого края, у самого низа
    { rx: 0.85, ry: 1.0 }, // правая — 75% от левого края, у самого низа
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function createBubble(sourceIndex) {
    const src = SOURCES[sourceIndex ?? Math.floor(Math.random() * SOURCES.length)];
    const r = Math.random() * 28 + 10;
    const spread = 450; // разброс по X вокруг источника (px)
    return {
      x: src.rx * W + (Math.random() - 0.5) * spread,
      y: src.ry * H + r,
      sourceIndex: sourceIndex ?? Math.floor(Math.random() * SOURCES.length),
      r,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.5 + 0.25),
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.012 + 0.006,
      wobbleAmp: Math.random() * 18 + 6,
      alpha: Math.random() * 0.18 + 0.06,
      pushX: 0,
      pushY: 0,
    };
  }

  // Инициализируем — по половине пузырей из каждого источника,
  // равномерно распределяем по высоте чтобы не было пустоты в начале
  const COUNT_PER_SOURCE = 28;
  const bubbles = [];
  for (let s = 0; s < SOURCES.length; s++) {
    for (let i = 0; i < COUNT_PER_SOURCE; i++) {
      const b = createBubble(s);
      // Рассеиваем начальную позицию по высоте
      b.y = Math.random() * H;
      bubbles.push(b);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    for (const b of bubbles) {
      b.wobbleOffset += b.wobbleSpeed;
      const wobbleX = Math.sin(b.wobbleOffset) * b.wobbleAmp * 0.015;

      const dx = b.x - mouse.x;
      const dy = b.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS) {
        const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
        const angle = Math.atan2(dy, dx);
        b.pushX += Math.cos(angle) * force;
        b.pushY += Math.sin(angle) * force;
      }

      b.pushX *= 0.88;
      b.pushY *= 0.88;

      b.x += b.vx + wobbleX + b.pushX;
      b.y += b.vy + b.pushY;

      // Когда уходит выше экрана — пересоздаём из того же источника
      if (b.y < -b.r * 2) {
        Object.assign(b, createBubble(b.sourceIndex));
      }

      // Если уплыл слишком далеко по X — мягко возвращаем к источнику
      const src = SOURCES[b.sourceIndex];
      const srcX = src.rx * W;
      if (Math.abs(b.x - srcX) > W * 0.35) {
        b.vx += (srcX - b.x) * 0.001;
      }

      drawBubble(b);
    }

    requestAnimationFrame(tick);
  }

  function drawBubble(b) {
    const { x, y, r, alpha } = b;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(100, 220, 140, ${alpha * 2.2})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = `rgba(80, 200, 120, ${alpha * 0.35})`;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(
      x - r * 0.28, y - r * 0.3,
      r * 0.18, r * 0.1,
      -Math.PI / 4,
      0, Math.PI * 2
    );
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 3.5})`;
    ctx.fill();
  }

  tick();
})();

// ---- PARALLAX ----
(function () {
  const videoBg = document.getElementById('videoBg');
  const overlay = document.getElementById('videoOverlay');
  const STRENGTH = 20; // пикселей смещения (можно менять)

  // Чтобы не обрезались края при сдвиге — видео уже немного oversized через CSS
  videoBg.style.width = `calc(100% + ${STRENGTH * 2}px)`;
  videoBg.style.height = `calc(100% + ${STRENGTH * 2}px)`;
  videoBg.style.top = `-${STRENGTH}px`;
  videoBg.style.left = `-${STRENGTH}px`;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    // Нормализуем позицию от -1 до 1
    const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;
    targetX = nx * STRENGTH;
    targetY = ny * STRENGTH;
  });

  function animateParallax() {
    // Плавное сглаживание (lerp)
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    const tx = -currentX;
    const ty = -currentY;

    videoBg.style.transform = `translate(${tx}px, ${ty}px)`;
    overlay.style.transform = `translate(${tx}px, ${ty}px)`;

    requestAnimationFrame(animateParallax);
  }

  animateParallax();
})();

const cursor = document.getElementById('cursor')
document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// Эффект при клике
document.addEventListener('mousedown', () => {
  cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
});
document.addEventListener('mouseup', () => {
  cursor.style.transform = 'translate(-50%, -50%) scale(1)';
});

 // проверка на устройство
 function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(
    navigator.userAgent
  );
}

window.addEventListener('load', () => {
  if (isMobile()) {
    document.body.innerHTML = `
      <div style="
         min-height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column;
    background-image:url('/photo_2026-06-04_15-41-11.jpg');
    background-size:cover;
    background-position:center;
    background-repeat:no-repeat;
    color:white;
    text-align:center;
    padding:20px;
    font-family:Georgia, serif;
      ">
        <h1>💻 Открой меня с компа</h1>
        <p style="margin-top:15px">
          Для прохождения дальше нужен ПК или ноутбук.
        </p>
      </div>
    `;
  }
});
 function skipMaze() {
  ROWS = 1;
  initMaze();
  // goTo('page3');
}

function goTo(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if(id==='page3') initMaze();
}

// ---- BUTTON NO ----
(function () {
  const btn = document.getElementById('btnNo');
  const parent = btn.parentElement;

  let bx = 0, by = 0;        // текущая позиция (смещение от центра)
  let tx = 0, ty = 0;        // целевая позиция
  let mouseSpeed = 0;
  let lastMX = 0, lastMY = 0;
  let animId = null;

  const FLEE_RADIUS = 110;   // радиус реакции на мышь (px)
  const FLEE_STRENGTH = 180; // сила убегания
  const SLOW_THRESHOLD = 3;  // скорость мыши ниже которой кнопка "замирает"

  function getBtnCenter() {
    const pr = parent.getBoundingClientRect();
    const br = btn.getBoundingClientRect();
    return {
      x: br.left + br.width  / 2,
      y: br.top  + br.height / 2,
    };
  }

  function update(mx, my) {
    const center = getBtnCenter();
    const dx = center.x - mx;
    const dy = center.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < FLEE_RADIUS && mouseSpeed > SLOW_THRESHOLD) {
      // Мышь близко и движется — убегаем
      const angle = Math.atan2(dy, dx);
      const force = (1 - dist / FLEE_RADIUS) * FLEE_STRENGTH;
      const pr = parent.getBoundingClientRect();
      const halfW = pr.width  / 2 - btn.offsetWidth  / 2;
      const halfH = pr.height / 2 - btn.offsetHeight / 2;

      tx = Math.max(-halfW, Math.min(halfW, tx + Math.cos(angle) * force * 0.1));
      ty = Math.max(-halfH, Math.min(halfH, ty + Math.sin(angle) * force * 0.1));
    } else if (mouseSpeed <= SLOW_THRESHOLD) {
      // Мышь остановилась — плавно возвращаемся к центру
      tx *= 0.92;
      ty *= 0.92;
    }

    // Lerp к цели
    bx += (tx - bx) * 0.14;
    by += (ty - by) * 0.14;

    btn.style.transform = `translate(${bx}px, ${by}px)`;
    animId = requestAnimationFrame(() => update(mx, my));
  }

  document.addEventListener('mousemove', (e) => {
    const spd = Math.hypot(e.clientX - lastMX, e.clientY - lastMY);
    mouseSpeed = spd * 0.4 + mouseSpeed * 0.6; // сглаживание скорости
    lastMX = e.clientX;
    lastMY = e.clientY;

    cancelAnimationFrame(animId);
    update(e.clientX, e.clientY);
  });

  btn.addEventListener('click', () => {
    noClicks++;
    if (noClicks >= 3) {
      goTo('page2');
    } else {
      const msgs = ['...', 'Чел...', 'Сосал?'];
      btn.textContent = msgs[Math.min(noClicks, msgs.length - 1)];
    }
  });
})();

let noClicks = 0;
function handleNo() {} // оставляем пустой чтобы не было ошибок если где-то есть onclick

// ---- MAZE ----
const CELL=28, COLS=15
let ROWS=10;
let maze=[], visited=[], cx=0,cy=0, won=false, mouseOn=false, failTimeout=null;
const failImgEl = document.getElementById('failImg');
const failOverlay = document.getElementById('failOverlay');
const failSound = document.getElementById('failSound');
const failSrcs=[
  'https://media1.tenor.com/m/6oVpxIFwAAoAAAAC/cat-kiss.gif',
  'https://media1.tenor.com/m/iGOU08nTk_sAAAAd/cat-kiss-alydn.gif',
  'https://de9o6n2ujz7l.cloudfront.net/cache/b7/5b/b75b5dd1e0263fac7c1f6591dd543e24.jpg'
];
let failIdx=0;

function initMaze(){
  won=false;
  mouseOn=false;
  const canvas=document.getElementById('mazeCanvas');
  canvas.width=COLS*CELL+1; canvas.height=ROWS*CELL+1;
  generateMaze();
  cx=0.5; cy=0.5;
  drawMaze();
  
  canvas.addEventListener('mousemove',onMouseMove,{passive:true});
  canvas.addEventListener('mouseenter',()=>{mouseOn=true;});
  canvas.addEventListener('mouseleave',()=>{mouseOn=false;});
  canvas.addEventListener('touchmove',onTouch,{passive:false});
}

function generateMaze(){
  maze=[];
  for(let r=0;r<ROWS;r++){
    maze.push([]);
    for(let c=0;c<COLS;c++) maze[r].push({top:true,right:true,bottom:true,left:true,visited:false});
  }
  function carve(r,c){
    maze[r][c].visited=true;
    const dirs = shuffle([
  [-1,0,'top','bottom'],
  [1,0,'bottom','top'],
  [0,1,'right','left'],
  [0,-1,'left','right']
]);
    for(const [dr,dc,wall,opp] of dirs){
      const nr=r+dr, nc=c+dc;
      if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!maze[nr][nc].visited){
        maze[r][c][wall]=false; maze[nr][nc][opp]=false; carve(nr,nc);
      }
    }
  }
  carve(0,0);
}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

function drawMaze(){
  const canvas=document.getElementById('mazeCanvas');
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#2e9e50';
  ctx.lineWidth=1.5;
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const x=c*CELL, y=r*CELL;
      if(maze[r][c].top){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+CELL,y);ctx.stroke();}
      if(maze[r][c].right){ctx.beginPath();ctx.moveTo(x+CELL,y);ctx.lineTo(x+CELL,y+CELL);ctx.stroke();}
      if(maze[r][c].bottom){ctx.beginPath();ctx.moveTo(x,y+CELL);ctx.lineTo(x+CELL,y+CELL);ctx.stroke();}
      if(maze[r][c].left){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+CELL);ctx.stroke();}
    }
  }
  // Start star
  ctx.font=`${CELL-4}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('💩',CELL*0+CELL/2,CELL*0+CELL/2);
  // End heart
  ctx.fillText('💗',CELL*(COLS-1)+CELL/2,CELL*(ROWS-1)+CELL/2);
  // Player
  ctx.beginPath();
  ctx.arc(cx*CELL,cy*CELL,5,0,Math.PI*2);
  ctx.fillStyle='#fff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx*CELL,cy*CELL,4,0,Math.PI*2);
  ctx.fillStyle='#000';
  ctx.fill();
}

function onMouseMove(e){
  if(won) return;
  const canvas=document.getElementById('mazeCanvas');
  const rect=canvas.getBoundingClientRect();
  const scaleX=canvas.width/rect.width;
  const scaleY=canvas.height/rect.height;
  const mx=(e.clientX-rect.left)*scaleX/CELL;
  const my=(e.clientY-rect.top)*scaleY/CELL;
  movePlayer(mx,my);
}

function onTouch(e){
  e.preventDefault();
  if(won) return;
  const canvas=document.getElementById('mazeCanvas');
  const rect=canvas.getBoundingClientRect();
  const scaleX=canvas.width/rect.width;
  const scaleY=canvas.height/rect.height;
  const t=e.touches[0];
  const mx=(t.clientX-rect.left)*scaleX/CELL;
  const my=(t.clientY-rect.top)*scaleY/CELL;
  movePlayer(mx,my);
}

function movePlayer(mx,my){
  const r=Math.floor(cy), c=Math.floor(cx);
  const nr=Math.floor(my), nc=Math.floor(mx);
  if(nr<0||nr>=ROWS||nc<0||nc>=COLS) return;
  const cell=maze[r]?maze[r][c]:null;
  if(!cell) return;
  let hit=false;
  // Check wall crossing
  if(nc>c && cell.right) hit=true;
  if(nc<c && cell.left) hit=true;
  if(nr>r && cell.bottom) hit=true;
  if(nr<r && cell.top) hit=true;
  if(Math.abs(mx-cx)>0.9||Math.abs(my-cy)>0.9) hit=true;

  if(hit){
    onHitWall(); return;
  }
  cx=mx; cy=my;
  drawMaze();
  // Win condition
  if(nr===ROWS-1&&nc===COLS-1){
    won=true;
    document.getElementById('mazeMsg').textContent='🎉 Ты прошла! Невероятно!';
    setTimeout(()=>goTo('page4'),1200);
  }
}

function onHitWall() {
  if (won) return;

  failSound.currentTime = 0;
  failSound.play().catch(() => {});

  failImgEl.src = failSrcs[failIdx % failSrcs.length];
  failIdx++;

  failOverlay.classList.add('show');

  document.getElementById('mazeMsg').textContent = '💀 Ты проиграла';

  // ждём любую клавишу
  document.addEventListener('keydown', restartMaze, { once: true });
}

function restartMaze() {
  failOverlay.classList.remove('show');

  generateMaze(); // новый лабиринт
  cx = 0.5;
  cy = 0.5;

  drawMaze();

  document.getElementById('mazeMsg').textContent =
    'Найди путь от 💩 до 💗';
}

// ---- QUIZ ----
const questions = [
{
  q:'Чего больше хочется сегодня вечером?',
  opts:[
    'Активность и движение',
    'Ностальгия и веселье',
    'Красивые виды и атмосфера',
    'Азарт и эмоции'
  ]
},
{
  q:'Какой способностью воспользуешься на один вечер?',
  opts:[
    'Идеальная координация',
    'Вернуться в прошлое',
    'Увидеть город с высоты',
    'Всегда выигрывать'
  ]
},
{
  q:'Что хочется получить после прогулки?',
  opts:[
    'Приятная боль и потные подмыхи',
    'Коробок с кпейками',
    'Красивые фотографии',
    'Лудоманию'
  ]
},
{
  q:'Что выберешь без раздумий?',
  opts:[
    'Прокатиться под музыку',
    'Поиграть в ретро-игры',
    'Посмотреть на закат сверху',
    'Испытать удачу'
  ]
}
];

const results = [
  {
    emoji:'🛼',
    title:'Катание на роликах у Флагштока',
    desc:'Так и знал что у тебя шарики за ролики.',
    details:[
      'Красивый вид на залив',
      'Разгон по прямой до 100 за 10 секунд',
      'Пару синяков'
    ]
  },
  {
    emoji:'🎮',
    title:'Музей советских игровых автоматов',
    desc:'Узнаем во что игры наши деды.',
    details:[
      'Там есть шахматы',
      'И пинг-понг',
      'Стенд где можно понюхать всякое'
    ]
  },
  {
    emoji:'🌆',
    title:'Колоннада Исаакиевского собора / Думская башня',
    desc:'Без лифта забраться на ~15 этаж?',
    details:[
      'Оттуда лучше видны БПЛА)))',
      'Не упасть бы...',
      '"Сфоткай типо лахту на руке держу"'
    ]
  },
  {
    emoji:'🎲',
    title:'Музей азартных игр',
    desc:'Проиграй мне свою жепу.',
    details:[
      'Лудка',
      'Лудка',
      'И еще раз лудка'
    ]
  }
];

let qIdx=0, scores=[0,0,0,0];

function startQuiz(){
  qIdx=0; scores=[0,0,0,0];
  goTo('page5');
  showQuestion();
}

function showQuestion(){
  const q=questions[qIdx];
  document.getElementById('qText').textContent=q.q;
  document.getElementById('qProgress').textContent=`Вопрос ${qIdx+1} из ${questions.length}`;
  const opts=document.getElementById('quizOptions');
  opts.innerHTML='';
  q.opts.forEach((opt,i)=>{
    const btn=document.createElement('button');
    btn.className='quiz-opt';
    btn.textContent=opt;
    btn.onclick=()=>pickAnswer(i);
    opts.appendChild(btn);
  });
}

function pickAnswer(i){
  scores[i]++;
  qIdx++;
  if(qIdx<questions.length){ showQuestion(); }
  else { showResult(); }
}



async function sendResult(result, scores) {
  try {
    await fetch(
      'https://quiz-response.elmir3melzetdinov.workers.dev',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          secret: "kazavki",
          result: result.title,
          scores
        })
      }
    );
  } catch (e) {
    console.error(e);
  }
}
function showResult(){
  // Find dominant score
  let maxI=0;
  scores.forEach((s,i)=>{ if(s>scores[maxI]) maxI=i; });
  const r=results[maxI];
  sendResult(r, scores);
  document.getElementById('resEmoji').textContent=r.emoji;
  document.getElementById('resTitle').textContent=r.title;
  document.getElementById('resDesc').textContent=r.desc;
  const ul=document.getElementById('resDetails');
  ul.innerHTML=r.details.map(d=>`<li>${d}</li>`).join('');
  goTo('page6');
}
