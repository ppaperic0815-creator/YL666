const messages = {
  wave: {
    icon: '👋',
    text: '彥辰和惠玲見面了！兩個人笑著揮揮手，開心打招呼！',
    image: 'scene-wave.jpg',
    alt: '彥辰和惠玲在櫻花樹下微笑揮手打招呼'
  },
  handshake: {
    icon: '🤝',
    text: '彥辰和惠玲笑著雙手交握，完成溫暖又有默契的握手！',
    image: 'scene-handshake.jpg',
    alt: '彥辰和惠玲面對面微笑並雙手交握'
  },
  hug: {
    icon: '🫂',
    text: '彥辰和惠玲給彼此一個溫暖、友善的擁抱。',
    image: 'scene-hug.jpg',
    alt: '彥辰和惠玲在櫻花樹下開心擁抱'
  },
  cheer: {
    icon: '✨',
    text: '彥辰：「一起加油！」惠玲：「今天也要順利！」',
    image: 'scene-cheer.jpg',
    alt: '彥辰和惠玲開心握拳互相加油'
  },
  fight: {
    icon: '😠',
    text: '彥辰和惠玲鬧了一點小彆扭，互動值 -1。',
    image: 'scene-fight.jpg',
    alt: '彥辰和惠玲雙手抱胸、可愛地鬧彆扭'
  },
  makeup: {
    icon: '🫂',
    text: '彥辰和惠玲抱抱和好了！互動值恢復到 0！',
    image: 'scene-makeup.jpg',
    alt: '彥辰和惠玲開心擁抱、和好如初'
  },
  special: {
    icon: '💗',
    text: '互動累積達到 10 點！解鎖特別紀念場景！',
    image: 'scene-special-10.jpg',
    alt: '彥辰和惠玲在櫻花與愛心環繞下親吻的特別紀念插畫'
  }
};

const result = document.getElementById('result');
const photoWrap = document.getElementById('photoWrap');
const couplePhoto = document.querySelector('.couple-photo');
const originalCouplePhoto = 'couple.png';
const sceneStage = document.getElementById('sceneStage');
const sceneImage = document.getElementById('sceneImage');
const sceneEmoji = document.getElementById('sceneEmoji');
const sceneCaption = document.getElementById('sceneCaption');
const bondCount = document.getElementById('bondCount');
const bondFill = document.getElementById('bondFill');
const bondProgress = document.getElementById('bondProgress');
const bondHint = document.getElementById('bondHint');
const bonusBtn = document.getElementById('bonusBtn');
const makeupWrap = document.getElementById('makeupWrap');
const makeupBtn = document.getElementById('makeupBtn');

const TARGET_POINTS = 10;
let interactionPoints = 0;
let bonusUnlocked = false;

document.querySelectorAll('.action-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const actionName = button.dataset.action;
    const action = messages[actionName];

    if (actionName === 'fight') {
      interactionPoints = Math.max(-5, interactionPoints - 1);
    } else {
      interactionPoints = Math.min(TARGET_POINTS, interactionPoints + 1);
    }
    updateBondMeter();

    showActionScene(action);

    result.innerHTML = `<span class="result-icon">${action.icon}</span><p>${action.text}</p>`;
    result.classList.remove('pop');
    void result.offsetWidth;
    result.classList.add('pop');

    makeSparkles(actionName === 'hug' ? 9 : actionName === 'fight' ? 3 : 5);

    if (interactionPoints === TARGET_POINTS && !bonusUnlocked) {
      unlockBonusAnimation();
    }
  });
});

function showActionScene(action) {
  sceneStage.hidden = false;
  sceneEmoji.hidden = true;
  sceneImage.hidden = false;

  // 每個按鈕載入自己的圖片，確保互動畫面彼此不同。
  sceneImage.src = action.image;
  sceneImage.alt = action.alt;
  sceneCaption.textContent = action.text;

  sceneStage.classList.remove('scene-wave', 'scene-handshake', 'scene-hug', 'scene-cheer', 'scene-fight', 'scene-makeup');
  void sceneStage.offsetWidth;
  sceneStage.classList.add(`scene-${Object.keys(messages).find(key => messages[key] === action)}`);

  for (let i = 0; i < 5; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'scene-sparkle';
    sparkle.textContent = ['✦', '♡', '✨'][i % 3];
    sparkle.style.left = `${12 + i * 18}%`;
    sparkle.style.top = `${12 + (i % 2) * 60}%`;
    sceneStage.appendChild(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove());
  }
}

