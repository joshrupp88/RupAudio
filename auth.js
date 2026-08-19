_supabase.auth.onAuthStateChange(async (event, session) => {
    // Log the event for debugging
    console.log(`[Auth Event]: ${event}`, session ? `User: ${session.user.email}` : '| No Session')

    // Handle routing and UI updates based on the event type
    switch (event) {
        case 'INITIAL_SESSION':
            // Fires once on page load after reading localStorage
            if (session) updateUIForUser(session.user)
            // Kick to homepage if signed out and on a restricted page
            else if (checkCurrentPage()) {
                window.location.href = 'index.html'
                console.log('Redirected to homepage due to sign-in status and previous page location.')
            }
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
const toolbarAvatar = document.getElementById('Toolbar-Avatar')

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
    const { data: { user }, error } = await _supabase.auth.getUser()
    userFullname.textContent = user?.user_metadata?.full_name
    userEmail.textContent = (await _supabase.auth.getUser()).data.user?.email
    userAccountSettingsBtn.classList.remove('hidden')
    loadUserAvatar()
}

// Define all keywords for website pages restricted to logged-in users
const restrictedPageKeywords = ['upload', 'library', 'feedback', 'profile']

// Return true if the current page is a restricted page
function checkCurrentPage() {
    const currentPage = window.location.href.toLocaleLowerCase()

    // .some() returns true if any keyword in the array matches and returns false otherwise
    return restrictedPageKeywords.some(keyword =>
        currentPage.includes(keyword.toLowerCase())
    )
}

// Load user's avatar if one exists
async function loadUserAvatar() {
    // Verify user is authenticated
    const { data: { user }, error: userError } = await _supabase.auth.getUser()
    if (userError || !user) throw new Error('User not logged in.')

    const folderName = user.id
    const { data: files } = await _supabase.storage
            .from('avatars')
            .list(folderName)
    
    // Update the userAvatarImg src if the user has uploaded an avatar
    if (files.length > 0) {
        const fileName = files[0].name
        const { data: { publicUrl } } = await _supabase.storage
            .from('avatars')
            .getPublicUrl(`${folderName}/${fileName}`)
        toolbarAvatar.src = publicUrl
    }
    console.log('User avatar loaded.')
}