import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Switch, Modal } from 'antd';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatDT } from '@/utils/tempUtils/DateTime';
import DataTable from '@/components/common/DataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import { mountToTab } from '@/layouts/routerControl';
import Link from 'umi/link';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const DOMAIN = 'userRespBroadcast';

@connect(({ loading, userRespBroadcast }) => ({
  loading,
  userRespBroadcast,
}))
@mountToTab()
class DistributeResponseList extends PureComponent {
  state = {
    modelValue: '',
    remarkModelShow: false,
    params: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
    // 资源下拉
    dispatch({
      type: `${DOMAIN}/queryResList`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        disterResId: params && params.disterResId ? params.disterResId.id : undefined,
      },
    });
  };

  getModelInputValue = e => {
    const val = e.target.value;
    this.setState({
      modelValue: val,
    });
  };

  modelHandleOk = () => {
    const { modelValue, params } = this.state;
    const {
      userRespBroadcast: { dataSource },
      dispatch,
    } = this.props;
    const { id, index, respStatus } = params;
    dispatch({
      type: `${DOMAIN}/changeDistStatusFn`,
      payload: {
        id,
        value: {
          respStatus,
          respDesc: modelValue,
        },
      },
    }).then(res => {
      if (res) {
        dataSource[index].respStatus = respStatus;
        dataSource[index].respStatusDesc = respStatus === 'INTERESTED' ? '感兴趣' : '不感兴趣';
        dataSource[index].respDesc = modelValue;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: dataSource,
        });
      }
      this.setState({
        remarkModelShow: false,
        modelValue: '',
        params: {},
      });
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userRespBroadcast: { dataSource, total, searchForm, resSource, resList },
    } = this.props;
    const { remarkModelShow, modelValue } = this.state;

    const tableProps = {
      rowKey: 'key',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '派发编号',
          dataIndex: 'distNo',
          options: {
            initialValue: searchForm.distNo,
          },
          tag: <Input placeholder="请输入派发编号" />,
        },
        {
          title: '派发人',
          dataIndex: 'disterResId',
          options: {
            initialValue: searchForm.disterResId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={resSource}
              onChange={() => {}}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      resSource: resList.filter(
                        d =>
                          d.code.indexOf(value) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    },
                  });
                },
                allowClear: true,
              }}
            />
          ),
        },
      ],
      columns: [
        {
          title: '派发编号',
          dataIndex: 'distNo',
          defaultSortOrder: 'descend',
          align: 'center',
          render: (value, row, index) => {
            const { distId } = row;
            return (
              <Link className="tw-link" to={`/user/distribute/detail?id=${distId}`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '派发对象',
          dataIndex: 'reasonName',
        },
        {
          title: '派发人',
          dataIndex: 'disterResName',
        },
        {
          title: '派发状态',
          dataIndex: 'distStatusDesc',
          align: 'center',
        },
        {
          title: '派发时间',
          dataIndex: 'distTime',
          render: value => <span>{formatDT(value, 'YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
          title: '派发说明',
          dataIndex: 'distDesc',
        },
        {
          title: '响应状态',
          dataIndex: 'respStatus',
          align: 'center',
          width: 140,
          render: (val, row, index) => (
            <Switch
              disabled={row.distStatus !== 'BROADCASTING'}
              checkedChildren="感兴趣"
              unCheckedChildren="不感兴趣"
              checked={val === 'INTERESTED'}
              onChange={(bool, e) => {
                const respStatus = bool ? 'INTERESTED' : 'NOT APPLICABLE';
                const params = {
                  id: row.respondId,
                  respStatus,
                  index,
                };

                this.setState({
                  remarkModelShow: true,
                  params,
                  modelValue: row.respDesc,
                });
              }}
            />
          ),
        },
        {
          title: '响应内容',
          dataIndex: 'respDesc',
        },
        {
          title: '响应时间',
          dataIndex: 'respTime',
          render: value => <span>{formatDT(value, 'YYYY-MM-DD HH:mm:ss')}</span>,
        },
        {
          title: '响应结果',
          dataIndex: 'resResult',
          align: 'center',
          render: (val, row, index) => {
            let showValue = '';
            if (val === 'true') {
              showValue = '抢到任务';
            } else if (val === 'false') {
              showValue = '未抢到任务';
            } else {
              showValue = '';
            }
            return <span>{showValue}</span>;
          },
        },
      ],
      leftButtons: [],
    };

    return (
      <PageHeaderWrapper title="我响应的广播">
        <DataTable {...tableProps} />
        <Modal
          title="响应说明"
          centered
          visible={remarkModelShow}
          onOk={this.modelHandleOk}
          onCancel={() => {
            this.setState({
              remarkModelShow: false,
              modelValue: '',
              params: {},
            });
          }}
        >
          <Input
            placeholder="输入响应说明"
            value={modelValue}
            onChange={e => this.getModelInputValue(e)}
          />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default DistributeResponseList;
