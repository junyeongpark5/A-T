let posts = [];
let scrollY = 0;
let heartClicked = [];
let numPosts = 40;

function setup() {
  createCanvas(400, windowHeight);
  textFont('Arial');
  generatePosts(numPosts);
  noSmooth();
}

function draw() {
  background(255);

  push();
  translate(0, -scrollY);
  for (let i = 0; i < posts.length; i++) {
    drawPost(i, i * 531);
  }
  pop();

  applyScrollBlur();
}

function generatePosts(count) {
  for (let i = 0; i < count; i++) {
    posts.push({
      username: "Arneo Paris",
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
  drawHeartIcon(index, 30, y + 25);
  drawCommentIcon(70, y + 25);
  drawDMIcon(110, y + 25);
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
  bezierVertex(-10, -15, -25, 10, 0, 25);
  bezierVertex(25, 10, 10, -15, 0, 0);
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

function mousePressed() {
  let yRelative = mouseY + scrollY;
  for (let i = 0; i < posts.length; i++) {
    let heartX = 10, heartY = i * 531 + 430;
    if (mouseX > heartX && mouseX < heartX + 40 &&
        yRelative > heartY && yRelative < heartY + 40) {
      heartClicked[i] = !heartClicked[i];
    }
  }
}

function mouseWheel(event) {
  scrollY += event.delta;
  scrollY = constrain(scrollY, 0, numPosts * 531 - height);
}

function applyScrollBlur() {
  let blurLevel = map(scrollY, 0, numPosts * 531 - height, 0, 5);
  blurLevel = constrain(blurLevel, 0, 5);
  if (blurLevel >= 1) {
    filter(BLUR, blurLevel);
  }
}
