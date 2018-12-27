(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function FunctionSample(){
	//exports
	return sample_function

	//scope actions
	function sample_function(a, b, c){
		return `sample_function() a: ${a} -> b: ${b} -> c:${c}`
	}
})

