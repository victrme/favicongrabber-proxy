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

async function getFavicongrabber(url) {
	const resp = await fetch(url)

	if (resp.status === 200) {
		const json = await resp.json()
		return json
	}

	return false
}

exports.handler = async (event, context) => {
	const path = 'http://favicongrabber.com/api/grab/'
	let query = event.path.replace('/api/', '')
	let hasSubDomain = query.split('.').length > 2
	let iconURL = ''

	try {
		// Try to get favicon json
		let json = await getFavicongrabber(path + query)

		// No json with a subdoamin, try with top-level domain
		if (!json && hasSubDomain) {
			query = query.replace(/^[^.]+\./g, '') // removes subdomain
			json = await getFavicongrabber(path + query)
		}

		// Json found: filter icon, if not: iconURL is still an empty string
		if (json.icons) {
			iconURL = filterBestIcon(json.icons)
		}
	} catch (err) {
		return {
			statusCode: err.statusCode || 500,
			body: JSON.stringify({
				error: err.message,
			}),
			headers: {
				'access-control-allow-origin': '*',
			},
		}
	}

	return {
		statusCode: 200,
		body: iconURL,
		headers: {
			'access-control-allow-origin': '*',
		},
	}
}
