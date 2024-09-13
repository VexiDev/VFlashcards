// js/loader.js

function animateCards() {
    const cards = document.querySelectorAll('.card-stack-container .card');
    const animationDuration = 4000;
    const stepDuration = animationDuration / 3;
    const outDuration = 500;
    const inDuration = 500;

    function updateCard(card, rotation, zIndex, translateX = 0, translateY = 0) {
        card.style.transform = `rotate(${rotation}deg) translate(${translateX}px, ${translateY}px)`;
        card.style.zIndex = zIndex;
    }

    function animateSequence() {
        updateCard(cards[0], -10, 3);
        updateCard(cards[1], 15, 2);
        updateCard(cards[2], 30, 1);

        setTimeout(() => {
            updateCard(cards[0], -15, 3, -80, -42);
        }, 0);

        setTimeout(() => {
            updateCard(cards[0], 30, 1);
            updateCard(cards[1], -10, 3);
            updateCard(cards[2], 15, 2);
        }, outDuration);

        setTimeout(() => {
            updateCard(cards[1], -15, 3, -80, -42);
        }, stepDuration);

        setTimeout(() => {
            updateCard(cards[0], 15, 2);
            updateCard(cards[1], 30, 1);
            updateCard(cards[2], -10, 3);
        }, stepDuration + outDuration);

        setTimeout(() => {
            updateCard(cards[2], -15, 3, -80, -42);
        }, 2 * stepDuration);

        setTimeout(() => {
            updateCard(cards[0], -10, 3);
            updateCard(cards[1], 15, 2);
            updateCard(cards[2], 30, 1);
        }, 2 * stepDuration + outDuration);
    }

    animateSequence();
    setInterval(animateSequence, animationDuration);
}

document.addEventListener('DOMContentLoaded', animateCards);

window.addEventListener('load', function() {
    setTimeout(() => {
        document.getElementById('loading-overlay').style.display = 'none';
    }, 2250);
});
