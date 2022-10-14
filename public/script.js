let linesDiv = document.getElementById("gameplay");
let scoreElm = document.getElementById('score');
let scorePerSecondElm = document.getElementById('sps');
let linesClearedElm = document.getElementById('lines');
let comboElm = document.getElementById('combo');
let bonusPointsElm = document.getElementById('bonusPoints');
let bonusTileChanceButton = document.getElementById('upgradeBonusTileChance');
let bonusTileChanceElm = document.getElementById('bonusTileChance');

let score = (localStorage.getItem("ccScore") ?? 0) * 1;
let combo = 0;
let offset = 0;

let bonusPoints = 0;
let bonusTileChance = 1;
let bonusTileUpgradeCost = 250;

let lastSecondScore = 0;
let linesCleared = (localStorage.getItem("ccLines") ?? 0) * 1;

let mode = "fm";  // fast mode (fm), hammers (hm), binary (bn)

let fm_lastActiveSlot = 0;

let currentLine = newLineArray();
let nextLines = [];

for (var i = 0; i < 25; i++) {
    nextLines.push(newLineArray());
}

function makeLineDiv(line_array) {
    let numWordMap = {0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four'}
    let line = document.createElement("div");
    line.classList.add("line");
    for (let index in line_array) {
        let block = document.createElement("div");
        block.classList.add("block");
        block.classList.add(numWordMap[line_array[index]] ?? 'four');
        line.appendChild(block);
    }
    return line;
}

function updateLines() {
    linesDiv.innerText = "";
    linesDiv.appendChild(makeLineDiv(currentLine));
    for (let index in nextLines) {
        linesDiv.appendChild(makeLineDiv(nextLines[index]));
    }
    linesClearedElm.innerText = linesCleared;
    scoreElm.innerText = score;
    scorePerSecondElm.innerText = lastSecondScore;
    comboElm.innerText = combo;
    bonusPointsElm.innerText = bonusPoints;
    bonusTileChanceElm.innerText = bonusTileChance;
    bonusTileChanceButton.innerText = `Upgrade (${bonusTileUpgradeCost})`;
}

function newLineArray() {
    let arr = [0, 0, 0, 0];
    let chosenSlot = fm_lastActiveSlot;
    while (chosenSlot == fm_lastActiveSlot) {
        chosenSlot = Math.floor(Math.random()*4);
    }
    arr[chosenSlot] = Math.random() > 1-(bonusTileChance/100) ? 2 : 1;
    fm_lastActiveSlot = chosenSlot;
    return arr;
}

function attemptRemoveLine() {
    if (currentLine.filter(i => i).length == 0) {
        linesCleared += 1;
        currentLine = nextLines[0];
        nextLines = nextLines.splice(1);
        nextLines.push(newLineArray());
        offset += 100;
    }
}

document.addEventListener("keydown", (e) => {
    let keyMap = {68: 0, 70: 1, 74: 2, 75: 3};
    let slot = keyMap[e.keyCode];
    if (slot == undefined) { return; }
    if (currentLine[slot] == 0) {
        score -= 1+Math.floor(combo/5);
        lastSecondScore -= 1;
        setTimeout(() => {
            lastSecondScore+=1;
            scorePerSecondElm.innerText = lastSecondScore;
        }, 1000);
        combo = 0;
        updateLines();
        return;
    }
    score+=1+Math.floor(combo/20);
    combo+=1;
    if (currentLine[slot] == 2) {
        bonusPoints += 1;
    }
    currentLine[slot]=0;
    lastSecondScore+=1;
    setTimeout(() => {
        lastSecondScore-=1;
        scorePerSecondElm.innerText = lastSecondScore;
    }, 1000);
    attemptRemoveLine();
    updateLines();
    updateOffset();
})

bonusTileChanceButton.addEventListener("click", (e) => {
    if (score > bonusTileUpgradeCost) {
        score -= bonusTileUpgradeCost;
        bonusTileChance += 1;
        bonusTileUpgradeCost = Math.floor(bonusTileUpgradeCost*1.5)
    }
    updateLines();
})

function updateOffset() {
    linesDiv.style.transform = 'translateY(' + offset + 'px)'
}

setInterval(() => {
    offset = (offset / 1.04)-3;
    if (offset < 0) {
        offset = 0;
    }
    updateOffset();
    localStorage.setItem("ccScore", score);
    localStorage.setItem("ccLines", linesCleared);
}, 10);

updateLines();
