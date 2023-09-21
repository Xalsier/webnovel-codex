// handlers.js

import { fetchErrorContent, fetchAndPopulate, displayContent } from './codex.js';
import { LANGUAGE_LIST, COLLECTION_LIST, PAGE_LIST, VOLUME_LIST, CHAPTER_LIST } from './codex.js';

export class Handlers {
    constructor(data) {
        this.data = data;
    }

    setupHandlers() {
        if (LANGUAGE_LIST) {
            LANGUAGE_LIST.addEventListener('change', async () => {
                fetchErrorContent();
                this.clearElements([COLLECTION_LIST, PAGE_LIST, VOLUME_LIST, CHAPTER_LIST]);
                this.handleErrorContent();
                await this.refresh();
            });
        }
        if (COLLECTION_LIST) {
            COLLECTION_LIST.addEventListener('change', () => {
                const selectedCollection = COLLECTION_LIST.value;
                fetchAndPopulate('page-list', selectedCollection);
            });
        }
        this.createListHandler(PAGE_LIST, 'page-content');
        this.createListHandler(CHAPTER_LIST, 'chapter-content');
        this.createObserverHandler(PAGE_LIST, 'page-content');
        this.createObserverHandler(CHAPTER_LIST, 'chapter-content');
        if (VOLUME_LIST) {
            VOLUME_LIST.addEventListener('change', () => {
                const selectedVolume = VOLUME_LIST.value;
                fetchAndPopulate('chapter-list', null, selectedVolume);
            });
        }
    }

    createListHandler(element, contentId) {
        if (element) {
            element.addEventListener('change', function () {
                const selectedItem = this.options[this.selectedIndex];
                const filePath = selectedItem.value;
                const key = selectedItem.getAttribute('data-key');
                displayContent(contentId, filePath, key);
            });
        }
    }

    createObserverHandler(element, contentId) {
        if (element) {
            const observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.addedNodes.length > 0 && element && element.options && element.options.length > 0) {
                        const filePath = element.options[0].value;
                        const key = element.options[0].getAttribute('data-key');
                        displayContent(contentId, filePath, key);
                    }
                });
            });
            observer.observe(element, { childList: true });
        }
    }
}
