import { COLLECTION_LIST, VOLUME_LIST } from './codex.js'; 
import { fetchAndPopulate } from './populate.js';
const canvas = document.getElementById('ekgCanvas');
const ctx = canvas.getContext('2d');
const ekgData = [];
let offsetX = 0;
let speedFactor = 0.5;
let zoomLevel = 1; // Initialize zoom level
let clickCount = 0;
const mdFileUrl = ''; 
let PASSCODE;
export let hasKey = false;
async function fetchMdFile() {
    try {
        const response = await fetch(mdFileUrl);
        const markdownText = await response.text();
        const base64 = btoa(unescape(encodeURIComponent(markdownText)));
        const newEkgData = generateCoordinatesFromBase64(base64);
        ekgData.splice(0, ekgData.length, ...newEkgData); 
        if (ekgData.length >= 29) {
            PASSCODE = String(Math.round(ekgData[28].y));
        } else {
            console.log("ekgData does not contain 29 values yet.");
        }
    } catch (error) {
        console.error("Error fetching the markdown file:", error);
    }
}
fetchMdFile(); // Call the function to fetch and process the .md file.
canvas.addEventListener('click', function() {
    clickCount++;
    if (clickCount === 5) {
        zoomLevel = 1;
        clickCount = 0;
    } else {
        zoomLevel += 1.1; // You can increase this value
    }
});
function generateCoordinatesFromBase64(base64) {
    const coords = [];
    const yCenter = 25; // Changed from 200 to 25
    const xIncrement = canvas.width / base64.length;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < base64.length; i++) {
        const charCode = base64.charCodeAt(i);
        const tentativeY = charCode % canvas.height;
        minY = Math.min(minY, tentativeY);
        maxY = Math.max(maxY, tentativeY);
    }
    const scaleFactor = (canvas.height - 100) / (maxY - minY);
    let sumY = 0;
    const tempCoords = [];
    for (let i = 0, x = 0; i < base64.length; i++, x += xIncrement) {
        const charCode = base64.charCodeAt(i);
        const y = (charCode % canvas.height - minY) * scaleFactor;
        sumY += y;
        tempCoords.push({x, y});
    }
    const avgY = sumY / base64.length;
    const offsetY = yCenter - avgY;
    let prevY = yCenter; // start from the center
    for (let i = 0; i < tempCoords.length; i++) {
        const y = tempCoords[i].y + offsetY;
        const smoothY = (prevY + y) / 2;
        coords.push({x: tempCoords[i].x, y: smoothY});
        prevY = smoothY;
    }
    return coords;
}
function drawEkg() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    if (ekgData.length > 0) {
        for (let i = 0; i < ekgData.length - 1; i++) {
            const x1 = (ekgData[i].x - offsetX) * zoomLevel;
            const x2 = (ekgData[i + 1].x - offsetX) * zoomLevel;
            ctx.moveTo(x1, ekgData[i].y);
            ctx.lineTo(x2, ekgData[i + 1].y);
        }
        if (offsetX > 0) {
            for (let i = 0; i < ekgData.length - 1; i++) {
                const x1 = (ekgData[i].x + canvas.width - offsetX) * zoomLevel;
                const x2 = (ekgData[i + 1].x + canvas.width - offsetX) * zoomLevel;
                ctx.moveTo(x1, ekgData[i].y);
                ctx.lineTo(x2, ekgData[i + 1].y);
            }
        }
        ctx.strokeStyle = 'limegreen';
        ctx.lineWidth = 2;
        ctx.stroke();
        offsetX += speedFactor;
        if (offsetX >= canvas.width) {
            offsetX -= canvas.width;
        }
    }
    requestAnimationFrame(drawEkg);
}
requestAnimationFrame(drawEkg);
export const observeRedSquare = () => {
    const observer = new MutationObserver(async mutations => {
        for (let mutation of mutations) {
            if (mutation.addedNodes.length) {
                const redSquare = document.querySelector(".redSquare");
                if (redSquare) {
                    redSquare.addEventListener('click', async function() {
                        const keyInput = document.getElementById("keyInput");
                        if (keyInput?.value.trim() === PASSCODE) {
                            hasKey = true;
                            const keyEntry = document.getElementById("keyEntry");
                            keyEntry.classList.add('fadeOut');
                            keyEntry.addEventListener('animationend', async function() {
                                try {
                                    keyEntry.style.display = 'none';
                                    if (COLLECTION_LIST) {
                                        const selectedCollection = COLLECTION_LIST.value;
                                        await fetchAndPopulate('page-list', selectedCollection);
                                    }
                                    if (VOLUME_LIST) {
                                        const selectedVolume = VOLUME_LIST.value;
                                        await fetchAndPopulate('chapter-list', selectedVolume);
                                    }
                                } catch (error) {
                                    console.error("Error:", error);
                                }
                            }, { once: true });
                        } else {
                            const errorMessage = document.createElement("span");
                            errorMessage.classList.add("error-slide");
                            errorMessage.textContent = "間違ったパスワード";
                            redSquare.appendChild(errorMessage);
                            errorMessage.addEventListener('animationend', function() {
                                errorMessage.remove();
                            }, { once: true });
                        }
                    });
                    observer.disconnect();
                    break;
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
};
