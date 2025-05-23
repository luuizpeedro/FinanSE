const container = document.querySelector('.container');
const signupButton = document.querySelector('.signup-section header');
const loginButton = document.querySelector('.login-section header');

loginButton.addEventListener('click', () => {
    container.classList.add('active');
});

signupButton.addEventListener('click', () => {
    container.classList.remove('active');
});

window.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');

    if (window.location.hash === '#login') {
        container.classList.add('active');
    } else if (window.location.hash === '#register') {
        container.classList.remove('active');
    }
});

