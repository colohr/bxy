(async function define_module(...x){ const define = async (module, ...inputs)=>await window.modules.define('Lessons.ExtendedCollection', {value:await module(...inputs)}); return window.modules.has('Lessons.ExtendedCollection')?window.modules.get('Lessons.ExtendedCollection'):await (async ([module],asyncs,...inputs)=>await define(module, ...(await Promise.all(asyncs)).concat(inputs)))(x.splice(0, 1),(x=x.map(i=>i instanceof Promise?async ()=>await i:i).reduce((l, i)=>((typeof(i)==='function'&&i.constructor.name==='AsyncFunction')?l[0].push(i()):l.push(i),l),[[]]))[0], ...x.slice(1, x.length)); })
(async function export_module(){

	//The extended collection can be used to combine a collection of
	//additional modules or codebase that fit a specific purpose & includes
	//similar loading functions similar used by the global `modules.import`
	//but are intended to be loaded relative to the folder assigned to the extended collection
	const Collection = await window.modules.import.class('ExtendedCollection')

	//URL assigned to the collection
	const collection_location = new URL('https://unpkg.com/bxy/web/classes/lesson/ExtendedCollection/')

	class SampleModuleCollection extends Collection{}

	//exports #1
	return new SampleModuleCollection(collection_location)

	//exports #2 - Pre-loading or initializing assets of extension
	return SampleModuleCollection.load(collection_location, async sample=>{
		//sample.let assigns all values of object & assigns the to the ExtendedCollection
		sample.let(
			//sample.import loads assets located in 'module/' folder
			await sample.import('index')
		)
		//sample.import.function loads functions located in 'function/' folder
		sample.set('abc', await sample.import.function('abc'))
	})
})
