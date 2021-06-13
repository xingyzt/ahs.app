self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

const version = 'fern'

const response = async request => {

	const cache = await caches.open(version)
	const cached_response = await cache.match(request)

	const now = Date.now()
	const second = 1000
	const minute = 60 * second
	const hour = 60 * minute
	const day = 24 * hour
	const year = 365 * day

	const timeouts = {
		'application/json': 10 * minute,
		'text/html': 10 * minute,
		'text/css': day,
		'application/javascript': day,
		'font/ttf': year,
		'image/jpg': year,
		'image/jpeg': year,
		'image/png': year,
	}

	const cached_time_url = request.url + '?cache_time'
	let cached_time_response = await cache.match(cached_time_url)
	const cached_time = cached_time_response ? parseInt(await cached_time_response.text()) : 0
	cached_time_response = new Response(now.toString())

	if ( cached_response ) {
		const content_type = `${cached_response.headers.get('content-type')}`.split(';')[0]
		const timeout = timeouts[content_type] || day
		console.log({content_type,timeout})
		if( !navigator.onLine || now - cached_time < timeout )
			return cached_response
	}
	
	const fresh_response = await fetch(request)
	const cloned_response = fresh_response.clone()

	cache.put(request.url, cloned_response)
	cache.put(cached_time_url, cached_time_response)
	return fresh_response

}
