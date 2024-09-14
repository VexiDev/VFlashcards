function sm2Algorithm(card, grade, studyStep) {
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
    card.nextReview = studyStep + Math.round(card.interval);
    return card;
}

function updateCardState(card, grade, algorithm, studyStep) {
    if (algorithm === 'sm2') {
        return sm2Algorithm(card, grade, studyStep);
    } else if (algorithm === 'fsrs') {
        return fsrsAlgorithm(card, grade);
    }
    return card;
}

// FSRS Algorithm
function fsrsAlgorithm(card, grade) {
    // Implement FSRS logic here
    // This is a placeholder for the actual FSRS implementation
    return card;
}