//https://facebook.github.io/react-native/docs/asyncstorage
import AsyncStorage from '@react-native-community/async-storage';
import EventsProtocol from '../Protocol/EventsProtocol';
import {StoreKey} from '../Id';
import * as Data from '../Data';
import Valid from '../Valid';


export default EventsProtocol(class StorageController{
	constructor(identifier='StorageController'){ this.namespace = StoreKey(identifier) }
	//AsyncStorage.clear([callback]: ?(error: ?Error) => void) //erases all data
	async clear(){ return (await this.cancel(), await clearStorageFields(await this.fields()),this) }

	//AsyncStorage.flushGetRequests() //Flushes any pending requests using a single batch call to get the data.
	async cancel(){ return (await AsyncStorage.flushGetRequests(), this) }

	//Returns count of stored values
	async count(){ return (await this.fields()).length }

	//Checks is storage container is empty
	async empty(){ return (await this.count()) === 0 }

	//Checks is property field exists
	async exists(field){ return (await this.fields()).includes(this.field(field)) }

	//Scopes a property field with storage namespace
	field(){ return this.namespace.field(...arguments) }

	//AsyncStorage.getAllKeys([callback]: ?(error: ?Error, keys: ?Array<string>) => void)
	async fields(){ return (await AsyncStorage.getAllKeys()).filter(field=>field.startsWith(this.namespace.prefix)) }

	//AsyncStorage.getItem(key: string, [callback]: ?(error: ?Error, result: ?string) => void)
	async get(){  return readableValue(await AsyncStorage.getItem(this.field(...arguments))) }

	async message(storeKey, to, operation){ return this.sends(storeKey) ? {from: await this.get(arguments[0]), operation, to}:null }

	//AsyncStorage.setItem(key: string, value: string, [callback]: ?(error: ?Error) => void)
	async merge(field, ...source){
		if(await this.exists(field = this.field(field))) source.unshift(await this.get(field))
		return (await this.set(field, source = Data.copy(...source)),source)
	}

	observe(){ return (arguments[0] = this.field(arguments[0]), this.on(...arguments)) }
	observed(){ return (this.send(this.field(arguments[0]), {from: arguments[1], operation: 'observed', to: arguments[1]}),arguments[1]) }
	observes(){ return (arguments[0] = this.field(arguments[0]), this.sends(...arguments)) }

	async remove(){ return await this.unset(...arguments) }

	//AsyncStorage.setItem(key: string, value: string, [callback]: ?(error: ?Error) => void)
	async set(){
		const message = await this.message(arguments[0] = this.field(arguments[0]), arguments[1], 'set')
		const value = writableValue(arguments[1])
		if(value === null && await this.unset(arguments[0])) return value
		await AsyncStorage.setItem(arguments[0], value)
		return (message ? this.send(arguments[0], message):null,arguments[1])
	}

	unobserve(){ return (arguments[0] = this.field(arguments[0]), this.off(...arguments)) }

	//AsyncStorage.removeItem(key: string, [callback]: ?(error: ?Error) => void)
	async unset(){
		const message = await this.message(arguments[0] = this.field(arguments[0]), arguments[1], 'unset')
		await AsyncStorage.removeItem(arguments[0])
		return (message ? this.send(arguments[0], message):null, true)
	}
})


//scope actions
async function clearStorageFields(fields){
	for(const field of fields) await AsyncStorage.removeItem(field)
}

export function jsonDecode(value){
	try{ value = JSON.parse(value) }
	catch(error){ value = null }
	return validValue(value)
}

export function jsonEncode(value){
	try{ value = JSON.stringify(value,null,0) }
	catch(error){ value = null }
	return validValue(value)
}

export function readableValue(value){ return jsonDecode(value) }

export function validValue(value){
	if(Valid.object(value)) value = Data.empty(value) ? null:value
	return Valid(value) ? value:null
}

export function writableValue(value){
	if(Valid.object(value)){
		value = jsonEncode(value)
		if(Valid.text(value)) value = jsonDecode(value)
		if(Valid.object(value)) value = jsonEncode(value)
	}
	return validValue(value)
}

//NOTE: This is not supported by all native implementations.
//Unsupported: AsyncStorage.mergeItem(key: string, value: string, [callback]: ?(error: ?Error) => void)
//AsyncStorage  multi-key functionality
class MultiStorageController{
	//This allows you to batch the fetching of items given an array of key inputs. Your callback will be invoked with an array of corresponding key-value pairs found:
	//AsyncStorage.multiGet(keys: Array<string>, [callback]: ?(errors: ?Array<Error>, result: ?Array<Array<string>>) => void)

	//Use this as a batch operation for storing multiple key-value pairs. When the operation completes you'll get a single callback with any errors:
	//AsyncStorage.multiSet(keyValuePairs: Array<Array<string>>, [callback]: ?(errors: ?Array<Error>) => void)

	//Call this to batch the deletion of all keys in the keys array. Returns a Promise object.
	//AsyncStorage.multiRemove(keys: Array<string>, [callback]: ?(errors: ?Array<Error>) => void)

	//Batch operation to merge in existing and new values for a given set of keys. This assumes that the values are stringified JSON. Returns a Promise object.
	//
	//NOTE: This is not supported by all native implementations.
	//static multiMerge(keyValuePairs: Array<Array<string>>, [callback]: ?(errors: ?Array<Error>) => void)
}