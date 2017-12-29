/** @format */
/**
 * External dependencies
 */
import { get, includes, isUndefined, map } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_QUERY_UPDATE } from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

const deepUpdateComments = (
	state,
	comments,
	{ order, page = 1, postId, search, status = 'all' }
) => {
	const parent = postId || 'site';
	const orderFilter = includes( [ 'ASC', 'DESC' ], order ) ? order : 'DESC';
	const searchFilter = !! search ? `&s=${ search }` : '';
	const filter = `${ status }?order=${ orderFilter }${ searchFilter }`;
	const commentIds = map( comments, 'ID' );

	const parentObject = get( state, parent, {} );
	const filterObject = get( parentObject, filter, {} );

	return {
		...state,
		[ parent ]: {
			...parentObject,
			[ filter ]: {
				...filterObject,
				[ page ]: commentIds,
			},
		},
	};
};

export const queries = ( state = {}, action ) => {
	if ( isUndefined( get( action, 'query.page' ) ) ) {
		return state;
	}
	const { comments, type, query } = action;
	switch ( type ) {
		case COMMENTS_QUERY_UPDATE:
			return deepUpdateComments( state, comments, query );
		default:
			return state;
	}
};

export default combineReducers( { queries: keyedReducer( 'siteId', queries ) } );
