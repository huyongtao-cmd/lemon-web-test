import React, { PureComponent, createContext } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'ramda';
import Basic from './Basic';

/**
 * 备用文件，单纯针对按钮的权限,如果有需要，后续就开放使用
 */
// export
const AuthContext = createContext([]);

class Auth extends PureComponent {
  static propTypes = {
    code: PropTypes.string,
  };

  static defaultProps = {
    code: '',
  };

  render() {
    const { code, ...restProps } = this.props;
    return (
      <AuthContext.Consumer>
        {allCodes => {
          if (isEmpty(code) || isEmpty(allCodes)) return <Basic {...restProps} />;
          if (!allCodes.includes(code)) return null;
          return <Basic {...restProps} />;
        }}
      </AuthContext.Consumer>
    );
  }
}

export default Auth;
