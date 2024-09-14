// js/decks.js

async function loadDecks() {
    const deckNames = await window.electronAPI.readDecks();
    decks = {};
    for (const deckName of deckNames) {
        decks[deckName.replace('.json', '')] = [];
    }
    if (document.getElementById('manageDecksModal').style.display === 'block') {
        updateDeckList();
    }
    const manageDecksModal = document.getElementById('manageDecksModal');
    if (manageDecksModal.style.display === 'block') {
        updateDeckList();
    }
    closeModal('manageDecksModal');
}

async function loadDeck(deckName) {
    currentDeckName = deckName;
    let deckData = await window.electronAPI.readDeck(deckName);

    // Check if the deck is a v1 deck (an array of cards)
    if (Array.isArray(deckData)) {
        deckData = {
            cards: deckData,
            ankiMode: false
        };
    }

    // Ensure the deck has the expected structure
    if (!deckData.cards) {
        deckData.cards = [];
    }
    if (typeof deckData.ankiMode !== 'boolean') {
        deckData.ankiMode = false;
    }

    // Ensure all cards have the necessary keys for SM2 learning
    deckData.cards = deckData.cards.map((card, index) => ({
        ...card,
        originalIndex: card.originalIndex !== undefined ? card.originalIndex : index,
        repetitions: card.repetitions !== undefined ? card.repetitions : 0,
        interval: card.interval !== undefined ? card.interval : 1,
        easeFactor: card.easeFactor !== undefined ? card.easeFactor : 2.5,
        nextReview: card.nextReview !== undefined ? card.nextReview : index + 1
    }));

    // Save the updated deck structure back to the file
    await window.electronAPI.writeDeck(deckName, deckData);

    // Load the deck data into the application
    cards = deckData.cards;
    ankiMode = deckData.ankiMode;
    studyStep = deckData.studyStep !== undefined ? deckData.studyStep : 0;
    currentIndex = 0;
    updateCardList();
    showCard();
    localStorage.setItem('lastUsedDeck', deckName);
    document.getElementById('current-deck-name').textContent = deckName;

    // Update the manage decks modal if it's open
    const manageDecksModal = document.getElementById('manageDecksModal');
    if (manageDecksModal.style.display === 'block') {
        updateDeckList();
    }
    document.getElementById('anki-mode-toggle').checked = ankiMode; // Update the toggle state
    updateControls(); // Ensure controls are updated based on ankiMode
}

async function createNewDeck() {
    let newDeckName = 'Deck1';
    let counter = 1;
    while (decks[newDeckName]) {
        counter++;
        newDeckName = `Deck_${counter}`;
    }
    decks[newDeckName] = [];
    await saveDeckToFile(newDeckName, []);
    await loadDeck(newDeckName);
}

async function saveDeckToFile(deckName, deckData) {
    await window.electronAPI.writeDeck(deckName, deckData);
    showSavingIndicator();
}

function showSavingIndicator() {
    const indicator = document.getElementById('saving-indicator');
    indicator.textContent = 'Saving...';
    setTimeout(() => {
        indicator.textContent = '';
    }, 1000);
}

function openManageDecksModal() {
    isRenaming = false;
    enableAllButtons();
    const modal = document.getElementById('manageDecksModal');
    modal.style.display = 'block';
    updateDeckList();
    updateManageDecksModalHighlight();
}

function updateDeckList() {
    const deckList = document.getElementById('deck-list');
    deckList.innerHTML = '';
    for (const deckName in decks) {
        const deckItem = document.createElement('div');
        deckItem.className = `deck-item ${deckName === currentDeckName ? 'selected' : ''}`;
        deckItem.innerHTML = `
            <input type="text" class="deck-name" value="${deckName}" readonly maxlength="50">
            <div class="deck-buttons">
                ${deckName !== currentDeckName 
                    ? `<button onclick="loadDeck('${deckName}')">Load</button>` 
                    : `
                        <button class="rename-button" onclick="startRename(this)">Rename</button>
                        <button class="save-button" style="display: none;" onclick="saveRename(this)">Save</button>
                        <button onclick="confirmDeleteDeck('${deckName}')">Delete</button>
                    `
                }
            </div>
        `;
        deckList.appendChild(deckItem);
    }
    const inputs = deckList.querySelectorAll('.deck-name');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.readOnly) {
                resetRename(this);
            }
        });
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveRename(this.closest('.deck-item').querySelector('.save-button'));
            }
        });
    });
}

