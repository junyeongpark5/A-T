let posts = [];
let scrollY = 0;
let heartClicked = [];
let numPosts = 40;
let showStartScreen = false;
let startScreenStartTime;
let startTime;
let scrollStopped = false;
let showEnding = false;
let restMessageStartTime;
let showTitle = true;
let distortionBuffer;
let images = [];
let popupZones = [24, 30, 36]; // 포스트 인덱스 기준
let popupMessages = [
  { message: "지금 왜 보고 있나요?", key: "A" },
  { message: "정말 중요한가요?", key: "D" },
  { message: "무언가 놓치고 있진 않나요?", key: "K" },
];
let currentPopupIndex = 0;
let isPopupActive = false;

function preload() {
  for (let i = 1; i <= 10; i++) {
    images.push(loadImage(`./res/images/Group${i}.jpg`));
  }
}

function setup() {
  createCanvas(400, windowHeight);
  textFont('Arial');
  generatePosts(numPosts);
  noSmooth();
  startTime = millis();
  startScreenStartTime = millis();
  distortionBuffer = createGraphics(width, height);
}

function draw() {
  if (showTitle) {
    background(0);
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("주제 : 무한스크롤에\n 현혹되지 말자", width / 2, height / 2);

    fill(150);
    textSize(20);
    text("제작진", width / 2, height / 2 + 60);
    textSize(18);
    text("김찬 · 박서연 · 박준영", width / 2, height / 2 + 80);

    if (millis() - startScreenStartTime > 3000) {
      showTitle = false;
      showStartScreen = true;
      startScreenStartTime = millis();
    }
    return;
  }

  if (showStartScreen) {
    background(0);
    fill(-150 + millis() / 15);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("계속 움직이세요. 멈추지 마세요.", width / 2, height / 2);

    if (millis() - startScreenStartTime > 7000) {
      showStartScreen = false;
      
    }
    return;
  }

  if (!isPopupActive && currentPopupIndex < popupZones.length) {
    let triggerY = popupZones[currentPopupIndex] * 531;
    if (scrollY > triggerY) {
      isPopupActive = true;
    }
  }

  if (isPopupActive) {
    drawInterruptPopup();
    return;
  }

  if (showEnding) {
    drawEndingCredits();
    return;
  }

  background(255);
  let maxScroll = numPosts * 531 - height;

  applyShakeEffect(scrollY, maxScroll);
  applyBlurEffect(scrollY, maxScroll);
  translate(0, -scrollY);

  // 화면에 보이는 포스트만 그리기
  let startIndex = max(0, floor(scrollY / 531));
  let endIndex = min(posts.length, ceil((scrollY + height) / 531));

  for (let i = startIndex; i < endIndex; i++) {
    drawPost(i, i * 531);
  }
  pop(); // blur pop
  drawRedOverlay(scrollY, maxScroll);
  pop(); // shake pop

  // 왜곡 이펙트는 2프레임에 1번만
  if (frameCount % 2 === 0) {
    applyWaveDistortionEffect(scrollY, maxScroll);
  }

  displayUsageTime(scrollY, maxScroll);
  displayWarning(scrollY, maxScroll);

  if (scrollY > 23 * 531 && !scrollStopped) {
    drawStopButton();
    scrollY -= 10;
  }

  if (scrollStopped) {
    showRestMessage();
  }
}

function applyShakeEffect(scrollY, maxScroll) {
  if (scrollY > 15 * 531) {
    let shakeAmt = map(scrollY, 15 * 531, maxScroll, 0, 15);
    push();
    translate(random(-shakeAmt, shakeAmt), random(-shakeAmt, shakeAmt));
  } else {
    push();
  }
}

function applyBlurEffect(scrollY, maxScroll) {
  if (scrollY > 15 * 531) {
    let blurAmt = map(scrollY, 15 * 531, maxScroll, 0, 4);
    blurAmt = constrain(blurAmt, 0, 4);
    push();
    filter(BLUR, blurAmt);
  } else {
    push();
  }
}

function applyWaveDistortionEffect(scrollY, maxScroll) {
  if (scrollY <= 23 * 531) return;

  loadPixels(); // 현재 캔버스 픽셀 배열 읽기

  let freq = map(scrollY, 23 * 531, maxScroll, 0.01, 0.1);
  let amp = map(scrollY, 23 * 531, maxScroll, 0, 5);
  amp = constrain(amp, 0, 10);

  let tempPixels = new Uint8ClampedArray(pixels.length);
  tempPixels.set(pixels);

  for (let y = 0; y < height; y++) {
    let offset = sin(y * freq + frameCount * 0.1) * amp;
    offset = int(offset);

    for (let x = 0; x < width; x++) {
      let srcX = constrain(x - offset, 0, width - 1);
      let srcIndex = (y * width + srcX) * 4;
      let dstIndex = (y * width + x) * 4;

      // 픽셀 RGBA 4개 복사
      tempPixels[dstIndex]     = pixels[srcIndex];
      tempPixels[dstIndex + 1] = pixels[srcIndex + 1];
      tempPixels[dstIndex + 2] = pixels[srcIndex + 2];
      tempPixels[dstIndex + 3] = pixels[srcIndex + 3];
    }
  }

  // 바뀐 픽셀 배열을 원본에 덮어쓰기
  pixels.set(tempPixels);
  updatePixels();
}


