import { COLLECTION_LIST, VOLUME_LIST} from './codex.js'; 
import { fetchAndPopulate } from './populate.js';
const PASSCODE = "nari";
export let hasKey = false;
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
                                keyEntry.style.display = 'none';
                                if (COLLECTION_LIST) {
                                    const selectedCollection = COLLECTION_LIST.value;
                                    await fetchAndPopulate('page-list', selectedCollection)
                                    .catch(error => {
                                        console.error("Error populating page-list:", error);
                                    });
                                }
                                if (VOLUME_LIST) {
                                    const selectedVolume = VOLUME_LIST.value;
                                    await fetchAndPopulate('chapter-list', selectedVolume)
                                    .catch(error => {
                                        console.error("Error populating chapter-list:", error);
                                    });
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