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
let speechRec;
let allowStopOnce = true;
let voiceMessage = "";
let stopByVoice = false; // "그만"으로 멈춤 감지


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

  speechRec = new p5.SpeechRec('ko-KR', gotSpeech);
  speechRec.start(true, false); // 연속 듣기, 중복 없음
}

function gotSpeech() {
  if (speechRec.resultValue) {
    let said = speechRec.resultString.trim();

    if (said === "멈춰") {
      voiceMessage = "더는 멈출 수 없습니다.";
    } else if (said === "그만" && allowStopOnce) {
      voiceMessage = "정적…";
      allowStopOnce = false;
      stopByVoice = true;     // 스크롤 중단
      scrollStopped = true;   // 기존 로직과 연결
    }
  }
}

function draw() {
  if (showTitle) {
    background(0);
    fill(255);
    textSize(40);
    textAlign(CENTER, CENTER);
    text("무한스크롤에\n 현혹되지 말자", width / 2, height / 2);

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

  if (voiceMessage !== "") {
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(18);
    text(voiceMessage, width / 2, height - 80);
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

let stopButtonClickCount = 0; // 추가: 버튼 클릭 횟수 저장

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
    stopButtonClickCount++;
    if (stopButtonClickCount >= 3) {
      scrollStopped = true;
    }
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

let creditYOffset = 600;
let scrollSpeed = 1.2;
let creditsFinished = false;

function drawEndingCredits() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);

  let y = creditYOffset;

  textSize(26);
  text("🎬 제작진", width / 2, y);
  y += 40;

  textSize(20);
  text("김찬 · 박서연 · 박준영", width / 2, y);
  y += 60;

  textSize(22);
  text("🧠 AI 사용 비율: 약 80%", width / 2, y);
  y += 50;

  textSize(24);
  text("🗣️ 소감", width / 2, y);
  y += 35;

  textSize(16);
  text("박준영:", width / 2, y);
  y += 25;
  text("이번 프로젝트에서는 무한 스크롤의", width / 2, y);
  y += 20;
  text("중독성과 피로감을 주제로 인터랙티브", width / 2, y);
  y += 20;
  text("콘텐츠를 p5.js로 제작했습니다.", width / 2, y);
  y += 20;
  text("스크롤 조작에 따른 화면 왜곡과", width / 2, y);
  y += 20;
  text("저해상도 필터 효과, 그리고 엔딩 크레딧처럼", width / 2, y);
  y += 20;
  text("글자가 올라가는 애니메이션을 구현하면서", width / 2, y);
  y += 20;
  text("p5.js의 다양한 함수와 기능들을 익힐 수 있었습니다.", width / 2, y);
  y += 20;
  text("map(), constrain(), random() 같은 내장 함수와", width / 2, y);
  y += 20;
  text("조건문, 반복문을 활용해 시각 효과와 상호작용을", width / 2, y);
  y += 20;
  text("자연스럽게 연결하는 과정이 특히 흥미로웠습니다.", width / 2, y);
  y += 20;
  text("코딩뿐 아니라 사용자 경험과 스토리텔링을 고려해", width / 2, y);
  y += 20;
  text("콘텐츠를 완성하는 경험이 매우 뜻깊었습니다.", width / 2, y);
  y += 40;

  text("박서연:", width / 2, y);
  y += 25;
  text("초반에 팀 주제가 다소 추상적이다 보니", width / 2, y);
  y += 20;
  text("자칫하면 메시지가 명확하게 전달되지 않을 수", width / 2, y);
  y += 20;
  text("있겠다는 우려가 있었습니다.", width / 2, y);
  y += 20;
  text("‘어떻게 하면 사용자가 주제를", width / 2, y);
  y += 20;
  text("직관적으로 파악할 수 있을까?’라는 고민을 해결하기 위해", width / 2, y);
  y += 20;
  text("SNS 프레임을 배경으로 설정하고", width / 2, y);
  y += 20;
  text("화면 흔들림, 색상 변화 등의 인터랙션을 통해", width / 2, y);
  y += 20;
  text("문제점이 시각적으로 뚜렷하게 나타나도록 구현했습니다.", width / 2, y);
  y += 20;
  text("기획, 프로그래밍, 디자인을 함께 고민하면서", width / 2, y);
  y += 20;
  text("의미 있는 결과물을 만들어 낸 좋은 경험이었습니다.", width / 2, y);
  y += 20;
  text("앞으로의 프로젝트에서도 여러 분야를 조화롭게 결합해", width / 2, y);
  y += 20;
  text("전달력 있는 콘텐츠를 만들어 보고 싶습니다.", width / 2, y);
  y += 50;

  textSize(24);
  text("📜 사용한 기술", width / 2, y);
  y += 35;

  textSize(16);
  text("✅ JavaScript 문법 요소", width / 2, y);
  y += 22;
  text("• 배열, 객체, 조건문(if), 반복문(for)", width / 2, y);
  y += 20;
  text("• map(), constrain(), random() 함수", width / 2, y);
  y += 20;
  text("• 사용자 정의 함수, mousePressed 등 이벤트 함수", width / 2, y);
  y += 30;

  text("🎨 p5.js 기능 활용", width / 2, y);
  y += 22;
  text("• createCanvas(), background(), text()", width / 2, y);
  y += 20;
  text("• translate(), push(), pop()을 활용한 화면 왜곡", width / 2, y);
  y += 20;
  text("• loadPixels(), updatePixels()을 이용한 저해상도 효과", width / 2, y);
  y += 40;

  textSize(20);
  text("🙏 감사합니다", width / 2, y);

  if (!creditsFinished) {
    creditYOffset -= scrollSpeed;
    if (y < 0) {
      creditsFinished = true;
    }
  }
}
