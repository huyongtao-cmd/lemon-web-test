import React from 'react';
import { selectUsers } from '@/services/user/management/leads';
import { Select, Spin } from 'antd';

const resSelectProps = {
  labelKey: 'name',
  valueKey: 'id',
  columns: [{ title: '编号', dataIndex: 'code' }, { title: '名称', dataIndex: 'name' }],
};

class MulResSelect extends React.Component {
  state = {
    dataSource: [],
    // tmpl: [],
    // loading: true,
  };

  // componentDidMount() {
  //   selectUsers().then(res => {
  //     this.setState({
  //       dataSource: Array.isArray(res.response) ? res.response : [],
  //       // tmpl: res.response || [],
  //       loading: false,
  //     });
  //   });
  // }

  onChange = (value, selectedOptions) => {
    const { onChange } = this.props;
    // console.log('changed', value);
    // onChange && onChange(value.map(v => v.key));
    onChange && onChange(value);
  };

  // d => d.code.indexOf(value) > -1 || d.name.indexOf(value) > -1
  onSearch = (input, option) => option.props.children.indexOf(input) >= 0;

  render() {
    const { dataSource } = this.state;
    const { value, disabled, selSource, loading } = this.props;

    // console.log('inv', dataSource, value);

    return loading ? (
      <Spin size="small" />
    ) : (
      <Select
        disabled={disabled}
        style={{ width: '100%' }}
        value={value || []}
        onChange={this.onChange}
        // source={dataSource.map(d => ({ ...d, name: `${d.name} ${d.code}` }))}
        showSearch
        filterOption={this.onSearch}
        // onSearch={this.onSearch}
        mode="multiple"
      >
        {selSource.map(d => (
          <Select.Option key={d.id}>{d.name}</Select.Option>
        ))}
      </Select>
    );
  }
}

export default MulResSelect;
