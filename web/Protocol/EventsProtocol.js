import ProtocolPrototype from './ProtocolPrototype';
import EventsController from '../Controller/Events';


//Event emitter behavior
export default function EventsProtocol(Interface = ProtocolPrototype){
	return class extends Interface{
		get events(){ return EventsController.instance(this) }
		off(...setting){ return this.events.off.apply(this.events, setting)}
		on(...setting){ return this.events.on.apply(this.events, setting)}
		once(...setting){ return this.events.once.apply(this.events, setting)}
		send(type, detail){ return this.events.emit(type, detail) }
		sends(type){ return this.events.sends(type) }
	}
}

EventsProtocol.instance = instance => EventsController.instance(instance)
EventsProtocol.delete = instance => EventsController.delete(instance)