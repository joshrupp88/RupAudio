// DOM Elements
const RSSUploadSection = document.getElementById('RSS-Upload-Section')
const RSSPreviewBtn = document.getElementById('RSS-Upload-Preview')
const RSSDetailsSection = document.getElementById('RSS-Details-Section')
const RSSURLInput = document.getElementById('RSS-URL-Input')
const RSSUploaderComment = document.getElementById('RSS-Uploader-Comment')
const RSSisPublicInput = document.getElementById('RSS-Public-Checkbox')
const RSSStatusMsg =document.getElementById('RSS-Status-Msg')
const RSSUploadBtn = document.getElementById('RSS-Upload-Btn')

const manualUploadSection = document.getElementById('Manual-Upload-Section')
const manualPreviewBtn = document.getElementById('Manual-Upload-Preview')
const manualDetailsSection = document.getElementById('Manual-Details-Section')
const manualFileUploadInput = document.getElementById('File-Upload-Input')
const manualUploaderComment = document.getElementById('Manual-Uploader-Comment')
const manualisPublicInput = document.getElementById('Manual-Public-Checkbox')
const manualStatusMsg = document.getElementById('Manual-Status-Msg')
const manualUploadBtn = document.getElementById('Manual-Upload-Btn')

const uploadSection = document.querySelectorAll('.upload-section')

// Handle the smooth animation of the max-height styling of the upload sections
function enableSmoothTransition(elements) {
    elements.forEach(element => {
        element.classList.add('smooth')

        clearTimeout(element._smoothTimer)
        element._smoothTimer = setTimeout(() => {
            element.classList.remove('smooth')
        }, 550)
    })
}

// Display status messages
function showMessage(container, msg, isError = false) {
    if (container === 'RSS') {
        RSSStatusMsg.textContent = msg
        RSSStatusMsg.classList = 'status-message'
        RSSStatusMsg.classList.add(isError ? 'error' : 'success')
    } else if (container === 'Manual') {
        manualStatusMsg.textContent = msg
        manualStatusMsg.classList = 'status-message'
        manualStatusMsg.classList.add(isError ? 'error' : 'success')
    } else {
        throw new Error('Incorrect status message call.')
    }
}

function clearMessage() {
    RSSStatusMsg.textContent = ''
    RSSStatusMsg.className = 'status-message'
    RSSStatusMsg.classList.add('hidden')

    manualStatusMsg.textContent = ''
    manualStatusMsg.className = 'status-message'
    manualStatusMsg.classList.add('hidden')
}


