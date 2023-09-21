import { displayContent } from './parser.js';
import { Setup } from './setup.js';
import { observeRedSquare, hasKey } from './observer.js'; // <-- Add this line at the top with the other imports
import { initializeItalicClickListener } from './italicListener.js';
import { fetchAndPopulate } from './populate.js'; // Add this import line
import { calculateWordCount } from './wordco.js'; // <-- Import the functions
export const md = window.markdownit({html: true});
export const LANGUAGE_LIST = document.getElementById('language-list');
export let errorContent;
export let secrets = [];
export const SECRETS_TEXT = '?????';
export const DEFAULT_VOLUME = 'Volume 1';
export const DEFAULT_COLLECTION = 'Florazoa';
export const DEFAULT_LANGUAGE = 'ja';
export const ERROR_PATH = '../md/pages/err/err_';
export const CODEX_JSON_PATH = '../json/codex.json';
export const PASS_PATH = '../md/pages/pass/pass_';
export const COLLECTION_LIST = document.getElementById('collection-list');
export const PAGE_LIST = document.getElementById('page-list');
export const VOLUME_LIST = document.getElementById('volume-list');
export const CHAPTER_LIST = document.getElementById('chapter-list');
function fetchErrorContent() {
    const lang = LANGUAGE_LIST ? LANGUAGE_LIST.value : DEFAULT_LANGUAGE;
    return fetch(`${ERROR_PATH}${lang}.md`)
        .then(response => response.text())
        .then(data => {
            errorContent = data;
        })
        .catch(error => {
            console.error('Error fetching error content:', error);
            errorContent = "# Error\nUnable to fetch error content.";
        });
}
fetchErrorContent();
function fetchData() {
    const lang = LANGUAGE_LIST ? LANGUAGE_LIST.value : DEFAULT_LANGUAGE;
    return fetch(CODEX_JSON_PATH)
        .then(response => response.json())
        .then(jsonData => jsonData[lang]);
}
fetchData();
new Setup();
observeRedSquare();
if (LANGUAGE_LIST) {
    LANGUAGE_LIST.addEventListener('change', (event) => {
        calculateWordCount(fetchData, event.target.value);
    });
}
calculateWordCount(fetchData, LANGUAGE_LIST ? LANGUAGE_LIST.value : DEFAULT_LANGUAGE);
initializeItalicClickListener();
export { fetchData, fetchErrorContent, fetchAndPopulate, displayContent };