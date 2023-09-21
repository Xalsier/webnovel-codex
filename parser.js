import { md, LANGUAGE_LIST, errorContent, PASS_PATH, secrets, SECRETS_TEXT } from './codex.js';
import { hasKey } from './observer.js';
import { chunkAndDisplay } from './pagingSystem.js';

export function displayContent(contentId, filePath, key) {
    const contentElement = document.getElementById(contentId);
    const lang = LANGUAGE_LIST ? LANGUAGE_LIST.value : DEFAULT_LANGUAGE;

    if (secrets.includes(filePath) && key === 'true' && !hasKey) {
        contentElement.innerHTML = SECRETS_TEXT;
        return;
    }

    if (key === 'true' && !hasKey) {
        displayPassContent(lang, contentElement);
        return;
    }

    if (!filePath || filePath.includes("null")) {
        contentElement.innerHTML = md.render(errorContent);
        return;
    }

    fetchAndRenderContent(filePath, contentElement);
}

function displayPassContent(lang, contentElement) {
    fetch(getPassContentPath(lang))
        .then(response => response.text())
        .then(data => {
            chunkAndDisplay(data, contentElement);
        })
        .catch(error => {
            console.error('Error fetching pass content:', error);
            contentElement.innerHTML = md.render(errorContent);
        });
}

function getPassContentPath(lang) {
    return `${PASS_PATH}${lang}.md`;
}

function fetchAndRenderContent(filePath, contentElement) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching content from ${filePath}. Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            chunkAndDisplay(data, contentElement);
        })
        .catch(error => {
            console.error('Error fetching content:', error.message);
            contentElement.innerHTML = md.render(errorContent);
        });
}
