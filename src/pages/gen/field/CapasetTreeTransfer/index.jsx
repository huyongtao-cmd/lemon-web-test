import React, { Component } from 'react';
import { Switch } from 'antd';
import { request } from '@/utils/networkUtils';
import Transfer, { treeToPlain, plainToTree } from '@/components/common/TreeTransfer';

const fetchTreeApi = '/api/base/v1/capas/tree';
const fetchTableApi = '/api/base/v1/capasetCapas/{capasetLevelId}';

const structure = {
  id: 'id',
  pid: 'upperId',
  children: 'children',
  selected: 'selected',
  mustFlag: 'mustFlag',
  capaKey: 'capaKey',
};

class SearchTree extends Component {
  state = {
    dataSource: [],
    tableSource: [],
  };

  componentDidMount() {
    this.fetchList();
  }

  fetchList = () => {
    const { capasetId } = this.props;
    request.get(fetchTreeApi).then(data => {
      if (data.response && data.response.ok) {
        const { response } = data;
        const tree = Array.isArray(response.datum) ? response.datum : [];
        const { plain } = treeToPlain(tree, structure);
        if (capasetId) {
          request.get(fetchTableApi.replace('{capasetLevelId}', capasetId)).then(dataTable => {
            if (dataTable.response && dataTable.response.ok) {
              const tablePlain = Array.isArray(dataTable.response.datum)
                ? dataTable.response.datum
                : [];
              tablePlain.map(table => {
                const plainNeedModified = plain.find(p => p.no === table.capaNo);
                plainNeedModified && (plainNeedModified[structure.selected] = true);
                plainNeedModified && (plainNeedModified[structure.mustFlag] = table.mustFlag);
                plainNeedModified && (plainNeedModified[structure.capaKey] = table.capaKey);
                return table;
              });
              // console.warn(plain);
              this.setState({ dataSource: plain, tableSource: tablePlain });
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

  onChange = (activeKeys, activeData, newDataSource) => {
    const { onChange } = this.props;
    // eslint-disable-next-line
    // console.warn('activeKeys --->', activeKeys, activeData);
    this.setState({
      dataSource: newDataSource,
    });
    const { tableSource } = this.state;
    const tableCapaNo = tableSource.map(table => table.capaNo);
    const filteredData = activeData.filter(active => !tableCapaNo.includes(active.no));
    if (!filteredData.length) return;
    if (onChange)
      onChange(filteredData).then(() => {
        this.fetchList();
      });
  };

  onDelete = async (selectedRowKeys, selectedRows) => {
    const { tableSource } = this.state;
    const selectedCapaNo = selectedRows.map(selected => selected.no);
    const { onDelete } = this.props;
    const deleteKeys = tableSource
      .filter(table => selectedCapaNo.indexOf(table.capaNo) > -1)
      .map(table => table.id);
    if (onDelete) {
      const result = await onDelete(deleteKeys);
      return result;
    }
    return true;
  };

  onStatChange = (checked, record) => {
    const { onStatChange } = this.props;
    // eslint-disable-next-line
    // console.warn('activeKeys --->', checked, record);
    const { tableSource } = this.state;
    const selectedCapaNo = record.no;
    const selected = tableSource.find(table => table.capaNo === selectedCapaNo);
    const statusObj = {
      ...selected,
      mustFlag: checked ? 1 : 0,
    };
    if (onStatChange)
      onStatChange(statusObj).then(() => {
        this.fetchList();
      });
  };

  render() {
    const { dataSource } = this.state;
    const { buttons } = this.props;
    const columns = [
      {
        title: '编号',
        dataIndex: 'capaKey', // real capaNo
        key: 'capaKey',
        className: 'text-center',
        width: '30%',
      },
      {
        title: '能力名称',
        dataIndex: 'text',
        key: 'text',
        width: '30%',
        render: (value, record) => {
          // 没有能力级别的时候，取 text ； 有能力级别的时候，取能力级别名称 capaName (capa_name-value)
          const { capaName } = record;
          return capaName || value;
        },
      },
      {
        title: '能力描述',
        dataIndex: 'dsc',
        width: '25%',
        key: 'dsc',
        render: value => <pre>{value}</pre>,
      },
      {
        title: '是否必需',
        dataIndex: 'mustFlag',
        width: '15%',
        className: 'text-center',
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
        buttons={buttons}
        dataSource={dataSource}
        structure={structure}
        columns={columns}
        onChange={this.onChange}
        onDelete={this.onDelete}
        tableProps={{
          pagination: false,
          scroll: {
            y: 400,
          },
        }}
      />
    );
  }
}

export default SearchTree;
