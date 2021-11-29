/* eslint-disable prefer-const */
/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable react/destructuring-assignment */
import React from 'react';
import { Cascader, message, Checkbox } from 'antd';
import { request } from '@/utils/networkUtils';
import styles from './index.less';

// const getHistoryVersion = '/api/org/v1/bu/backUp'; // get
// const multiColumnSelectBu = '/api/org/v1/bu/multicol/{id}'; // get

const getVersionBuList = '/api/org/v1/bu/versionBu/{flag}';

class BuVersionSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buVersionList: [],
      flag: 'active',
    };
  }

  componentDidMount() {
    this.getVersionBuListHandle('active');
  }

  getVersionBuListHandle = flag => {
    request.get(getVersionBuList.replace('{flag}', flag)).then(res => {
      const { response = [] } = res;
      if (response && response.length === 1) {
        this.setState({ buVersionList: response[0].children || [] });
      } else {
        this.setState({ buVersionList: response || [] });
      }
    });
  };

  displayRender = label => label[label.length - 1];

  onBoxChange = e => {
    const flag = e.target.checked ? 'all' : 'active';
    this.setState({
      flag,
    });
    this.getVersionBuListHandle(flag);
  };

  filter = (inputValue, path) =>
    path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

  render() {
    const {
      onChange,
      defaultValue,
      value,
      disabled = false,
      allowClear = true,
      placeholder = '请选择BU',
    } = this.props;
    const { flag, buVersionList } = this.state;
    return (
      <div className={styles.buVersionBox}>
        <div className={styles.buVersionSelect}>
          <Cascader
            allowClear={allowClear}
            disabled={disabled}
            displayRender={this.displayRender}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            defaultValue={defaultValue}
            options={buVersionList}
            showSearch={this.filter}
            popupClassName={styles.buVersionSelectPop}
          />
        </div>
        <div className={styles.buVersionCheckbox}>
          <Checkbox onChange={this.onBoxChange} value={flag === 'all'}>
            显示已关闭
          </Checkbox>
        </div>
      </div>
    );
  }
}

export default BuVersionSelect;
