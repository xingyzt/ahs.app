'use strict'

const Main = document.querySelector('main')
const Media = Main.querySelector('.media')
const Canvas = document.createElement('canvas')
Canvas.ctx = Canvas.getContext('2d')

main()

async function main() {
	show_article()

	document.body
		.querySelectorAll('[href^="/"]')
		.forEach(link=>link.addEventListener('click', internal_link))
	
	document.body
		.querySelectorAll('.snippet>.image')
		.forEach(gradient_background)
	
	window.addEventListener('popstate', show_article)
	window.addEventListener('resize', safe_center)

	Canvas.width = Canvas.height = 1
	Canvas.ctx.filter = 'saturate(1000%)'
}
async function reset(){
	document.title = 'ahs.app'	
}
async function show_article() {
	reset()
	Main.hidden = window.location.pathname==='/'
	if(Main.hidden) return
	window.scrollTo(0,0)
	const id = window.location.pathname
		.split('/')
		.pop() // Last portion of the path is the ciphered ID
		.replace(/./g,c=>'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm-'['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-'.indexOf(c)]) // ROT13
	const article  = await db('articles/'+id)
	if (!article) return false
	document.title = article.title
	Main.querySelector('h2').focus()
	for (const property in article) {
		const element = Main.querySelector('.' + property)
		if (!element) continue
		element.innerHTML = article[property]
	}
	
	const media_cache = []
	if(article.videoIDs) for (const id of article.videoIDs){
		const embed = clone_template('youtube')
		embed.src = embed.src.replace('[URL]',id)
		media_cache.push(embed)
		embed.addEventListener('load',safe_center)
	}
	if(article.imageURLs) for (const url of article.imageURLs){
		const image = clone_template('image')
		image.src = url
		media_cache.push(image)
		image.addEventListener('load',safe_center)
	}
	Media.style.alignContent = 'safe center'
	Media.replaceChildren(...media_cache)
}
async function safe_center(){
	Media.style.alignContent = Media.scrollWidth > window.innerWidth ? 'flex-start' : 'safe center'
}
async function db(...path) {
	const response = await fetch(`https://ahs-app.firebaseio.com/${path.join('/')}.json`)
	return await response.json()
}
function internal_link(event){
	history.pushState({}, '', event.target.href)
	show_article()
	event.preventDefault()
}
async function gradient_background(image) {
	image.crossOrigin = 'Anonymous'
	image.addEventListener('load', () => {
		Canvas.ctx.drawImage(image, 0, 0, 1, 1)
		const data = Canvas.ctx.getImageData(0, 0, 1, 1).data
		let color = `rgba(${data[0]}, ${data[1]}, ${data[2]}, 0.2)`
		let gradients = `
			radial-gradient(circle at 100% 100%,${color},transparent),
			radial-gradient(circle at 0% 0%,transparent,var(--secondary))
		`
		image.parentNode.style.backgroundImage = gradients
	})
}
function clone_template(name) {
	return document.querySelector('.template-' + name)
		.content.cloneNode(true)
		.querySelector('*')
} 