// Add event listener for RSS Preview Button
RSSPreviewBtn.addEventListener('click', () => {
    // Temporarily set the max-height transition to smooth
    enableSmoothTransition(uploadSection)

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
    // Temporarily set the max-height transition to smooth
    enableSmoothTransition(uploadSection)

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

// Handle RSS Link uploads
async function parseRSSBookLink(RSSLink, options = {}) {
    // Set default values for the variables that will be passed to the parser function
    const {
        isPublic = false,
        invitedUsers = [],
        uploaderComment = ''
    } = options

    // Get the current authenticated user's ID for the uploader field
    const { data: { user }, error: authError } = await _supabase.auth.getUser()
    if (authError || !user) {
        showMessage('RSS', 'You must be logged in to upload content', true)
        throw new Error('You must be logged in to upload content.')
    }

    // Fetch the XML feed content from the provided URL
    let xmlText
    try  {
        // Prepend a public CORS proxy URL to avoid fetch errors
        const proxyUrl = 'https://corsproxy.io/?'
        const targetUrl = encodeURIComponent(RSSLink)

        const response = await fetch(`${proxyUrl}${targetUrl}`)
        if (!response.ok) {
            showMessage('RSS', `HTTP error status: ${response.status}`, true)
            throw new Error(`HTTP error status: ${response.status}`)
        }
        xmlText = await response.text()
    } catch (err) {
        showMessage('RSS', `Failed to fetch the RSS URL: ${err.message}`, true)
        console.error('Failed to fetch the RSS URL:', err.message)
        throw new Error(`Could not download XML feed from URL: ${err.message}`)
    }

    // Parse the fetched XML string
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    // Check for XML parsing errors (e.g. malformed feed)
    const parserError = xmlDoc.querySelector('parsererror')
    if (parserError) {
        showMessage('RSS', 'The URL returned invalid or malformed XML.', true)
        throw new Error('The URL returned invalid or malformed XML.')
    }

    // Parse book metadata (<channel>)
    const channel = xmlDoc.querySelector('channel')
    if (!channel) {
        showMessage('RSS', 'Invalid RSS feed structure: missing <channel> element.', true)
        throw new Error('Invalid RSS feed structure: missing <channel> element.')
    }

    const items = xmlDoc.querySelectorAll('item')

    const bookData = {
        title: channel.querySelector('title')?.textContent.trim() || 'Untitled Book',
        author: channel.getElementsByTagName('itunes:author')[0]?.textContent.trim() || 'Unknown Author',
        description: channel.querySelector('description')?.textContent.trim() || '',
        cover_url: channel.getElementsByTagName('itunes:image')[0]?.getAttribute('href') || '',
        total_chapters: items.length,
        
        // Metadata & RLS access control fields
        uploader: user.id,
        is_public: isPublic,
        invited_users: invitedUsers,
        uploader_comment: uploaderComment
    }

    // Insert parent book record
    const { data: bookRecord, error: bookError } = await _supabase
        .from('books')
        .insert(bookData)
        .select('id')
        .single()

    if (bookError) {
        showMessage('RSS', `Failed to create book entry: ${bookError.message}`)
        console.error('Failed to create book entry:', bookError.message)
        throw bookError
    }

    const bookId = bookRecord.id

    // Parse & map chapters (<item>)
    const chaptersToInsert = []

    items.forEach((item) => {
        const chapterTitle = item.querySelector('title')?.textContent.trim()
        const episodeNum = item.getElementsByTagName('itunes:episode')[0]?.textContent.trim()
        const duration = item.getElementsByTagName('itunes:duration')[0]?.textContent.trim()
        const audioUrl = item.querySelector('enclosure')?.getAttribute('url')

        if (audioUrl) {
            chaptersToInsert.push({
                book_id: bookId, // Foreign key linking child to parent book
                title: chapterTitle || 'Untitled Chapter',
                chapter_number: episodeNum ? parseInt(episodeNum, 10) : null,
                duration: duration || '00:00',
                audio_url: audioUrl
            })
        }
    })

    // Bulk insert chapter records
    if (chaptersToInsert.length > 0) {
        const { error: chapterError } = await _supabase
            .from('chapters')
            .insert(chaptersToInsert)

        if (chapterError) {
            showMessage('RSS', `Failed to insert chapters: ${chapterError.message}`)
            console.error('Failed to insert chapters:', chapterError.message)
            throw chapterError;
        }
    }

    return bookId
}

// Add event listener to the RSSUploadBtn to parse the provided RSS link
RSSUploadBtn.addEventListener('click', async () => {
    // Make sure the user provided an RSS link
    if (!RSSURLInput.value) {
        showMessage('RSS', 'Please provide an RSS Link.', true)
        return null
    }
    
    clearMessage()

    const RSSURL = RSSURLInput.value
    const uploaderComment = RSSUploaderComment.value
    const isPublic = RSSisPublicInput.checked

    try {
        const bookId = await parseRSSBookLink(RSSURL, {
            isPublic: isPublic,
            uploaderComment: uploaderComment
        })

        showMessage('RSS', 'RSS Link processed successfully!')
        console.log('Successfully ingested book with ID:', bookId)
    } catch (err) {
        showMessage('RSS', 'Failed to process RSS link.', true)
        console.error('Ingestion failed:', err.message)
    }
})