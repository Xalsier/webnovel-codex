const kuromoji = window.kuromoji;

// Global tokenizer initialization
let tokenizer;
kuromoji.builder({ dicPath: "https://cdn.jsdelivr.net/npm/kuromoji@latest/dict/" }).build((err, tok) => {
    if (err) {
        console.error('Error building kuromoji tokenizer:', err);
    } else {
        tokenizer = tok;
    }
});

async function fetchChapterWordCount(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Failed to fetch the file at ${filePath}. Status: ${response.status}`);
        }
        const data = await response.text();

        if (containsJapanese(data)) {
            return await countJapaneseWords(data);
        } else {
            return data.split(/\s+/).filter(Boolean).length; // Count words for non-Japanese
        }
    } catch (error) {
        console.error('Error fetching chapter content:', error.message);
        return 0;  // Return 0 if there's an error.
    }
}

// 3. Cache RegExp instance
const JAPANESE_REGEX = /[\u3040-\u30FF\uFF66-\uFF9F\u4E00-\u9FBF]/;

// 4. Use named constants
function containsJapanese(text) {
    return JAPANESE_REGEX.test(text);
}

function countJapaneseWords(data) {
    if (!tokenizer) {
        console.error('Tokenizer is not initialized.');
        return 0;
    }
    const tokens = tokenizer.tokenize(data);
    return tokens.length;
}

async function displayTotalWordCount(chapters) {
    const counts = await Promise.all(Object.values(chapters).map(chapter => fetchChapterWordCount(chapter.path)));
    const totalWordCount = counts.reduce((acc, curr) => acc + curr, 0);
    document.getElementById('wordCountSpan').innerText = `${totalWordCount}語`;
}

async function calculateWordCount(fetchDataFunction, lang) {
    try {
        const data = await fetchDataFunction();
        const langChapters = data.chapters;
        displayTotalWordCount(langChapters);
    } catch (error) {
        console.error('Error calculating total word count for', lang, ':', error.message);
    }
}

export { fetchChapterWordCount, displayTotalWordCount, calculateWordCount };
