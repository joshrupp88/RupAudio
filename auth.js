// Page auth state monitor and private content loader
const SUPABASE_URL = 'https://hvhhbdyvnboaoaqofihy.supabase.co'
const SUPABASE_KEY = 'sb_publishable_unjzRwmoOqkEFLTsBzDE9g_l9RgNjRx'
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

_supabase.auth.onAuthStateChange(async (event, session) => {
    // Log the event for debugging
    console.log(`[Auth Event]: ${event}`, session ? `User: ${session.user.email}` : '| No Session')

    // Handle routing and UI updates based on the event type
    switch (event) {
        case 'INITIAL_SESSION':
            // Fires once on page load after reading localStorage
            if (session) updateUIForUser(session.user)
            // Kick to homepage if signed out and on a restricted page
            else if (checkCurrentPage()) window.location.href = 'index.html'
            console.log('Redirected to homepage due to sign-in status and previous page location.')
            break

        case 'SIGNED_IN':
            // Fires on manual sign in
            if (session) updateUIForUser(session.user)
            break

        case 'SIGNED_OUT':
            // Fires on manual logout or session termination. Redirect to home page
            window.location.href = 'index.html'
            break

        case 'PASSWORD_RECOVERY':
            // Direct the user to a "Set New Password" form
            // ADD PASSWORD RESET LOGIC HERE
            break

        case 'TOKEN_REFRESHED':
            // Silently updated token - no action required
            break

        default:
            console.warn('Unhandled auth event: ${event}')
    }
})

// Define all elements that require hiding/unhiding
const privateButtons = []

// notificationsBtn and userProfileBtn were already declared in general.js
const libraryTab = document.getElementById('Library-Btn')
const uploadTab = document.getElementById('Upload-Btn')
const suggestionBtn = document.getElementById('Suggestion-Btn')
const userFullname = document.getElementById('User-Fullname')
const userEmail = document.getElementById('User-Email')
const userAccountSettingsBtn = document.getElementById('Account-Settings')

privateButtons.push(
    notificationsBtn,
    libraryTab,
    uploadTab,
    suggestionBtn,
    userEmail
)

async function updateUIForUser() {
    // Show the buttons and tabs only available to logged-in users
    privateButtons.forEach(element => {
        element.classList.remove('hidden')
    });

    // Update the User-Profile-Tooltip
    SignInOutBtn.textContent = 'Sign Out'
    userFullname.textContent = (await _supabase.auth.getSession()).data.session?.user?.user_metadata?.full_name
    userEmail.textContent = (await _supabase.auth.getUser()).data.user?.email
    userAccountSettingsBtn.classList.remove('hidden')
}

// Define all keywords for website pages restricted to logged-in users
const restrictedPageKeywords = ['upload', 'library', 'feedback']

// Return true if the current page is a restricted page
function checkCurrentPage() {
    const currentPage = window.location.href.toLocaleLowerCase()

    // .some() returns true if any keyword in the array matches and returns false otherwise
    return restrictedPageKeywords.some(keyword =>
        currentPage.includes(keyword.toLowerCase())
    )
}