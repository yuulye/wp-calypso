/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { noop, truncate, get, isEmpty } from 'lodash';
import classnames from 'classnames';
import ReactDom from 'react-dom';
import closest from 'component-closest';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import DisplayTypes from 'state/reader/posts/display-types';
import * as stats from 'reader/stats';
import ReaderPostActions from 'blocks/reader-post-actions';
import PostByline from './byline';
import GalleryPost from './gallery';
import PhotoPost from './photo';
import StandardPost from './standard';
import ConversationPost from './conversation-post';
import FollowButton from 'reader/follow-button';
import DailyPostButton from 'blocks/daily-post-button';
import { isDailyPostChallengeOrPrompt } from 'blocks/daily-post-button/helper';
import {
	getDiscoverBlogName,
	getSourceFollowUrl as getDiscoverFollowUrl,
} from 'reader/discover/helper';
import DiscoverFollowButton from 'reader/discover/follow-button';
import { expandCard as expandCardAction } from 'state/ui/reader/card-expansions/actions';
import { isReaderCardExpanded } from 'state/selectors';

class ReaderPostCard extends React.Component {
	static propTypes = {
		post: PropTypes.object.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		isSelected: PropTypes.bool,
		onClick: PropTypes.func,
		onCommentClick: PropTypes.func,
		showPrimaryFollowButton: PropTypes.bool,
		discoverPick: PropTypes.shape( {
			post: PropTypes.object,
			site: PropTypes.object,
		} ),
		showSiteName: PropTypes.bool,
		followSource: PropTypes.string,
		isDiscoverStream: PropTypes.bool,
		postKey: PropTypes.object,
		compact: PropTypes.bool,
	};

	static defaultProps = {
		onClick: noop,
		onCommentClick: noop,
		isSelected: false,
		showSiteName: true,
	};

	propagateCardClick = () => {
		// If we have an discover pick post available, send the discover pick to the full post view
		const postToOpen = get( this.props, 'discoverPick.post' ) || this.props.post;
		this.props.onClick( postToOpen );
	};

	handleCardClick = event => {
		const rootNode = ReactDom.findDOMNode( this ),
			selection = window.getSelection && window.getSelection();

		// if the click has modifier or was not primary, ignore it
		if ( event.button > 0 || event.metaKey || event.controlKey || event.shiftKey || event.altKey ) {
			if ( closest( event.target, '.reader-post-card__title-link', true, rootNode ) ) {
				stats.recordPermalinkClick( 'card_title_with_modifier', this.props.post );
			}
			return;
		}

		if ( closest( event.target, '.should-scroll', true, rootNode ) ) {
			setTimeout( function() {
				window.scrollTo( 0, 0 );
			}, 100 );
		}

		// declarative ignore
		if ( closest( event.target, '.ignore-click, [rel~=external]', true, rootNode ) ) {
			return;
		}

		// ignore clicks on anchors inside inline content
		if (
			closest( event.target, 'a', true, rootNode ) &&
			closest( event.target, '.reader-excerpt', true, rootNode )
		) {
			return;
		}

		// ignore clicks when highlighting text
		if ( selection && selection.toString() ) {
			return;
		}

		// programattic ignore
		if ( ! event.defaultPrevented ) {
			// some child handled it
			event.preventDefault();
			this.propagateCardClick();
		}
	};

