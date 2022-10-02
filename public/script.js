let linesDiv = document.getElementById("gameplay");
let scoreElm = document.getElementById('score');
let scorePerSecondElm = document.getElementById('sps');
let linesClearedElm = document.getElementById('lines');

let score = 0;
let lastSecondScore = 0;
let linesCleared = 0;

let mode = "fm";  // fast mode (fm), hammers (hm), binary (bn)

let fm_lastActiveSlot = 0;

let currentLine = newLineArray();
let nextLines = [newLineArray(), newLineArray(), newLineArray(), newLineArray(), newLineArray(), newLineArray(), newLineArray()];

function makeLineDiv(line_array) {
    let numWordMap = {0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four'}
    let line = document.createElement("div");
    line.classList.add("line");
    for (let index in line_array) {
        let block = document.createElement("div");
        block.classList.add("block");
        block.classList.add(numWordMap[line_array[index]] ?? 'four');
        block.innerText = line_array[index];
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
}

function newLineArray() {
    let arr = [0, 0, 0, 0];
    let chosenSlot = fm_lastActiveSlot;
    while (chosenSlot == fm_lastActiveSlot) {
        chosenSlot = Math.floor(Math.random()*4);
    }
    arr[chosenSlot] = 1;
    fm_lastActiveSlot = chosenSlot;
    return arr;
}

function attemptRemoveLine() {
    if (currentLine.filter(i => i).length == 0) {
        linesCleared += 1;
        currentLine = nextLines[0];
        nextLines = nextLines.splice(1);
        nextLines.push(newLineArray());
    }
}

document.addEventListener("keydown", (e) => {
    let keyMap = {68: 0, 70: 1, 74: 2, 75: 3};
    let slot = keyMap[e.keyCode];
    if (slot == undefined) { return; }
    if (currentLine[slot] == 0) {
        score -= 1;
        lastSecondScore -= 1;
        setTimeout(() => {
            lastSecondScore+=1;
            scorePerSecondElm.innerText = lastSecondScore;
        }, 1000);
        updateLines();
        return;
    }
    score+=1;
    currentLine[slot]+=-1;
    lastSecondScore+=1;
    setTimeout(() => {
        lastSecondScore-=1;
        scorePerSecondElm.innerText = lastSecondScore;
    }, 1000);
    attemptRemoveLine();
    updateLines();
})

updateLines();
