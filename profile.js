// Define DOM Elements
const profilePicBtn = document.getElementById('Profile-Pic-Btn')
const firstNameInput = document.getElementById('First-Name-Input')
const firstNameBtn = document.getElementById('First-Name-Btn')
const lastNameInput = document.getElementById('Last-Name-Input')
const lastNameBtn = document.getElementById('Last-Name-Btn')
const emailInput = document.getElementById('Email-Input')
const emailBtn = document.getElementById('Email-Btn')
const usernameInput = document.getElementById('Username')

const bioBtn = document.getElementById('Bio-Btn')
const bioInput = document.getElementById('Bio-Input')

const currentPwInput = document.getElementById('PW-Input-1')
const currentPwToggle = document.getElementById('PW-Toggle-1')
const newPwInput = document.getElementById('PW-Input-2')
const newPwToggle = document.getElementById('PW-Toggle-2')
const confirmPwInput = document.getElementById('PW-Input-3')
const confirmPwToggle = document.getElementById('PW-Toggle-3')
const updatePwBtn = document.getElementById('Update-PW-Btn')

const statusMsg = document.getElementById('Status-Message')

let userProfileData = {}

// Toggle visibility of password fields
currentPwToggle.addEventListener('click', () => {
    const inputType = currentPwInput.getAttribute('type')
    if (inputType === 'password') {
        currentPwInput.setAttribute('type', 'text')
    } else {
        currentPwInput.setAttribute('type', 'password')
    }
})

newPwToggle.addEventListener('click', () => {
    const inputType = newPwInput.getAttribute('type')
    if (inputType === 'password') {
        newPwInput.setAttribute('type', 'text')
    } else {
        newPwInput.setAttribute('type', 'password')
    }
})

confirmPwToggle.addEventListener('click', () => {
    const inputType = confirmPwInput.getAttribute('type')
    if (inputType === 'password') {
        confirmPwInput.setAttribute('type', 'text')
    } else {
        confirmPwInput.setAttribute('type', 'password')
    }
})

// Pull user data and fill page data fields
async function getCurrentUserProfile() {
    try {
        // Get the current user's session data
        const { data: { user }, error: authError } = await _supabase.auth.getUser()

        if (authError || !user) {
            console.error('User is not logged in:', authError?.message)
            return null
        }

        // Query the profiles table filtering by the user's ID
        const { data: profile, error: dbError } = await _supabase
            .from('profiles')
            .select('first_name, last_name, email, username, bio')
            .eq('id', user.id)
            .single() // This returns a single object instead of an array with one object [{ first_name, ... }]

        if (dbError) {
            console.error('Error fetching profile:', dbError.message)
            return null
        }

        return profile
    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

async function populateProfile() {
    const profile = await getCurrentUserProfile()

    if (!profile) return

    firstNameInput.value = profile.first_name ?? ''
    lastNameInput.value = profile.last_name ?? ''
    emailInput.value = profile.email ?? ''
    usernameInput.value = profile.username ?? ''
    bioInput.value = profile.bio ?? ''

    console.log('Populated user profile fields.')
    return profile
}

async function updateProfileData() {
    userProfileData = await getCurrentUserProfile()
    console.log('Current User Profile:', userProfileData)
}

// Allow user to update their non-auth, non-file fields (name and bio)
async function updateUserProfile(updatedField) {
    try {
        // Get the current user's session data
        const { data: { user }, error: authError } = await _supabase.auth.getUser()

        if (authError || !user) {
            console.error('User is not logged in:', authError?.message)
            return null
        }

        // Update the user's row on the profiles table
        const { data, error } = await _supabase
            .from('profiles')
            .update(updatedField)
            .eq('id', user.id)
            .select() // Returns the updated row data
            .single()

        if (error) {
            console.error('Error updating profile:', error.message)
            return null;
        }

        console.log('Profile updated successfully:', data);

        // Rerun populateProfile to update all user data fields
        userProfileData = await populateProfile()

        return data;

    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

firstNameBtn.addEventListener('click', () => {
    // Check if the new value is different and valid
    if (firstNameInput.value === userProfileData.first_name) {
        showMessage('This is already your First Name. Type a new value to change it.', true)
    } else {
        const updatedField = { first_name: firstNameInput.value }
        updateUserProfile(updatedField)
        clearMessage()
        showMessage('First Name updated successfully!')
    }
})

lastNameBtn.addEventListener('click', () => {
    // Check if the new value is different and valid
    if (lastNameInput.value === userProfileData.last_name) {
        showMessage('This is already your Last Name. Type a new value to change it.', true)
    } else {
        const updatedField = { last_name: lastNameInput.value }
        updateUserProfile(updatedField)
        clearMessage()
        showMessage('Last Name updated successfully!')
    }
})

bioBtn.addEventListener('click', () => {
    // Check if the new value is different and valid
    if (bioInput.value === userProfileData.bio) {
        showMessage('This is already your bio. Type a new value to change it.', true)
    } else {
        const updatedField = { bio: bioInput.value }
        updateUserProfile(updatedField)
        clearMessage()
        showMessage('Bio updated successfully!')
    }
})

// Allow the user to update their email
async function updateUserEmail(newEmail) {
    try {
        const { data, error } = await _supabase.auth.updateUser({
            email: newEmail
        })

        if (error) {
            if (error.status === 429) {
                console.error("You're requesting email changes too quickly. Please wait 24 hours before trying again.")
                showMessage("You're requesting email changes too quickly. Please wait 24 hours before trying again.", true)
                return null
            } else {
                console.error('Error updating email:', error.message)
                showMessage(`Error updating email: ${error.message}`, true)
                return null
            }
        }

        console.log('Confirmation email sent to current address:', data)
        return data
    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

emailBtn.addEventListener('click', async () => {
    // Check if the new value is different and valid
    if (emailInput.value === userProfileData.email) {
        showMessage('This is already your registered email. Type a new address to change it.', true)
    } else {
        const result = await updateUserEmail(emailInput.value)
        if (result) {
            clearMessage()
            showMessage('A confirmation email was sent to your current email address. Once confirmed, another email will be sent to your new address.')
        }
    }
})

// Allow the user to update their password
async function changePassword(currentPassword, newPassword, confirmPassword) {
    // Confirm new passwords match
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match.', true)
        return
    }

    // Get current user's email
    const { data: { user }, error: userError } = await _supabase.auth.getUser()
    if (userError || !user) {
        showMessage('Error authenticating your session. Please sign out and try again.', true)
        return
    }

    // Verify current password by attempting a sign-in
    const { error: signInError } = await _supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
    })

    if (signInError) {
        showMessage('Incorrect current password.', true)
        return
    }

    // Update to new password
    const { data, error: updateError } = await _supabase.auth.updateUser({
        password: newPassword
    })

    if (updateError) {
        showMessage('Failed to update password.', true)
        return
    }

    showMessage('Password updated successfully!')
}

updatePwBtn.addEventListener('click', async () => {
    if (currentPwInput.value && newPwInput.value) {
        changePassword(currentPwInput.value, newPwInput.value, confirmPwInput.value)
    } else {
        showMessage('Please type your current password as well as you new password.', true)
    }
})

// Display status message upon failure or successful profile update
function showMessage(msg, isError = false) {
    statusMsg.textContent = msg
    statusMsg.classList = 'status-message'
    statusMsg.classList.add(isError ? 'error' : 'success')
}

function clearMessage() {
    statusMsg.textContent = ''
    statusMsg.className = 'status-message'
    statusMsg.classList.add('hidden')
}

populateProfile()
updateProfileData()