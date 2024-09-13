// js/modals.js

function openConfirmModal(message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmButton = document.getElementById('confirmAction');
    const cancelButton = document.getElementById('cancelAction');

    confirmMessage.textContent = message;
    modal.style.display = 'block';

    confirmButton.onclick = () => {
        onConfirm();
        closeModal('confirmModal');
    };

    cancelButton.onclick = () => {
        closeModal('confirmModal');
    };
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'manageDecksModal') {
        const renamingInput = document.querySelector('.deck-name:not([readonly])');
        if (renamingInput) {
            resetRename(renamingInput);
        }
    }
}

// Add event listeners for modal close buttons
document.querySelectorAll('.close').forEach(button => {
    button.addEventListener('click', () => {
        const modalId = button.getAttribute('data-modal');
        closeModal(modalId);
    });
});
