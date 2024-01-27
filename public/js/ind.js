const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

function updatePanels() {
    const currentPath = window.location.pathname;

    // Use a regular expression to check if the path matches the pattern '/register/:profileId'
    if (/^\/register\/\w+$/.test(currentPath)) {
        container.classList.add('right-panel-active');
    } else {
        container.classList.remove('right-panel-active');
    }
}

signUpButton.addEventListener('click', () => {
    container.classList.add('right-panel-active');
    history.pushState(null, null, '/register'); // Change this to the appropriate URL
});

signInButton.addEventListener('click', () => {
    container.classList.add('left-panel-active');
    window.location.href = '/login';
});

updatePanels();
window.addEventListener('popstate', updatePanels);
