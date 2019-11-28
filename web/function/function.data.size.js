(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('function.data.size',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('function.data.size')?_.get('function.data.size'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	//export
	return data_size

	//scope actions
	function data_length(value){ return ~-encodeURI(value).split(/%..|./).length }

	function data_size(value){
		try{ return data_length(JSON.stringify(value)) }
		catch(error){ console.error(error) }
		return 0
	}

})