function updateManageDecksModalHighlight() {
    const manageDecksModal = document.getElementById('manageDecksModal');
    if (manageDecksModal.style.display === 'block') {
        const deckItems = manageDecksModal.querySelectorAll('.deck-item');
        deckItems.forEach(item => {
            const deckNameInput = item.querySelector('.deck-name');
            if (deckNameInput.value === currentDeckName) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }
}

function startRename(button) {
    if (isRenaming) return;
    
    const deckItem = button.closest('.deck-item');
    const input = deckItem.querySelector('.deck-name');
    input.readOnly = false;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    button.style.display = 'none';
    deckItem.querySelector('.save-button').style.display = 'inline-block';
    isRenaming = true;
    disableOtherButtons(deckItem);

    // Add event listener to prevent invalid characters
    input.addEventListener('input', function(e) {
        if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(this.value)) {
            this.value = this.value.replace(/[^a-zA-Z0-9_-]/g, '');
            if (!/^[a-zA-Z]/.test(this.value)) {
                this.value = this.value.substring(1);
            }
        }
    });
}

function saveRename(button) {
    const deckItem = button.closest('.deck-item');
    const input = deckItem.querySelector('.deck-name');
    const newName = input.value.trim();
    const oldName = input.defaultValue;
    
    if (newName === oldName) {
        resetRename(input);
        return;
    }
    
    if (validateDeckName(newName, oldName)) {
        renameDeck(oldName, newName);
        input.defaultValue = newName;
        resetRename(input);
    } else {
        input.value = oldName;
        resetRename(input);
    }
}

function resetRename(input) {
    input.blur();
    input.readOnly = true;
    input.value = input.defaultValue;
    const deckItem = input.closest('.deck-item');
    deckItem.querySelector('.rename-button').style.display = 'inline-block';
    deckItem.querySelector('.save-button').style.display = 'none';
    isRenaming = false;
    enableAllButtons();
}

function validateDeckName(newName, oldName) {
    if (!newName || newName === oldName) {
        return false;
    }
    if (decks[newName]) {
        return false;
    }
    return /^[a-zA-Z][a-zA-Z0-9_-]{0,49}$/.test(newName);
}

function disableOtherButtons(currentDeckItem) {
    const buttons = document.querySelectorAll('#deck-list button');
    buttons.forEach(btn => {
        if (!btn.closest('.deck-item').isSameNode(currentDeckItem)) {
            btn.disabled = true;
        }
    });
}

function enableAllButtons() {
    const buttons = document.querySelectorAll('#deck-list button');
    buttons.forEach(btn => btn.disabled = false);
}

async function renameDeck(oldName, newName) {
    await window.electronAPI.renameDeck(oldName, newName);
    decks[newName] = decks[oldName];
    delete decks[oldName];
    if (currentDeckName === oldName) {
        currentDeckName = newName;
        document.getElementById('current-deck-name').textContent = newName;
        await saveDeckToFile(currentDeckName, cards);
    }
    updateDeckList();
}


function confirmDeleteDeck(deckName) {
    openConfirmModal(`Are you sure you want to delete the deck "${deckName}"?`, () => deleteDeck(deckName));
}

async function deleteDeck(deckName) {
    await window.electronAPI.deleteDeck(deckName);
    delete decks[deckName];
    if (currentDeckName === deckName) {
        const remainingDecks = Object.keys(decks);
        if (remainingDecks.length > 0) {
            await loadDeck(remainingDecks[0]);
        } else {
            await createNewDeck();
        }
    }
    updateDeckList();
    closeModal('manageDecksModal');
}
