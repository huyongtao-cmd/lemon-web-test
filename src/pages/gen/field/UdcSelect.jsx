import React from 'react';
import { FormattedMessage } from 'umi/locale';
import { queryUdc } from '@/services/gen/app';
import AsyncSelect from '@/components/common/AsyncSelect';
// import PropTypes from 'prop-types';

// Stateless function components cannot be given refs. Attempts to access that ref will fail.
class UdcSelect extends React.PureComponent {
  // static propTypes = {
  //   code: PropTypes.string.isRequired,
  // };

  render() {
    const { code, value, expirys, ...restProps } = this.props;
    return (
      <AsyncSelect
        value={value}
        source={() => queryUdc(code, expirys).then(resp => resp.response)}
        {...restProps}
      />
    );
  }
}

export default UdcSelect;
