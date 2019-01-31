(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function Index(){
	window.modules.import.assets(window.modules.http.locator.script('meta/esprima/index.js'))
	await window.modules.wait('modules.esprima')
	window.modules.import.assets(window.modules.http.locator.script('meta/yaml/index.js'))
	await window.modules.set('yaml', await window.modules.wait('jsyaml', true))
})
