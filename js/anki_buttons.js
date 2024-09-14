function again(event) {
    event.preventDefault();
    updateCardGrade(1);
    nextCard();
    event.target.blur();
}

function hard(event) {
    event.preventDefault();
    updateCardGrade(2);
    nextCard();
    event.target.blur();
}

function good(event) {
    event.preventDefault();
    updateCardGrade(3);
    nextCard();
    event.target.blur();
}

function easy(event) {
    event.preventDefault();
    updateCardGrade(4);
    nextCard();
    event.target.blur();
}

function updateCardGrade(grade) {
    const card = cards[currentIndex];
    updateCardState(card, grade, 'sm2', studyStep);
    saveDeckToFile(currentDeckName, getCurrentDeckData());
}
