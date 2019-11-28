import {url, Tag, Data, Text, Valid} from './exports';
import Authority from './Authority';
import Failure from './Authority/Failure';
import MountProtocol from './Protocol/MountProtocol';
const authority = Symbol('Authority instance')
const http_date = Symbol.for('HTTP request date')
const http_response = Symbol.for('HTTP response instance')
import * as configuration from '../configuration';

class Api extends MountProtocol(){
	constructor(){
		super()
		this.configuration = configuration
		this.domain = Data.get(this.configuration, 'api.domain')
		this.points = createPoints(this, this.configuration)
		this[authority] = new Authority(this)
	}
	get account(){ return Data.get(this, 'app.account') }
	get app(){ return this[authority] }
	get authenticated(){ return Data.get(this,'app.authenticated') }
	//Provides access to app routes + navigation
	get get(){ return this.points.get }
	headers = httpHeaders
	http = http
	join = joinPath
	get post(){ return this.points.post }
	url = resolveUrl
}


//exports
export default new Api();
export * from './exports';

//scope actions
function createPoints(instance){
	const api = Object.freeze(instance.configuration.api.endpoint)
	return Object.entries(api).reduce(constructPoints, { get: {}, post:{}, put:{}, delete:{} })

	//scope actions
	function constructPoints(points, entry){
		return pointDefine(points, pointCreate(...entry))

		//scope actions
		function pointCreate(identifier, definition){
			const type= (definition.type || 'get').toLowerCase()
			return {
				body: Valid.data(definition.body) ? Object.freeze(definition.body):null,
				identifier,
				method: type.toUpperCase(),
				url: definition.url,
				tags: definition.url.includes('${'),
				type
			}
		}
	}

	function pointApi(point){
		const identifier = point.identifier
		const method = Data.get(point,'method')
		return async function pointHTTP(request={}, setting){
			const locator = pointUrl(point, request)
			const body = pointBody(point, request)
			return await instance.http(locator, method, body, httpRequestSetting(setting, identifier))
		}
	}

	function pointBody(point, request){
		const definition = point.body || {}
		const body = Data.copy({}, definition, request.body || {})
		for(const field in definition) if(field in request) body[field] = request[field]
		return body
	}

	function pointDefine(points, point){ return (Object.defineProperty(points[point.type], point.identifier, pointProperty(point)), points) }

	function pointGetter(){ return pointApi(this) }

	function pointProperty(){ return {get: pointGetter.bind(arguments[0])} }

	function pointUrl(point, parameter){
		if(point.tags) return instance.url(Tag(point.url, {api, parameter}))
		return instance.url(point.url)
	}
}


async function http(locator, method, body, setting){
	Api.failures = await this.app.exists('failed') ? await this.app.get('failed'):[]
	const request = { method }
	request.headers = this.headers(Data.get(setting.headers))
	if(Valid.data(body) && Object.keys(body).length) body = JSON.stringify(body)
	if(Valid.text(body)) request.body = body

	const storageKey = Valid.text(setting.storageKey) ? setting.storageKey:null
	const read = setting.reload !== true && storageKey && await this.app.exists(storageKey)
	const store = storageKey && setting.cache !== false
	//console.log({reload: setting.reload,read, storageKey})
	if(read) {
		const cached = await this.app.get(storageKey)
		if(cached) return await this.app.observed(storageKey, cached)
	}

	try{
		const message = await httpRequest(locator, request)
		return store ? await this.app.set(storageKey, message):message
	}
	catch(error){
		await this.app.set('failed',Api.failures)
	}
}

function httpHeaders(){ return Data.copy({'Content-Type':'application/json'}, this.app.headers(), ...arguments) }

async function httpRequest(locator, request){

	try{
		const isJson = request.headers['Content-Type'].includes('json')
		const response = await fetch(locator, request)
		if(Api.failures.includes(locator)){
			//console.log('Failed: ',locator, request)
			//console.log(await response.text())

		}

		const message = isJson ? await response.json():response
		message[http_date] = new Date()
		message[http_response] = response
		return message
	}
	catch(error){
		if(Api.failures.includes(locator) === false){
			Api.failures.push(locator)
		}

		throw new Failure('api', error.message, 'httpRequest', 'fetch', {error, locator, request})
	}
}



function httpRequestSetting(setting, identifier=null){
	setting = Valid.data(setting) ? setting:{}
	return Data.copy({identifier, reload: false,  storageKey:identifier}, setting)
}

function joinPath(...paths){ return Text.clean(paths.join('/'), '/') }

function resolveUrl(locator, ...paths){
	if(Valid.text(locator) == false) return null
	paths = paths.filter(Valid.text)
	locator = locator.trim()
	if(locator.startsWith('http') || locator.startsWith('://')) {
		if(paths.length === 0) locator = locator
		else locator =  [locator,joinPath(...paths)].join('/')
	}
	else locator = url.resolve(this.domain, joinPath(locator, ...paths))
	if(locator.endsWith('/')) locator = locator.slice(0,locator.length-1)
	return locator
}

export function URI(resource){
	return new class URI extends String{
		constructor(){
			super(resource)
			try{ this.data = url.parse(resource, true) }
			catch(error){this.error = error}
		}
		get(notation){ return Data.get(this, `data.search.${notation}`) }
		has(notation){ return Data.has(this, `data.search.${notation}`) }
		set(notation, value){ return Data.set(this, `data.search.${notation}`, value) }
		unset(notation){ return Data.unset(this,`data.search.${notation}`) }
		toString(){ return this.data ? url.format(this.data):super.toString() }
	}
}

export function uri(locator, search){
	locator = URI(locator)
	if(Valid.data(search)) for(const field in search) locator.set(field,search[field])
	return locator.toString()
}