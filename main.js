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

function setup() {
  createCanvas(400, windowHeight);
  textFont('Arial');
  generatePosts(numPosts);
  noSmooth();
  startTime = millis();
  startScreenStartTime = millis();
}

function draw() {
  
  if(showTitle) {
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
    
    if (millis() - showTitle > 3000) {
      showTitle = false;
      showStartScreen = true;
    }
    return;
  }
  
  if (showStartScreen) {
    background(0);
    fill(-150 + millis()/15);
    textSize(20);
    textAlign(CENTER, CENTER);
    text("계속 움직이세요. 멈추지 마세요.", width / 2, height / 2);

    if (millis() - startScreenStartTime > 7000) {
      showStartScreen = false;
    }
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
  for (let i = 0; i < posts.length; i++) {
    drawPost(i, i * 531);
  }
  pop(); // blur
  drawRedOverlay(scrollY, maxScroll);
  pop(); // shake

   applyWaveDistortionEffect(scrollY, maxScroll);

  displayUsageTime(scrollY, maxScroll);
  displayWarning(scrollY, maxScroll);

  if (scrollY > 23 * 531 && !scrollStopped) {
    drawStopButton();
  }

  if (scrollStopped) {
    showRestMessage();
  }
}

// -----------------------
// 기능 함수 분리
// -----------------------

function applyShakeEffect(scrollY, maxScroll) {
  let shakeAmt = map(scrollY, 0, maxScroll, 0, 15);
  push();
  translate(random(-shakeAmt, shakeAmt), random(-shakeAmt, shakeAmt));
}

function applyBlurEffect(scrollY, maxScroll) {
  let blurAmt = map(scrollY, 0, maxScroll, 0, 12);
  blurAmt = constrain(blurAmt, 0, 15);
  push();
  filter(BLUR, blurAmt);
}

function applyWaveDistortionEffect(scrollY, maxScroll) {
  let freq = map(scrollY, 23 * 531, maxScroll, 0.01, 0.1);
  let amp = map(scrollY, 23 * 531, maxScroll, 0, 5);
  amp = constrain(amp, 0, 10);

  let snapshot = get();

  let margin = 10; // 가장자리 고정 영역 (픽셀 수)

  if (scrollY > 23 * 531) {
    for (let y = 0; y < height; y++) {
      let offset = sin(y * freq + frameCount * 0.1) * amp;
      offset = int(offset);

      // 왼쪽 가장자리 유지
      copy(snapshot, 0, y, margin, 1, 0, y, margin, 1);

      // 왜곡된 중간 영역
      copy(snapshot, margin, y, width - 2 * margin, 1, margin + offset, y, width - 2 * margin, 1);

      // 오른쪽 가장자리 유지
      copy(snapshot, width - margin, y, margin, 1, width - margin, y, margin, 1);
    }
  }
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

function drawEndingCredits() {
  background(0);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(22);
  text("✨ 제작진 ✨", width / 2, height / 2 - 60);
  textSize(18);
  text("김찬 · 박서연 · 박준영", width / 2, height / 2 - 20);
  textSize(16);
  text("AI 사용 비율: 약 80%", width / 2, height / 2 + 20);
  text("소감 : ~~~~ ", width / 2, height / 2 + 45);
  textSize(14);
  text("감사합니다 🙏", width / 2, height / 2 + 90);
}