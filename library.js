// Define DOM elements
const libraryNavHeader = document.getElementById('Library-Nav-Header')
const statusMsg = document.getElementById('Status-Message')

const navBtnAllMedia = document.getElementById('All-Media-Nav-Btn')
const navBtnBooks = document.getElementById('Books-Nav-Btn')
const navBtnSongs = document.getElementById('Songs-Nav-Btn')
const navBtnPodcasts = document.getElementById('Podcasts-Nav-Btn')
const navBtnPlaylists = document.getElementById('Playlists-Nav-Btn')
const navBtnCollections = document.getElementById('Collections-Nav-Btn')
const libraryNavBtns = [navBtnAllMedia, navBtnBooks, navBtnSongs, navBtnPodcasts, navBtnPlaylists, navBtnCollections]

const tabAllMedia = document.getElementById('All-Media-Tab')
const tabBooks = document.getElementById('Books-Tab')
const tabSongs = document.getElementById('Songs-Tab')
const tabPodcasts = document.getElementById('Podcasts-Tab')
const tabPlaylists = document.getElementById('Playlists-Tab')
const tabCollections = document.getElementById('Collections-Tab')
const libraryTabs = document.querySelectorAll('.tab')

const allMediaTableBody = document.querySelector('#All-Media-Table tbody')

const booksContainer = document.getElementById('Books-Container')

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

// Handle toggling between Library nav tabs
libraryNavHeader.addEventListener('click', (event) => {
    // Determine which button was clicked
    const btn = event.target.closest('.library-nav-button')

    // If the click wasn't on a button, ignore it
    if (!btn) return

    if (btn.id === navBtnAllMedia.id) {
        // Select the All Media tab button and deselect all other buttons
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnAllMedia.classList.add('selected')
        // Reveal the All Media tab and hide all other tabs
        libraryTabs.forEach((item) => {
            item.classList.add('hidden')
        })
        tabAllMedia.classList.remove('hidden')
        // Run function to load tab data
        loadAllMediaTab()
        return
    } else if (btn.id === navBtnBooks.id) {
        // Select the Books tab button and deselect all other buttons
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnBooks.classList.add('selected')
        // Reveal the Books tab and hide all other tabs
        libraryTabs.forEach((item) => {
            item.classList.add('hidden')
        })
        tabBooks.classList.remove('hidden')
        // Run function to load tab data
        loadBooksTab()
        return
    } else if (btn.id === navBtnSongs.id) {
        // Select the Songs tab button and deselect all other buttons
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnSongs.classList.add('selected')
        // Reveal the Songs tab and hide all other tabs
        libraryTabs.forEach((item) => {
            item.classList.add('hidden')
        })
        tabSongs.classList.remove('hidden')
        return
    } else if (btn.id === navBtnPodcasts.id) {
        // Select the Podcasts tab button and deselect all other buttons
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnPodcasts.classList.add('selected')
        // Reveal the Podcasts tab and hide all other tabs
        libraryTabs.forEach((item) => {
            item.classList.add('hidden')
        })
        tabPodcasts.classList.remove('hidden')
        return
    } else if (btn.id === navBtnPlaylists.id) {
        // Select the Playlists tab button and deselect all other buttons
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnPlaylists.classList.add('selected')
        // Reveal the Playlists tab and hide all other tabs
        libraryTabs.forEach((item) => {
            item.classList.add('hidden')
        })
        tabPlaylists.classList.remove('hidden')
        return
    } else if (btn.id === navBtnCollections.id) {
        // Select the Collections tab button and deselect all other buttons
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnCollections.classList.add('selected')
        // Reveal the Collections tab and hide all other tabs
        libraryTabs.forEach((item) => {
            item.classList.add('hidden')
        })
        tabCollections.classList.remove('hidden')
        return
    } else {
        console.error('Unexpected error selecting Library view.')
        return
    }
})

