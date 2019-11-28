import * as Data from 'Hitract/Api/Data';

const Types = ['student','university','teacher','company']
const accountAuthority = Symbol('Account.authority')
const accountUserProfile = Symbol('Account.userProfile')
const accountType = Symbol('Account.type')
const accountSessionDate = Symbol('Account Session Date')
const accountId = Symbol('Account.id')

export default class Account{
	static create = createAccount
	static apiAccountId = apiAccountId
	static apiAccountType = apiAccountType
	static apiParameter = apiParameter
	static apiPointer = apiPointer
	constructor(authority, authentication){
		for(const field in authentication) this[field] = authentication[field]
		this[accountAuthority] = authority
		this[accountSessionDate] = new Date()
		this[accountType] = apiAccountType(this)
		this[accountId] = apiAccountId(this)
	}
	get authenticated(){ return Data.has(this, 'api.authToken') }
	get authority(){ return this[accountAuthority] }
	get authorization(){ return `Bearer ${Data.get(this, 'api.authToken')}` }
	async feed(){ return await loadAccountFeed.apply(this, arguments) }
	get(notation){ return Data.get(this, notation) }
	has(notation){ return Data.has(this, notation) }
	get id(){ return this[accountId] }
	parameter(){ return apiParameter(this, ...arguments) }
	pointer(){ return apiPointer(this, ...arguments) }
	async profile(){ return await loadAccountProfile.apply(this, arguments) }
	get user(){ return this[accountUserProfile] || null }
	get type(){ return this[accountType] }
}


//scope action

function apiAccountId(account){ return Data.get(account, `api.${account.type}Id`) }
function apiAccountType(account){
	for(const type of Types){
		if(Data.has(account, `api.${type}Id`))  return type
	}
	return Types[0]
}
function apiParameter({id}, ...parameter){ return Data.copy({id},...parameter) }
function apiPointer(account, endpoint){ return `${account.type}${endpoint}` }

async function createAccount(authority, session){
	const account = new Account(authority, session)
	account[accountUserProfile] = await account.profile()
	return await authority.set('account', account)
}

async function loadAccountFeed(){
	const pointer = this.pointer('Feed')
	if(Data.has(this, `authority.api.get.${pointer}`) === false) return null
	const parameter = this.parameter()
	return await this.authority.api.get[pointer](parameter, ...arguments)
}

async function loadAccountProfile(){
	const pointer = this.pointer('Profile')
	if(Data.has(this,`authority.api.get.${pointer}`) === false) return null
	const parameter = this.parameter()
	return this[accountUserProfile] = await this.authority.api.get[pointer](parameter, ...arguments)
}