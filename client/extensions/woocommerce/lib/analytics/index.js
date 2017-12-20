/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import * as tracksUtils from './tracks-utils';
import { getBlogStickers } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
const debug = debugFactory( 'woocommerce:analytics' );

export const tracksStore = {
	getBlogStickers: function() {
		const state = tracksStore.reduxStore.getState();
		const siteId = getSelectedSiteId( state );
		return getBlogStickers( state, siteId );
	},
	setReduxStore( reduxStore ) {
		this.reduxStore = reduxStore;
	},
};

export const recordTrack = tracksUtils.recordTrack( analytics.tracks, debug, tracksStore );
