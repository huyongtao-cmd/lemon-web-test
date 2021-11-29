import React from 'react';
import { connect } from 'dva';
import { DatePicker, Input, Table, Card, Divider, Modal, Form } from 'antd';
import { isEmpty } from 'ramda';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { mountToTab } from '@/layouts/routerControl';
import moment from 'moment';
import { expenseList } from '../config';
import FieldList from '@/components/layout/FieldList';

const DOMAIN = 'userExpenseAccountList';
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

@connect(({ loading, userExpenseAccountList }) => ({
  loading,
  ...userExpenseAccountList, // 代表与该组件相关redux的model
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    const { jdeAccount } = props;
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { jdeAccount: { ...jdeAccount, ...changedValues } },
      });
    }
  },
})
@mountToTab()
class AccountList extends React.PureComponent {
  state = {
    details: [],
    visible: false,
  };

  componentDidMount() {}

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
    this.setState({ details: [] });
  };

  getTableProps = () => {
    const { dispatch, loading, searchForm, dataSource, total, config } = this.props;

    return {
      rowKey: 'id',
      scroll: { x: '120%' },
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      showExport: false,
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
          title: '批名称/编号',
          dataIndex: 'batchName',
          options: {
            initialValue: searchForm.batchName,
          },
          tag: <Input placeholder="批名称、编号" />,
        },
        {
          title: '批生产时间',
          dataIndex: 'batchTime',
          options: {
            initialValue: [searchForm.batchTimeStart, searchForm.batchTimeEnd],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
        // {
        //   title: '批导出时间',
        //   dataIndex: 'exportTime',
        //   options: {
        //     initialValue: [searchForm.exportTimeStart, searchForm.exportTimeEnd],
        //   },
        //   tag: (
        //     <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
        //   ),
        // },
        {
          title: '报销总金额',
          dataIndex: 'batchAmt',
          options: {
            initialValue: searchForm.batchAmt,
          },
          tag: <Input placeholder="报销总金额" />,
        },
        {
          title: '导出次数',
          dataIndex: 'batchQty',
          options: {
            initialValue: searchForm.batchQty,
          },
          tag: <Input placeholder="导出次数" />,
        },
      ],
      columns: [
        {
          title: '操作',
          dataIndex: 'edit',
          render: (value, row, index) => {
            if (row.batchNo) {
              return (
                <a href={SERVER_URL + '/api/worth/v1/acc/pay/account/export?id=' + row.id}>
                  导出明细
                </a>
              );
            }
            return null;
          },
        },
        {
          title: '批编号',
          dataIndex: 'batchNo',
          sorter: true,
        },
        {
          title: '批名称',
          dataIndex: 'batchName',
          sorter: true,
        },
        {
          title: '批状态',
          dataIndex: 'batchStatus',
          align: 'center',
        },
        {
          title: '批类型',
          dataIndex: 'batchType',
          align: 'center',
        },
        {
          title: '最后导出时间',
          dataIndex: 'lastExportTime',
          sorter: true,
        },
        {
          title: '导出次数',
          dataIndex: 'expoertCount',
          align: 'center',
          sorter: true,
        },
        {
          title: '报销总金额',
          dataIndex: 'batchAmt',
          align: 'right',
          sorter: true,
          render: value => (value ? value.toFixed(2) : null),
        },
        {
          title: '批单据条数',
          dataIndex: 'batchQty',
          sorter: true,
          align: 'center',
        },
        {
          title: '操作人',
          dataIndex: 'createUserName',
        },
        {
          title: '操作时间',
          dataIndex: 'createTime',
          sorter: true,
        },
        {
          title: '应付科目',
          dataIndex: 'accName',
        },
        {
          title: '应付账号',
          dataIndex: 'accCode',
        },
        {
          title: '应付子帐',
          dataIndex: 'subAccCode',
        },
        {
          title: '总账日期',
          dataIndex: 'ledgerDate',
        },
      ],
      leftButtons: [
        {
          key: 'view',
          className: 'tw-btn-info',
          title: '查看批报销单明细',
          loading: false,
          icon: 'eye',
          hidden: false,
          disabled: false, // selectedRows => selectedRows[0] && selectedRows[0].taskStatus !== 'CREATE',
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            const details = !isEmpty(selectedRows[0])
              ? selectedRows[0].bathDataItemJsonList || []
              : [];
            this.setState({ details });
          },
        },
        {
          key: 'jdeAcc',
          className: 'tw-btn-info',
          title: '报销记账(jde)',
          loading: false,
          icon: 'eye',
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows) => {
            this.targeToggleVisible();
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                accPayBatchIds: selectedRowKeys,
              },
            });
          },
        },
      ],
    };
  };

  targeToggleVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  select = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveAccount`,
          payload: null,
        }).then(resp => {
          if (resp.ok) {
            this.targeToggleVisible();
            this.fetchData();
          }
        });
      }
    });
  };

  cancel = () => {
    this.targeToggleVisible();
  };

  render() {
    const { details, visible } = this.state;
    const {
      loading,
      form: { getFieldDecorator },
      accPayBatchIds,
    } = this.props;
    return (
      <PageHeaderWrapper title="记账导出">
        <Card bordered={false}>
          <div className="tw-card-title">财务记账报销单</div>
          <DataTable {...this.getTableProps()} />

          {!isEmpty(details) && (
            <div>
              <Divider dashed />
              <div className="tw-card-title">批明细—报销单信息</div>
              <div style={{ padding: '12px 24px' }}>
                <Table
                  domain={DOMAIN}
                  scroll={{ x: 2000 }}
                  pagination={false}
                  loading={loading.effects[`${DOMAIN}/query`]}
                  dataSource={details}
                  columns={expenseList}
                  rowKey="id"
                  bordered
                />
              </div>
            </div>
          )}
        </Card>
        <Modal
          title="JDE报销记账"
          visible={visible}
          loading={false}
          onOk={this.select}
          onCancel={this.cancel}
          width="60%"
          destroyOnClose // 关闭时销毁子元素，防止缓存
        >
          <FieldList getFieldDecorator={getFieldDecorator} layout="horizontal" col={2}>
            <Field
              name="accName"
              label="应付科目"
              decorator={{
                initialValue: null,
                rules: [
                  {
                    required: true,
                    message: '请输入应付科目',
                  },
                ],
              }}
              // {... FieldListLayout}
            >
              <Input placeholder="请输入应付科目" />
            </Field>
            <Field
              name="accCode"
              label="应付账号"
              decorator={{
                initialValue: null,
                rules: [
                  {
                    required: true,
                    message: '请输入应付账号',
                  },
                ],
              }}
              // {...FieldListLayout}
            >
              <Input placeholder="请输入应付账号" />
            </Field>
            <Field
              name="subAccCode"
              label="应付子账"
              // decorator={{
              //   initialValue:null,
              // }}
              // {...FieldListLayout}
            >
              <Input placeholder="请输入应付子账" />
            </Field>
            <Field
              name="ledgerDate"
              label="总账日期"
              decorator={{
                initialValue: moment(),
                rules: [
                  {
                    required: true,
                    message: '请输入总账日期',
                  },
                ],
              }}
              // {...FieldListLayout}
            >
              <DatePicker placeholder="请输入总账日期" format="YYYY-MM-DD" className="x-fill-100" />
            </Field>
            <Field
              name="remark"
              label="凭证说明"
              decorator={{
                initialValue: null,
                rules: [
                  {
                    required: true,
                    message: '请输入凭证说明',
                  },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 8, xxl: 3 }}
              wrapperCol={{ span: 16, xxl: 20 }}
            >
              <Input.TextArea placeholder="请输入凭证说明" autosize={{ minRows: 1, maxRows: 3 }} />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default AccountList;
