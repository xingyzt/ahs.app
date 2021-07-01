const version = 'garlic'

self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

self.addEventListener('activate', event => event.waitUntil(
	 caches.keys().then( keys => Promise.all(
		keys.filter(key => key !== version)
		.map(caches.delete)
    ))
))


const response = async request => {

	const now = Date.now()

	const request_url = new URL(request.url)

	// Since ahs.app is an SPA, no need to cache its separate HTML pages
	if( request_url.hostname === 'ahs.app' && !request_url.pathname.includes('.') )
		request_url.pathname = '/'

	const cache = await caches.open(version)
	const cached_response = await cache.match(request_url)

	const cached_time_url = new URL(request_url)
	cached_time_url.search = '?cache_time'

	let cached_time_response = await cache.match(cached_time_url)
	const cached_time = cached_time_response ? parseInt(await cached_time_response.text()) : 0
	cached_time_response = new Response(now.toString())

	if ( cached_response ) {

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

		const content_type = String(cached_response.headers.get('content-type')).split(';')[0]
		const timeout = timeouts[content_type] || day
		console.log({content_type,timeout})
		if( !navigator.onLine || now - cached_time < timeout )
			return cached_response
	}
	
	const fresh_response = await fetch(request)
	const cloned_response = fresh_response.clone()

	cache.put(request_url, cloned_response)
	cache.put(cached_time_url, cached_time_response)
	return fresh_response

}