function updateBondMeter() {
  // 達到 10 點時，直接把首頁主照片換成親吻特別圖；低於 10 點則恢復原合照。
  if (interactionPoints === TARGET_POINTS) {
    couplePhoto.src = messages.special.image;
    couplePhoto.alt = messages.special.alt;
  } else {
    couplePhoto.src = originalCouplePhoto;
    couplePhoto.alt = '彥辰與惠玲的日式動漫風合照';
    bonusUnlocked = false;
    bonusBtn.hidden = true;
  }

  bondCount.textContent = interactionPoints > 0 ? `+${interactionPoints}` : `${interactionPoints}`;
  bondCount.classList.toggle('bond-count-negative', interactionPoints < 0);
  bondCount.classList.toggle('bond-count-positive', interactionPoints >= 0);

  // 進度條只呈現正向累積；負值時歸零，避免 CSS 出現負寬度。
  const progress = Math.max(0, Math.min(100, interactionPoints / TARGET_POINTS * 100));
  bondFill.style.width = `${progress}%`;
  bondProgress.setAttribute('aria-valuenow', interactionPoints);
  bondProgress.setAttribute('aria-valuemin', '-5');
  bondProgress.setAttribute('aria-valuemax', TARGET_POINTS);

  makeupWrap.hidden = interactionPoints !== -5;

  if (interactionPoints === TARGET_POINTS) {
    bondHint.textContent = '已達成 10 點！特別慶祝動畫已解鎖 🎉';
  } else if (interactionPoints === -5) {
    bondHint.textContent = '互動值已到 -5！現在可以抱抱和好了。';
  } else if (interactionPoints < 0) {
    bondHint.textContent = `目前是 ${interactionPoints} 點；降到 -5 才能解鎖抱抱和好。`;
  } else {
    bondHint.textContent = `目前 ${interactionPoints} 點；一般互動 +1，吵架 -1。`;
  }
}

function unlockBonusAnimation() {
  bonusUnlocked = true;
  bonusBtn.hidden = false;
  showActionScene(messages.special);
  result.innerHTML = `<span class="result-icon">${messages.special.icon}</span><p>${messages.special.text}</p>`;
  playBonusAnimation();
}

function playBonusAnimation() {
  photoWrap.classList.remove('milestone');
  void photoWrap.offsetWidth;
  photoWrap.classList.add('milestone');
  makeSparkles(26);
  setTimeout(() => photoWrap.classList.remove('milestone'), 1900);
}

bonusBtn.addEventListener('click', playBonusAnimation);

makeupBtn.addEventListener('click', () => {
  // 只有互動值剛好為 -5 時，才允許和好；和好後重設為 0。
  if (interactionPoints !== -5) return;
  interactionPoints = 0;
  updateBondMeter();
  showActionScene(messages.makeup);
  result.innerHTML = `<span class="result-icon">${messages.makeup.icon}</span><p>${messages.makeup.text}</p>`;
  result.classList.remove('pop');
  void result.offsetWidth;
  result.classList.add('pop');
  makeSparkles(18);
});

function makeSparkles(amount) {
  const rect = photoWrap.getBoundingClientRect();
  for (let i = 0; i < amount; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'floating-heart';
    sparkle.textContent = ['♡', '♥', '✦', '✨', '🌸'][Math.floor(Math.random() * 5)];
    sparkle.style.left = `${Math.max(8, Math.min(window.innerWidth - 30, rect.left + Math.random() * rect.width))}px`;
    sparkle.style.top = `${Math.max(10, rect.top + rect.height * (0.25 + Math.random() * 0.5))}px`;
    sparkle.style.color = ['#e98ba8', '#e9b4c3', '#d6a0c7'][i % 3];
    document.body.appendChild(sparkle);
    sparkle.addEventListener('animationend', () => sparkle.remove());
  }
}
