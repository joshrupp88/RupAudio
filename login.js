// 1. Supabase Credentials
const SUPABASE_URL = 'https://hvhhbdyvnboaoaqofihy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_unjzRwmoOqkEFLTsBzDE9g_l9RgNjRx';

// 2. Initialize Client from CDN Global Object
const createClient = window.supabase.createClient;
const _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// DOM Elements
const signInToggle = document.getElementById('Sign-In-Toggle')
const signUpToggle = document.getElementById('Sign-Up-Toggle')
const emailInput = document.getElementById('Email-Input')
const passwordInput = document.getElementById('Password-Input')
const firstnameInput = document.getElementById('Firstname-Input')
const lastnameInput = document.getElementById('Lastname-Input')
const statusMsg = document.getElementById('Status-Message')
const confirmBtn = document.getElementById('Confirm-Button')

// Handle toggling between sign in and sign up
signInToggle.addEventListener('click', () => {
    if (!signInToggle.classList.contains('selected')) {
        signInToggle.classList.add('selected')
        signUpToggle.classList.remove('selected')

        firstnameInput.classList.add('hidden')
        lastnameInput.classList.add('hidden')

        clearMessage()
    }
})

signUpToggle.addEventListener('click', () => {
    if (!signUpToggle.classList.contains('selected')) {
        signUpToggle.classList.add('selected')
        signInToggle.classList.remove('selected')

        firstnameInput.classList.remove('hidden')
        lastnameInput.classList.remove('hidden')

        clearMessage()
    }
})

// Helper to show status feedback
function showMessage(msg, isError = false) {
    statusMsg.textContent = msg;
    statusMsg.classList.add(isError ? 'error' : 'success')
    statusMsg.classList.remove('hidden')
}

function clearMessage() {
    statusMsg.textContent = ''
    statusMsg.className = 'status-message'
    statusMsg.classList.add('hidden')
}

// ------------------------------------------------------------------
// 3. AUTH LISTENERS & SESSION MANAGEMENT
// ------------------------------------------------------------------

// Listen for auth state changes (automatically runs on page load/refresh)
_supabase.auth.onAuthStateChange( async (event, session) => {
    clearMessage()
    if (session) {
        // User is logged in
        window.location.href = 'index.html'
    } else {
        // User is NOT logged in
        // I don't think any logic is needed here, but leaving this section just in case
    }
})

// Simple capitalize function to handle uncapitalized names entered by users
function titleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
}

// Sign up & login handler
confirmBtn.addEventListener('click', async () => {
    clearMessage()
    // Check if the user is signing up or logging in
    if (signUpToggle.classList.contains('selected')) {
        // User is signing up
        const email = titleCase(emailInput.value.trim())
        const password = titleCase(passwordInput.value.trim())
        const firstname = titleCase(firstnameInput.value.trim())
        const lastname = titleCase(lastnameInput.value.trim())

        const { data, error } = await _supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    first_name: firstname,
                    last_name: lastname,
                    full_name: `${firstname} ${lastname}`
                }
            }
        })

        if (error) {
            showMessage('Sign-up failed. Please refresh the page and try again.', true)
            console.error('Sign-up failed:', error.message)
        } else {
            showMessage('Account created! Check your email for a confirmation link.')
        }

    } else if (signInToggle.classList.contains('selected')) {
        // User is logging in
        const email = titleCase(emailInput.value.trim())
        const password = titleCase(passwordInput.value.trim())

        const { error } = await _supabase.auth.signInWithPassword({ email, password })

        if (error) {
            showMessage(`Login Error: ${error.message}`, true)
        }

    } else {
        // Neither button was selected somehow. Display and log error
        showMessage('Please select either "Sign In" or "Sign Up" then try again.', true)
        console.log('Login/Signup confirmation failed. Refresh page and try again.')
    }
})

// ------------------------------------------------------------------
// 4. DATABASE READ & WRITE OPERATIONS
// ------------------------------------------------------------------









// // WRITE/UPDATE: Save modified profile data back to Supabase
// document.getElementById('profile-form').addEventListener('submit', async (e) => {
//     e.preventDefault();
//     clearMessage();

//     // Get current logged-in user
//     const { data: { user } } = await _supabase.auth.getUser();

//     if (!user) {
//         showMessage('No active user found.', true);
//         return;
//     }

//     const updates = {
//         id: user.id, // Primary Key linking to auth.users.id
//         username: usernameInput.value,
//         full_name: fullNameInput.value,
//         bio: bioInput.value,
//         updated_at: new Date().toISOString(),
//     };

//     // Upsert inserts a row if it doesn't exist, or updates it if it does
//     const { error } = await _supabase
//         .from('profiles')
//         .upsert(updates);

//     if (error) {
//         showMessage(`Save Error: ${error.message}`, true);
//     } else {
//         showMessage('Profile updated successfully!');
//     }
// });