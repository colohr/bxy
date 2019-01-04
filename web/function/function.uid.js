(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('uid',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('uid')?_.get('uid'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {

	//exports
	return get_id

	//scope actions
	function get_id(prefix=''){
		let first = (Math.random() * 46656) | 0
		let second = (Math.random() * 46656) | 0
		first = (`000${first.toString(36)}`).slice(-3)
		second = (`000${second.toString(36)}`).slice(-3)
		return `${prefix}${first}${second}`
	}
})
