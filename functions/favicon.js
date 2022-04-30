const fetch = require('node-fetch')

function filterBestIcon(icons) {
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

	return icons[0].src
}

exports.handler = async (event, context) => {
	const query = event.path.replace('/favicon/', '')
	const path = 'http://favicongrabber.com/api/grab/' + query
	let grabber, json

	try {
		grabber = await fetch(path)
		json = await grabber.json()
	} catch (err) {
		return {
			statusCode: err.statusCode || 500,
			body: JSON.stringify({
				error: err.message,
			}),
		}
	}

	return {
		statusCode: 200,
		body: filterBestIcon(json.icons),
		headers: {
			'access-control-allow-origin': '*',
		},
	}
}