function drawRedOverlay(scrollY, maxScroll) {
  if (scrollY > 15 * 531) {
    let redOverlayAlpha = map(scrollY, 15 * 531, maxScroll, 0, 80);
    fill(255, 0, 0, redOverlayAlpha);
    rect(0, 0, width, height);
  }
}

function displayUsageTime(scrollY, maxScroll) {
  let usageTime = floor(map(scrollY, 0, maxScroll, 0, 360));
  fill(0);
  textAlign(RIGHT, TOP);
  textSize(14);
  text(`사용 시간: ${usageTime}분`, width - 10, 10);
}

function displayWarning(scrollY, maxScroll) {
  let redOverlayAlpha = map(scrollY, 23 * 531, maxScroll, 0, 200);
  let usageTime = floor(map(scrollY, 0, maxScroll, 0, 360));
  if (usageTime > 220) {
    fill(255, 0, 0, redOverlayAlpha);
    textAlign(CENTER, TOP);
    textSize(18);
    text("⚠️ 경고! 과도한 사용은 건강에 해로울 수 있습니다.", width / 2, 40);
  }
}

function showRestMessage() {
  if (!restMessageStartTime) {
    restMessageStartTime = millis();
  }
  fill(0);
  rect(0, 0, width, height);
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("스크롤이 멈췄습니다. 휴식을 취하세요.", width / 2, height / 2);

  if (millis() - restMessageStartTime > 3000) {
    showEnding = true;
  }
}

function generatePosts(count) {
  let englishNames = [
    "Ethan Carter", "Olivia Bennett", "Liam Thompson", "Ava Morgan",
    "Noah Brooks", "Chloe Anderson", "Mason Reed", "Lily Parker",
    "James Sullivan", "Sophia Hayes"
  ];

  let captions = [
    "대한민국, 망한다는 말이 현실일까? 🚨\n지금 우리가 서 있는 이 길, 전문가들은 붕괴 직전이라 경고한다.\n이미 시작된 변화, 당신은 알고 있었나요?",
    "속았다…대기업의 민낯\n겉으론 미소, 뒤에선 조작과 착취.\n그들은 언제부터 이렇게 완벽하게 속여왔을까?",
    "당신의 정보, 이미 팔렸습니다 🔓\n가입할 때 체크한 그 동의서 한 장이\n당신의 인생을 열어버렸습니다.",
    "평범한 아파트, 지하실엔 지옥이 있었다\n\"그 집이 이상했어요\"\n이웃들이 몰랐던 충격적인 진실",
    "그가 웃고 있었다…살인의 순간에도\n도무지 이해할 수 없는 미소.\n살인범이 남긴 단 한 마디는, 모두를 얼어붙게 만들었다.",
    "그녀는 진짜 사람이 아니었다\n팔로워 100만, 그런데… 실존하지 않는 사람?\nAI 아이돌의 정체가 밝혀졌다.",
    "기억을 지우는 약💊 , 진짜 존재합니다\n고통도, 실수도 사라진다.\n하지만… 나도 사라질지도 몰라요.",
    "인간은 필요 없다\nAI가 직접 선언했다.\n이젠 우리 없이도 가능하다고.",
    "당신의 얼굴👁, 복제당했습니다\n딥페이크? 아니요, 이제는 클론입니다.\n누군가 이미 ‘당신’을 쓰고 있어요.",
    "결혼식 전날, 그는 사라졌다\n사랑이든 아니든, 진실은 끝까지 가야 보인다.\n누군가의 실화입니다."
  ];

  for (let i = 0; i < count; i++) {
    posts.push({
      username: random(englishNames),
      caption: random(captions),
      image: random(images)
    });
    heartClicked.push(false);
  }
}


function drawPost(index, yOffset) {
  drawHeader(posts[index].username, yOffset);
  drawImagePlaceholder(posts[index].image, yOffset + 50);
  drawBottomUI(index, yOffset + 425);

  
}

function drawHeader(username, y) {
  fill(240);
  rect(0, y, 400, 50);
  fill(200);
  circle(25, y + 25, 35);
  fill(0);
  textSize(16);
  textAlign(LEFT, CENTER);
  text(username, 50, y + 25);
}

