type CookieType = string | number | boolean
const cookies = new Map<string, CookieType>()

// Load cookies into the map
document.cookie.split(";").forEach(cookieStr => {
    cookieStr = cookieStr.trim()
    if (cookieStr === "") {
        return
    }

    const [cookie, value] = cookieStr.split("=", 2)

    // Check if cookie is numeric value
    if(!isNaN(Number(value))) {
        cookies.set(cookie, Number(value))
        return
    }

    // Check if cookie is a boolean value
    if(value.toLowerCase() === "false") {
        cookies.set(cookie, false)
        return
    }
    if(value.toLowerCase() === "true") {
        cookies.set(cookie, true)
        return
    }

    // Cookie must just be a string
    cookies.set(cookie, value)
})

/**
 * Retrieves a browser cookie. Sets a default value if not found.
 *
 * @param cookie The name of the cookie to be retrieved
 * @param defaultValue (opt) The value to default to if the cookie is not found. Updates cookie accordingly
 * @returns
 */
export function getOrDefault<T extends CookieType>(cookie: string, defaultValue?: T) {
    if (!cookies.has(cookie) && defaultValue !== undefined) {
        set(cookie, defaultValue)
    }

    return cookies.get(cookie)
}

/**
 * Sets a browser cookie
 *
 * @param cookie The name of the cookie to be set
 * @param value The value to be set to
 */
export function set(cookie: string, value: CookieType) {
    cookies.set(cookie, value)

    document.cookie = Array.from(cookies.entries().map(([cookie, value]) => {
        return `${cookie}=${value}`
    })).join("; ")
}
