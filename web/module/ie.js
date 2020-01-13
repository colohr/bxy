(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('ie',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('ie')?_.get('ie'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	return new Proxy(Object, {get(object, field){ return typeof field === 'string' ? Symbol.for(field):field }})
})
