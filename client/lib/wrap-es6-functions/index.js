/**
 * /* eslint-disable no-console
 *
 * @format
 */

/**
 * External dependencies
 */
import { isFunction, partial, noop } from 'lodash';

function wrapFnWithWarning( fn, name ) {
	const consoleFn = ( console.error || console.log ).bind( console );
	return function() {
		const err = new Error(
			`${ name } is not supported on all browsers. You must use a replacement method from lodash.`
		);
		consoleFn( err );
		return fn.apply( this, arguments );
	};
}

function wrapObjectFn( obj, objectName, key ) {
	if ( isFunction( obj[ key ] ) ) {
		Object.defineProperty( obj, key, {
			value: wrapFnWithWarning( obj[ key ], `${ objectName }${ key }` ),
		} );
	}
}

const wrapEs6Functions = function() {
	if ( process.env.NODE_ENV === 'development' ) {
		return;
	}

	[ 'keys', 'entries', 'values', 'findIndex', 'fill', 'find', 'includes' ].map(
		partial( wrapObjectFn, Array.prototype, 'Array#' )
	);

	[ 'codePointAt', 'normalize', 'repeat', 'startsWith', 'endsWith', 'includes' ].map(
		partial( wrapObjectFn, String.prototype, 'String#' )
	);
};

export default ( process.env.NODE_ENV === 'development' ? wrapEs6Functions : noop );
