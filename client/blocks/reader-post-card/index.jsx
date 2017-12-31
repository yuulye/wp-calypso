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
			74221510,
			69435401,
			68672991,
			40806253,
			36495360,
			73453524,
			63006096,
			73868163,
			65985495,
			24986611,
			71666708,
			67681209,
			72190224,
			382486,
			33336689,
			76555404,
			61094332,
			76004000,
			75634817,
			71725908,
			59180997,
			76045835,
			72732533,
			73929580,
			69922209,
			74672960,
			68464086,
			76141811,
			52949380,
			59459306,
			46544872,
			68804394,
			69419855,
			64756695,
			59654271,
			68821911,
			75424596,
			70129411,
			66756476,
			35170000,
			46338578,
			74005977,
			76665336,
			76122503,
			76221427,
			69840324,
			66565216,
			68666696,
			75255412,
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
