// Define DOM Elements
const profilePicBtn = document.getElementById('Profile-Pic-Btn')
const firstNameInput = document.getElementById('First-Name-Input')
const firstNameBtn = document.getElementById('First-Name-Btn')
const lastNameInput = document.getElementById('Last-Name-Input')
const lastNameBtn = document.getElementById('Last-Name-Btn')
const emailInput = document.getElementById('Email-Input')
const emailBtn = document.getElementById('Email-Btn')

const bioBtn = document.getElementById('Bio-Btn')
const bioInput = document.getElementById('Bio-Btn')

const currentPwInput = document.getElementById('PW-Input-1')
const currentPwToggle = document.getElementById('PW-Toggle-1')
const newPwInput = document.getElementById('PW-Input-2')
const newPwToggle = document.getElementById('PW-Toggle-2')
const confirmPwInput = document.getElementById('PW-Input-3')
const confirmPwToggle = document.getElementById('PW-Toggle-3')
const updatePwBtn = document.getElementById('Update-PW-Btn')

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