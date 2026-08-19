const SUPABASE_URL = 'https://hvhhbdyvnboaoaqofihy.supabase.co'
const SUPABASE_KEY = 'sb_publishable_unjzRwmoOqkEFLTsBzDE9g_l9RgNjRx'
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// Define DOM elements
const newPwInput = document.getElementById('New-Pw')
const newPwToggle = document.getElementById('New-Pw-Toggle')
const confirmPwInput = document.getElementById('Confirm-Pw')
const confirmPwToggle = document.getElementById('Confirm-Pw-Toggle')
const submitBtn = document.getElementById('Confirm-Btn')
const resetSection = document.getElementById('Reset-Section')
const statusMsg = document.getElementById('Status-Message')

// Toggle password field visibility
newPwToggle.addEventListener('click', (event) => {
    const inputType = newPwInput.getAttribute('type')
    if (inputType === 'password') {
        newPwInput.setAttribute('type', 'text')
    } else {
        newPwInput.setAttribute('type', 'password')
    }
})

confirmPwToggle.addEventListener('click', (event) => {
    const inputType = confirmPwInput.getAttribute('type')
    if (inputType === 'password') {
        confirmPwInput.setAttribute('type', 'text')
    } else {
        confirmPwInput.setAttribute('type', 'password')
    }
})

// Helper to show status feedback
function showMessage(msg, isError = false) {
    statusMsg.textContent = msg
    statusMsg.className = 'status-message'
    statusMsg.classList.add(isError ? 'error' : 'success')
}

function clearMessage() {
    statusMsg.textContent = ''
    statusMsg.className = 'status-message'
    statusMsg.classList.add('hidden')
}

async function handleFormSubmission(event) {
    event.preventDefault()
    clearMessage()
    const newPw = newPwInput.value.trim()
    const confirmPw = confirmPwInput.value.trim()
    
    // Check if the user filled out both fields and if they match
    if (!newPw || !confirmPw) {
        showMessage('Please type your new password in both fields.', true)
        return null
    } else if (newPw !== confirmPw) {
        showMessage('Passwords do not match.', true)
        return null
    }

    // Submit the password reset request to Supabase
    const { data, error } = await _supabase.auth.updateUser({
        password: newPw
    })

    if (error) {
        showMessage(`Error updating password: ${error.message}`, true)
        return null
    }

    showMessage('Password updated successfully! Redirecting to login page...')
    setTimeout(() => {
        window.location.href = 'login.html'
    }, 2000)
}

// Listen for manual button click
submitBtn.addEventListener('click', handleFormSubmission)

// Listen for form submission via hitting the Enter key while in one of the input fields
resetSection.addEventListener('submit', handleFormSubmission)

// Set page focus to Email Address input field by default
newPwInput.focus()