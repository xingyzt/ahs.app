'use strict'

async function main() {
	const access_token = location.hash.split('=')[1].split('&')[0]
	const endpoint = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'
	const url = endpoint + '&access_token=' + access_token
	const response = await fetch(url)
	const user_info = await response.text()
	console.log(user_info)
	window.localStorage.setItem('google-user-info', user_info)
	window.close()
}
main()

