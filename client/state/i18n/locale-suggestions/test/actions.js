/** @format */

/**
 * Internal dependencies
 */
import { requestLocaleSuggestions } from '../actions';
import {
	I18N_LOCALE_SUGGESTIONS_REQUEST,
	I18N_LOCALE_SUGGESTIONS_SUCCESS,
	I18N_LOCALE_SUGGESTIONS_FAILURE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'locale suggestions actions', () => {
	const responseBody = [
		{
			locale: 'it',
			name: 'Italiano',
			availability_text: 'Disponibile anche in',
		},
	];

	describe( 'success', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/locale-guess' )
				.reply( 200, responseBody );
		} );

		test( 'should dispatch request action when thunk triggered', () => {
			const mockCallback = jest.fn();
			requestLocaleSuggestions()( mockCallback );

			expect( mockCallback.mock.calls.length ).toBe( 1 );
			expect( mockCallback.mock.calls[ 0 ][ 0 ] ).toEqual( {
				type: I18N_LOCALE_SUGGESTIONS_REQUEST,
			} );
		} );

		test( 'should dispatch receive action when request completes', () => {
			const mockCallback = jest.fn();

			return requestLocaleSuggestions()( mockCallback ).then( () => {
				expect( mockCallback.mock.calls[ 1 ][ 0 ] ).toEqual( {
					type: I18N_LOCALE_SUGGESTIONS_SUCCESS,
					items: responseBody,
				} );
			} );
		} );
	} );

	describe( 'failure', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/locale-guess' )
				.reply(
					500,
					{ error: 'Server Error', message: 'naughty!' },
					{ 'Content-Type': 'application/json' }
				);
		} );

		test( 'should dispatch receive action when request completes', () => {
			const mockCallback = jest.fn();

			return requestLocaleSuggestions()( mockCallback ).then( () => {
				expect( mockCallback.mock.calls[ 1 ][ 0 ] ).toEqual( {
					type: I18N_LOCALE_SUGGESTIONS_FAILURE,
					error: {
						error: 'Server Error',
						message: 'naughty!',
						status: 500,
					},
				} );
			} );
		} );
	} );
} );
