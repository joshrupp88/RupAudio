// 1. Supabase Credentials
const SUPABASE_URL = 'https://hvhhbdyvnboaoaqofihy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_unjzRwmoOqkEFLTsBzDE9g_l9RgNjRx';

// 2. Initialize Client from CDN Global Object
const createClient = window.supabase.createClient;
const _supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// DOM Elements
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profile-section');
const statusMsg = document.getElementById('status-msg');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const profileEmail = document.getElementById('profile-email');
const usernameInput = document.getElementById('username');
const fullNameInput = document.getElementById('full-name');
const bioInput = document.getElementById('bio');

// Helper to show status feedback
function showMessage(msg, isError = false) {
    statusMsg.textContent = msg;
    statusMsg.className = isError ? 'error' : 'success';
    statusMsg.classList.remove('hidden');
}

function clearMessage() {
    statusMsg.textContent = '';
    statusMsg.classList.add('hidden');
}

// ------------------------------------------------------------------
// 3. AUTH LISTENERS & SESSION MANAGEMENT
// ------------------------------------------------------------------

// Listen for auth state changes (automatically runs on page load/refresh)
_supabase.auth.onAuthStateChange( async(event, session) => {
    clearMessage();
    if (session) {
        // User is logged in
        window.location.href = 'index.html'
    } else {
        // User is logged out
        authSection.classList.remove('hidden');
        profileSection.classList.add('hidden');
    }
});

// Sign Up Handler
document.getElementById('btn-signup').addEventListener('click', async () => {
    clearMessage();
    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await _supabase.auth.signUp({ email, password });
    
    if (error) {
        showMessage(`Sign Up Error: ${error.message}`, true);
    } else {
        showMessage('Account created! Check your email for a confirmation link (or log in if email confirmation is disabled).');
    }
});

// Log In Handler
document.getElementById('btn-login').addEventListener('click', async () => {
    clearMessage();
    const email = emailInput.value;
    const password = passwordInput.value;

    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        showMessage(`Login Error: ${error.message}`, true);
    }
});

// Log Out Handler
document.getElementById('btn-logout').addEventListener('click', async () => {
    clearMessage();
    await _supabase.auth.signOut();
    showMessage('Signed out successfully.');
});

// ------------------------------------------------------------------
// 4. DATABASE READ & WRITE OPERATIONS
// ------------------------------------------------------------------

// READ: Fetch user profile data from Supabase table
async function loadUserProfile(userId) {
    try {
        const { data, error, status } = await _supabase
            .from('profiles')
            .select('username, full_name, bio')
            .eq('id', userId)
            .single();

        if (error && status !== 406) {
            throw error;
        }

        if (data) {
            usernameInput.value = data.username || '';
            fullNameInput.value = data.full_name || '';
            bioInput.value = data.bio || '';
        }
    } catch (error) {
        showMessage(`Error loading profile: ${error.message}`, true);
    }
}

// WRITE/UPDATE: Save modified profile data back to Supabase
document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    // Get current logged-in user
    const { data: { user } } = await _supabase.auth.getUser();

    if (!user) {
        showMessage('No active user found.', true);
        return;
    }

    const updates = {
        id: user.id, // Primary Key linking to auth.users.id
        username: usernameInput.value,
        full_name: fullNameInput.value,
        bio: bioInput.value,
        updated_at: new Date().toISOString(),
    };

    // Upsert inserts a row if it doesn't exist, or updates it if it does
    const { error } = await _supabase
        .from('profiles')
        .upsert(updates);

    if (error) {
        showMessage(`Save Error: ${error.message}`, true);
    } else {
        showMessage('Profile updated successfully!');
    }
});