import React, { PureComponent } from 'react';
// import { Table, Divider, Switch } from 'antd';
import { request } from '@/utils/networkUtils';
import { toQs } from '@/utils/stringUtils';
import Transfer, { treeToPlain, plainToTree } from '@/components/common/TreeTransfer';
import { Tooltip } from 'antd';
import { create, update, findResById } from '@/services/plat/res/resprofile';

// 复合能力列表树
const fetchTreeApi = '/api/base/v1/capasets/tree';
// 资源能力-复合能力类型列表
const fetchTableApi = '/api/person/v1/res/capasets';
// 资源能力-新增
const resCapaAddApi = '/api/person/v1/res/capas';
// 资源能力-删除
const resCapaDeleteApi = '/api/person/v1/res/capa/del';

const structure = {
  id: 'id',
  pid: 'upperId',
  children: 'children',
  selected: 'selected',
  resCapaId: 'resCapaId',
  eqvaRatio: 'eqvaRatio',
  dsc: 'dsc',
  resCapaNo: 'resCapaNo',
};

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

class CapasetTreeTransfer extends React.Component {
  state = {
    dataSource: [],
  };

  componentDidMount() {
    this.fetchList();
  }

  fetchList = () => {
    const { resId } = this.props;
    request.get(fetchTreeApi).then(data => {
      if (data.response && data.response.ok) {
        const { response } = data;
        const tree = Array.isArray(response.datum) ? response.datum : [];
        const { plain } = treeToPlain(tree, structure);
        if (resId) {
          request.get(toQs(fetchTableApi, { resId, limit: 0 })).then(dataTable => {
            if (dataTable.response && dataTable.status === 200) {
              const tablePlain = Array.isArray(dataTable.response.rows)
                ? dataTable.response.rows
                : [];
              tablePlain.map(table => {
                if (table.capaNo) {
                  plain.find(p => p.no === table.capaNo)[structure.selected] = true;
                  plain.find(p => p.no === table.capaNo)[structure.resCapaId] = table.id;
                  // plain.find(p => p.no === table.capaNo)[structure.eqvaRatio] = table.eqvaRatio;
                  // plain.find(p => p.no === table.capaNo)[structure.dsc] = table.capaDesc;
                  plain.find(p => p.no === table.capaNo)[structure.resCapaNo] = table.resCapaNo;
                }
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

  onChange = async (activeKeys, activeData, newDataSource) => {
    const { onChange, resId } = this.props;
    // eslint-disable-next-line
    // console.warn('activeKeys --->', activeKeys, activeData, newDataSource);
    const newData = activeData.map(data => ({
      entryId: data.itemId,
      entryType: '2', // 复合能力主数据新增资源能力-实体类型为2
      resId,
      leveldId: data.leveldId,
    }));

    const result = await request.post(resCapaAddApi, {
      body: { resCapaList: newData, resId, entryType: '2' },
    });

    if (onChange) onChange(activeData);

    if (result.status === 200) {
      this.fetchList();
      return true;
    }
    return null;
  };

  onDelete = async (activeKeys, activeData) => {
    // 获取资源能力id
    const ids = activeData.map(data => data.resCapaId);
    // 发送删除请求
    const result = await request.patch(resCapaDeleteApi, { body: { delList: ids } });
    if (result.status === 200) {
      this.fetchList();
      return true;
    }
    return null;
  };

  render() {
    const { dataSource } = this.state;
    const columns = [
      {
        title: '编号',
        dataIndex: 'resCapaNo',
        key: 'resCapaNo',
        align: 'center',
        width: '15%',
      },
      {
        title: '复合能力',
        dataIndex: 'text',
        key: 'text',
        align: 'center',
        width: '35%',
        render: (value, row, index) => {
          if (row.capasetLevelDId) {
            return (
              <div>
                {row.jobType1}-{row.jobType2}-{value}
              </div>
            );
          }
          return (
            <div>
              {row.jobType1}-{row.jobType2}
            </div>
          );
        },
      },
      {
        title: '当量系数',
        dataIndex: 'eqvaRatio',
        key: 'eqvaRatio',
        align: 'center',
        width: '15%',
      },
      {
        title: '能力描述',
        dataIndex: 'dsc',
        key: 'dsc',
        align: 'left',
        width: '35%',
        render: (value, row, key) =>
          value && value.length > 15 ? (
            <Tooltip placement="left" title={<pre>{value}</pre>}>
              <span>{`${value.substr(0, 15)}...`}</span>
            </Tooltip>
          ) : (
            <span>{value}</span>
          ),
      },
    ];

    return (
      <Transfer
        ignoreCase
        type="plain"
        text="text"
        dataSource={dataSource}
        structure={structure}
        columns={columns}
        onChange={this.onChange}
        onDelete={this.onDelete}
        tableProps={{ pagination: defaultPagination, scroll: { y: 400 } }}
        height="450"
      />
    );
  }
}

export default CapasetTreeTransfer;
