import React, { PureComponent } from 'react';
import { isEmpty, isNil } from 'ramda';
import PropTypes from 'prop-types';
import AuthorizedContext from './util';

class Block extends PureComponent {
  static propTypes = {
    code: PropTypes.string.isRequired,
  };

  render() {
    const { code, children } = this.props;
    if (isNil(code)) {
      throw new Error('``Auth.Block`` is Authorized, code must be implemented as props');
    }
    if (isEmpty(code)) return <>{children}</>;
    return (
      <AuthorizedContext.Consumer>
        {allCodes => {
          if (isEmpty(allCodes)) return null;
          if (!allCodes.includes(code)) return null;
          return <>{children}</>;
        }}
      </AuthorizedContext.Consumer>
    );
  }
}

export default Block;
