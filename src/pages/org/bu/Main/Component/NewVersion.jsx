import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Card, Col, Row, Button } from 'antd';
import DataTable from '@/components/common/DataTable';
import TreeSearch from '@/components/common/TreeSearch';
import { createConfirm } from '@/components/core/Confirm';
import Loading from '@/components/core/DataLoading';
import { Selection, BuVersion } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import { BuHistoryVersion } from '../Modal';

const DOMAIN = 'orgbu';
@connect(({ dispatch, loading, orgbu }) => ({
  dispatch,
  orgbu,
  loading,
}))
@mountToTab()
class OrgBu extends PureComponent {
  state = {
    buHistoryVisible: false, // 保存历史版本弹框显示
    formData: {},
  };

  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/findbuMainTree` });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  onSelect = selectedKeys => {
    this.fetchData({ id: selectedKeys[0] });
  };

  // 保存历史版本的弹框的取消事件
  buHistoryModal = () => {
    this.setState({
      buHistoryVisible: false,
    });
  };

  // 保存历史版本的弹框的提交事件
  buHistorySubmitModal = () => {
    const { formData } = this.state;
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/buSaveVersion`, payload: formData }).then(res => {
      this.setState({
        buHistoryVisible: false,
      });
    });
  };

  // 显示保存历史版本的弹框事件
  showBtnModel = () => {
    this.setState({
      buHistoryVisible: true,
    });
  };

  gotoArchart = () => {
    router.push(`/org/bu/orgChart`);
  };

  render() {
    const { loading, orgbu, dispatch } = this.props;
    const { list, total, tree, searchForm } = orgbu;
    const { buHistoryVisible, formData } = this.state;
    const { pathname } = window.location;

    const tableProps = {
      rowKey: 'id',
      scroll: {
        x: '150%',
      },
      columnsCache: DOMAIN,
      dispatch,
      loading: loading.effects[`${DOMAIN}/query`],
      expirys: 0,
      total,
      dataSource: list,
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
          title: 'BU编号',
          dataIndex: 'buNo',
          options: {
            initialValue: searchForm.buNo,
          },
        },
        {
          title: 'BU名称',
          dataIndex: 'buName',
          options: {
            initialValue: searchForm.buName,
          },
        },
        {
          title: 'BU类型',
          dataIndex: 'buType',
          options: {
            initialValue: searchForm.buType,
          },
          tag: <Selection.UDC code="ORG.BU_TYPE" placeholder="请选择BU类型" />,
        },
      ],
      leftButtons:
        pathname !== '/org/bu/main'
          ? [
              {
                key: 'add',
                title: '新增',
                className: 'tw-btn-primary',
                icon: 'plus-circle',
                loading: false,
                hidden: false,
                disabled: false,
                minSelections: 0,
                cb: (selectedRowKeys, selectedRows, queryParams) => {
                  router.push(`/org/bu/create`);
                },
              },
              {
                key: 'edit',
                title: '编辑',
                className: 'tw-btn-primary',
                icon: 'form',
                loading: false,
                hidden: false,
                disabled: selectedRowKeys => {
                  const havaClose = selectedRowKeys.find(value => value.buStatus === 'CLOSED');
                  const havaHangup = selectedRowKeys.find(value => value.buStatus === 'PENDING');
                  return selectedRowKeys.length !== 1 || havaClose || havaHangup;
                },
                minSelections: 0,
                cb: (selectedRowKeys, selectedRows, queryParams) => {
                  dispatch({
                    type: `${DOMAIN}/edit`,
                    payload: { buId: selectedRowKeys[0], mode: 'edit' },
                  });
                },
              },
              {
                key: 'active',
                title: '激活',
                className: 'tw-btn-primary',
                icon: 'form',
                loading: false,
                hidden: false,
                disabled: selectedRowKeys => {
                  const havaClose = selectedRowKeys.find(value => value.buStatus === 'CLOSED');
                  const havaActive = selectedRowKeys.find(value => value.buStatus === 'ACTIVE');
                  return selectedRowKeys.length === 0 || havaClose || havaActive;
                },
                minSelections: 0,
                cb: (selectedRowKeys, selectedRows, queryParams) => {
                  createConfirm({
                    content: '确认激活所选记录？',
                    onOk: () =>
                      dispatch({
                        type: `${DOMAIN}/active`,
                        payload: { ids: selectedRowKeys },
                      }),
                  });
                },
              },
              {
                key: 'hangup',
                title: '暂挂',
                className: 'tw-btn-primary',
                icon: 'form',
                loading: false,
                hidden: false,
                disabled: selectedRowKeys => {
                  const havaClose = selectedRowKeys.find(value => value.buStatus === 'CLOSED');
                  const havaHangup = selectedRowKeys.find(value => value.buStatus === 'PENDING');
                  const noActive = selectedRowKeys.find(value => value.buStatus !== 'ACTIVE');
                  return selectedRowKeys.length === 0 || havaClose || havaHangup || noActive;
                },
                minSelections: 0,
                cb: (selectedRowKeys, selectedRows, queryParams) => {
                  createConfirm({
                    content: '确认暂挂所选记录？',
                    onOk: () =>
                      dispatch({
                        type: `${DOMAIN}/hangAndCloseFn`,
                        payload: { ids: selectedRowKeys, type: 'PENDING' },
                      }),
                  });
                },
              },
              {
                key: 'close',
                title: '关闭',
                className: 'tw-btn-primary',
                icon: 'form',
                loading: false,
                hidden: false,
                disabled: selectedRowKeys => {
                  const havaClose = selectedRowKeys.find(value => value.buStatus === 'CLOSED');
                  return selectedRowKeys.length === 0 || havaClose;
                },
                minSelections: 0,
                cb: (selectedRowKeys, selectedRows, queryParams) => {
                  createConfirm({
                    content: '确认关闭所选记录？',
                    onOk: () =>
                      dispatch({
                        type: `${DOMAIN}/hangAndCloseFn`,
                        payload: { ids: selectedRowKeys, type: 'CLOSED' },
                      }),
                  });
                },
              },
              {
                key: 'remove',
                title: '删除',
                className: 'tw-btn-error',
                icon: 'file-excel',
                loading: false,
                hidden: false,
                disabled: selectedRowKeys => selectedRowKeys.length === 0,
                minSelections: 0,
                cb: (selectedRowKeys, selectedRows, queryParams) => {
                  const canDeleteStatus = ['CREATING'];
                  const unLegalRows = selectedRows.filter(
                    ({ buStatus }) => !canDeleteStatus.includes(buStatus)
                  );
                  if (unLegalRows.length) {
                    createMessage({ type: 'warn', description: '只有创建中的BU可以被删除' });
                  } else {
                    createConfirm({
                      content: '是否确认删除?',
                      onOk: () =>
                        dispatch({
                          type: `${DOMAIN}/buDelete`,
                          payload: { delList: selectedRowKeys, mode: 'delete' },
                        }),
                    });
                  }
                },
              },
            ]
          : [],

      columns: [
        {
          title: 'BU编号',
          dataIndex: 'buNo',
          width: 100,
          sorter: true,
          align: 'center',
          // fixed: 'left',
          render: (buNo, rowData) => {
            const href = `/org/bu/particulars?buId=${rowData.id}`;
            return (
              <Link className="tw-link" to={href}>
                {buNo}
              </Link>
            );
          },
        },
        {
          title: 'BU名称',
          dataIndex: 'buName',
          width: 200,
          sorter: true,
          // fixed: 'left',
        },
        {
          title: '父BU',
          dataIndex: 'pname',
          sorter: true,
        },
        {
          title: 'BU状态',
          dataIndex: 'buStatus',
          sorter: true,
          align: 'center',
          width: 200,
          render: (value, row, index) => row.buStatusDesc,
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatus',
          sorter: true,
          align: 'center',
          render: (value, row, index) => row.apprStatusDesc,
        },
        {
          title: '负责人',
          dataIndex: 'inchargeResId',
          sorter: true,
          render: (value, row, index) => row.inchargeResName,
        },
        {
          title: 'BU类型',
          dataIndex: 'buType',
          sorter: true,
          align: 'center',
          render: (value, row, index) => row.buTypeDesc,
        },
        {
          title: '科目模板',
          dataIndex: 'accTmplName',
          sorter: true,
        },
        {
          title: '当前财务年期',
          dataIndex: 'finPeriodName',
          width: '10%',
          sorter: true,
          align: 'right',
        },
        {
          title: '币种',
          dataIndex: 'currCode',
          sorter: true,
          render: (value, row, index) => row.currCodeDesc,
        },
        {
          title: '管理区域码',
          dataIndex: 'regionCode',
          width: '10%',
          sorter: true,
          render: (value, row, index) => row.regionCodeDesc,
        },
      ],
    };
    const mergeDeep = child =>
      Array.isArray(child)
        ? child.map(item => ({
            ...item,
            buName: item.className,
            child: item.child ? mergeDeep(item.child) : null,
          }))
        : [];

    const treeData = mergeDeep(tree);

    return (
      <>
        <Row gutter={5}>
          {/*  paddingTop 是为了跟右边顶部对齐 */}
          <Col
            span={6}
            style={{ borderRight: '1px dashed #e8e8e8', paddingRight: '24px', minHeight: '600px' }}
          >
            {!loading.effects[`${DOMAIN}/findbuMainTree`] ? (
              <>
                <Button type="primary" onClick={this.gotoArchart}>
                  切换查看模式
                </Button>
                <TreeSearch
                  showSearch
                  showBtn={pathname !== '/org/bu/main' ? 'showBtn' : false}
                  showBtnModel={this.showBtnModel}
                  placeholder="请输入关键字"
                  treeData={treeData}
                  onSelect={this.onSelect}
                  defaultExpandedKeys={treeData.map(item => `${item.id}`)}
                />
              </>
            ) : (
              <Loading />
            )}
          </Col>
          <Col span={18}>
            <DataTable {...tableProps} />
          </Col>
        </Row>
        <BuHistoryVersion
          formData={formData}
          loading={loading}
          visible={buHistoryVisible}
          handleCancel={this.buHistoryModal}
          handleOk={this.buHistorySubmitModal}
        />
      </>
    );
  }
}

export default OrgBu;
