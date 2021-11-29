import React from 'react';
import { selectUsersWithBu } from '@/services/gen/list';
import SelectWithCols from '@/components/common/SelectWithCols';
import { Spin, Input } from 'antd';

const InputGroup = Input.Group;

const resSelectProps = {
  labelKey: 'name',
  valueKey: 'id',
  columns: [{ title: '编号', dataIndex: 'code' }, { title: '名称', dataIndex: 'name' }],
};

class ResSelect extends React.Component {
  state = {
    dataSource: [],
    loading: true,
  };

  componentDidMount() {
    this.setState({ loading: true });
    selectUsersWithBu().then(res => {
      this.setState({
        loading: false,
        dataSource: Array.isArray(res.response) ? res.response : [],
        tmpl: Array.isArray(res.response) ? res.response : [],
      });
    });
  }

  onChange = (value, selectedOptions) => {
    const { onChange } = this.props;
    // console.log(value);

    onChange && onChange(value);
    // if (level === 0) {
    //   onChange({ type: 'reimType1', value });
    // } else {
    //   onChange({ type: level === 1 ? 'reimType2' : 'reimType3', value });
    // }
  };

  onSearch = value => {
    const { tmpl } = this.state;
    // console.log(value);
    const newDataSource = tmpl.filter(
      d => d.code.indexOf(value) > -1 || d.name.indexOf(value) > -1
    );
    this.setState({ dataSource: newDataSource });
  };

  render() {
    const { dataSource, loading } = this.state;
    const { value, disabled } = this.props;
    // console.log(value);
    return loading ? (
      <Spin size="small" />
    ) : (
      <InputGroup compact>
        <SelectWithCols
          {...resSelectProps}
          value={value}
          onChange={this.onChange}
          dataSource={dataSource}
          selectProps={{
            showSearch: true,
            onSearch: this.onSearch,
            style: { width: '70%' },
            disabled,
          }}
        />
        <Input disabled value={value && value.jobGrade} style={{ width: '30%' }} />
      </InputGroup>
    );
  }
}

export default ResSelect;