function drawImagePlaceholder(img, y) {
  fill(255);
  rect(0, y, 400, 375);
  imageMode(CENTER);
  image(img, width / 2, y + 187.5, 400, 375);  // 이미지 중앙 배치
}

function drawBottomUI(index, y) {
  fill(255);
  rect(0, y, 400, 150);
  drawIcons(index, y);
  fill(0);
  textAlign(LEFT);
  textSize(14);
  text("???님 외 여러 명이 좋아합니다", 20, y + 55);
  textStyle(BOLD);
  text(posts[index].username, 20, y + 76);
  textStyle(NORMAL);
  text(" " + posts[index].caption, 30 + textWidth(posts[index].username), y + 95);
}

function drawIcons(index, y) {
  drawHeartIcon(index, 30, y + 15);
  drawCommentIcon(73, y + 25);
  drawDMIcon(115, y + 25);
  drawSaveIcon(360, y + 15);
}

function drawHeartIcon(index, x, y) {
  push();
  translate(x, y);
  stroke(0);
  strokeWeight(2);
  fill(heartClicked[index] ? 'red' : 'white');
  beginShape();
  vertex(0, 0);
  bezierVertex(-10, -10, -30, 10, 0, 25);
  bezierVertex(30, 10, 10, -10, 0, 0);
  endShape(CLOSE);
  pop();
}

function drawCommentIcon(x, y) {
  push();
  translate(x, y);
  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(-15, -10);
  vertex(15, -10);
  vertex(15, 10);
  vertex(0, 10);
  vertex(-5, 15);
  vertex(-5, 10);
  vertex(-15, 10);
  endShape(CLOSE);
  pop();
}

function drawDMIcon(x, y) {
  push();
  translate(x, y);
  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(-15, 10);
  vertex(0, -10);
  vertex(15, 10);
  vertex(5, 5);
  vertex(0, 10);
  vertex(-5, 5);
  vertex(-15, 10);
  endShape();
  pop();
}

function drawSaveIcon(x, y) {
  push();
  translate(x, y);
  stroke(0);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(0, 0);
  vertex(0, 30);
  vertex(10, 22);
  vertex(20, 30);
  vertex(20, 0);
  vertex(0, 0);
  endShape();
  pop();
}

function drawStopButton() {
  push();
  let stopButtonAlpha = map(scrollY, 23 * 531, 40 * 531, 0, 255);
  fill(255, 0, 0, stopButtonAlpha);
  noStroke();
  rect(width / 4, height - 60, width / 2, 40, 10);
  fill(255, stopButtonAlpha);
  textAlign(CENTER, CENTER);
  textSize(16);
  text("멈추시겠습니까?", width / 2, height - 40);
  pop();
}

function mousePressed() {
  if (!scrollStopped) {
    let yRelative = mouseY + scrollY;
    for (let i = 0; i < posts.length; i++) {
      let heartX = 10, heartY = i * 531 + 430;
      if (mouseX > heartX && mouseX < heartX + 40 &&
          yRelative > heartY && yRelative < heartY + 40) {
        heartClicked[i] = !heartClicked[i];
      }
    }
  }
  if (scrollY > 23 * 531 &&
      mouseX > width / 4 && mouseX < width * 3 / 4 &&
      mouseY > height - 60 && mouseY < height - 20) {
    scrollStopped = true;
  }
}

function mouseWheel(event) {
  if (!scrollStopped && !isPopupActive) {
    scrollY += event.delta;
    scrollY = constrain(scrollY, 0, numPosts * 531 - height);
  }
}

function drawInterruptPopup() {
  background(0, 200);
  fill(255,200);
  rect(width / 4, height / 2 - 60, width / 2, 120, 10);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(16);

  let popup = popupMessages[currentPopupIndex];
  text(`${popup.message}\n계속하려면 '${popup.key}' 키를 누르세요`, width / 2, height / 2);
}

function keyPressed() {
  if (isPopupActive) {
    let expectedKey = popupMessages[currentPopupIndex].key.toLowerCase();
    if (key.toLowerCase() === expectedKey) {
      isPopupActive = false;
      currentPopupIndex++;
    }
  }
}

function drawEndingCredits() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text(" 제작진 ", width / 2, height / 2 - 60);
  textSize(18);
  text("김찬 · 박서연 · 박준영", width / 2, height / 2 - 20);
  textSize(16);
  text("AI 사용 비율: 약 80%", width / 2, height / 2 + 20);
  text("소감 : ~~~~ ", width / 2, height / 2 + 45);
  textSize(14);
  text("감사합니다", width / 2, height / 2 + 90);
}