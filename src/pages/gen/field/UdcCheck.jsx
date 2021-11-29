import React from 'react';
import { FormattedMessage } from 'umi/locale';
import { queryUdc } from '@/services/gen/app';
import AsyncCheck from '@/components/common/AsyncCheck';
// import PropTypes from 'prop-types';

// Stateless function components cannot be given refs. Attempts to access that ref will fail.
class UdcCheck extends React.PureComponent {
  // static propTypes = {
  //   code: PropTypes.string.isRequired,
  // };

  render() {
    const { code, expirys, ...restProps } = this.props;
    return (
      <AsyncCheck
        source={() => queryUdc(code, expirys).then(resp => resp.response)}
        {...restProps}
      />
    );
  }
}

export default UdcCheck;
