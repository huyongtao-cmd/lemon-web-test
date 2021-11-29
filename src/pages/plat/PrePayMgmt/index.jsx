import React, { PureComponent } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isNil, isEmpty } from 'ramda';
import { DatePicker, Tag, Input, Select, Modal, Form } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import AsyncSelect from '@/components/common/AsyncSelect';
import { UdcSelect, Selection } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { selectSupplier } from '@/services/user/Contract/sales';
import { selectUsersWithBu, selectProject } from '@/services/gen/list';
import { selectBuBy } from '@/services/user/feeapply/feeapply';
import { formatDT, formatDTHM } from '@/utils/tempUtils/DateTime';
import moment from 'moment';
import FieldList from '@/components/layout/FieldList';
import { selectInnerAccount } from '@/services/plat/recv/InvBatch';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'prePayMgmtList';
const { Option } = Select;
const { Field, FieldLine } = FieldList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

const expenseColumns = [
  { dataIndex: 'code', title: '编号', span: 4 },
  { dataIndex: 'name', title: '名称', span: 20 },
];

@connect(({ loading, prePayMgmtList }) => ({
  // loading,
  prePayMgmtList,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    const {
      prePayMgmtList: { jdePay },
    } = props;
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { jdePay: { ...jdePay, ...changedValues } },
      });
    }
  },
})
@mountToTab()
class PrePayMgmtList extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC', limit: 10 });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { applyDate, adpayHxDate, ...restParams } = params || {};
    const applyDateObject = { applyDateStart: undefined, applyDateEnd: undefined };
    const adpayHxDateObject = { adpayHxDateStart: undefined, adpayHxDateEnd: undefined };
    if (!isNil(applyDate) && !isEmpty(applyDate)) {
      applyDateObject.applyDateStart = formatDTHM(applyDate[0]);
      applyDateObject.applyDateEnd = formatDTHM(applyDate[1]);
    }
    if (!isNil(adpayHxDate) && !isEmpty(adpayHxDate)) {
      adpayHxDateObject.adpayHxDateStart = formatDT(adpayHxDate[0]);
      adpayHxDateObject.adpayHxDateEnd = formatDT(adpayHxDate[1]);
    }
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...restParams, ...applyDateObject, ...adpayHxDateObject },
    });
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
          type: `${DOMAIN}/savePreAccount`,
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
    const {
      loading,
      prePayMgmtList,
      dispatch,
      form: { getFieldDecorator },
    } = this.props;
    const { list, total, searchForm, adpayApplyIds, jdePay } = prePayMgmtList;
    const { visible } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: { x: '120%' },
      loading,
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
          title: '单据',
          dataIndex: 'applyInfo',
          options: {
            initialValue: searchForm.applyInfo,
          },
        },
        {
          title: '申请人',
          dataIndex: 'applyResId',
          options: {
            initialValue: searchForm.applyResId,
          },
          tag: (
            <Selection.Columns
              placeholder="请选择申请人"
              source={() => selectUsersWithBu()}
              columns={applyColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              allowClear
            />
          ),
        },
        {
          title: '业务类型',
          dataIndex: 'prepayType',
          options: {
            initialValue: searchForm.prepayType,
          },
          tag: <Selection.UDC code="ACC:PREPAY_TYPE" placeholder="请选择" />,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuId',
          options: {
            initialValue: searchForm.expenseBuId,
          },
          tag: (
            <Selection.Columns
              placeholder="请选择费用承担BU"
              source={() => selectBuBy()}
              columns={expenseColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              showSearch
              allowClear
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 340 }}
              dropdownAlign={{
                points: ['tr', 'br'],
                overflow: false,
              }}
            />
          ),
        },
        {
          title: '相关采购合同',
          dataIndex: 'pcontractName',
          options: {
            initialValue: searchForm.pcontractName,
          },
        },
        {
          title: '相关项目',
          dataIndex: 'reasonName',
          options: {
            initialValue: searchForm.reasonName,
          },
          // tag: (
          //   <AsyncSelect
          //     source={() => selectProject().then(resp => resp.response)}
          //     showSearch
          //     filterOption={(input, option) =>
          //       option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          //     }
          //     placeholder="请选择相关项目"
          //   />
          // ),
        },
        {
          title: '申请状态',
          dataIndex: 'applyStatus',
          options: {
            initialValue: searchForm.applyStatus,
          },
          tag: <Selection.UDC code="ACC:APPLY_STATUS" placeholder="请选择" />,
        },
        {
          title: '供应商',
          dataIndex: 'supplierName',
          options: {
            initialValue: searchForm.supplierName,
          },
          // tag: (
          //   <AsyncSelect
          //     source={() => selectSupplier().then(resp => resp.response)}
          //     placeholder="请选择供应商"
          //     showSearch
          //     filterOption={(input, option) =>
          //       option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          //     }
          //   />
          // ),
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          options: {
            initialValue: searchForm.applyDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '预计核销日期',
          dataIndex: 'adpayHxDate',
          options: {
            initialValue: searchForm.adpayHxDate,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '核销状态',
          dataIndex: 'processState',
          options: {
            initialValue: searchForm.processState,
          },
          tag: <Selection.UDC code="ACC:ADPAY_HX_STATE" placeholder="请选择" />,
        },
        {
          title: '是否延期核销',
          dataIndex: 'isHxDelay',
          options: {
            initialValue: searchForm.isHxDelay,
          },
          tag: <Selection.UDC code="COM:YESNO" placeholder="请选择" />,
        },
      ],
      columns: [
        {
          title: '预付款单号',
          dataIndex: 'applyNo',
          width: 150,
          render: (value, rowData) => {
            const href = `/plat/purchPay/prePayMgmt/detail?id=${rowData.id}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '业务类型',
          dataIndex: 'prepayTypeDesc',
          width: 150,
          align: 'center',
        },
        {
          title: '申请状态',
          dataIndex: 'applyStatusDesc',
          width: 100,
          align: 'center',
        },
        {
          title: '相关采购合同',
          dataIndex: 'pcontractName',
          width: 200,
        },
        {
          title: '相关项目',
          dataIndex: 'reasonName',
          // width: 100,
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
          width: 150,
        },
        {
          title: '费用所属公司',
          dataIndex: 'feeExtendOuName',
          width: 150,
        },
        {
          title: '供应商',
          dataIndex: 'supplierName',
          // width: 200,
        },
        {
          title: '预付金额',
          dataIndex: 'adpayAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '预付款核销日期',
          dataIndex: 'adpayHxDate',
          align: 'center',
          width: 100,
        },
        {
          title: '已核销金额',
          dataIndex: 'alreadyAmt',
          align: 'center',
          width: 100,
        },
        {
          title: '核销状态',
          dataIndex: 'processStateName',
          align: 'center',
          width: 100,
        },
        {
          title: '是否延期核销字段',
          dataIndex: 'isHxDelayName',
          align: 'center',
          width: 100,
        },
        {
          title: '申请日期',
          dataIndex: 'applyDate',
          width: 150,
          render: value => formatDT(value),
        },
        {
          title: '创建人',
          dataIndex: 'createUserName',
          width: 100,
        },
        {
          title: '创建日期',
          dataIndex: 'createTime',
          width: 150,
          render: value => formatDTHM(value),
        },
        {
          title: '付款银行',
          dataIndex: 'accountNo',
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
          key: 'delete',
          icon: 'file-excel',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => {
            if (isEmpty(selectedRows)) return true;
            const { isInitial, procId } = selectedRows[0];
            if (!!isInitial || isNil(procId)) return false;
            return true;
          },
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            !isNil(id) &&
              dispatch({ type: `${DOMAIN}/delete`, payload: id }).then(success => {
                if (success) {
                  dispatch({
                    type: `${DOMAIN}/updateSearchForm`,
                    payload: { selectedRowKeys: [] },
                  });
                  this.fetchData(searchForm);
                }
              });
          },
        },
        {
          key: 'jdeAcc',
          className: 'tw-btn-info',
          title: '预付款记账',
          loading: false,
          icon: 'eye',
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            const { length } = selectedRows.filter(r => r.applyStatus !== 'APPROVED');
            if (length > 0) {
              createMessage({ type: 'warn', description: '仅申请状态为申请通过的才能预付款记账' });
              return;
            }
            this.targeToggleVisible();
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                adpayApplyIds: selectedRowKeys,
              },
            });
          },
        },
        // {
        //   key: 'verification',
        //   icon: 'plus-circle',
        //   className: 'tw-btn-primary',
        //   title: '预付款核销',
        //   loading: false,
        //   hidden: false,
        //   disabled: selectedRows => {
        //     if (selectedRows && selectedRows.length !== 1) {
        //       return true;
        //     }
        //     const { applyStatus } = selectedRows[0];
        //     if (applyStatus === 'APPROVED') {
        //       return false;
        //     }
        //     return true;
        //   },
        //   minSelections: 0,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     const { id } = selectedRows[0];
        //     router.push(
        //       `/plat/purchPay/advanceVerification/create?id=${id}&sourceUrl=/plat/purchPay/prePayMgmt`
        //     );
        //   },
        // },
      ],
    };

    return (
      <PageHeaderWrapper title="预付款列表">
        <DataTable {...tableProps} />
        <Modal
          title="预付款记账(jde)"
          visible={visible}
          loading={false}
          onOk={this.select}
          onCancel={this.cancel}
          width="60%"
          destroyOnClose // 关闭时销毁子元素，防止缓存
        >
          <FieldList getFieldDecorator={getFieldDecorator} layout="horizontal" col={2}>
            <Field
              name="accountNo"
              label="付款银行"
              decorator={{
                // initialValue: recvData.accountNo ? recvData.accountNo : iniAccountNo,
                rules: [
                  {
                    required: true,
                    message: '请选择付款银行',
                  },
                ],
              }}
              // {...FieldListLayout}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectInnerAccount()}
                columns={[
                  // span加起来不能超过24
                  { dataIndex: 'valCode', title: '账户', span: 6 },
                  { dataIndex: 'valDesc', title: '公司', span: 9 },
                  // { dataIndex: 'valSphd1', title: '银行', span: 3 },
                  { dataIndex: 'valSphd2', title: '网点', span: 9 },
                ]}
                transfer={{ key: 'id', code: 'valCode', name: 'valCode' }} // key唯一键，code要保存的值；name选中后显示的值
                dropdownMatchSelectWidth={false} // 下拉菜单菜单和选择器同款
                dropdownStyle={{ width: 700 }} // 下拉宽度
                showSearch
                onColumnsChange={() => {}}
                placeholder="请选择收款银行账号"
                // value={value}
                width={100}
                onChange={e => {}}
              />
            </Field>
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
              // {... FieldListLayout} todo 付款银行
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

export default PrePayMgmtList;
