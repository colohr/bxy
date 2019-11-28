export const scopes = {
	facebook: {
		canceled: 'Authentication was canceled by user.',
		invalid: 'Authentication failed: "The facebook session certificate for use account is not valid."',
		rejected: 'Authentication failed: "The application did not receive permission from user to establish identity via facebook account."',
		unspecified: 'Authentication failed: "Reason for failure could not be identified."'
	},
	firebase: {}
}

export default class AuthorityError extends Error{
	constructor(scope, reason = 'unspecified', operation = 'unspecified', issuer = 'user', meta = null){
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		if(scope instanceof Error){
			scope = scope.message
			issuer = 'internal'
			meta = scope
			scope = scope.name
		}
		super(scope in scopes && scopes[scope][reason] ? scopes[scope][reason]:`Authentication error in scope: "${scope}" with reason: "${reason}".`)
		this.name = 'AuthorityError'
		this.scope = scope
		this.reason = reason
		this.operation = operation || 'authority'
		this.issuer = issuer
		this.meta = meta
		this.date = new Date()
		if(Error.captureStackTrace) Error.captureStackTrace(this, AuthorityError)
	}
}