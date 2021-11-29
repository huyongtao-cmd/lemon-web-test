import React, { PureComponent } from 'react';
import { isEmpty, isNil } from 'ramda';
import PropTypes from 'prop-types';
import AuthorizedContext from './util';
import { Button } from '../field';

class Block extends PureComponent {
  static propTypes = {
    code: PropTypes.string.isRequired,
  };

  render() {
    const { code, ...restProps } = this.props;
    if (isNil(code)) {
      throw new Error('``Auth.Button`` is Authorized, code must be implemented as props');
    }
    if (isEmpty(code)) return <Button {...restProps} />;
    return (
      <AuthorizedContext.Consumer>
        {allCodes => {
          if (isEmpty(allCodes)) return null;
          if (!allCodes.includes(code)) return null;
          return <Button {...restProps} />; // 这里已经判断了 code ， Button 作为 普通按钮展示即可
        }}
      </AuthorizedContext.Consumer>
    );
  }
}

export default Block;
