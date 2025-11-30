//                       Ex: /about.html => about.html => about
const location = window.location.pathname.substring(1).replace(/\.html$/mi, "")

// Reload the page when the user hits the 'back button'
window.addEventListener('popstate', () => {
    window.location.reload()
})

/**
 * Checks if a user is on a given page.
 * @param path The page to check
 * @returns A boolean function specifying if the user is on the given page
 */
export function pageIs(path: string | RegExp): () => boolean {
    return () => {
        if (path instanceof RegExp) {
            return path.test(location)
        } else {
            return path === location
        }
    }
}

/**
 * Redirects the user to a given page.
 * @param path The page to redirect to
 */
export function redirect(path: string): void {
    if (!path.includes(".")) {
        path += ".html"
    }

    window.history.pushState(null, null, path)
    window.location.reload()
}

/**
 * Replaces a user's current page with another.
 * @param path The page to be replaced with
 */
export function replace(path: string): void {
    if (path !== "" && !path.includes(".")) {
        path += ".html"
    }

    const { protocol, hostname, port } = window.location
    window.location.replace(`${protocol}//${hostname}:${port}/${path}`)
}