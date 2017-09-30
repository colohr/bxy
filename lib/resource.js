const cluster = require('cluster')
const datagram = require('dgram')
const events = require('events')
const net = require('net')
const readline = require('readline')
const stream = require('stream')
const ssl = require('tls')
const tty = require('tty')
const string = require('string_decoder')
const child = require('child_process')
const spawn = child.spawn

const rxys = [
	cluster,
	datagram,
	events,
	net,
	readline,
	stream,
	ssl,
	tty,
	string,
	child,
	spawn
]

//All classNames
const classNames = [
]
//prevented names for promise closure
const preventPromise = [
].concat(classNames);



//closure promise
const promisure = function (name) {
	const func = name;
	return function (...args) {
		return new Promise((resolve, reject) => {
			return fs[func](...args, (...res) => {
				if (res[0] !== null) return reject(res[0])
				res.splice(0, 1);
				return resolve(...res);
			});
		})
	}
}


//check is promises
const promise = (name) => {
	if(typeof name !== 'string') return false;
	else if (preventPromise.includes(name)) return false;
	else if (name.includes('Sync')) return false;
	else if (name.includes('_')) return false;
	return typeof os[name] === 'function';
}




//object that rxy proxy handles (main-module)
const rxy = {
	//additional child modules
	//get values as other value types
	
}



//rxy proxy handler
const Rxy = {
	get(o, name){
		let match = rxys.filter(s=>name in s)
		if(match.length) return match[0]
		return null
	},
	has(o,name){
		let match = rxys.filter(s=>name in s)
		if(match.length) return true
		return false
	}
}


//export of fxy through proxy handler
module.exports = new Proxy(rxy, Rxy)