// Load data for the All Media tab
async function loadAllMediaTab() {
    const { data: { user }, error: userError } = await _supabase.auth.getUser()

    if (userError) {
        showMessage(`Could not get signed-in user: ${userError.message}`, true)
        console.error('Could not get signed-in user:', userError.message)
        return
    }

    if (!user) {
        showMessage('No signed-in user found.', true)
        console.error('No signed-in user found.')
        return
    }

    const { data: books, error: booksError } = await _supabase
        .from('books')
        .select('id, title, author, total_chapters, total_duration, is_public')
        .eq('uploader', user.id)
        .order('title', { ascending: true })

    if (booksError) {
        showMessage(`Could not load books: ${booksError.message}`)
        console.error('Could not load books:', booksError.message)
        return
    }

    // Clear existing table entries
    allMediaTableBody.replaceChildren()

    // Create a document fragment and append rows to the fragment before appending the fragment to the table element
    // all at once to avoid a layout repaint as each item loads
    fragment = document.createDocumentFragment()

    books.forEach((book) => {
        const row = document.createElement('tr')

        row.className = 'all-media-table-row'
        row.setAttribute('role', 'row')
        row.id = book.id

        const titleCell = document.createElement('td')
        titleCell.textContent = book.title || 'Untitled'
        titleCell.setAttribute('role', 'cell')

        const authorCell = document.createElement('td')
        authorCell.textContent = book.author || 'Unknown Author'
        authorCell.setAttribute('role', 'cell')

        const chaptersCell = document.createElement('td')
        chaptersCell.textContent = book.total_chapters ?? '0'
        chaptersCell.setAttribute('role', 'cell')

        const privacyCell = document.createElement('td')
        privacyCell.textContent = book.is_public ? 'Public' : 'Private'
        privacyCell.setAttribute('role', 'cell')
        privacyCell.classList.add('far-right-col')

        // Calculate book duration
        const hrs = Math.floor(book.total_duration / 3600)
        const mins = Math.floor((book.total_duration % 3600) / 60)
        const secs = book.total_duration % 60

        // Ensure single-digit values display with a leading zero
        const padHrs = String(hrs).padStart(2, '0')
        const padMins = String(mins).padStart(2, '0')
        const padSecs = String(secs).padStart(2, '0')

        // Only display hours and minutes if they aren't zero
        let lengthCell
        if (padHrs === '00') {
            if (padMins === '00') {
                lengthCell = document.createElement('td')
                lengthCell.textContent = `${padSecs}s`
                lengthCell.setAttribute('role', 'cell')
            } else {
                lengthCell = document.createElement('td')
                lengthCell.textContent = `${padMins}m ${padSecs}s`
                lengthCell.setAttribute('role', 'cell')
            }
        } else {
            lengthCell = document.createElement('td')
            lengthCell.textContent = `${padHrs}h ${padMins}m ${padSecs}s`
            lengthCell.setAttribute('role', 'cell')
        }

        row.append(
            titleCell,
            authorCell,
            lengthCell,
            chaptersCell,
            privacyCell
        )

        fragment.appendChild(row)
    })

    // Append the entire fragment to the table to only trigger one layout render/repaint
    allMediaTableBody.appendChild(fragment)

    // Remove the bottom border from the last row
    const lastRow = allMediaTableBody.lastElementChild.querySelectorAll('td')
    lastRow.forEach((cell) => {
        cell.classList.add('last-row')
    })
}

// Load data for the Books tab
async function loadBooksTab() {
    const { data: { user }, error: userError } = await _supabase.auth.getUser()

    if (userError) {
        showMessage(`Could not get signed-in user: ${userError.message}`, true)
        console.error('Could not get signed-in user:', userError.message)
        return
    }

    if (!user) {
        showMessage('No signed-in user found.', true)
        console.error('No signed-in user found.')
        return
    }

    const { data: books, error: booksError } = await _supabase
        .from('books')
        .select('id, title, author, total_chapters, total_duration, is_public, cover_url')
        .eq('uploader', user.id)
        .order('title', { ascending: true })

    if (booksError) {
        showMessage(`Could not load books: ${booksError.message}`)
        console.error('Could not load books:', booksError.message)
        return
    }

    // Clear existing book cards
    booksContainer.replaceChildren()

    // Create a document fragment to append book cards to before rendering the fragment on the tab in a single step
    const fragment = document.createDocumentFragment()

    // Create a new card for each book in the user's library
    books.forEach((book) => {
        const card = document.createElement('button')
        card.classList = 'book-card'
        card.setAttribute('id', book.id)

        const image = document.createElement('img')
        image.classList = "book-cover"
        image.setAttribute('src', book.cover_url)
        image.setAttribute('alt', "book cover image")

        const title = document.createElement('div')
        title.textContent = book.title
        title.classList = "book-title lora-bold"

        const author = document.createElement('div')
        author.textContent = book.author
        author.classList = "book-author lora-italic"

        card.append(image, title, author)

        fragment.appendChild(card)
    })

    // Render all loaded books in a single step
    booksContainer.appendChild(fragment)
}

loadAllMediaTab()