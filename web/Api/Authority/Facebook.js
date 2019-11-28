import {LoginManager, AccessToken} from 'react-native-fbsdk';
import {facebook as configuration} from 'Hitract/configuration'
import Failure from './Failure'
const totalPermissions = configuration.scopes.length


//scope actions
export async function authenticate(){
	try{ return await token(await login()) }
	catch(error){ throw error }
}

export function login(){
	let error = null
	return LoginManager.logInWithReadPermissions(configuration.scopes).then(onSuccess, onFailure)
	//scope actions
	function onSuccess(response){
		if(response instanceof Object === false){
			error = new Failure('facebook', 'invalid', 'authenticate', 'response', response)
		}
		else if(response.isCancelled){
			error = new Failure('facebook', 'canceled', 'authenticate', 'user', response)
		}
		else if('grantedPermissions' in response === false || response.grantedPermissions.length === 0){
			error = new Failure('facebook', 'rejected', 'authenticate', 'user', response)
		}
		else if(response.grantedPermissions.length !== totalPermissions){
			error = new Failure('facebook', 'permissions', 'authenticate', 'user', response)
		}

		if(error) return onFailure(error)
		return response
	}

	//console.log(error.message)
	//console.log('userInfo', error.userInfo)
	//console.log('frames', error.framesToPop)
	//console.log('code', error.code)
	//console.log('domain', error.domain)
	//console.log('stack', error.nativeStackIOS)
	//console.log(Object.keys(error))
	//console.log("Login fail with error: " + error);
}

export async function logout(){ return (await LoginManager.logOut(),  true) }

function onFailure(error){
	if(error instanceof Error && error instanceof Failure === false) error = new Failure(error)
	if(error instanceof Failure === false) new Failure(error)
	throw error
}

async function refresh(authentication = {}){
	try{
		const {data} = await AccessToken.refreshCurrentAccessTokenAsync()
		if(data.length > 0) return await token(authentication)
	}
	catch(error){ throw new Failure('facebook', 'tokenize', 'refresh', 'tokenizer', {error}) }
	return authentication
}

export async function token(authentication = {}){
	try{ authentication.certificate = await AccessToken.getCurrentAccessToken() }
	catch(error){ throw new Failure('facebook', 'tokenize', 'token', 'tokenizer', {error}) }
	return authentication
}