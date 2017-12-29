/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_LOCALE_SUGGESTIONS_REQUEST,
	I18N_LOCALE_SUGGESTIONS_SUCCESS,
	I18N_LOCALE_SUGGESTIONS_FAILURE,
} from 'state/action-types';

import { combineReducers } from 'state/utils';

export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case I18N_LOCALE_SUGGESTIONS_REQUEST:
			return true;
		case I18N_LOCALE_SUGGESTIONS_SUCCESS:
		case I18N_LOCALE_SUGGESTIONS_FAILURE:
			return false;
		default:
			return false;
	}
};

export const error = ( state = null, action ) => {
	switch ( action.type ) {
		case I18N_LOCALE_SUGGESTIONS_SUCCESS:
			return null;
		case I18N_LOCALE_SUGGESTIONS_FAILURE:
			return action.error;
		default:
			return null;
	}
};

export const items = ( state = null, action ) => {
	switch ( action.type ) {
		case I18N_LOCALE_SUGGESTIONS_SUCCESS:
			return action.items;
		default:
			return state;
	}
};

export default combineReducers( {
	isFetching,
	error,
	items,
} );
