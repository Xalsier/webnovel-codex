// refreshContent.js

import { fetchData } from './codex.js';
import { fetchAndPopulate } from './populate.js';
import { COLLECTION_LIST, PAGE_LIST, VOLUME_LIST, CHAPTER_LIST } from './codex.js';

export class RefreshContent {
    constructor(data) {
        this.data = data;
    }
    
    async refresh() {
        this.clearElements([COLLECTION_LIST, PAGE_LIST, VOLUME_LIST, CHAPTER_LIST]);
        this.data = await fetchData();
        this.populateCollectionsAndVolumes();
    }

    clearElements(elements) {
        elements.forEach(el => el && (el.innerHTML = ''));
    }

    handleErrorContent() {
        if (!this.data.pages || Object.keys(this.data.pages).length === 0) {
            const contentElement = document.getElementById('page-content'); 
            contentElement.innerHTML = md.render(errorContent);
            return;
        }
    }

    populateCollectionsAndVolumes() {
        if (COLLECTION_LIST) {
            this.populateSelectOptionsFromData(COLLECTION_LIST, 'collection', 'pages', 'page-list');
        }
    
        if (VOLUME_LIST) {
            const volumes = [...new Set(Object.values(this.data.chapters).map(chapter => chapter.volume))];
            this.populateSelectOptions(VOLUME_LIST, volumes);
    
            if (volumes.length > 0) {
                this.populateChapterListBasedOnVolume(volumes[0]);
            }
        }
    }

    populateChapterListBasedOnVolume(selectedVolume) {
        if (CHAPTER_LIST) {
            CHAPTER_LIST.innerHTML = ''; // Clear the CHAPTER_LIST
            const chaptersForVolume = Object.keys(this.data.chapters).filter(chapterName => this.data.chapters[chapterName].volume === selectedVolume);
            this.populateSelectOptions(CHAPTER_LIST, chaptersForVolume, 'path');
        }
    }

    populateSelectOptionsFromData(selectElement, property, dataProperty, fetchArgument) {
        const set = new Set(Object.values(this.data[dataProperty]).map(item => item[property]));
        const list = [...set];
        this.populateSelectOptions(selectElement, list);
        if (list.length > 0) {
            fetchAndPopulate(fetchArgument, list[0]);
        }
    }

    populateSelectOptions(selectElement, items, property = null) {
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = property ? this.data.chapters[item][property] : item;
            option.text = item;
            selectElement.appendChild(option);
        });
    }
}
