import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Divider, Row, Col, Table, Spin, Button, Input } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import FieldList from '@/components/layout/FieldList';
import { genFakeId } from '@/utils/mathUtils';
import AsyncSelect from '@/components/common/AsyncSelect';
import update from 'immutability-helper';
import { selectSupplier, selectBu } from '@/services/user/Contract/sales';
import { selectOus } from '@/services/gen/list';
import { getcostRuleAbSupp } from '@/services/sys/system/wageCostRule';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'wageCostRule';

@connect(({ loading, wageCostRule }) => ({
  loading,
  wageCostRule,
}))
@mountToTab()
class WageCostRule extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
    });
  }

  // 一般行编辑赋值
  onCellChanged = (rowIndex, rowField, value) => {
    const {
      dispatch,
      wageCostRule: { JDEWageExportDataSource },
    } = this.props;
    const newDataSource = update(JDEWageExportDataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { JDEWageExportDataSource: newDataSource },
    });
  };

  // 选择任务和活动下拉组件赋值
  onSelectChanged = (rowIndex, rowField, value) => {
    const {
      dispatch,
      wageCostRule: { JDEWageExportDataSource },
    } = this.props;
    const newDataSource = update(JDEWageExportDataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { JDEWageExportDataSource: newDataSource },
    });
  };

  handleSave = () => {
    const {
      dispatch,
      wageCostRule: { JDEWageExportDataSource },
    } = this.props;
    const conCorNoError = JDEWageExportDataSource.filter(v => !v.conCorNo);
    const conJdeNoError = JDEWageExportDataSource.filter(v => !v.conJdeNo);
    const conCorIdError = JDEWageExportDataSource.filter(v => !v.conCorId);
    const conBuIdsError = JDEWageExportDataSource.filter(v => !v.conBuIds.length);
    if (conCorNoError.length) {
      createMessage({
        type: 'warn',
        description: `请填写公司代码`,
      });
      return;
    }
    if (conJdeNoError.length) {
      createMessage({
        type: 'warn',
        description: `请填写导出费用编码`,
      });
      return;
    }
    if (conCorIdError.length) {
      createMessage({
        type: 'warn',
        description: `请选择对应公司`,
      });
      return;
    }
    if (conBuIdsError.length) {
      createMessage({
        type: 'warn',
        description: `请选择对应BU`,
      });
      return;
    }
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < JDEWageExportDataSource.length; i++) {
      // eslint-disable-next-line no-plusplus
      for (let j = i + 1; j < JDEWageExportDataSource.length; j++) {
        if (JDEWageExportDataSource[i].conJdeNo === JDEWageExportDataSource[j].conJdeNo) {
          createMessage({
            type: 'warn',
            description: `导出费用编号不能重复!`,
          });
          return;
        }
      }
    }
    dispatch({
      type: `${DOMAIN}/save`,
    });
  };

  render() {
    const { loading, wageCostRule, dispatch } = this.props;
    const {
      outsourcingInfoDataSource,
      JDEWageExportDataSource,
      JDEWageExportTotal,
      _selectedRowKeys,
      disableSaveBtn,
    } = wageCostRule;

    const outsourcingInfoTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      dataSource: outsourcingInfoDataSource,
      pagination: false,
      columns: [
        {
          title: '外包预留字段',
          dataIndex: 'conSup',
          align: 'center',
          width: '50%',
        },
        {
          title: '供应商',
          dataIndex: 'conSupId',
          align: 'center',
          width: '50%',
          render: (value, row, index) => (
            <AsyncSelect
              value={value}
              source={() => getcostRuleAbSupp().then(resp => resp.response)}
              placeholder="请选择供应商"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              // dropdownMatchSelectWidth={false}
              showSearch
              onChange={val => {
                const newDataSource = update(outsourcingInfoDataSource, {
                  [index]: {
                    conSupId: {
                      $set: val,
                    },
                  },
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    outsourcingInfoDataSource: newDataSource,
                  },
                });
              }}
            />
          ),
        },
      ],
    };

    const JDEWageExportTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'ASC',
      total: JDEWageExportTotal,
      dataSource: JDEWageExportDataSource,
      rowSelection: {
        _selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              _selectedRowKeys: selectedRowKeys,
            },
          });
        },
      },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            JDEWageExportDataSource: update(JDEWageExportDataSource, {
              $push: [
                {
                  ...newRow,
                  conBuIds: [],
                  id: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = JDEWageExportDataSource.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { _selectedRowKeys: [] },
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { JDEWageExportDataSource: newDataSource },
        });
      },
      onCopyItem: copied => {
        const newDataSource = copied.map(item => ({
          ...item,
          // conBuIds: [],
          id: genFakeId(-1),
        }));
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            JDEWageExportDataSource: update(JDEWageExportDataSource, { $push: newDataSource }),
          },
        });
      },
      columns: [
        {
          title: '公司代码',
          dataIndex: 'conCorNo',
          required: true,
          width: '20%',
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={e => {
                this.onCellChanged(index, 'conCorNo', e.target.value);
              }}
            />
          ),
        },
        {
          title: '导出费用编号', // 初始化 填写
          dataIndex: 'conJdeNo',
          required: true,
          width: '20%',
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={e => {
                this.onCellChanged(index, 'conJdeNo', e.target.value);
              }}
            />
          ),
        },
        {
          title: '对应公司',
          dataIndex: 'conCorId',
          required: true,
          width: '15%',
          render: (value, row, index) => (
            <AsyncSelect
              // disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
              value={value}
              source={() => selectOus().then(resp => resp.response)}
              placeholder="请选择对应公司"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={val => {
                this.onSelectChanged(index, 'conCorId', val);
              }}
            />
          ),
        },
        {
          title: '对应BU',
          dataIndex: 'conBuIds',
          required: true,
          width: '15%',
          render: (value, row, index) => (
            <AsyncSelect
              mode="multiple"
              // disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
              value={value}
              showSearch
              source={() => selectBu().then(resp => resp.response)}
              placeholder="请选择对应BU"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              onChange={val => {
                this.onSelectChanged(index, 'conBuIds', val);
              }}
            />
          ),
        },
        {
          title: '备注说明',
          dataIndex: 'remark',
          required: false,
          width: '30%',
          render: (value, row, index) => (
            <Input.TextArea
              // disabled={row.tsStatus !== 'CREATE' && row.tsStatus !== 'REJECTED'}
              value={value}
              rows={1}
              maxLength={200}
              onChange={e => {
                this.onCellChanged(index, 'remark', e.target.value);
              }}
            />
          ),
        },
      ],
      buttons: [],
    };

    return (
      <PageHeaderWrapper title="薪资成本规则配置">
        <Spin
          spinning={
            loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`] || false
          }
        >
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={disableSaveBtn}
              onClick={this.handleSave}
            >
              保存
            </Button>
          </Card>
          <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
            <FieldList layout="horizontal" legend="外包信息配置" />
            <Card bordered={false} bodyStyle={{ padding: '10px 0px 0px 5px' }}>
              <Row gutter={16}>
                <Col lg={12} md={24}>
                  <Table {...outsourcingInfoTableProps} />
                </Col>
                <Col lg={12} md={24}>
                  {/* <CyclicChart data={stateStatisList} /> */}
                </Col>
              </Row>
            </Card>

            <br />
            <Divider dashed />
            <FieldList layout="horizontal" legend="JDE工资导出部门对应关系" />
            <Card bordered={false} bodyStyle={{ padding: '10px 0px 0px 5px' }}>
              <Row gutter={16}>
                <Col lg={24} md={24}>
                  <EditableDataTable {...JDEWageExportTableProps} />
                </Col>
              </Row>
            </Card>
          </Card>
        </Spin>
      </PageHeaderWrapper>
    );
  }
}

export default WageCostRule;
