// js/app.js

async function initializeApp() {
    await loadDecks();
    const lastUsedDeck = localStorage.getItem('lastUsedDeck');
    if (lastUsedDeck && decks[lastUsedDeck]) {
        await loadDeck(lastUsedDeck);
    } else {
        const firstDeckName = Object.keys(decks)[0];
        if (firstDeckName) {
            await loadDeck(firstDeckName);
        } else {
            await createNewDeck();
        }
    }
    document.addEventListener('keydown', handleKeyPress);
    addEventListeners();
}

function addEventListeners() {
    document.getElementById('add-button').addEventListener('click', addCards);
    document.getElementById('manage-decks-btn').addEventListener('click', openManageDecksModal);
    document.getElementById('new-deck-btn').addEventListener('click', createNewDeck);
    document.getElementById('prev-button').addEventListener('click', prevCard);
    document.getElementById('next-button').addEventListener('click', nextCard);
    document.getElementById('first-card-button').addEventListener('click', firstCard);
    document.getElementById('last-card-button').addEventListener('click', lastCard);
    document.getElementById('shuffle-toggle').addEventListener('change', toggleShuffle);
    document.getElementById('side1-input').addEventListener('input', validateInput);
    document.getElementById('side2-input').addEventListener('input', validateInput);
    document.getElementById('anki-mode-toggle').addEventListener('change', async () => {
        ankiMode = document.getElementById('anki-mode-toggle').checked;
        updateControls();
        updateCardList();

        await saveDeckToFile(currentDeckName, cards);
    });
    document.getElementById('again-button').addEventListener('click', again);
    document.getElementById('hard-button').addEventListener('click', hard);
    document.getElementById('good-button').addEventListener('click', good);
    document.getElementById('easy-button').addEventListener('click', easy);
    document.querySelectorAll('.close').forEach(button => {
        button.addEventListener('click', () => {
            closeModal(button.getAttribute('data-modal'));
        });
    });
    document.getElementById('confirm-edit-button').addEventListener('click', confirmEdit);
    document.getElementById('confirm-remove-button').addEventListener('click', () => {
        confirmRemove(editingIndex);
    });
}

window.addEventListener('load', () => {
    initializeApp();
    initModeSwitch();
});

document.addEventListener('DOMContentLoaded', () => {
    initModeSwitch();
    initializeAppMode();
});