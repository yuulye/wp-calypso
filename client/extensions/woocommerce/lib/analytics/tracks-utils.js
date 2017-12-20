/** @format */

/**
 * External dependencies
 */
import { startsWith, includes } from 'lodash';

export const recordTrack = ( tracks, debug, tracksStore ) => ( eventName, eventProperties ) => {
	if ( ! startsWith( eventName, 'calypso_woocommerce_' ) ) {
		debug( `invalid store track name: '${ eventName }', must start with 'calypso_woocommerce_'` );
		return;
	}

	debug( `track '${ eventName }': `, eventProperties );

	const blogStickers = tracksStore.getBlogStickers();
	if ( includes( blogStickers, 'dotcom-store-test-site' ) ) {
		debug( 'track request discarded. this site is flagged with `dotcom-store-test-site`' );
		return;
	}

	tracks.recordEvent( eventName, eventProperties );
};
