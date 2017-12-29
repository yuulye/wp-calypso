/** @format */

/**
 * Internal dependencies
 */
import { isRequestingLocaleSuggestions } from 'state/selectors';

describe( 'isRequestingLocaleSuggestions()', () => {
	test( 'should return false by default', () => {
		const isRequesting = isRequestingLocaleSuggestions( {
			i18n: {
				localeSuggestions: {},
			},
		} );

		expect( isRequesting ).toBe( false );
	} );

	test( 'should return the suggested locales', () => {
		const isRequesting = isRequestingLocaleSuggestions( {
			i18n: {
				localeSuggestions: {
					isFetching: true,
				},
			},
		} );

		expect( isRequesting ).toBe( true );
	} );
} );
