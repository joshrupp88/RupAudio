// Force page refresh on browser forward/back button
window.addEventListener('pageshow', (event) => {
  // event.persisted is true if the page was restored from the back-forward cache
  if (event.persisted) {
    window.location.reload()
  }
})

// Expanding/collapsing the Nav Panel
const navToggleBtn = document.getElementById('Nav-Toggle-Btn')
const navMenu = document.getElementById('Nav-Panel')
const contentPanel = document.querySelector('.content-panel')
const btnText = document.querySelector('.btn-text')
const navBtns = document.querySelectorAll('.nav-btn')

navToggleBtn.addEventListener('click', () => {
    // Check if currently collapsed
    const isCollapsed = navToggleBtn.classList.contains('collapsed')

    if (isCollapsed) {
        // EXPAND: Remove collapsed class from nav buttons and remove collapsed class from Nav Panel
        navBtns.forEach(btn => {
            btn.classList.remove('collapsed')
            btn.setAttribute('aria-expanded', 'true')
        });

        navMenu.classList.remove('collapsed')

        // Shift left edge of content panel to compensate for larger Nav Panel
        contentPanel.style.marginLeft = '200px'

    } else {
        // COLLAPSE: Add collapsed class to nav buttons and add collapsed class to Nav Panel
        navBtns.forEach(btn => {
            btn.classList.add('collapsed')
            btn.setAttribute('aria-expanded', 'false')
        });

        navMenu.classList.add('collapsed')

        // Shift left edge of Content Panel back over to the left
        contentPanel.style.marginLeft = '50px'
    }
})

// Showing/hiding user profile tooltip
const userProfileBtn = document.getElementById('User-Profile-Btn')
const notificationsBtn = document.getElementById('Notifications-Btn')
const userProfileTooltip = document.getElementById('User-Profile-Tooltip')
const notificationTooltip = document.getElementById('Notifications-Tooltip')

userProfileBtn.addEventListener('click', () => {
    // Check if currently hidden
    const isHidden = userProfileTooltip.classList.contains('hidden')

    if (isHidden) {
        userProfileTooltip.classList.remove('hidden')
        userProfileTooltip.setAttribute('aria-hidden', 'false')
        userProfileTooltip.focus()
    } else {
        contentPanel.focus() // Ensure no child item of the tooltip is focussed to prevent aria-hidden conflicts
        userProfileTooltip.classList.add('hidden')
        userProfileTooltip.setAttribute('aria-hidden', 'true')
    }
})

// Hide the user profile tooltip when anywhere else on the page is clicked
userProfileTooltip.addEventListener('focusout', (e) => {
    const to = e.relatedTarget
    if (!to || !userProfileTooltip.contains(to) && to !== userProfileBtn) {
        console.log('Re-hid the user profile tooltip.')
        userProfileTooltip.classList.add('hidden')
        // Prevent aria-hidden issues when clicking off the web page
        contentPanel.focus()
        try {
            to.focus()
        } catch (error) {
            console.log("Can't set focus to elements outside the webpage or that can't receive focus.")
        }
        userProfileTooltip.setAttribute('aria-hidden', 'true')
    }
})

// Handle SignInOut button functionality
const SignInOutBtn = document.getElementById('SignInOut-Btn')

SignInOutBtn.addEventListener('click', async () => {
    // Check if the user is signed in
    const { data: { session }, error } = await _supabase.auth.getSession()

    if (error) {
        // Error logic for if there is no valid response from Supabase auth servers
        console.log(error)
        console.log('Try refreshing the page.')
    } else if (session) {
        // Logged-in user logic
        const { err } = await _supabase.auth.signOut()
        if (err) {
            alert(`Sign out failed: ${err.message}`)
        } else SignInOutBtn.textContent = 'Sign In'
    } else {
        // Guest user logic
        window.location.href = 'login.html'
    }
})