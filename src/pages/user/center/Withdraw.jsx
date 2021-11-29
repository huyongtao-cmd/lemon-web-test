// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, Divider, Col, InputNumber, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';

import { selectUsersWithBu } from '@/services/gen/list';
import { selectProjectConditional } from '@/services/user/project/project';
import moment from 'moment';
import { formatDT } from '@/utils/tempUtils/DateTime';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'withdraw';
let initApplyAmt = 0;
let initEqva = 0;
@connect(({ loading, withdraw, dispatch, user }) => ({
  loading,
  ...withdraw,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class Withdraw extends PureComponent {
  constructor(props) {
    super(props);

    this.dataTable = React.createRef();
  }

  componentDidMount() {
    const param = fromQs();
    const {
      dispatch,
      searchForm,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    dispatch({ type: `${DOMAIN}/updateState`, payload: { formData: {} } });
    if (param.id) {
      // 编辑模式
    } else {
      // 新增模式
      // this.fetchData({ offset: 0, limit: 10,settleDate:[formatDT(searchForm.settleDate[0]),formatDT(searchForm.settleDate[1])] });
      this.fetchData({ offset: 0, limit: 10, settleDate: searchForm.settleDate });
      dispatch({
        type: `${DOMAIN}/queryInnerType`,
        payload: extInfo.resId,
      });
    }
  }

  componentWillUnmount() {
    initApplyAmt = 0;
    initEqva = 0;
  }

  fetchData = params => {
    initApplyAmt = 0;
    initEqva = 0;
    const {
      dispatch,
      formData,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, resId: extInfo.resId, submitWithdrawFlag: true },
    }).then(res => {
      if (res.length > 0) {
        const number = res.reduce(
          (sum, row) =>
            sum +
            (!Number.isNaN(
              row.eqvaSalary * (row.approveSettleEqva - row.withdrawEqva) - row.freezeAmt
            )
              ? row.eqvaSalary * (row.approveSettleEqva - row.withdrawEqva) - row.freezeAmt
              : 0),
          0
        );
        initApplyAmt += number;
        const number1 = res.reduce(
          (sum, row) =>
            sum +
            (!Number.isNaN(row.approveSettleEqva - row.freezeEqva - row.withdrawEqva)
              ? row.approveSettleEqva - row.freezeEqva - row.withdrawEqva
              : 0),
          0
        );
        initEqva += number1;
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { formData: { ...formData, applyAmt: initApplyAmt, eqva: initEqva } },
        });
      }
    });
  };

  handleSubmit = () => {
    const { negSource } = this.props;
    const { selectedRows } = this.dataTable.current.state;
    const list = selectedRows.concat(negSource);
    if (isEmpty(list)) {
      createMessage({ type: 'warn', description: '请至少选择一条结算单记录进行解冻！' });
      return;
    }
    const dtlEntities = list.map(row => ({
      settleId: row.id,
      applyAmt: row.eqvaSalary * (row.approveSettleEqva - row.withdrawEqva) - row.freezeAmt,
      eqva: row.approveSettleEqva - row.freezeEqva - row.withdrawEqva,
    }));
    const { form, dispatch, formData } = this.props;
    form.validateFields((error, values) => {
      if (error) {
        return;
      }
      dispatch({
        type: `${DOMAIN}/submit`,
        payload: {
          entity: {
            ...formData,
            ...values,
            ledgerId: list[0].ledgerId,
            submit: true,
          },
          dtlEntities,
        },
      });
    });
  };

  render() {
    const {
      loading,
      total,
      posSource,
      negSource,
      formData,
      searchForm,
      innerType,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const negSourceIds = [];
    if (negSource.length > 0) {
      negSource.forEach(item => {
        negSourceIds.push(item.id);
      });
    }
    const disabledBtn = loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/submit`];
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      total,
      dataSource: posSource,
      ref: this.dataTable,
      onChange: filters => {
        this.fetchData(filters);
      },
      onRowChecked: (selectedRowKeys, selectedRows) => {
        const applyAmt = selectedRows.reduce(
          (sum, row) =>
            sum +
            (!Number.isNaN(
              row.eqvaSalary * (row.approveSettleEqva - row.withdrawEqva) - row.freezeAmt
            )
              ? row.eqvaSalary * (row.approveSettleEqva - row.withdrawEqva) - row.freezeAmt
              : 0),
          0
        );
        const eqva = selectedRows.reduce(
          (sum, row) =>
            sum +
            (!Number.isNaN(row.approveSettleEqva - row.freezeEqva - row.withdrawEqva)
              ? row.approveSettleEqva - row.freezeEqva - row.withdrawEqva
              : 0),
          0
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            formData: { ...formData, applyAmt: applyAmt + initApplyAmt, eqva: eqva + initEqva },
          },
        });
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '项目',
          dataIndex: 'projId',
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectProjectConditional({ myFlag: true })}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '结算日期',
          dataIndex: 'settleDate',
          options: {
            initialValue: searchForm.settleDate,
          },
          tag: <DatePicker.RangePicker className="x-fill-100" />,
        },
      ],
      leftButtons: [
        {
          key: 'submit',
          icon: 'submit',
          className: 'tw-btn-primary',
          title: '提交提现',
          hidden: true,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // const flag = selectedRows.filter(item => item.settleStatus !== 'CREATE').length;
            // if (flag) {
            //   createMessage({ type: 'warn', description: '只有新增状态的可以删除！' });
            //   return;
            // }
            const ids = selectedRows.map(selected => selected.id);
            // dispatch({
            //   type: `${DOMAIN}/delete`,
            //   payload: { keys: ids.join(',') },
            // });
          },
        },
      ],
      columns: [
        {
          title: '可提现当量',
          dataIndex: 'eqva',
          align: 'center',
          render: (value, row, key) =>
            (row.approveSettleEqva - row.freezeEqva - row.withdrawEqva).toFixed(2),
        },
        {
          title: '可提现金额',
          dataIndex: 'applyAmt',
          align: 'center',
          render: (value, row, key) =>
            (row.eqvaSalary * (row.approveSettleEqva - row.withdrawEqva) - row.freezeAmt).toFixed(
              2
            ),
        },
        {
          title: '相关结算单号',
          dataIndex: 'settleNo',
          align: 'center',
          render: (value, row, key) => {
            const { id, settleType } = row;
            let url;
            if (settleType === 'TASK_BY_PACKAGE') url = `/plat/intelStl/list/sum/preview?id=${id}`;
            else if (settleType === 'TASK_BY_MANDAY')
              url = `/plat/intelStl/list/single/preview?id=${id}`;
            else url = `/plat/intelStl/list/common/preview?id=${id}`;
            return (
              <Link className="tw-link" to={url}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '结算日期',
          dataIndex: 'settleDate',
          align: 'center',
        },
        {
          title: '当量收入',
          dataIndex: 'approveSettleEqva',
          align: 'center',
        },
        {
          title: '现金收入',
          dataIndex: 'eqvaSalary',
          align: 'center',
          render: (value, row, key) => row.approveSettleEqva * value,
        },
        {
          title: '冻结当量',
          dataIndex: 'freezeEqva',
          align: 'center',
        },
        {
          title: '冻结现金',
          dataIndex: 'freezeAmt',
          align: 'center',
        },
        {
          title: '已提现当量',
          dataIndex: 'withdrawEqva',
          align: 'center',
        },
        {
          title: '相关项目',
          dataIndex: 'projName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/project/projectDetail?id=${row.projId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '相关任务',
          dataIndex: 'taskName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/task/view?id=${row.taskId}`}>
              {value}
            </Link>
          ),
        },
      ],
    };

    const tableProps1 = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      dataSource: negSource,
      pagination: false,
      showSearch: false,
      rowSelection: {
        selectedRowKeys: negSource ? negSourceIds : 0,
        getCheckboxProps: record => ({
          disabled: true,
        }),
      },
      onRowChecked: (selectedRowKeys, selectedRows) => {},
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      columns: [
        {
          title: '可提现当量',
          dataIndex: 'eqva',
          align: 'center',
          render: (value, row, key) =>
            (row.approveSettleEqva - row.freezeEqva - row.withdrawEqva).toFixed(2),
        },
        {
          title: '可提现金额',
          dataIndex: 'applyAmt',
          align: 'center',
          render: (value, row, key) =>
            (row.eqvaSalary * (row.approveSettleEqva - row.withdrawEqva) - row.freezeAmt).toFixed(
              2
            ),
        },
        {
          title: '相关结算单号',
          dataIndex: 'settleNo',
          align: 'center',
          render: (value, row, key) => {
            const { id, settleType } = row;
            let url;
            if (settleType === 'TASK_BY_PACKAGE') url = `/plat/intelStl/list/sum/preview?id=${id}`;
            else if (settleType === 'TASK_BY_MANDAY')
              url = `/plat/intelStl/list/single/preview?id=${id}`;
            else url = `/plat/intelStl/list/common/preview?id=${id}`;
            return (
              <Link className="tw-link" to={url}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '结算日期',
          dataIndex: 'settleDate',
          align: 'center',
        },
        {
          title: '当量收入',
          dataIndex: 'approveSettleEqva',
          align: 'center',
        },
        {
          title: '现金收入',
          dataIndex: 'eqvaSalary',
          align: 'center',
          render: (value, row, key) => row.approveSettleEqva * value,
        },
        {
          title: '冻结当量',
          dataIndex: 'freezeEqva',
          align: 'center',
        },
        {
          title: '冻结现金',
          dataIndex: 'freezeAmt',
          align: 'center',
        },
        {
          title: '已提现当量',
          dataIndex: 'withdrawEqva',
          align: 'center',
        },
        {
          title: '相关项目',
          dataIndex: 'projName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/project/projectDetail?id=${row.projId}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '相关任务',
          dataIndex: 'taskName',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/task/view?id=${row.taskId}`}>
              {value}
            </Link>
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="提现">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={disabledBtn}
            onClick={this.handleSubmit}
          >
            提交
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="提现人"
              decorator={{
                initialValue: formData.resId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>
            <Field
              name="withdrawNo"
              label="提现单号"
              decorator={{
                initialValue: formData.withdrawNo,
              }}
            >
              <Input disabled style={{ width: '100%' }} />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || formatDT(moment()),
              }}
            >
              <DatePicker disabled style={{ width: '100%' }} />
            </Field>
            <Field
              name="apprStatus"
              label="审批状态"
              decorator={{
                initialValue: formData.apprStatus,
              }}
            >
              <UdcSelect disabled code="COM.APPR_STATUS" placeholder="审批状态" />
            </Field>
            <Field
              name="resInnerType"
              label="内部资源类型"
              decorator={{
                initialValue: formData.resInnerType || innerType,
              }}
            >
              <UdcSelect disabled code="RES:RES_TYPE1" placeholder="内部资源类型" />
            </Field>
            <Field
              name="eqva"
              label="提现当量"
              decorator={{
                initialValue: formData.eqva ? formData.eqva.toFixed(2) : 0,
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="提现当量" />
            </Field>
            <Field
              name="applyAmt"
              label="提现金额"
              decorator={{
                initialValue: formData.applyAmt ? formData.applyAmt.toFixed(2) : 0,
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="提现金额" />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
              }}
            >
              <Input.TextArea rows={1} placeholder="备注" />
            </Field>
          </FieldList>
        </Card>
        <br />
        <Card title="结算单列表" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
        {negSource.length > 0 ? (
          <Card title="转包负当量抵消" bordered={false} className="tw-card-adjust">
            <Divider dashed />
            <DataTable {...tableProps1} />
          </Card>
        ) : null}
      </PageHeaderWrapper>
    );
  }
}

export default Withdraw;
