(function define(...x){const _=this.modules?this.modules:module,__=(m,...a)=>_.define?_.define('bytes',{value:m(...a)}):_.exports=m(...a);return _.has&&_.has('bytes')?_.get('bytes'):(([m],y,...z)=>__(m,...(y.concat(z))))(x.splice(0,1),(x=x.map(i=>Array.isArray(i)?i.map(f=>f()):i).reduce((l,i)=>(Array.isArray(i)?l[0].push(...i):l.push(i),l),[[]]))[0],...x.slice(1, x.length));})
(function definition() {
	const increment = 1024
	const Variety = {
		petabyte: {
			get base(){ return Variety.terabyte.base * increment },
			suffix: 'PB'
		},
		terabyte: {
			get base(){ return Variety.gigabyte.base * increment },
			suffix: 'TB'
		},
		gigabyte: {
			get base(){ return Variety.megabyte.base * increment },
			suffix: 'GB'
		},
		megabyte: {
			get base(){ return Variety.kilobyte.base * increment },
			suffix: 'MB'
		},
		kilobyte: {
			get base(){ return increment },
			suffix: 'KB'
		},
		bytes:{
			base:1,
			suffix:' bytes'
		}
	}

	class Bytes extends Number{
		get gigabyte(){ return get_value('gigabyte', this) }
		get kilobyte(){ return get_value('kilobyte', this) }
		get label(){ return get_label(this) }
		get megabyte(){ return get_value('megabyte', this) }
		get petabyte(){ return get_value('petabyte', this) }
		get suffix(){ return Variety[this.variety].suffix }
		get terabyte(){ return get_value('terabyte', this) }
		get variety(){ return get_variety(this) }
		toString(){ return get_label(this) }
	}

	//exports
	return create

	//scope actions
	function create(bytes){ return new Bytes(bytes) }

	function get_label(bytes){
		const variety = Variety[bytes.variety]
		return `${(bytes / variety.base).toFixed(1)}${variety.suffix}`
	}

	function get_value(type, bytes){
		if(type in Variety) return bytes / Variety[type].base
		return bytes
	}

	function get_variety(bytes){
		for(const type in Variety){
			const variety = Variety[type]
			if(bytes >= variety.base) return type
		}
		return 'bytes'
	}
})
