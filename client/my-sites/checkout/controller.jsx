/**
 * External Dependencies
 */
import page from 'page';
import qs from 'qs';
import i18n from 'i18n-calypso';
import ReactDom from 'react-dom';
import React from 'react';
import { get, isEmpty } from 'lodash';

/**
 * Internal Dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import productsFactory from 'lib/products-list';
import { renderWithReduxStore } from 'lib/react-helpers';
import { canCurrentUser } from 'state/selectors';
import {
	getSelectedSiteId,
	getSelectedSite,
} from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';

/**
 * Module variables
 */
const productsList = productsFactory();

module.exports = {
	checkout: function( context ) {
		var Checkout = require( './checkout' ),
			CheckoutData = require( 'components/data/checkout' ),
			CartData = require( 'components/data/cart' ),
			SecondaryCart = require( './cart/secondary-cart' ),
			basePath = route.sectionify( context.path ),
			product = context.params.product,
			selectedFeature = context.params.feature;

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		if ( 'thank-you' === product ) {
			return;
		}

		analytics.pageView.record( basePath, 'Checkout' );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		renderWithReduxStore(
			(
				<CheckoutData>
					<Checkout
						product={ product }
						productsList={ productsList }
						purchaseId={ context.params.purchaseId }
						selectedFeature={ selectedFeature }
						couponCode={ context.query.code }
					/>
				</CheckoutData>
			),
			document.getElementById( 'primary' ),
			context.store
		);

		renderWithReduxStore(
			(
				<CartData>
					<SecondaryCart selectedSite={ selectedSite } />
				</CartData>
			),
			document.getElementById( 'secondary' ),
			context.store
		);
	},

	sitelessCheckout: function( context ) {
		const Checkout = require( './checkout' ),
			CheckoutData = require( 'components/data/checkout' ),
			CartData = require( 'components/data/cart' ),
			SecondaryCart = require( './cart/secondary-cart' );

		analytics.pageView.record( '/checkout/no-site', 'Checkout' );

		// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
		context.store.dispatch( setTitle( i18n.translate( 'Checkout' ) ) );

		renderWithReduxStore(
			(
				<CheckoutData>
					<Checkout
						reduxStore={ context.store }
						productsList={ productsList }
					/>
				</CheckoutData>
			),
			document.getElementById( 'primary' ),
			context.store
		);

		renderWithReduxStore(
			(
				<CartData>
					<SecondaryCart />
				</CartData>
			),
			document.getElementById( 'secondary' ),
			context.store
		);
	},

	checkoutThankYou: function( context ) {
		const CheckoutThankYouComponent = require( './checkout-thank-you' ),
			basePath = route.sectionify( context.path ),
			receiptId = Number( context.params.receiptId );

		analytics.pageView.record( basePath, 'Checkout Thank You' );

		context.store.dispatch( setSection( { name: 'checkout-thank-you' }, { hasSidebar: false } ) );

		context.store.dispatch( setTitle( i18n.translate( 'Thank You' ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		const state = context.store.getState();
		const selectedSite = getSelectedSite( state );

		renderWithReduxStore(
			(
				<CheckoutThankYouComponent
					productsList={ productsList }
					receiptId={ receiptId }
					domainOnlySiteFlow={ isEmpty( context.params.site ) }
					selectedFeature={ context.params.feature }
					selectedSite={ selectedSite } />
			),
			document.getElementById( 'primary' ),
			context.store
		);

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
	},

	redirectIfNoSite: function( redirectTo ) {
		return function( context, next ) {
			const state = context.store.getState();
			const siteId = getSelectedSiteId( state );
			const userCanManageOptions = canCurrentUser( state, siteId, 'manage_options' );
			if ( ! userCanManageOptions ) {
				const user = getCurrentUser( state );
				const visibleSiteCount = get( user, 'visible_site_count', 0 );
				//if only one site navigate to stats to avoid redirect loop
				const redirect = visibleSiteCount > 1 ? redirectTo : '/stats';
				return page.redirect( redirect );
			}
			next();
		};
	},

	redirectToAddMappingIfVipSite: function() {
		return function( context, next ) {
			const state = context.store.getState();
			const selectedSite = getSelectedSite( state ),
				domain = context.params.domain ? `/${ context.params.domain }` : '',
				query = qs.stringify( { initialQuery: context.params.suggestion } );

			if ( selectedSite && selectedSite.is_vip ) {
				return page.redirect( `/domains/add/mapping${ domain }?${ query }` );
			}

			next();
		};
	}
};
