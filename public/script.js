let linesDiv = document.getElementById("gameplay");
let scoreElm = document.getElementById('score');
let scorePerSecondElm = document.getElementById('sps');
let linesClearedElm = document.getElementById('lines');
let comboElm = document.getElementById('combo');
let bonusPointsElm = document.getElementById('bonusPoints');
let bonusTileChanceButton = document.getElementById('upgradeBonusTileChance');
let bonusTileChanceElm = document.getElementById('bonusTileChance');
let pointsPerLineButton = document.getElementById('upgradePointsPerLine');
let pointsPerLineElm = document.getElementById('pointsPerLine');
let scrollSpeedElm = document.getElementById('scrollSpeed');
let prestigeAmountElm = document.getElementById('prestigeAmount');
let prestigeAmountButton = document.getElementById('prestigeAmountButton');

function gset(val, norm) {
    return (localStorage.getItem(val) ?? (norm ?? 0)) * 1;
}

let score = gset("ccScore")
let combo = gset("ccCombo")
let offset = 0;

let pointsPerLine = gset("ccPointsPerLine", 1);
let pointsPerLineUpgradeCost = gset("ccPointsPerLineUpgradeCost", 10)

let bonusPoints = gset("ccBonus");
let bonusTileChance = gset("ccTileChance", 1);
let bonusTileChanceUpgradeCost = gset("ccTileChanceCost", 250);

let lastSecondScore = 0;
let linesCleared = gset("ccLines");

let prestigeAmount = gset("ccPrestigeAmount", 0);

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
    bonusTileChanceButton.innerText = `Upgrade (${bonusTileChanceUpgradeCost} score)`;
    pointsPerLineElm.innerText = pointsPerLine;
    pointsPerLineButton.innerText = `Upgrade (${pointsPerLineUpgradeCost} bonus points)`;
    prestigeAmountElm.innerText = prestigeAmount;
    prestigeAmountButton.innerText = `Prestige (${(2**prestigeAmount)*10000} score)`;
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
    let scoreMod = (pointsPerLine+Math.floor(combo/8))*(2**prestigeAmount);
    if (currentLine[slot] == 0) {
        score -= scoreMod;
        lastSecondScore -= scoreMod;
        setTimeout(() => {
            lastSecondScore += scoreMod;
            scorePerSecondElm.innerText = lastSecondScore;
        }, 1000);
        combo = 0;
        updateLines();
        return;
    }
    score+=scoreMod;
    combo+=1;
    if (currentLine[slot] == 2) {
        bonusPoints += 1;
    }
    currentLine[slot]=0;
    lastSecondScore+=scoreMod;
    setTimeout(() => {
        lastSecondScore -= scoreMod;
        scorePerSecondElm.innerText = lastSecondScore;
    }, 1000);
    attemptRemoveLine();
    updateLines();
    updateOffset();
})

bonusTileChanceButton.addEventListener("click", (e) => {
    if (score >= bonusTileChanceUpgradeCost) {
        score -= bonusTileChanceUpgradeCost;
        bonusTileChance += 1;
        bonusTileChanceUpgradeCost = Math.floor(bonusTileChanceUpgradeCost*1.5)
    }
    updateLines();
})
pointsPerLineButton.addEventListener("click", (e) => {
    if (bonusPoints >= pointsPerLineUpgradeCost) {
        bonusPoints -= pointsPerLineUpgradeCost;
        pointsPerLine += 1;
        pointsPerLineUpgradeCost = Math.floor(pointsPerLineUpgradeCost*1.2)
    }
    updateLines();
})

function updateOffset() {
    linesDiv.style.transform = 'translateY(' + offset + 'px)'
}

let decidingToReset = false;

function resetStats() {
    decidingToReset = true;
    if (confirm("are you sure?")) {
        localStorage.removeItem("ccScore");
        localStorage.removeItem("ccLines");
        localStorage.removeItem("ccBonus");
        localStorage.removeItem("ccTileChance")
        localStorage.removeItem("ccTileChanceCost")
        localStorage.removeItem("ccCombo")
        localStorage.removeItem("ccPointsPerLine")
        localStorage.removeItem("ccPointsPerLineUpgradeCost");
        localStorage.removeItem("ccPrestigeAmount");
        window.location.reload();
    }
}

setInterval(() => {
    offset = (offset / (((scrollSpeedElm.value*1)/10)+1))-3;
    if (offset < 0) {
        offset = 0;
    }
    updateOffset();
    if (score < 0) {
        score = 0;
    }
}, 10);
setInterval(() => {
    saveGame();
}, 400)

function prestige() {
    decidingToReset = true;
    if ((2**prestigeAmount)*10000 > score) {
        return;
    }
    saveGame();
    setTimeout(() => {
        score = 0
        linesCleared = 0
        bonusPoints = 0
        bonusTileChance = 0
        bonusTileChanceUpgradeCost = 0
        combo = 0
        pointsPerLine = 0
        pointsPerLineUpgradeCost = 0
        localStorage.removeItem("ccScore");
        localStorage.removeItem("ccLines");
        localStorage.removeItem("ccBonus");
        localStorage.removeItem("ccTileChance")
        localStorage.removeItem("ccTileChanceCost")
        localStorage.removeItem("ccCombo")
        localStorage.removeItem("ccPointsPerLine")
        localStorage.removeItem("ccPointsPerLineUpgradeCost");
        prestigeAmount += 1;
        localStorage.setItem("ccPrestigeAmount", prestigeAmount)
        window.location.reload();
    }, 200)
}

function saveGame() {
    if (decidingToReset) {
        return
    }
    localStorage.setItem("ccScore", score);
    localStorage.setItem("ccLines", linesCleared);
    localStorage.setItem("ccBonus", bonusPoints);
    localStorage.setItem("ccTileChance", bonusTileChance);
    localStorage.setItem("ccTileChanceCost", bonusTileChanceUpgradeCost);
    localStorage.setItem("ccCombo", combo);
    localStorage.setItem("ccPointsPerLine", pointsPerLine);
    localStorage.setItem("ccPointsPerLineUpgradeCost", pointsPerLineUpgradeCost)
    localStorage.setItem("ccPrestigeAmount", prestigeAmount)
}

updateLines();
