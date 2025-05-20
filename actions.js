    const modalOverlay = document.getElementById('modalOverlay');

    document.querySelector('.action-btn').addEventListener('click', () => {
        modalOverlay.style.display = 'flex';
        document.body.classList.add('modal-active');
    });

    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.classList.remove('modal-active');
    }
