/**
 * Derive a user's full name from Firebase Auth data
 * Falls back to email prefix if no display name is available
 */
function deriveUserName(displayName: string | undefined, email: string | undefined): string {
	if (displayName && displayName.trim().length > 0) {
		return displayName.trim()
	}

	if (email) {
		const emailPrefix = email.split('@')[0]
		if (emailPrefix) {
			// Capitalize first letter and replace common separators with spaces
			const formatted = emailPrefix.replace(/[._-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
			return formatted
		}
	}

	return 'New User'
}

/**
 * Derive a store name from the user's name
 */
function deriveStoreName(userName: string): string {
	// Use possessive form for the store name
	const name = userName.trim()
	if (name.toLowerCase().endsWith('s')) {
		return `${name}' Store`
	}
	return `${name}'s Store`
}

export { deriveUserName, deriveStoreName }
