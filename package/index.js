
const default_routes = [
	'bxy',
	'locaforage'
]

//exports
module.exports.routes = get_express_routes

//scope actions
function get_express_routes(...inputs){
	const node_modules = require('path').join(process.cwd(), '/node_modules/')
	const routes = inputs.filter(i=>Array.isArray(i))[0] || []
	const loader = inputs.filter(i=>typeof i==='function')[0] || require
	const routers = []
	try{
		const express = loader('express')
		routes.push(...default_routes)
		for(const route of routes){
			routers.push([`/node_modules/${route}`, express.static(require('path').join(node_modules, route))])
		}
	}
	catch(error){}
	return routers
}
