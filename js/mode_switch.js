// mode_switch.js

function initializeAppMode() {
    const flashcardContainer = document.getElementById('flashcard-container');
    const ankiModeToggle = document.getElementById('anki-mode-toggle');
    ankiMode = ankiModeToggle.checked;
    if (mode === 'review') {
        flashcardContainer.classList.add('review-mode');
    } else {
        flashcardContainer.classList.remove('review-mode');
    }
    updateControls();
    updateCardList(); // Refresh the card list when Anki mode is toggled
}

function initModeSwitch() {
    const modeSwitch = document.querySelector('.mode-switch');
    const switchOptions = modeSwitch.querySelectorAll('.switch-option');
    const switchHighlight = modeSwitch.querySelector('.switch-highlight');

    switchOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            switchOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            switchHighlight.style.transform = `translateX(${100 * index}%)`;
            changeMode(option.dataset.mode);
        });
    });

    // Call initializeAppMode after setting up the mode switch
    initializeAppMode();
}

function changeMode(newMode) {
    mode = newMode;
    const deckControls = document.getElementById('deck-controls');
    const deckControlsButtons = document.getElementById('deck-controls-header');
    const flashcardArea = document.getElementById('flashcard-area');
    const inputContainerWrapper = document.getElementById('input-container-wrapper');
    const controls = document.getElementById('controls');
    const flashcardContainer = document.getElementById('flashcard-container');

    if (mode.startsWith('study')) {
        deckControls.classList.add('hidden');
        deckControlsButtons.classList.add('hidden');
        inputContainerWrapper.classList.add('hidden');
        
        requestAnimationFrame(() => {
            flashcardArea.classList.add('full-width');
            controls.classList.add('full-width');
            flashcardContainer.classList.add('full-width');
        });

        setTimeout(() => {
            deckControls.style.display = 'none';
            deckControlsButtons.style.display = 'none';
        }, 300);
        
        flashcardContainer.classList.remove('review-mode');
        
        if (shuffleEnabled) {
            initializeShuffledDeck();
        } else {
            firstCard();
        }

        // Delay the card animation until the input hiding animation is done
        setTimeout(() => {
            animateCards();
        }, 300);
    } else {
        deckControls.style.display = 'block';
        deckControlsButtons.style.display = 'block';
        inputContainerWrapper.classList.remove('hidden');
        
        setTimeout(() => {
            deckControls.classList.remove('hidden');
            deckControlsButtons.classList.remove('hidden');
        }, 10);

        flashcardArea.classList.remove('full-width');
        controls.classList.remove('full-width');
        flashcardContainer.classList.remove('full-width');
        
        flashcardContainer.classList.add('review-mode');
    }
    updateControls();
    showCard();
}

function animateCards() {
    const flashcardContainer = document.getElementById('flashcard-container');
    const flashcards = flashcardContainer.querySelectorAll('.flashcard');
    flashcards.forEach(card => {
        card.classList.add('animate');
        card.addEventListener('animationend', () => {
            card.classList.remove('animate');
        }, { once: true });
    });
}

function updateControls() {
    const ankiModeToggle = document.getElementById('anki-mode-toggle');
    const navButtons = document.getElementById('nav-buttons');
    const bottomControls = document.getElementById('bottom-controls');
    const ankiControls = document.getElementById('anki-controls');
    const shuffleControl = document.getElementById('shuffle-control');

    if (ankiModeToggle.checked && mode.startsWith('study')) {
        navButtons.style.display = 'none';
        bottomControls.style.display = 'none';
        ankiControls.style.display = 'flex';
    } else {
        navButtons.style.display = 'flex';
        bottomControls.style.display = 'flex';
        ankiControls.style.display = 'none';
    }

    if (ankiModeToggle.checked && mode === 'review') {
        shuffleControl.style.display = 'none';
    } else {
        shuffleControl.style.display = 'block';
    }
}