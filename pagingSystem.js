import { md } from './codex.js';
import { RefreshContent } from './refreshContent.js';

const CHUNK_SIZE = 500;
let pagingEnabled = false;
let currentPage = 0;
let contentChunks = [];

function chunkAndDisplay(data, contentElement) {
    if (pagingEnabled) {
        contentChunks = splitIntoChunks(data, CHUNK_SIZE);
        displayCurrentPage(contentElement);
    } else {
        contentElement.innerHTML = md.render(data);
    }
}

function splitIntoChunks(str, length) {
    let chunks = [];
    while (str) {
        if (str.length < length) {
            chunks.push(str);
            break;
        } else {
            let pos = str.lastIndexOf(' ', length);
            // Check if we are inside an HTML tag or markdown link/image syntax
            while (isInsideTag(str, pos) || isInsideMarkdownSyntax(str, pos)) {
                pos--;
            }
            let leftText = str.substring(0, pos);
            let rightText = str.substring(pos + 1);
            chunks.push(leftText);
            str = rightText;
        }
    }
    return chunks;
}

function isInsideTag(str, index) {
    // Check if index is between < and > which indicates inside a tag
    const lastOpenTag = str.lastIndexOf('<', index);
    const lastCloseTag = str.lastIndexOf('>', index);
    return lastOpenTag > lastCloseTag;
}

function isInsideMarkdownSyntax(str, index) {
    // Checking for markdown link/image syntax, you can add more checks if needed
    const lastOpenBracket = str.lastIndexOf('![', index);
    const lastCloseBracket = str.lastIndexOf(']', index);
    return lastOpenBracket > lastCloseBracket;
}


function displayCurrentPage(contentElement) {
    contentElement.innerHTML = md.render(contentChunks[currentPage]);
    updateButtonStates();
}

function updateButtonStates() {
    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");

    if (currentPage <= 0) {
        prevButton.classList.remove("active");
    } else {
        prevButton.classList.add("active");
    }

    if (currentPage >= contentChunks.length - 1) {
        nextButton.classList.remove("active");
    } else {
        nextButton.classList.add("active");
    }
}

document.getElementById("togglePaging").addEventListener("click", () => {
    pagingEnabled = !pagingEnabled;
    const displayStyle = pagingEnabled ? "inline-block" : "none";
    document.getElementById("prevPage").style.display = displayStyle;
    document.getElementById("nextPage").style.display = displayStyle;

    const contentElement = document.getElementById("yourContentId");
    if (contentElement) {
        const currentContent = contentElement.innerHTML;
        chunkAndDisplay(currentContent, contentElement);
    }
    const refresher = new RefreshContent(null);
    refresher.refresh();
});

document.getElementById("prevPage").addEventListener("click", () => {
    if (pagingEnabled && currentPage > 0) {
        currentPage--;
        const contentElement = document.getElementById("yourContentId");
        if (contentElement) {
            const currentContent = contentElement.innerHTML;
            chunkAndDisplay(currentContent, contentElement);
        }
        const refresher = new RefreshContent(null);
        refresher.refresh();
    }
});

document.getElementById("nextPage").addEventListener("click", () => {
    if (pagingEnabled && currentPage < contentChunks.length - 1) {
        currentPage++;
        const contentElement = document.getElementById("yourContentId");
        if (contentElement) {
            const currentContent = contentElement.innerHTML;
            chunkAndDisplay(currentContent, contentElement);
        }
        const refresher = new RefreshContent(null);
        refresher.refresh();
    }
});

export { chunkAndDisplay };
