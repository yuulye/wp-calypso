/**
 * @format
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';

const cssReload = function() {
	if ( config.isEnabled( 'css-hot-reload' ) ) {
		asyncRequire( 'lib/css-hot-reload', cssHotReload => cssHotReload() );
	}
};
export default ( process.env.NODE_ENV === 'development' ? cssReload : noop );
