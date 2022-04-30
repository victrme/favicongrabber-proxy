const fetch = require('node-fetch')

function filterBestIcon(icons) {
	// Removes gigantic icons
	icons = icons.filter((i) => i.sizes === undefined || !i.sizes?.includes('512'))

	// Always take apple-touch-icon if available
	const appleIcons = icons.filter((icon) => icon.src.includes('apple-touch-icon'))

	if (appleIcons.length > 0) {
		return appleIcons[0].src
	}

	// If no apple-touch-icon, get biggest icon available
	icons.sort((curr, next) => {
		const size = (icon) => icon.sizes?.split('x')[0] || 16
		return size(next) - size(curr)
	})

	// No icon found ? Return empty string
	if (icons.length === 0) {
		return ''
	}

	return icons[0].src
}

exports.handler = async (event, context) => {
	const query = event.path.replace('/api/', '').replace(/^[^.]+\./g, '') // removes subdomain
	const path = 'http://favicongrabber.com/api/grab/' + query
	let iconString = ''

	try {
		const response = await fetch(path)

		if (response.status === 200) {
			const json = await response.json()
			iconString = filterBestIcon(json.icons)
		}
	} catch (err) {
		return {
			statusCode: err.statusCode || 500,
			body: JSON.stringify({
				error: err.message,
			}),
			headers: { 'access-control-allow-origin': '*' },
		}
	}

	return {
		statusCode: 200,
		body: iconString,
		headers: { 'access-control-allow-origin': '*' },
	}
}
