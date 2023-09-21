import { fetchData, SECRETS_TEXT } from './codex.js';
import { hasKey } from './observer.js';

export function populateSelect(data, selectorId) {
    if (typeof data !== 'object' || !data) {
        console.error(`Data provided to populateSelect is not a valid object.`);
        return;
    }

    const selector = document.getElementById(selectorId);
    if (!selector) {
        console.error(`Element with ID '${selectorId}' not found in the DOM.`);
        return;
    }

    selector.innerHTML = '';
    Object.keys(data).forEach(key => {
        const entry = data[key];
        if (!entry || typeof entry !== 'object') {
            console.error(`Invalid entry for key: ${key}`);
            return; // continue to the next iteration
        }
        const option = document.createElement('option');
        option.value = typeof entry.path === 'string' ? entry.path : '';
        if (entry.hasOwnProperty('keyRequired') && entry.keyRequired && !hasKey) {
            option.text = SECRETS_TEXT;
            
            if (selectorId === 'chapter-list') {
                console.log(`Appending ?????? to secret chapters.`);
            } else {
                console.log(`Appending ?????? to secret pages.`);
            }
        } else {
            option.text = typeof key === 'string' ? key : 'Invalid Key';
        }
        if (entry.hasOwnProperty('keyRequired') && entry.keyRequired) {
            option.setAttribute('data-key', 'true');
        }
        selector.appendChild(option);
    });
}
export function fetchAndPopulate(selectorId, collectionName, volumeName = null) {
    function logError(message) {
        console.error(message);
    }

    if (!selectorId || typeof selectorId !== 'string') {
        logError(`Invalid selectorId provided to fetchAndPopulate.`);
        return;
    }

    fetchData()
        .then(data => {
            if (!data || typeof data !== 'object') {
                logError(`Fetched data is not a valid object.`);
                return;
            }

            function processDataType(dataType) {
                if (!['chapters', 'pages'].includes(dataType)) {
                    logError(`Invalid dataType: ${dataType}`);
                    return;
                }

                const entriesByCollection = {};
                Object.keys(data[dataType]).forEach(entryName => {
                    const entry = data[dataType][entryName];
                    if (!entryName || !entry) {
                        logError(`Invalid entry or entryName in dataType: ${dataType}`);
                        return; // continue to the next iteration
                    }

                    // Filter by collection name for pages and by volume for chapters
                    if (dataType === 'pages' && (!collectionName || entry.collection === collectionName)) {
                        entriesByCollection[entryName] = entry;
                    } else if (dataType === 'chapters' && (!volumeName || entry.volume === volumeName)) {
                        entriesByCollection[entryName] = entry;
                    }
                });

                populateSelect(entriesByCollection, dataType === 'chapters' ? 'chapter-list' : selectorId);
            }

            if (selectorId === 'chapter-list') {
                processDataType('chapters');
            } else {
                processDataType('pages');
            }
        })
        .catch(error => {
            logError(`Error in fetchAndPopulate for ${selectorId}: ${error.message}`);
        });
}
