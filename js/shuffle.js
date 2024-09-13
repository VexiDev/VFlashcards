// js/shuffle.js

function toggleShuffle() {
    shuffleEnabled = document.getElementById('shuffle-toggle').checked;
    if (mode.startsWith('study')) {
        if (shuffleEnabled) {
            initializeShuffledDeck();
            showRandomCard();
        } else {
            shuffledDeck = [];
            seenCards.clear();
            showCard(true);
        }
    }
}

function initializeShuffledDeck() {
    const enabledCards = getEnabledCards();
    shuffledDeck = shuffleArray([...enabledCards]);
    shuffleIndex = -1;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showRandomCard() {
    shuffleIndex++;
    if (shuffleIndex >= shuffledDeck.length) {
        // All cards have been shown, reinitialize
        initializeShuffledDeck();
        shuffleIndex = 0;
    }
    currentIndex = cards.indexOf(shuffledDeck[shuffleIndex]);
    showCard(true);
}
