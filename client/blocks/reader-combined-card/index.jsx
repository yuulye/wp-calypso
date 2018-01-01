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
