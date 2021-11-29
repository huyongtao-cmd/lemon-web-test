import React from 'react';
import { isNil } from 'ramda';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectAccount } from '@/services/user/expense/expense';

const resSelectProps = {
  labelKey: 'accountNo',
  valueKey: 'id',
  columns: [
    { title: '账户', dataIndex: 'accountNo', span: 12 },
    { title: '银行', dataIndex: 'bankName', span: 6 },
    { title: '网点', dataIndex: 'bankBranch', span: 6 },
  ],
};

// accountNo: "576633333788662999"
// bankBranch: "徐汇支行"
// bankName: "中国银行"
// defaultFlag: null
// holderName: "刘醒"
// id: 2

class AccSelect extends React.Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    const { resId } = this.props;
    !isNil(resId) && this.fetchData(resId);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      !isNil(snapshot) && this.fetchData(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { resId } = this.props;
    if (prevProps.resId !== resId && !isNil(resId)) {
      return resId;
    }
    return null;
  }

  fetchData = resId => {
    selectAccount(resId).then(resp =>
      this.setState({
        dataSource: (Array.isArray(resp.response) ? resp.response : []).map(item => ({
          ...item,
          // id: item.id,
          // code: item.id,
          accountNo: item.accountNo.replace(/(\d{4})(?=\d)/g, '$1 '),
        })),
      })
    );
  };

  onChange = (value, selectedOptions) => {
    const { onChange } = this.props;
    onChange && onChange(value);
  };

  render() {
    const { dataSource } = this.state;
    const { value, disabled } = this.props;
    // console.log(value);
    return (
      <SelectWithCols
        {...resSelectProps}
        value={value}
        onChange={this.onChange}
        dataSource={dataSource}
        selectProps={{
          dropdownMatchSelectWidth: false,
          dropdownStyle: { width: 440 },
          style: { width: '100%' },
          disabled,
        }}
      />
    );
  }
}

export default AccSelect;
