const fetch = require('node-fetch')
const fs = require('fs')

exports.handler = async (event, context) => {
	const query = event.path.replace('/favicon', '')
	const path = 'https://main-green-spider.b-cdn.net/' + query
	let response, blob, buffer, base64

	try {
		response = await fetch(path)
		blob = await response.blob()
		buffer = await blob.arrayBuffer()
		base64 = 'data:image/png;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)))
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
		body: base64,
		headers: {
			'content-type': 'application/text',
			'content-length': base64.length,
			'access-control-allow-origin': '*',
		},
	}
}
