// js/cards.js

async function addCards() {
    const side1Input = document.getElementById('side1-input').value;
    const side2Input = document.getElementById('side2-input').value;
    const side1Items = side1Input.split(';;');
    const side2Items = side2Input.split(';;');

    if (side1Items.length !== side2Items.length) {
        showError("Number of items doesn't match between fields");
        return;
    }

    if (side1Items.length > 5) {
        showError("Maximum 5 cards can be added at once");
        return;
    }

    for (let i = 0; i < side1Items.length; i++) {
        if (side1Items[i].length > 250 || side2Items[i].length > 250) {
            showError("Each side must be 250 characters or fewer.");
            return;
        }
    }

    const newCards = [];
    for (let i = 0; i < side1Items.length; i++) {
        newCards.push({
            side1: side1Items[i].trim(),
            side2: side2Items[i].trim(),
            enabled: true,
            originalIndex: cards.length + i
        });
    }

    cards = [...cards, ...newCards];

    document.getElementById('side1-input').value = '';
    document.getElementById('side2-input').value = '';
    updateCardList();
    showCard();
    validateInput();
    await saveDeckToFile(currentDeckName, cards);
}

function validateInput() {
    const side1Input = document.getElementById('side1-input').value;
    const side2Input = document.getElementById('side2-input').value;
    const addButton = document.getElementById('add-button');
    const errorMessage = document.getElementById('error-message');

    const side1Items = side1Input.split(';;').map(item => item.trim()).filter(item => item);
    const side2Items = side2Input.split(';;').map(item => item.trim()).filter(item => item);

    if (side1Items.length !== side2Items.length) {
        addButton.disabled = true;
        errorMessage.textContent = "Number of items doesn't match between fields";
    } else if (side1Items.length > 5) {
        addButton.disabled = true;
        errorMessage.textContent = "Maximum 5 cards can be added at once";
    } else if (side1Items.length === 0 || side2Items.length === 0) {
        addButton.disabled = true;
        errorMessage.textContent = "";
    } else {
        addButton.disabled = false;
        errorMessage.textContent = "";
    }
}


function updateCardList(shouldScroll = true) {
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '';
    cards.sort((a, b) => a.originalIndex - b.originalIndex);
    cards.forEach((card, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = `card-item ${index === currentIndex ? 'selected' : ''} ${card.enabled ? '' : 'disabled'}`;
        cardItem.dataset.enabled = card.enabled;
        cardItem.innerHTML = `
            <div class="left-controls">
                <label class="toggle-switch">
                    <input type="checkbox" ${card.enabled ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <button class="edit-button">Edit</button>
            </div>
            <div class="card-content">
                <span>${card.side1} / ${card.side2}</span>
            </div>
        `;
        
        const checkbox = cardItem.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (event) => {
            toggleCard(index);
        });

        const editButton = cardItem.querySelector('.edit-button');
        editButton.addEventListener('click', (event) => {
            openEditModal(index);
        });

        const cardContent = cardItem.querySelector('.card-content');
        cardContent.addEventListener('click', () => {
            if (card.enabled) {
                selectCard(index);
            }
        });

        cardList.appendChild(cardItem);
    });
    if (shouldScroll) {
        scrollSelectedCardIntoView();
    }
}

function selectCard(index) {
    currentIndex = index;
    showCard(true);
}

function toggleCard(index) {
    cards[index].enabled = !cards[index].enabled;
    const enabledCards = getEnabledCards();
    if (!cards[index].enabled && index === currentIndex) {
        if (enabledCards.length > 0) {
            if (shuffleEnabled) {
                showRandomCard();
            } else {
                currentIndex = cards.indexOf(enabledCards[0]);
            }
        }
    }
    if (shuffleEnabled) {
        initializeShuffledDeck();
        if (cards[index].enabled) {
            shuffledDeck.push(cards[index]);
        }
        if (!cards[index].enabled && index === currentIndex) {
            showRandomCard();
        }
    }
    saveDeckToFile(currentDeckName, cards);
    showCard(false);
}

async function removeCard(index) {
    cards.splice(index, 1);
    if (index === currentIndex) {
        currentIndex = 0;
    }
    updateCardList();
    showCard();
    await saveDeckToFile(currentDeckName, cards);
    closeModal('editModal');
}

function openEditModal(index) {
    editingIndex = index;
    const card = cards[index];
    document.getElementById('edit-side1-input').value = card.side1;
    document.getElementById('edit-side2-input').value = card.side2;
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
}

function confirmEdit() {
    const newSide1 = document.getElementById('edit-side1-input').value.trim();
    const newSide2 = document.getElementById('edit-side2-input').value.trim();
    if (newSide1.length > 250 || newSide2.length > 250) {
        alert('Each side must be 250 characters or fewer.');
        return;
    }
    if (newSide1 && newSide2) {
        cards[editingIndex].side1 = newSide1;
        cards[editingIndex].side2 = newSide2;
        updateCardList();
        showCard();
        saveDeckToFile(currentDeckName, cards);
        closeModal('editModal');
    } else {
        alert('Both sides of the card must be filled.');
    }
}

function confirmRemove(index) {
    openConfirmModal("Are you sure you want to remove this card?", () => removeCard(index));
}

function getEnabledCards() {
    return Array.isArray(cards) ? cards.filter(card => card.enabled) : [];
}

async function saveDeckToFile(deckName, deckData) {
    const ankiModeState = document.getElementById('anki-mode-toggle').checked;
    const dataToSave = {
        cards: deckData,
        ankiMode: ankiModeState
    };
    await window.electronAPI.writeDeck(deckName, dataToSave);
    showSavingIndicator();
}
