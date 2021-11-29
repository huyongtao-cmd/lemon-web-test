import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Button, Divider } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import EditableDataTable from '@/components/common/EditableDataTable';
import { Selection } from '@/pages/gen/field';
import { genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import update from 'immutability-helper';
import { isEmpty } from 'ramda';
import TreeSelect from '../../ResTreeSelect';

const { Field } = FieldList;

const DOMAIN = 'probationMid';

@connect(({ loading, probationMid, dispatch }) => ({
  loading,
  probationMid,
  dispatch,
}))
@Form.create({})
@mountToTab()
class ResCapacity extends Component {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryCapaTreeData`,
    });
    dispatch({
      type: `${DOMAIN}/getCapacityList`,
    });
  }

  // 切换弹出窗。
  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        capaTreeDataDetail: [],
        capaTreeDataDetailTotal: 0,
      },
    });
    dispatch({
      type: `${DOMAIN}/queryCapaTreeDataDetail`,
      payload: { ...params },
    });
  };

  queryData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        capaTreeDataDetail: [],
        capaTreeDataDetailTotal: 0,
      },
    });
    if (params.text || params.id.length > 0) {
      dispatch({
        type: `${DOMAIN}/queryCapaTreeDataDetailWithText`,
        payload: { ...params },
      });
    }
  };

  handleModelOk = (e, checkedKeys, checkRows) => {
    const {
      dispatch,
      probationMid: { dataList = [] },
    } = this.props;
    const newCheckRows = checkRows.map(item => {
      // eslint-disable-next-line no-param-reassign
      item.isNew = true;
      // eslint-disable-next-line no-param-reassign
      item.id = genFakeId(-1);
      return item;
    });
    const clearCheckRow = [];
    const dataList2CapaLevelIds = dataList.map(item => item.capaLevelId);
    newCheckRows.forEach(item => {
      if (!dataList2CapaLevelIds.includes(item.capaLevelId)) {
        clearCheckRow.push(item);
      }
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataList: dataList.concat(clearCheckRow),
      },
    });
    this.toggleVisible();
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      probationMid: {
        formData,
        buPicPointItemList,
        capaTreeDataDetail,
        capaTreeDataDetailTotal,
        capaTreeData,
        dataList, // 单项能力列表
        dataListDel, // 删除的单项能力id
        capacityList, // 复合能力列表
        capacityListSelected, // 已选择的复合能力
        capacityListSelectedDelId, // 删除的已选复合能力Id
      },
    } = this.props;

    const fetchDataLoading =
      loading.effects[`${DOMAIN}/queryCapaTreeData`] ||
      loading.effects[`${DOMAIN}/queryCapaTreeDataDetail`] ||
      loading.effects[`${DOMAIN}/queryCapaTreeDataDetailWithText`];

    const { visible } = this.state;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: fetchDataLoading,
      dataSource: capacityListSelected,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      showAdd: false,
      showCopy: false,
      pagination: true,
      enableSelection: false,
      enableDoubleClick: false,
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const ids = selectedRowKeys.filter(item => item > 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            capacityListSelected: capacityListSelected.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
            capacityListSelectedDelId: [...capacityListSelectedDelId, ...ids],
          },
        });
      },
      columns: [
        {
          title: '编号',
          dataIndex: 'capasetNo',
          align: 'center',
          width: 100,
        },
        {
          title: '复合能力',
          dataIndex: 'name',
          align: 'center',
          width: 200,
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          align: 'center',
          width: 100,
        },
        {
          title: '能力描述',
          dataIndex: 'ddesc',
          render: val => <pre>{val}</pre>,
        },
      ],
    };

    const tableColumns = [
      {
        title: '分类',
        dataIndex: 'capaTypeName',
        key: 'capaTypeName',
        align: 'center',
        width: 200,
      },
      {
        title: '单项能力',
        dataIndex: 'text',
        key: 'text',
        align: 'center',
        width: 200,
      },
      {
        title: '能力描述',
        dataIndex: 'dsc',
        key: 'dsc',
        render: val => <pre>{val}</pre>,
      },
    ];

    const tablePropsAbility = {
      rowKey: 'capaLevelId',
      loading: false,
      pagination: true,
      dataSource: dataList,
      total: dataList.length || 0,
      showCopy: false,
      showAdd: false,
      onAdd: newRow => {
        this.setState({
          visible: true,
        });

        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            capaTreeDataDetail: [],
            capaTreeDataDetailTotal: 0,
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const ids = selectedRowKeys.filter(item => item > 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataList: dataList.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.capaLevelId).length
            ),
            dataListDel: [...dataListDel, ...ids],
          },
        });
      },
      columns: [
        {
          title: '分类',
          dataIndex: 'capaTypeName',
          key: 'capaTypeName',
          align: 'center',
          width: 200,
        },
        {
          title: '单项能力',
          dataIndex: 'text',
          key: 'text',
          align: 'center',
          width: 200,
        },
        {
          title: '能力描述',
          dataIndex: 'dsc',
          key: 'dsc',
          render: val => <pre>{val}</pre>,
        },
      ],
    };

    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: dataList.find(item => item.capaLevelId === record.capaLevelId), // Column configuration not to be checked
      }),
      selectedRowKeys: dataList.map(item => item.capaLevelId),
    };

    return (
      <>
        <FieldList
          legend="资源能力"
          layout="horizontal"
          getFieldDecorator={getFieldDecorator}
          col={2}
          noReactive
        >
          <Field name="capacitys" fieldCol={2} style={{ marginLeft: '10px' }} presentational>
            <br />
            <span style={{ color: '#284488' }}>复合能力</span>
            <Row gutter={6}>
              <Col span={22}>
                <Selection
                  value={formData.capacitysId}
                  className="x-fill-100"
                  source={capacityList}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  showSearch
                  placeholder="请选择复合能力"
                  onChange={e => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        capacitysId: e,
                      },
                    });
                  }}
                />
              </Col>
              <Col span={2}>
                <Button
                  className="tw-btn-primary"
                  onClick={() => {
                    if (!formData.capacitysId) {
                      createMessage({
                        type: 'warn',
                        description: '请选择需要添加的复合能力！',
                      });
                      return;
                    }
                    if (
                      !isEmpty(
                        capacityListSelected.filter(
                          v => Number(v.id) === Number(formData.capacitysId)
                        )
                      )
                    ) {
                      createMessage({
                        type: 'warn',
                        description: '复合能力已存在，请勿重复添加！',
                      });
                      return;
                    }
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        capacityListSelected: update(capacityListSelected, {
                          $push: [
                            {
                              ...capacityList.filter(
                                v => Number(v.id) === Number(formData.capacitysId)
                              )[0],
                            },
                          ],
                        }),
                      },
                    });
                  }}
                >
                  添加复合能力
                </Button>
              </Col>
            </Row>
          </Field>
          <Field
            name="capacityListSelected"
            fieldCol={1}
            labelCol={{ span: 0, xxl: 0 }}
            wrapperCol={{ span: 24, xxl: 24 }}
            style={{ marginLeft: '10px' }}
            presentational
            noReactive
          >
            <EditableDataTable {...tableProps} />
          </Field>
        </FieldList>
        <br />
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2} noReactive>
          <Field name="capacity" fieldCol={2} style={{ marginLeft: '10px' }} presentational>
            <span style={{ color: '#284488' }}>单项能力</span>
            <br />
            <Button
              className="tw-btn-primary"
              onClick={() => {
                this.setState({
                  visible: true,
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    capaTreeDataDetail: [],
                    capaTreeDataDetailTotal: 0,
                  },
                });
              }}
            >
              添加单项能力
            </Button>
          </Field>
          <Field
            name="capacityList"
            fieldCol={1}
            labelCol={{ span: 0, xxl: 0 }}
            wrapperCol={{ span: 24, xxl: 24 }}
            style={{ marginLeft: '10px' }}
            presentational
            noReactive
          >
            <EditableDataTable {...tablePropsAbility} />
          </Field>
        </FieldList>
        <TreeSelect
          title="单项能力添加"
          domain={DOMAIN}
          visible={visible}
          dispatch={dispatch}
          queryData={this.queryData}
          fetchData={this.fetchData}
          dataSource={capaTreeDataDetail}
          tableColumns={tableColumns}
          multiple
          loading={fetchDataLoading}
          total={capaTreeDataDetailTotal}
          onOk={this.handleModelOk}
          onCancel={this.toggleVisible}
          treeData={capaTreeData}
          tableRowKey="capaLevelId"
          rowSelection={rowSelection}
        />
      </>
    );
  }
}

export default ResCapacity;
