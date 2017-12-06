/** @format */

/**
 * External dependencies
 */
import { castArray, isObject, forEach, some, isFunction, last, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import warn from 'lib/warn';

/**
 * Returns a selector that caches values.
 *
 * @param  {Function} selector      A standard selector for calculating cached result
 * @param  {Function} getDependents A Function describing the dependent(s) of the selector.
 *                                    Must return an object which gets used as the first arg of the selector
 * @return {Function}               Cached selector
 */
export default function createCachedSelector( { selector, getDependents } ) {
	if ( ! isFunction( selector ) || ! isFunction( getDependents ) ) {
		throw new TypeError(
			'createCachedSelector: invalid arguments passed, selector and getDependents must both be functions'
		);
	}

	const cache = new WeakMap();

	const cachedSelector = function( state, ...args ) {
		const dependents = getDependents( state, ...args );
		const sortedDependentsArray = Object.keys( dependents )
			.sort()
			.map( key => dependents[ key ] );

		if ( process.env.NODE_ENV !== 'production' ) {
			if ( some( args, isObject ) ) {
				warn( 'Do not pass complex objects as arguments to a cachedSelector' );
			}
		}
		if ( ! isObject( dependents ) || isEmpty( dependents ) ) {
			warn( 'getDependents must return an object' );
			return undefined;
		}

		// create a dependency tree for caching selector results.
		// this is beneficial over standard memoization techniques so that we can
		// garbage collect any values that are based on outdated dependents
		let currCache = cache;
		forEach( sortedDependentsArray, dependent => {
			if ( ! currCache.has( dependent ) ) {
				const isLast = last( sortedDependentsArray ) === dependent;
				currCache.set( dependent, isLast ? new Map() : new WeakMap() );
			}
			currCache = currCache.get( dependent );
		} );

		const key = castArray( args ).join();
		if ( ! currCache.has( key ) ) {
			currCache.set( key, selector( dependents, ...args ) );
		}

		return currCache.get( key );
	};

	return cachedSelector;
}
