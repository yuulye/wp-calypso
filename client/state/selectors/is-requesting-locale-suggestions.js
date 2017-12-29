/** @format */
/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * @param  {Object}  state Global state tree
 * @returns {Boolean} Whether the HTTP request is complete
 */
export default function isRequestingLocaleSuggestions( state ) {
	return get( state.i18n.localeSuggestions, 'isFetching', false );
}
