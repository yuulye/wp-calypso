/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { get, size, filter, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import { getStreamUrl } from 'reader/route';
import ReaderAvatar from 'blocks/reader-avatar';
import ReaderSiteStreamLink from 'blocks/reader-site-stream-link';
import ReaderCombinedCardPost from './post';
import { keysAreEqual, keyForPost } from 'lib/feed-stream-store/post-key';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import { recordTrack } from 'reader/stats';
import { getSiteName } from 'reader/get-helpers';
import FollowButton from 'reader/follow-button';

class ReaderCombinedCard extends React.Component {
	static propTypes = {
		posts: PropTypes.array.isRequired,
		site: PropTypes.object,
		feed: PropTypes.object,
		onClick: PropTypes.func,
		isDiscover: PropTypes.bool,
		postKey: PropTypes.object.isRequired,
		selectedPostKey: PropTypes.object,
		showFollowButton: PropTypes.bool,
		followSource: PropTypes.string,
	};

	static defaultProps = {
		isDiscover: false,
		showFollowButton: false,
	};

	componentDidMount() {
		this.recordRenderTrack();
	}

	componentWillReceiveProps( nextProps ) {
		if (
			this.props.postKey.feedId !== nextProps.postKey.feedId ||
			this.props.postKey.blogId !== nextProps.postKey.blogId ||
			size( this.props.posts ) !== size( nextProps.posts )
		) {
			this.recordRenderTrack( nextProps );
		}
	}

	recordRenderTrack = ( props = this.props ) => {
		const { postKey, posts } = props;

		recordTrack( 'calypso_reader_combined_card_render', {
			blog_id: postKey.blogId,
			feed_id: postKey.feedId,
			post_count: size( posts ),
		} );
	};

	render() {
		const {
			posts,
			site,
			feed,
			postKey,
			selectedPostKey,
			onClick,
			isDiscover,
			translate,
		} = this.props;
		const feedId = postKey.feedId;
		const siteId = postKey.blogId;
		const siteIcon = get( site, 'icon.img' );
		const feedIcon = get( feed, 'image' );
		const streamUrl = getStreamUrl( feedId, siteId );
		const siteName = getSiteName( { site, post: posts[ 0 ] } );
		const isSelectedPost = post => keysAreEqual( keyForPost( post ), selectedPostKey );
		const followUrl = ( feed && feed.URL ) || ( site && site.URL );
		const mediaCount = filter( posts, post => ! isEmpty( post.canonical_media ) ).length;

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

		var newClasses = 'reader-combined-card';
		if ( ! found ) {
			newClasses += ' hidden';
		}

		// return false;
		return (
			<Card className={ newClasses }>
				<header className="reader-combined-card__header">
					<ReaderAvatar
						siteIcon={ siteIcon }
						feedIcon={ feedIcon }
						author={ null }
						preferGravatar={ true }
						siteUrl={ streamUrl }
						isCompact={ true }
					/>
					<div className="reader-combined-card__header-details">
						<ReaderSiteStreamLink
							className="reader-combined-card__site-link"
							feedId={ feedId }
							siteId={ siteId }
						>
							{ siteName }
						</ReaderSiteStreamLink>
						<p className="reader-combined-card__header-post-count">
							{ translate( '%(count)d posts', {
								args: {
									count: posts.length,
								},
							} ) }
						</p>
					</div>
					{ this.props.showFollowButton &&
						followUrl && (
							<FollowButton siteUrl={ followUrl } followSource={ this.props.followSource } />
						) }
				</header>
				<ul className="reader-combined-card__post-list">
					{ posts.map( post => (
						<ReaderCombinedCardPost
							key={ `post-${ post.ID }` }
							post={ post }
							streamUrl={ streamUrl }
							onClick={ onClick }
							isDiscover={ isDiscover }
							isSelected={ isSelectedPost( post ) }
							showFeaturedAsset={ mediaCount > 0 }
						/>
					) ) }
				</ul>
				{ feedId && <QueryReaderFeed feedId={ +feedId } includeMeta={ false } /> }
				{ siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
			</Card>
		);
	}
}

export default localize( ReaderCombinedCard );
