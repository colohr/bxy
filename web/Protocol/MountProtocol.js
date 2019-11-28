import ProtocolPrototype from './ProtocolPrototype';
const mounted = Symbol('Component.mounted');

//exports
export default function MountProtocol(Interface = ProtocolPrototype){
	return class extends Interface{
		mount = mountState
		mounted = isMountedState
		unmount = unmountState
	}
}

//scope actions
export function mountState(component){ return (component[mounted] = true, component) }
export function isMountedState(component){ return mounted in component }
export function unmountState(component){ return (delete component[mounted], component) }