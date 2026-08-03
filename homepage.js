const navToggleBtn = document.getElementById('nav-toggle-btn')
const navMenu = document.getElementById('Nav-Panel')
const contentPanel = document.querySelector('.content-panel')
const btnText = document.querySelector('.btn-text')
const navBtns = document.querySelectorAll('.nav-btn')

navToggleBtn.addEventListener('click', () => {
    // Check if currently collapsed
    const isCollapsed = navToggleBtn.classList.contains('collapsed')

    if (isCollapsed) {
        // EXPAND: Remove collapsed class from nav buttons and remove hidden class from Nav Panel
        navBtns.forEach(btn => {
            btn.classList.remove('collapsed')
            btn.setAttribute('aria-expanded', 'true')
        });

        navMenu.classList.remove('hidden')
        navMenu.setAttribute('aria-hidden', 'false')

        // Shift left edge of content panel to compensate for larger Nav Panel
        contentPanel.style.left = '200px'

    } else {
        // COLLAPSE: Add collapsed class to nav buttons and add hidden class to Nav Panel
        navBtns.forEach(btn => {
            btn.classList.add('collapsed')
            btn.setAttribute('aria-expanded', 'false')
        });

        navMenu.classList.add('hidden')
        navMenu.setAttribute('aria-hidden', 'true')

        // Shift left edge of Content Panel back over to the left
        contentPanel.style.left = '50px'

    }
})