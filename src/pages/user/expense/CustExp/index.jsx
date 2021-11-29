import React from 'react';
import { connect } from 'dva';
import { Checkbox, Input, Icon, Modal, Form } from 'antd';
import router from 'umi/router';
import Link from 'umi/link';
import { isEmpty, isNil } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker, BuVersion } from '@/pages/gen/field';
import { TagOpt } from '@/utils/tempUtils';

import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';
import { formatDT } from '@/utils/tempUtils/DateTime';

import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { selectBus } from '@/services/org/bu/bu';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'custExpenseList';
const { Field } = FieldList;

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const FieldListLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 19 },
};

@connect(({ loading, custExpenseList }) => ({
  loading,
  custExpenseList,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class custExpenseList extends React.PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      this.fetchData({
        offset: 0,
        limit: 10,
        sortBy: 'id',
        sortDirection: 'DESC',
      });
    });
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.expenseBuId, 'expenseBuId', 'expenseBuVersionId'),
        ...getBuVersionAndBuParams(params.sumBuId, 'sumBuId', 'sumBuVersionId'),
      },
    });
  };

  toggle = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  handleSubmit = () => {
    const {
      dispatch,
      custExpenseList: { formData },
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/record`,
          payload: formData,
        }).then(() => {
          this.toggle();
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator },
      custExpenseList: { formData, list, total, searchForm },
    } = this.props;
    const { visible } = this.state;

    const tableProps = {
      title: () => (
        <span style={{ color: 'red' }}>
          <Icon type="alert" />
          同步刷新说明: 报销单核销状态每天晚上系统自动同步1次，如果需要立即同步，可以点击同步按钮
        </span>
      ),
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: 2700 },
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource: list,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          options: {
            initialValue: searchForm.reimNo,
          },
          tag: <Input placeholder="报销单号" />,
        },
        {
          title: '报销申请人',
          dataIndex: 'reimResId',
          options: {
            initialValue: searchForm.reimResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择报销申请人"
              showSearch
            />
          ),
        },
        {
          title: '流程类型',
          dataIndex: 'procKey',
          options: {
            initialValue: searchForm.procKey,
          },
          tag: <Selection.UDC code="ACC:REIM_PROC_KEY" placeholder="请选择流程类型" />,
        },
        {
          title: '事由类型',
          dataIndex: 'reasonType',
          options: {
            initialValue: searchForm.reasonType,
          },
          tag: <Selection.UDC code="TSK:REASON_TYPE" placeholder="请选择事由类型" />,
        },
        {
          title: '事由名称',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          tag: <Input placeholder="事由名称" />,
        },
        {
          title: '发票法人公司',
          dataIndex: 'expenseOuId',
          options: {
            initialValue: searchForm.expenseOuId,
          },
          tag: <Selection source={() => selectInternalOus()} placeholder="请选择发票法人公司" />,
        },
        {
          title: '报销类型',
          dataIndex: 'reimType1',
          options: {
            initialValue: searchForm.reimType1,
          },
          tag: <Selection.UDC code="ACC:REIM_TYPE1" placeholder="请选择报销类型" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuId', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '费用类型',
          dataIndex: 'reimType2',
          options: {
            initialValue: searchForm.reimType2,
          },
          tag: <Selection.UDC code="ACC:REIM_TYPE2" placeholder="请选择费用类型" />,
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBuId', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: searchForm.sumBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '报销单状态',
          dataIndex: 'reimStatus',
          options: {
            initialValue: searchForm.reimStatus,
          },
          tag: <Selection.UDC code="ACC:REIM_STATUS" placeholder="报销单状态" />,
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatus',
          options: {
            initialValue: searchForm.recvStatus,
          },
          tag: <Selection.UDC code="ACC:RECV_STATUS" placeholder="收款状态" />,
        },
        {
          title: '请款状态',
          dataIndex: 'expapplyStatus',
          options: {
            initialValue: searchForm.expapplyStatus,
          },
          tag: <Selection.UDC code="ACC:EXP_APPLY_STATUS" placeholder="请款状态" />,
        },
        {
          title: '是否分摊',
          dataIndex: 'allocationFlag', // TODO: 这个需要做成下拉选择，暂无接口
          options: {
            initialValue: !!searchForm.allocationFlag,
            valuePropName: 'checked',
          },
          tag: <Checkbox>是</Checkbox>,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      columns: [
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          align: 'center',
          render: (value, row, key) => {
            let type;
            switch (row.reimType2) {
              // 差旅报销
              case 'TRIP': {
                type = 'trip';
                break;
              }
              // 行政订票报销
              case 'TICKET': {
                type = 'trip';
                break;
              }
              // 专项费用报销
              case 'SPEC': {
                type = 'spec';
                break;
              }
              // 特殊费用报销 -因公报销
              case 'BSPECIAL': {
                type = 'particular';
                break;
              }
              // 特殊费用报销 -个人报销
              case 'PSPECIAL': {
                type = 'particular';
                break;
              }
              // 非差旅报销
              default: {
                type = 'normal';
                break;
              }
            }
            return (
              <Link className="tw-link" to={`/plat/expense/${type}/view?id=${row.reimId}`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '请款状态',
          dataIndex: 'expapplyStatusName',
          align: 'center',
        },
        {
          title: '费用发生日期',
          dataIndex: 'feeDate',
          align: 'center',
        },
        {
          title: '报销申请人',
          dataIndex: 'reimResName',
          align: 'center',
        },
        {
          title: '报销费用(含税)',
          dataIndex: 'taxedReimAmt',
          align: 'right',
          render: value => (!isNil(value) ? value.toFixed(2) : 0),
        },
        {
          title: '调整后费用',
          dataIndex: 'adjustedAmt',
          align: 'right',
          render: value => (!isNil(value) ? value.toFixed(2) : 0),
        },
        // {
        //   title: '核销状态',
        //   dataIndex: 'clearStatusName',
        //   align: 'center',
        // },
        {
          title: '请款单编号',
          dataIndex: 'custexpApplyNo',
          align: 'center',
          render: (value, row, key) => (
            <Link to={`/user/project/custExp/detail?id=${row.custexpApplyId}`}>{value}</Link>
          ),
        },
        {
          title: '请款审批状态',
          dataIndex: 'applyApprStatusDesc',
          align: 'center',
        },
        {
          title: '收款状态',
          dataIndex: 'recvStatusName',
          align: 'center',
        },
        {
          title: '单据状态',
          dataIndex: 'reimStatusDesc',
          align: 'center',
        },
        // {
        //   title: '单据状态',
        //   dataIndex: 'reimStatusDesc',
        //   align: 'center',
        // },

        {
          title: '报销单审批状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          align: 'center',
        },
        {
          title: '流程类型',
          dataIndex: 'procName',
          align: 'center',
        },
        {
          title: '事由名称',
          dataIndex: 'reasonName',
        },
        {
          title: '报销类型',
          dataIndex: 'reimType1Name',
          align: 'center',
        },
        {
          title: '费用类型',
          dataIndex: 'reimType2Name',
          align: 'center',
        },
        {
          title: '事由类型',
          dataIndex: 'reasonTypeName',
          align: 'center',
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
          align: 'left',
        },
        {
          title: '费用归属BU',
          dataIndex: 'sumBuName',
          align: 'left',
        },
        {
          title: '是否分摊',
          dataIndex: 'allocationFlag',
          align: 'center',
          render: value => (
            <TagOpt
              value={value}
              opts={[{ code: 0, name: '否' }, { code: 1, name: '是' }]}
              palette="red|green"
            />
          ),
        },
        {
          title: '发票法人公司',
          dataIndex: 'expenseOuName',
          align: 'left',
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          align: 'center',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
      ],
      leftButtons: [
        {
          key: 'create',
          title: '创建请款单',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length < 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { reasonType, reasonId, reimId } = selectedRows[0];
            if (selectedRows.filter(v => v.expapplyStatus !== 'CREATE').length > 0) {
              createMessage({ type: 'error', description: '请款状态为已完成或审批中,不可申请!' });
              return;
            }
            if (
              selectedRows.filter(v => v.reasonType !== reasonType).length === 0 && // 事由类型 相同
              selectedRows.filter(v => v.reasonId !== reasonId).length === 0 // 事由号 相同
            ) {
              // console.warn('事由类型 事由号 ------- 相同');
              router.push(
                `/user/project/custExp/edit?ids=${selectedRowKeys.join(',')}&id=${reimId}`
              );
            } else {
              createMessage({ type: 'error', description: '必须是同一项目、同一客户才可请款' });
            }
          },
        },
        {
          key: 'sync',
          title: '同步刷新',
          className: 'tw-btn-info',
          icon: 'reload',
          loading: false,
          hidden: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({ type: `${DOMAIN}/sync`, payload: searchForm });
          },
        },
        {
          key: 'cancel',
          title: '取消费用承担',
          className: 'tw-btn-info',
          icon: 'close-circle',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { reimId } = selectedRows[0];
            dispatch({ type: `${DOMAIN}/cancel`, payload: { reimId, searchForm } });
          },
        },
        {
          key: 'record',
          title: '手工收款补录',
          className: 'tw-btn-info',
          icon: 'edit',
          loading: false,
          hidden: true,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                formData: {
                  recvPlanNo: undefined,
                  recordReason: undefined,
                },
              },
            });
            this.toggle();
          },
        },
      ],
    };

    return (
      <>
        <PageHeaderWrapper title="客户承担费用">
          <DataTable {...tableProps} />
        </PageHeaderWrapper>
        <Modal
          centered
          title="请选择汇报对象"
          visible={visible}
          onOk={this.handleSubmit}
          onCancel={this.toggle}
          width={600}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1} noReactive>
            <Field
              name="recvPlanNo"
              label="收款计划编号"
              decorator={{
                initialValue: formData.recvPlanNo || undefined,
              }}
              {...FieldListLayout}
            >
              <Input placeholder="请输入收款计划编号" />
            </Field>
            <Field
              name="recordReason"
              label="补录原因"
              decorator={{
                initialValue: formData.recordReason || undefined,
              }}
              {...FieldListLayout}
            >
              <Input.TextArea placeholder="请输入补录原因" rows={3} />
            </Field>
          </FieldList>
        </Modal>
      </>
    );
  }
}

export default custExpenseList;
