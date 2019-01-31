(async (Export, ...x)=>await Export(...(await Promise.all(x.map(i=>typeof (i) === 'function' && i.constructor.name === 'AsyncFunction' ? i():i)))))
(async function Sample(){
    class SampleModuleIndex{ }
    return new SampleModuleIndex()
})
