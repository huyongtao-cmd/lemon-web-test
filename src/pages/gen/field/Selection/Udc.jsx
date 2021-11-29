import React from 'react';
import { queryUdc } from '@/services/gen/app';
import Selection from './Basic';

class UdcSelect extends React.PureComponent {
  translate = source => {
    const { filters = [] } = this.props;
    const filterObjects = filters.reduce((prev, curr) => ({ ...prev, ...curr }), {});
    const keys = Object.keys(filterObjects);
    const filteredSource = source.filter(item => {
      const unMatchKeys = keys.filter(key => {
        const sourceValue = item[key];
        const filterValue = filterObjects[key];
        return sourceValue !== filterValue;
      });
      return unMatchKeys.length === 0;
    });
    return filteredSource;
  };

  render() {
    /**
     * filters: [
     *  { key: value }
     *  ...
     * ]
     * eg: filters: [{ ext1: 'FINAL' }]
     */
    const { code, value, expirys, filters = [], ...restProps } = this.props;
    return (
      <Selection
        value={value}
        source={() => queryUdc(code, expirys)}
        resTransform={this.translate}
        {...restProps}
      />
    );
  }
}

export default UdcSelect;
