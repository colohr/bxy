import {StorageController} from '../Controller';
import * as Data from '../Data';
import Failure from './Failure';
import Account from './Account';
import * as Facebook from './Facebook';
const account = Symbol('App.account');

export default class AppAuthority extends StorageController{
	constructor(api){
		super(getNamespace(api))
		this.api = api
		this.on('failure', onFailure.bind(this))
		function onFailure(failure){
			for(const field in failure){
				console.log(field, failure[field])
			}
		}
	}
	get account(){ return account in this ? this[account]:null }
	async authenticate(){
		if(this.authenticated) return this.account
		try{
			let authentication = await Facebook.token()
			if(!authentication.certificate){
				authentication = await Facebook.authenticate()
			}
			if(authentication.certificate) return await this.authorize(authentication)
		}
		catch(error){ this.send('failure', error) }
		return null
	}
	get authenticated(){ return Data.has(this, 'account.authorization') }
	async authorize(authentication){
		try{
			const session = await this.set('account.session', await authorizeApi(this, authentication))
			return this[account] = await Account.create(this, session)
		}
		catch(error){ throw error }
	}
	headers(){
		const authorization = Data.get(this,'account.authorization')
		if(authorization) return {Authorization: authorization}
		return {}
	}
	get index(){ return this.api.index }
	async logout(){
		await Facebook.logout()
		delete this[account]
		return await this.clear()
	}
	async open(){
		const session = await this.get('account.session')
		if(session) this[account] = await Account.create(this, session)
		return this.authenticated
	}
}

//Activate session
async function authorizeApi(authority, authentication, endSession = false){
	try{
		if(endSession === true && await Facebook.logout()){
			authentication = await Facebook.authenticate()
		}
		const inputToken = authentication.certificate.accessToken.toString()
		authentication.api = await authority.api.post.authenticate({inputToken}, {cache: false})
		if(hasAuthorization(authentication.api)) return authentication
		if(endSession === false) return await authorizeApi(authority, authentication=null, true)
	}
	catch(error){ throw error }
	throw new Failure('authenticate', 'unauthorized', 'authorizeApi', 'authority',{message:'Please try again. Account could not be authenticated'})
}

function hasAuthorization(message){ return message && typeof message.authToken === 'string' }

function getNamespace(api){
	if(Data.has(api, 'configuration.authorityNamespace')) return Data.get(api,'configuration.authorityNamespace')
	throw new Error(`Property: "configuration.authorityNamespace" not defined. Could not instantiate Api/Authority.`)
}
