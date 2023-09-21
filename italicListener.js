import { fetchData, displayContent, COLLECTION_LIST, PAGE_LIST, fetchAndPopulate, CHAPTER_LIST, VOLUME_LIST } from './codex.js';

export const initializeItalicClickListener = () => {
    document.addEventListener('click', async function(event) {
        if (event.target.tagName.toLowerCase() === 'a' && 
            (event.target.closest('#window1') || event.target.closest('#window3'))) {
            event.preventDefault();

            const clickedWord = event.target.textContent;
            console.log("Clicked on:", clickedWord);

            const data = await fetchData();

            if (clickedWord.includes('Chapter')) {
                const chapterEntry = data.chapters[clickedWord];
                if (chapterEntry && chapterEntry.volume) {
                    VOLUME_LIST.value = chapterEntry.volume;
                    await fetchAndPopulate('chapter-list', null, chapterEntry.volume);
                    await new Promise(resolve => setTimeout(resolve, 100));

                    const chapterOption = Array.from(CHAPTER_LIST.options).find(option => option.text === clickedWord);
                    if (chapterOption) {
                        chapterOption.selected = true;
                    }
                }

                const checkbox1 = document.getElementById('window1-checkbox');
                checkbox1.checked = true;
                changeWindow(1);
                return;
            }

            const entry = data.pages[clickedWord];

            if (entry) {
                COLLECTION_LIST.value = entry.collection;
                await fetchAndPopulate('page-list', entry.collection);
                await new Promise(resolve => setTimeout(resolve, 100));

                const pageOption = Array.from(PAGE_LIST.options).find(option => option.text === clickedWord);
                let isPageSelectTitleCorrect = pageOption ? (pageOption.text === clickedWord) : false;

                if (pageOption) {
                    pageOption.selected = true;
                    displayContent('page-content', pageOption.value, pageOption.getAttribute('data-key'));
                }

                const checkbox3 = document.getElementById('window3-checkbox');
                checkbox3.checked = true;
                changeWindow(3);
            }
        } else if (event.target.tagName.toLowerCase() === 'a' && event.target.href) {
            // Allow default behavior for external links
            window.location.href = event.target.href;
        }
    });
};
