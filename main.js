let posts = [];
let scrollY = 0;
let heartClicked = [];
let numPosts = 40;

let startTime;
let scrollStopped = false;

function setup() {
  createCanvas(400, windowHeight);
  textFont('Arial');
  generatePosts(numPosts);
  noSmooth();
  startTime = millis();
}

function draw() {
  background(255);
  let maxScroll = numPosts * 531 - height;

  applyShakeEffect(scrollY, maxScroll);
  applyBlurEffect(scrollY, maxScroll);

  translate(0, -scrollY);
  for (let i = 0; i < posts.length; i++) {
    drawPost(i, i * 531);
  }
  pop(); // blur
  drawRedOverlay(scrollY, maxScroll);
  pop(); // shake

  displayUsageTime(scrollY, maxScroll);
  displayWarning(scrollY, maxScroll);

  if (scrollY > 23 * 531 && !scrollStopped) {
    drawStopButton();
  }

  if (scrollStopped) {
    showRestMessage();
  }

  handleExitMessage(); 
}

// -----------------------
// 기능 함수 분리
// -----------------------
let showExitMessage = false;
let exitMessageStartTime = 0;

function handleExitMessage() {
  if (showExitMessage) {
    fill(0, 200);
    rect(0, 0, width, height);
    fill(255);
    textSize(22);
    textAlign(CENTER, CENTER);
    text("종료합니다.", width / 2, height / 2);

    if (millis() - exitMessageStartTime > 2000) {
      showExitMessage = false;  
    }
  }
}

// 키보드 입력 감지 함수
function keyPressed() {
  if (keyCode === ENTER) {
    showExitMessage = true;
    exitMessageStartTime = millis();
  }
}


function applyShakeEffect(scrollY, maxScroll) {
  let shakeAmt = map(scrollY, 0, maxScroll, 0, 5);
  push();
  translate(random(-shakeAmt, shakeAmt), random(-shakeAmt, shakeAmt));
}

function applyBlurEffect(scrollY, maxScroll) {
  let blurAmt = map(scrollY, 0, maxScroll, 0, 12);
  blurAmt = constrain(blurAmt, 0, 12);
  push();
  filter(BLUR, blurAmt);
}

function drawRedOverlay(scrollY, maxScroll) {
  if (scrollY > 23 * 531) {
    let redOverlayAlpha = map(scrollY, 23 * 531, maxScroll, 0, 80);
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
    text("⚠ 경고! 과도한 사용은 건강에 해로울 수 있습니다.", width / 2, 40);
  }
}

function showRestMessage() {
  fill(0);
  rect(0, 0, width, height);
  fill(255);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("스크롤이 멈췄습니다. 휴식을 취하세요.", width / 2, height / 2);
}

// -----------------------
// 기존 콘텐츠 출력
// -----------------------

function generatePosts(count) {
  let englishNames = [
  "Ethan Carter",
  "Olivia Bennett",
  "Liam Thompson",
  "Ava Morgan",
  "Noah Brooks",
  "Chloe Anderson",
  "Mason Reed",
  "Lily Parker",
  "James Sullivan",
  "Sophia Hayes"
  ];
  for (let i = 0; i < count; i++) {
    posts.push({
      username: random(englishNames),
      caption: "파리의 하루 🌇 #" + (i + 1),
    });
    heartClicked.push(false);
  }
}

function drawPost(index, yOffset) {
  drawHeader(posts[index].username, yOffset);
  drawImagePlaceholder(yOffset + 50);
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

function drawImagePlaceholder(y) {
  fill(255);
  rect(0, y, 400, 375);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("image", 200, y + 187.5);
}

function drawBottomUI(index, y) {
  fill(255);
  rect(0, y, 400, 106);
  drawIcons(index, y);
  fill(0);
  textAlign(LEFT);
  textSize(14);
  text("???님 외 여러 명이 좋아합니다", 20, y + 65);
  text(posts[index].username + ": " + posts[index].caption, 20, y + 85);
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

// -----------------------
// 버튼 + 입력 처리
// -----------------------

function drawStopButton() {
  push();
  let stopButtonAlpha = map(scrollY, 23 * 531, 40 * 531, 0, 255); // 투명도 조절

  let stopButtonColor = color(255, 0, 0, stopButtonAlpha);
  fill(stopButtonColor);
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

  // 멈춤 버튼 클릭 조건
  if (scrollY > 23 * 531 &&
      mouseX > width / 4 && mouseX < width * 3 / 4 &&
      mouseY > height - 60 && mouseY < height - 20) {
    scrollStopped = true;
  }
}

function mouseWheel(event) {
  if (!scrollStopped) {
    scrollY += event.delta;
    scrollY = constrain(scrollY, 0, numPosts * 531 - height);
  }
}
