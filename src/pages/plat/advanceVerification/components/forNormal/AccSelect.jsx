import React from 'react';
import { isNil } from 'ramda';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectAccount, selectAllAccount } from '@/services/user/expense/expense';
import { Selection } from '@/pages/gen/field';

const resSelectProps = {
  labelKey: 'accountNo',
  valueKey: 'id',
  columns: [
    { title: '户名', dataIndex: 'holderName', span: 8 },
    { title: '账户', dataIndex: 'accountNo', span: 8 },
    { title: '银行', dataIndex: 'bankName', span: 4 },
    { title: '网点', dataIndex: 'bankBranch', span: 4 },
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
    const { resId, suppId } = this.props;
    if (!isNil(suppId)) {
      this.fetchData(undefined, suppId);
    } else if (!isNil(resId)) {
      this.fetchData(resId, undefined);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      const { suppId, resId, reimType1, reasonType } = snapshot;
      if (reimType1 === 'BUSINESS' && reasonType !== '04') {
        this.fetchAllData();
        return;
      }
      if (!isNil(suppId)) {
        this.fetchData(undefined, suppId);
      } else if (!isNil(resId)) {
        this.fetchData(resId, undefined);
      }
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { resId, suppId, reimType1, reasonType, reasonId } = this.props;
    if (
      prevProps.resId !== resId ||
      prevProps.suppId !== suppId ||
      prevProps.reimType1 !== reimType1 ||
      prevProps.reasonId !== reasonId ||
      prevProps.reasonType !== reasonType
    ) {
      return { resId, suppId, reimType1, reasonType, reasonId };
    }
    return null;
  }

  fetchData = (resId, suppId) => {
    resId !== '' &&
      suppId !== '' &&
      selectAccount(resId, suppId).then(resp =>
        this.setState({
          dataSource: (Array.isArray(resp.response) ? resp.response : []).map(item => ({
            ...item,
            accountNo: item.accountNo.replace(/(\d{4})(?=\d)/g, '$1 '),
          })),
        })
      );
  };

  fetchAllData = () => {
    selectAllAccount().then(resp =>
      this.setState({
        dataSource: (Array.isArray(resp.response) ? resp.response : []).map(item => ({
          ...item,
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
    return (
      // <SelectWithCols
      //   {...resSelectProps}
      //   value={value}
      //   onChange={this.onChange}
      //   dataSource={dataSource}
      //   selectProps={{
      //     // showSearch: true,
      //     dropdownMatchSelectWidth: false,
      //     dropdownStyle: { width: 700 },
      //     style: { width: '100%' },
      //     disabled,
      //   }}
      // />
      <Selection.Columns
        source={dataSource}
        transfer={{ key: 'id', code: 'id', name: 'accountNo' }}
        columns={resSelectProps.columns}
        value={value && Number(value.id)}
        // placeholder="请选择报销申请人"
        showSearch
        onColumnsChange={this.onChange}
        dropdownMatchSelectWidth={false}
        dropdownStyle={{ width: 700 }}
        disabled={disabled}
      />
    );
  }
}

export default AccSelect;
