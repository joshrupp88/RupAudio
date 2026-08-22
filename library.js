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

const allMediaTableBody = document.querySelector('#All-Media-Table tbody')

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
        // Reveal the All Media view and hide other views
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnAllMedia.classList.add('selected')
        return
    } else if (btn.id === navBtnBooks.id) {
        // Reveal the Books view and hide other views
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnBooks.classList.add('selected')
        return
    } else if (btn.id === navBtnSongs.id) {
        // Reveal the Songs view and hide other views
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnSongs.classList.add('selected')
        return
    } else if (btn.id === navBtnPodcasts.id) {
        // Reveal the Podcasts view and hide other views
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnPodcasts.classList.add('selected')
        return
    } else if (btn.id === navBtnPlaylists.id) {
        // Reveal the Playlists view and hide other views
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnPlaylists.classList.add('selected')
        return
    } else if (btn.id === navBtnCollections.id) {
        // Reveal the Collections view and hide other views
        libraryNavBtns.forEach((item) => {
            item.classList.remove('selected')
        })
        navBtnCollections.classList.add('selected')
        return
    } else {
        console.error('Unexpected error selecting Library view.')
        return
    }
})

// Load data into the All Media table
async function loadLibraryBooks() {
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
        .select('id, title, author, total_chapters, is_public')
        .eq('uploader', user.id)
        .order('title', { ascending: true })

    if (booksError) {
        showMessage(`Could not load books: ${booksError.message}`)
        console.error('Could not load books:', booksError.message)
        return
    }

    allMediaTableBody.replaceChildren()

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

        const lengthCell = document.createElement('td')
        lengthCell.textContent = 'Not available'
        lengthCell.setAttribute('role', 'cell')

        const chaptersCell = document.createElement('td')
        chaptersCell.textContent = book.total_chapters ?? '0'
        chaptersCell.setAttribute('role', 'cell')

        const privacyCell = document.createElement('td')
        privacyCell.textContent = book.is_public ? 'Public' : 'Private'
        privacyCell.setAttribute('role', 'cell')
        privacyCell.classList.add('far-right-col')

        row.append(
            titleCell,
            authorCell,
            lengthCell,
            chaptersCell,
            privacyCell
        )

        allMediaTableBody.append(row)
    })

    // Remove the bottom border from the last row
    const lastRow = allMediaTableBody.lastElementChild.querySelectorAll('td')
    lastRow.forEach((cell) => {
        cell.classList.add('last-row')
    })
}

loadLibraryBooks()