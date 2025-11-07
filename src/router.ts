const location = window.location.pathname

// Reload the page when the user hits the 'back button'
window.addEventListener('popstate', () => {
    window.location.reload()
})

export function pageIs(path: string): () => boolean {
    return () => location.substring(1) === path
}

export function redirect(path: string): void {
    window.history.pushState(null, null, path)
    window.location.reload()
}

export function replace(path: string): void {
    const { protocol, hostname, port } = window.location
    window.location.replace(`${protocol}//${hostname}:${port}/${path}`)
}