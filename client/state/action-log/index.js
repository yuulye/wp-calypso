/** @format */

/**
 * Action Log Redux store enhancer
 *
 * Inject at the bottom of the `createStore` enhancer
 * chain in order to provide access to dispatched actions
 * as well as the state and store directly from the console.
 *
 * Will only attach if the `window` variable is available
 * globally. If not it will simply be an empty link in the
 * chain, passing straight through.
 */

const state = {
	actionHistory: [],
	shouldRecordActions: true,
	historySize: 100,
};

export const queryToPredicate = query => {
	if ( query instanceof RegExp ) {
		return ( { type } ) => query.test( type );
	}
	if ( 'string' === typeof query ) {
		return ( { type } ) => type === query;
	}
	if ( 'function' === typeof query ) {
		return query;
	}

	throw new TypeError( 'provide string or RegExp matching `action.type` or a predicate function' );
};

const actionLog = {
	clear: () => ( state.actionHistory = [] ),
	filter: query => state.actionHistory.filter( queryToPredicate( query ) ),
	setSize: size => ( state.historySize = size ),
	start: () => ( state.shouldRecordActions = true ),
	stop: () => ( state.shouldRecordActions = false ),
};

Object.defineProperty( actionLog, 'history', {
	enumerable: true,
	get: () => state.actionHistory,
} );

const recordAction = action => {
	const { actionHistory, historySize } = state;

	const thunkDescription = 'function' === typeof action ? { type: 'thunk (hidden)' } : {};

	actionHistory.push( {
		...action,
		...thunkDescription,
		meta: {
			...action.meta,
			timestamp: Date.now(),
		},
	} );

	// cheap optimization to keep from
	// thrashing once we hit our size limit
	if ( actionHistory.length > 2 * historySize ) {
		state.actionHistory = actionHistory.slice( -1 * historySize );
	}
};

export const actionLogger = next => ( ...args ) => {
	const store = next( ...args );

	if ( 'undefined' === typeof window ) {
		return store;
	}

	const dispatch = action => {
		if ( state.shouldRecordActions ) {
			recordAction( action );
		}

		return store.dispatch( action );
	};

	Object.assign( window, {
		actionLog,
	} );

	return {
		...store,
		dispatch,
	};
};

export default actionLogger;
