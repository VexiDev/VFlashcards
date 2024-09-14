// js/navigation.js

function handleKeyPress(event) {
    const { code } = event;

    if (mode.startsWith('review')) {
        handleReviewModeKeyPress(code);
    } else if (mode.startsWith('study')) {
        handleStudyModeKeyPress(code, event);
    }
}

function handleReviewModeKeyPress(code) {
    if (code === 'ArrowLeft') {
        prevCard();
    } else if (code === 'ArrowRight') {
        nextCard();
    }
}

function handleStudyModeKeyPress(code, event) {
    if (ankiMode) {
        handleAnkiModeKeyPress(code);
    } else {
        if (code === 'ArrowLeft') {
            prevCard();
        } else if (code === 'ArrowRight') {
            nextCard();
        }
    }
    if (code === 'Space') {
        event.preventDefault();
        flipCard();
    }
}

function handleAnkiModeKeyPress(code) {
    switch (code) {
        case '1':
            again();
            break;
        case '2':
            hard();
            break;
        case '3':
            good();
            break;
        case '4':
            easy();
            break;
    }
}

function prevCard() {
    const enabledCards = getEnabledCards();
    if (enabledCards.length > 0) {
        const currentEnabledIndex = enabledCards.indexOf(cards[currentIndex]);
        if (currentEnabledIndex > 0) {
            currentIndex = cards.indexOf(enabledCards[currentEnabledIndex - 1]);
        } else {
            currentIndex = cards.indexOf(enabledCards[enabledCards.length - 1]);
        }
        showCard(true);
    }
}

function nextCard() {
    studyStep++;
    const enabledCards = getEnabledCards();
    if (enabledCards.length > 0) {
        if (ankiMode && mode.startsWith('study')) {
            const dueCards = enabledCards.filter(card => card.nextReview <= studyStep);
            if (dueCards.length > 0) {
                dueCards.sort((a, b) => a.nextReview - b.nextReview);
                currentIndex = cards.indexOf(dueCards[0]);
            } else {
                // Optionally, you can handle no due cards differently
                currentIndex = cards.indexOf(enabledCards[0]);
            }
            saveDeckToFile(currentDeckName, getCurrentDeckData());
        } else if (mode.startsWith('study') && shuffleEnabled) {
            if (shuffledDeck.length === 0) {
                initializeShuffledDeck();
            }
            showRandomCard();
            if (seenCards.size === enabledCards.length) {
                initializeShuffledDeck();
            }
        } else {
            const currentEnabledIndex = enabledCards.indexOf(cards[currentIndex]);
            if (currentEnabledIndex < enabledCards.length - 1) {
                currentIndex = cards.indexOf(enabledCards[currentEnabledIndex + 1]);
            } else {
                currentIndex = cards.indexOf(enabledCards[0]);
            }
        }
        showCard(true);
    }
}

function firstCard() {
    const enabledCards = getEnabledCards();
    if (enabledCards.length > 0) {
        currentIndex = cards.indexOf(enabledCards[0]);
        showCard(true);
    }
}

function lastCard() {
    const enabledCards = getEnabledCards();
    if (enabledCards.length > 0) {
        currentIndex = cards.indexOf(enabledCards[enabledCards.length - 1]);
        showCard(true);
    }
}

function showCard(shouldScroll = true) {
    const flashcardContainer = document.getElementById('flashcard-container');
    flashcardContainer.innerHTML = '';

    const enabledCards = getEnabledCards();
    if (enabledCards.length > 0) {
        const card = cards[currentIndex];
        if (mode === 'review') {
            flashcardContainer.innerHTML = `
                <div class="flashcard">
                    <div class="front"><p>${card.side1}</p></div>
                </div>
                <div class="flashcard">
                    <div class="front"><p>${card.side2}</p></div>
                </div>
            `;
        } else {
            flashcardContainer.innerHTML = `
                <div class="flashcard study-mode" onclick="flipCard()">
                    <div class="front"><p>${mode === 'study-side1' ? card.side1 : card.side2}</p></div>
                    <div class="back"><p>${mode === 'study-side1' ? card.side2 : card.side1}</p></div>
                </div>
            `;
        }
        setTimeout(() => {
            const flashcards = flashcardContainer.querySelectorAll('.flashcard');
            flashcards.forEach(card => {
                card.classList.add('animate');
                card.addEventListener('animationend', () => {
                    card.classList.remove('animate');
                }, {once: true});
            });
        }, 0);
        // Adjust font size
        const flashcardTextElements = flashcardContainer.querySelectorAll('.flashcard p');
        flashcardTextElements.forEach(element => {
            adjustFontSize(element);
        });
    } else {
        flashcardContainer.innerHTML = `
            <div class="flashcard">
                <div class="front"><p>No Enabled Cards In Deck</p></div>
                <div class="back"><p>Enable some cards or add new ones</p></div>
            </div>
        `;
    }
    updateCardList(shouldScroll);
}

function adjustFontSize(element) {
    let fontSize = parseInt(window.getComputedStyle(element).fontSize);
    while (element.scrollHeight > element.clientHeight && fontSize > 12) {
        fontSize -= 1;
        element.style.fontSize = fontSize + 'px';
    }
}


function flipCard() {
    const flashcard = document.querySelector('.flashcard');
    flashcard.style.transform = flashcard.style.transform === 'rotateX(180deg)' ? 'rotateX(0deg)' : 'rotateX(180deg)';
}

function scrollSelectedCardIntoView() {
    const selectedCard = document.querySelector('.card-item.selected');
    if (selectedCard) {
        selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}
