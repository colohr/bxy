import React from 'react';
import {withNavigation} from 'react-navigation';
import EventsProtocol from './EventsProtocol';

//Provides navigation property & event emitter support in component classes
export default function NavigationProtocol(Component, options){
	return withNavigation(EventsProtocol(class extends Component{
		static navigationOptions = Object.assign({ header: null }, options)
	}))
}