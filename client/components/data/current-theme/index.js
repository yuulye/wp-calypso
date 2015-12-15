/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import omit from 'lodash/object/omit';

/**
 * Internal dependencies
 */
import { fetchCurrentTheme } from 'lib/themes/actions';
import { getCurrentTheme } from 'lib/themes/selectors/current-theme';

/**
 * Fetches the currently active theme of the supplied site
 * and passes it to the supplied child component.
 */
const CurrentThemeData = React.createClass( {

	propTypes: {
		children: React.PropTypes.element.isRequired,
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		// The following props aren't part of this module's public interface,
		// since they are provided by the `connect()` call that is wrapped around
		// `CurrentThemeData` before it is exported.
		currentTheme: React.PropTypes.shape( {
			name: React.PropTypes.string,
			id: React.PropTypes.string
		} ),
		fetchCurrentTheme: React.PropTypes.func.isRequired
	},

	componentDidMount() {
		this.refresh( this.props );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.site && nextProps.site !== this.props.site ) {
			this.refresh( nextProps );
		}
	},

	refresh( props ) {
		if ( ! this.props.currentTheme && props.site ) {
			this.props.fetchCurrentTheme( props.site );
		}
	},

	render() {
		return React.cloneElement( this.props.children, omit( this.props, 'children' ) );
	}
} );

export default connect(
	( state, props ) => Object.assign( {},
		props,
		{
			currentTheme: getCurrentTheme( state, props.site.ID )
		}
	),
	bindActionCreators.bind( null, { fetchCurrentTheme } )
)( CurrentThemeData );
