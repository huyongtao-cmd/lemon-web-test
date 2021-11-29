import React from 'react';
import SelectWithCols from '@/components/common/SelectWithCols';

const columns = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'no', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 10 },
  { dataIndex: 'gender', title: '性别', span: 4 },
];

const source = [
  { no: '80100506', name: '邓正', gender: '男' },
  { no: '80100507', name: '闵谦', gender: '女' },
  { no: 'test', name: 'test', gender: 'test' },
];

class SelectWithColsDemo extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: source.slice(),
    };
  }

  render() {
    const { dataSource } = this.state;

    return (
      <div>
        <div>
          <SelectWithCols
            // 选择框里展示那个字段
            defaultValue={{ no: 'test', name: 'test', gender: 'test' }}
            labelKey="name"
            columns={columns}
            dataSource={source}
            onChange={value => {
              console.log(value);
            }}
            // https://ant.design/components/select-cn/
            selectProps={{
              allowClear: true,
              style: { width: 200 },
            }}
          />
          标准组件 (数据在组件外部)
        </div>
        <br />
        <div>
          <SelectWithCols
            // 选择框里展示那个字段
            labelKey="name"
            defaultValue={{ no: 'test', name: 'test', gender: 'test' }}
            columns={columns}
            dataSource={dataSource}
            onChange={value => {
              console.log(value);
            }}
            // https://ant.design/components/select-cn/
            selectProps={{
              showSearch: true,
              // 搜索函数自己实现。可调用接口。注意节流
              onSearch: value => {
                this.setState({
                  dataSource: source.filter(
                    d => d.no.indexOf(value) > -1 || d.name.indexOf(value) > -1
                  ),
                });
              },
              allowClear: true,
              style: { width: 200 },
            }}
          />
          支持搜索 (数据在组件外部，搜索算法和结果组件外实现)
        </div>
      </div>
    );
  }
}
export default SelectWithColsDemo;
