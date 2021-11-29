import React, { PureComponent } from 'react';
import { Table, Divider, Switch } from 'antd';
import { request } from '@/utils/networkUtils';
import { toQs } from '@/utils/stringUtils';
import Transfer, { treeToPlain, plainToTree } from '@/components/common/TreeTransfer';

const fetchTreeApi = '/api/base/v1/capaAbilities';
const fetchTableApi = '/api/base/v1/capaAbilities/{capaId}';

const structure = {
  id: 'id',
  pid: 'upperId',
  children: 'children',
  selected: 'selected',
};

class SearchTree extends React.Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    this.fetchList();
  }

  fetchList = () => {
    const { capaId } = this.props;
    request.get(fetchTreeApi).then(data => {
      if (data.response && data.response.ok) {
        const { response } = data;
        const tree = Array.isArray(response.datum) ? response.datum : [];
        const { plain } = treeToPlain(tree, structure);
        if (capaId) {
          request.get(fetchTableApi.replace('{capaId}', capaId)).then(dataTable => {
            if (dataTable.response && dataTable.response.ok) {
              const tablePlain = Array.isArray(dataTable.response.datum)
                ? dataTable.response.datum
                : [];
              tablePlain.map(table => {
                // TODO: 修改
                plain.find(p => p.no === table.capaNo)[structure.selected] = true;
                return table;
              });
              this.setState({ dataSource: plain });
            } else {
              this.setState({
                dataSource: plain,
              });
            }
          });
        } else {
          this.setState({
            dataSource: plain,
          });
        }
      }
    });
  };

  onChecked = (checked, record) => {
    const { onChange } = this.props;
    const { dataSource } = this.state;
    const { id, selected } = structure;
    const newData = dataSource.map(data => {
      if (data[id] === record[id]) {
        return {
          ...record,
          mustFlag: checked ? 1 : 0,
        };
      }
      return data;
    });
    this.setState({
      dataSource: newData,
    });
    if (onChange) {
      const { leafs } = plainToTree(newData, structure);
      const activeData = leafs.filter(l => l[selected]);
      onChange(activeData);
    }
  };

  onChange = (activeKeys, activeData, newDataSource) => {
    const { onChange } = this.props;
    // eslint-disable-next-line
    console.warn('activeKeys --->', activeKeys, activeData);
    this.setState({
      dataSource: newDataSource,
    });
    if (onChange) onChange(activeData);
  };

  onStatChange = (activeKeys, record) => {
    const { onStatChange } = this.props;
    // eslint-disable-next-line
    console.warn('activeKeys --->', activeKeys, record);
    // this.setState({
    //   dataSource: newDataSource,
    // });

    // if (onStatChange)
    //   onStatChange(activeData).then(() => {
    //     this.fetchList();
    //   });
  };

  render() {
    const { dataSource } = this.state;
    const columns = [
      {
        title: '编号',
        dataIndex: 'itemId',
        key: 'itemId',
      },
      {
        title: '能力名称',
        dataIndex: 'text',
        key: 'text',
      },
      {
        title: '能力描述',
        dataIndex: 'dsc',
        key: 'dsc',
      },
      {
        title: '是否必需',
        dataIndex: 'mustFlag',
        key: 'mustFlag',
        render: (text, record, index) => (
          <Switch checked={!!text} onChange={checked => this.onStatChange(checked, record)} />
        ),
      },
    ];

    return (
      <Transfer
        type="plain"
        text="text"
        dataSource={dataSource}
        structure={structure}
        columns={columns}
        onChange={this.onChange}
      />
    );
  }
}

export default SearchTree;
