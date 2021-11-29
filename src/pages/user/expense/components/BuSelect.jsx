import React from 'react';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectBu } from '@/services/user/expense/expense';

const resSelectProps = {
  labelKey: 'buName',
  valueKey: 'id',
  columns: [
    { title: '名称', dataIndex: 'buName', span: 24 },
    // { title: '银行', dataIndex: 'bankName', span: 6 },
    // { title: '网点', dataIndex: 'bankBranch', span: 6 },
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
    // const { resId } = this.props;
    selectBu().then(resp =>
      this.setState({
        dataSource: Array.isArray(resp.response) ? resp.response : [],
        tmpl: Array.isArray(resp.response) ? resp.response : [],
      })
    );
  }

  onChange = (value, selectedOptions) => {
    const { onChange } = this.props;
    onChange && onChange(value);
  };

  onSearch = value => {
    const { tmpl } = this.state;
    const newDataSource = tmpl.filter(
      d => d.buName.indexOf(value) > -1 || d.buNo.indexOf(value) > -1
    );
    this.setState({ dataSource: newDataSource });
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
        columns={[
          { dataIndex: 'buNo', title: '编号', span: 12 },
          { dataIndex: 'buName', title: '名称', span: 12 },
        ]}
        selectProps={{
          // dropdownMatchSelectWidth: false,
          // dropdownStyle: { width: 440 },
          showSearch: true,
          onSearch: this.onSearch,
          style: { width: '100%' },
          disabled,
        }}
      />
    );
  }
}

export default AccSelect;
