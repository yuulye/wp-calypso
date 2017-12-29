/** @format */

/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	I18N_LOCALE_SUGGESTIONS_REQUEST,
	I18N_LOCALE_SUGGESTIONS_SUCCESS,
	I18N_LOCALE_SUGGESTIONS_FAILURE,
} from 'state/action-types';

/**
 * Triggers a network request to get locale suggestions
 * @returns {Function} Action thunk
 */
export function requestLocaleSuggestions() {
	return dispatch => {
		dispatch( {
			type: I18N_LOCALE_SUGGESTIONS_REQUEST,
		} );

		return wpcom
			.undocumented()
			.getLocaleSuggestions()
			.then( items => {
				dispatch( {
					type: I18N_LOCALE_SUGGESTIONS_SUCCESS,
					items,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: I18N_LOCALE_SUGGESTIONS_FAILURE,
					error: pick( error, [ 'error', 'status', 'message' ] ),
				} );
			} );
	};
}
