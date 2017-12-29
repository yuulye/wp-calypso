/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addLocaleToPath } from 'lib/i18n-utils';
import LocaleSuggestionsListItem from './list-item';
import QueryLocaleSuggestions from 'components/data/query-locale-suggestions';
import Notice from 'components/notice';
import switchLocale from 'lib/i18n-utils/switch-locale';
import { getLocaleSuggestions } from 'state/selectors';

export class LocaleSuggestions extends Component {
	static propTypes = {
		locale: PropTypes.string,
		path: PropTypes.string.isRequired,
		localeSuggestions: PropTypes.array,
		localeSuggestionsIsFetching: PropTypes.bool,
	};

	static defaultProps = {
		locale: '',
		localeSuggestions: [],
		localeSuggestionsIsFetching: false,
	};

	state = {
		dismissed: false,
	};

	componentWillMount() {
		if ( this.props.locale ) {
			switchLocale( this.props.locale );
		}
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.locale !== nextProps.locale ) {
			switchLocale( nextProps.locale );
		}
	}

	dismiss = () => {
		this.setState( { dismissed: true } );
	};

	getPathWithLocale = locale => {
		return addLocaleToPath( this.props.path, locale );
	};

	render() {
		if ( this.state.dismissed ) {
			return null;
		}

		const { localeSuggestions } = this.props;

		if ( ! localeSuggestions ) {
			return <QueryLocaleSuggestions />;
		}

		const usersOtherLocales = localeSuggestions.filter( function( locale ) {
			return locale.locale !== getLocaleSlug();
		} );

		if ( usersOtherLocales.length === 0 ) {
			return null;
		}

		const localeMarkup = usersOtherLocales.map( locale => {
			return (
				<LocaleSuggestionsListItem
					key={ 'locale-' + locale.locale }
					locale={ locale }
					onLocaleSuggestionClick={ this.dismiss }
					path={ this.getPathWithLocale( locale.locale ) }
				/>
			);
		} );

		return (
			<div className="locale-suggestions">
				<Notice icon="globe" showDismiss={ true } onDismissClick={ this.dismiss }>
					<div className="locale-suggestions__list">{ localeMarkup }</div>
				</Notice>
			</div>
		);
	}
}

export default connect( state => ( {
	localeSuggestions: getLocaleSuggestions( state ),
} ) )( LocaleSuggestions );
