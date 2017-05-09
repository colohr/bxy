const assert = require('assert')
const crypto = require('crypto')
const dns = require('dns')
const http = require('http')
const https = require('https')
const os = require('os')
const query = require('querystring')
const util = require('util')
const v8 = require('v8')
const vm = require('vm')
const zlib = require('zlib')
const bxys = [
	assert,
	crypto,
	dns,
	http,
	https,
	os,
	query,
	util,
	v8,
	vm,
	zlib
]
//All classNames
const classNames = []
//prevented names for promise closure
const preventPromise = [].concat(classNames);
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
	if (typeof name !== 'string') return false;
	else if (preventPromise.includes(name)) return false;
	else if (name.includes('Sync')) return false;
	else if (name.includes('_')) return false;
	return typeof os[name] === 'function';
}
//object that bxy proxy handles (main-module)
const bxy = {
	//additional child modules
	//get values as other value types
}
const owners = {
	assert: require('assert'),
	crypto: require('crypto'),
	dns: require('dns'),
	http: require('http'),
	https: require('https'),
	os: require('os'),
	query: require('querystring'),
	
	util: require('util'),
	v8: require('v8'),
	vm: require('vm'),
	zlib: require('zlib')
}
//bxy proxy handler
const Bxy = {
	get(o, name){
		let match = bxys.filter(s => name in s)
		console.log(match)
		if (match.length) return match[0][name]
		return null
	},
	has(o, name){
		let match = bxys.filter(s => name in s)
		if (match.length) return true
		return false
	}
}
//export of fxy through proxy handler
module.exports = new Proxy(bxy, Bxy)