	render() {
		const {
			post,
			discoverPick,
			site,
			feed,
			onCommentClick,
			showPrimaryFollowButton,
			isSelected,
			showSiteName,
			followSource,
			isDiscoverStream,
			postKey,
			isExpanded,
			expandCard,
			compact,
		} = this.props;

		const isPhotoPost = !! ( post.display_type & DisplayTypes.PHOTO_ONLY ) && ! compact;
		const isGalleryPost = !! ( post.display_type & DisplayTypes.GALLERY ) && ! compact;
		const isVideo = !! ( post.display_type & DisplayTypes.FEATURED_VIDEO ) && ! compact;
		const isDiscover = post.is_discover;
		const title = truncate( post.title, { length: 140, separator: /,? +/ } );
		const classes = classnames( 'reader-post-card', {
			'has-thumbnail': !! post.canonical_media,
			'is-photo': isPhotoPost,
			'is-gallery': isGalleryPost,
			'is-selected': isSelected,
			'is-discover': isDiscover,
			'is-expanded-video': isVideo && isExpanded,
			'is-compact': compact,
		} );

		let discoverFollowButton;

		if ( isDiscover && ! compact ) {
			const discoverBlogName = getDiscoverBlogName( post ) || null;
			discoverFollowButton = discoverBlogName && (
				<DiscoverFollowButton
					siteName={ discoverBlogName }
					followUrl={ getDiscoverFollowUrl( post ) }
				/>
			);
		}

		const readerPostActions = (
			<ReaderPostActions
				post={ get( discoverPick, 'post' ) || post }
				site={ site }
				visitUrl={ post.URL }
				showVisit={ true }
				showMenu={ true }
				fullPost={ false }
				showMenuFollow={ ! isDiscover }
				onCommentClick={ onCommentClick }
				showEdit={ false }
				className="ignore-click"
				iconSize={ 18 }
			/>
		);

		// Set up post byline
		let postByline;

		if ( isDiscoverStream && ! isEmpty( discoverPick ) ) {
			// create a post like object with some props from the discover post
			const postForByline = Object.assign( {}, discoverPick.post || {}, {
				date: post.date,
				URL: post.URL,
				primary_tag: post.primary_tag,
			} );
			postByline = (
				<PostByline post={ postForByline } site={ discoverPick.site } showSiteName={ true } />
			);
		} else {
			postByline = (
				<PostByline
					post={ post }
					site={ site }
					feed={ feed }
					showSiteName={ showSiteName || isDiscover }
					showAvatar={ ! compact }
				/>
			);
		}

		// Set up post card
		let readerPostCard;
		if ( compact ) {
			readerPostCard = (
				<ConversationPost
					post={ post }
					title={ title }
					isDiscover={ isDiscover }
					postByline={ postByline }
					commentIds={ postKey.comments }
					onClick={ this.handleCardClick }
				/>
			);
		} else if ( isPhotoPost ) {
			readerPostCard = (
				<PhotoPost
					post={ post }
					site={ site }
					title={ title }
					onClick={ this.handleCardClick }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					postKey={ postKey }
				>
					{ discoverFollowButton }
					{ readerPostActions }
				</PhotoPost>
			);
		} else if ( isGalleryPost ) {
			readerPostCard = (
				<GalleryPost post={ post } title={ title } isDiscover={ isDiscover }>
					{ readerPostActions }
				</GalleryPost>
			);
		} else {
			readerPostCard = (
				<StandardPost
					post={ post }
					title={ title }
					isDiscover={ isDiscover }
					isExpanded={ isExpanded }
					expandCard={ expandCard }
					site={ site }
					postKey={ postKey }
				>
					{ isDailyPostChallengeOrPrompt( post ) &&
						site && <DailyPostButton post={ post } site={ site } /> }
					{ discoverFollowButton }
					{ readerPostActions }
				</StandardPost>
			);
		}

		const followUrl = feed ? feed.feed_URL : post.site_URL;
		const onClick = ! isPhotoPost && ! compact ? this.handleCardClick : noop;

		var white = [
			69435401, // ~ cogitoesoterica - smalltimejetsetter - cogitoesoterica - https://smalltimejetsetter.wordpress.com
			40806253, // ~ patrickstories247 - PATRICK REAL STORIES - PATRICK STORIES - https://patrickrealstories.wordpress.com
			73453524, // ~ naveed7493 - Women Diaries07 - Mariam Naveed - https://womendiaries07.wordpress.com
			63006096, // ~ zovision782 - Zovision - Zovi - https://zovisionsite.wordpress.com
			64756695, // ~ agp98 - A SPARK - agp98 - https://agp98.wordpress.com
			74221510, // ~ theunstormingmind - The Storming Mind - thestormingmind - https://thestormingmind.wordpress.com
			59459306, // ~ doubledacres -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            doubledacres - doubledacres - http://ramblingsofafarrier.com
			71666708, // ~ angelamcclintock - Water for Camels - angelamcclintock - http://waterforcamels.com
			73868163, // ~ iscriblr - iScriblr - iScriblr - http://iscriblr.com
			// 382486, // ~ bizmarc - Die Erste Eslarner Zeitung - Aus und über Eslarn, sowie die bayerisch-tschechische Region! - OIKOS™-Redaktion - https://bizmarc.wordpress.com
			75424596, // ~ jondwx - jondwx - jondwx - https://jondwx.wordpress.com
			24986611, // ~ dee02kay - The Immortal Arts by Dee Kay - Dee Kay - https://imdeekay.wordpress.com
			36495360, // ~ harithsoman - harithsnair - Harith S Nair - https://harithsnair.wordpress.com
			75255412, // ~ kishwarayesha - The Write Direction - Ayesha☆Kishwar - https://blog26989.wordpress.com
			66756476, // ~ thekintsukuroilife - The Kintsukuroi Life - thekintsukuroilife - https://thekintsukuroilife.wordpress.com
			67681209, // ~ ivestrendytopic - Ive's Trendy Topic - IvesTrendyTopic - https://ivestrendytopic.wordpress.com
			74672960, // ~ objectcodercom - Sanjib.org - Sanjib Ahmad - http://sanjib.org
			65985495, // ~ truthiskef - truthiskef - Rohini - https://truthiskef.wordpress.com
			69419855, // ~ szshaikh - Islamic Gems - SZ - https://szshaikh.wordpress.com
			73929580, // ~ gunjaninks - GunjanInks - gunjaninks - https://gunjaninks.wordpress.com
			70129411, // ~ simofutet - Foolproof Musings Of A Weirdie - Sim - https://simofutet.wordpress.com
			75634817, // ~ bebloggerofficial - Be Blogger (Official) - BeBloggerofficial - http://bebloggerofficial.com
			68672991, // ~ selfmotivationisinspiration - Feelings Do Motivate Too - Ritika Nijhawan - https://selfmotivationisinspiration.wordpress.com
			61094332, // ~ nildamacedopaulino - My Life - nildamacedopaulino - https://nildamacedopaulino.wordpress.com
			76004000, // ~ viviensvoice - Viviensvoice - Vivien Ayinotu - http://viviensvoice.com
			72190224, // ~ pennylanethoughts - Penny Wilson Writes - Penny Wilson Writes - http://pennywilsonwrites.com
			68804394, // ~ wanderingwaffles - Wandering Waffles - Wandering Waffles - http://wanderingwaffles.com
			59654271, // ~ dystopiancitznblog - DystopianCitzn Blog - Ayah - https://dystopiancitznblog.wordpress.com
			69922209, // ~ booknerdtravels - A Booknerd Travels - Annie - https://booknerdtravels.wordpress.com
			46544872, // ~ fictiontoactual - Actualize Dreams - David Web Designer - https://fictiontoactual.wordpress.com
			76555404, // ~ appletomypiee - appletomypiee - appletomypiee - https://appletomypiee.wordpress.com
			59180997, // ~ daisymae2017 - WELCOME TO CRYSTAL'S SITE(ORIGINALLY COUNTRY LIVING) - Crystal Stewart - https://daisymae2017.wordpress.com
			76045835, // ~ lisayoungphotographyportfolio - Bella Capture - L Young - http://bellacapture.net
			76665336, // ~ ourbeautifullies - Our Beautiful Lies - ourbeautifullies - http://ourbeautifullies.com
			// 66565216, // ~ kimberlyfren - This Girl's Got Curves - kimberlyf - https://thisgirlsgotcurves.wordpress.com
			76141811, // ~ crawlingtocoding - Crawling to Coding - crawlingtocoding - https://crawlingtocoding.wordpress.com
			52949380, // ~ nsmtechnicals - Nsm.Technicals - Suraj singh - https://nsmtechnicals.wordpress.com
			46338578, // ~ yaskhan66 - yaskhan - yassy - https://yassy66.wordpress.com
			68821911, // ~ dhilshaa -  "The Interminable Thoughts✍️" - Dhilshaa❤ - https://dhilshaa.wordpress.com
			76221427, // ~ nvinside - CK’s Technology News - CHEF-KOCH - https://chefkochblog.wordpress.com
			68464086, // ~ egates49yahoocom - Eddie Hotel - Ed "Hotel" Gates - https://eddiehotel27.wordpress.com
			33336689, // ~ omabdalrahmaan - Try to get it! - Sohair - https://omabdalrahmaan.wordpress.com
			72732533, // ~ webworksdesigners - ProgWiz - WebWorks - https://webworksdesigners.wordpress.com
			68666696, // ~ mysticwriter2002 - poetic essence - mysticwriter2002 - https://poetricessence.wordpress.com
			76122503, // ~ yuulye - A Qoder Blog ✍️ - yuulye - https://yuulye.wordpress.com
			74005977, // ~ sachinsnagaraj - SN Designs - sachinsnagaraj - https://sachinnagaraja.wordpress.com
			// 35170000, // ~ tonyburgess1969 - The Tony Burgess Blog - Tony Burgess - http://tonyburgess1969.net
			69840324, // ~ touchmyspinebookreviews - Touch My Spine Book Reviews  - Dani☆Touch My Spine Book Reviews☆ - http://touchmyspinebookreviews.com
			71725908, // ~ innalearnsjs - Inna Learns JS - innalearnsjs - https://innalearnsjs.wordpress.com
		];

		var found = false;
		if ( feed && feed.feed_ID ) {
			for ( var i = 0; i < white.length; i++ ) {
				if ( white[ i ] == feed.feed_ID ) {
					found = true;
					break;
				}
			}
		}

		var newClasses = classes;
		if ( ! found ) {
			newClasses += ' hidden';
		}

		console.log( newClasses, found );

		return (
			<Card className={ newClasses } onClick={ onClick }>
				{ ! compact && postByline }
				{ showPrimaryFollowButton &&
					followUrl && (
						<FollowButton
							siteUrl={ followUrl }
							followSource={ followSource }
							railcar={ post.railcar }
						/>
					) }
				{ readerPostCard }
				{ this.props.children }
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isExpanded: isReaderCardExpanded( state, ownProps.postKey ),
	} ),
	{ expandCard: expandCardAction }
)( ReaderPostCard );
