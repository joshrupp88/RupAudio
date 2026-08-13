// DOM Elements
const RSSUploadSection = document.getElementById('RSS-Upload-Section')
const RSSPreviewBtn = document.getElementById('RSS-Upload-Preview')
const RSSDetailsSection = document.getElementById('RSS-Details-Section')
const RSSURLInput = document.getElementById('RSS-URL-Input')
const RSSUploaderComment = document.getElementById('RSS-Uploader-Comment')
const RSSUploadBtn = document.getElementById('RSS-Upload-Btn')

const manualUploadSection = document.getElementById('Manual-Upload-Section')
const manualPreviewBtn = document.getElementById('Manual-Upload-Preview')
const manualDetailsSection = document.getElementById('Manual-Details-Section')
const manualFileUploadInput = document.getElementById('File-Upload-Input')
const manualUploaderComment = document.getElementById('Manual-Uploader-Comment')
const manualUploadBtn = document.getElementById('Manual-Upload-Btn')

// Add event listener for RSS Preview Button
RSSPreviewBtn.addEventListener('click', () => {
    // Check if the section is already expanded
    if (!RSSUploadSection.classList.contains('expanded')) {
        // Make sure the File Upload section is hidden
        manualUploadSection.classList.remove('expanded')
        manualDetailsSection.setAttribute('aria-hidden', 'true')

        // Expand the RSS section
        RSSUploadSection.classList.add('expanded')
        RSSDetailsSection.setAttribute('aria-hidden', 'false')
    } else {
        // Collapse the section
        RSSUploadSection.classList.remove('expanded')
        RSSDetailsSection.setAttribute('aria-hidden', 'true')
    }
})

// Add event listener for File Upload Preview Button
manualPreviewBtn.addEventListener('click', () => {
    // Check if the section is already expanded
    if (!manualUploadSection.classList.contains('expanded')) {
        // Make sure the RSS section is hidden
        RSSUploadSection.classList.remove('expanded')
        RSSDetailsSection.setAttribute('aria-hidden', 'true')

        // Expand the File Upload section
        manualUploadSection.classList.add('expanded')
        manualDetailsSection.setAttribute('aria-hidden', 'false')
    } else {
        // Collapse the section
        manualUploadSection.classList.remove('expanded')
        manualDetailsSection.setAttribute('aria-hidden', 'true')
    }
})