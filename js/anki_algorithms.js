// js/anki_algorithms.js

// SM-2 Algorithm
function sm2Algorithm(card, grade) {
    const now = Date.now();
    if (grade >= 3) {
        if (card.repetitions === 0) {
            card.interval = 1;
        } else if (card.repetitions === 1) {
            card.interval = 6;
        } else {
            card.interval *= card.easeFactor;
        }
        card.repetitions += 1;
        card.easeFactor += 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
    } else {
        card.repetitions = 0;
        card.interval = 1;
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    }
    card.nextReview = now + card.interval * 24 * 60 * 60 * 1000;
    return card;
}

// FSRS Algorithm
function fsrsAlgorithm(card, grade) {
    // Implement FSRS logic here
    // This is a placeholder for the actual FSRS implementation
    return card;
}

// Update card state based on the selected algorithm
function updateCardState(card, grade, algorithm) {
    if (algorithm === 'sm2') {
        return sm2Algorithm(card, grade);
    } else if (algorithm === 'fsrs') {
        return fsrsAlgorithm(card, grade);
    }
    return card;
}