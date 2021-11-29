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
import moment from 'moment';

import { selectUsersWithBu } from '@/services/gen/list';
import { selectProjectConditional } from '@/services/user/project/project';
import { selectSubContract } from '@/services/user/Contract/sales';

import { formatDT } from '@/utils/tempUtils/DateTime';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'unfreezeCreate';

@connect(({ loading, unfreezeCreate, dispatch, user }) => ({
  loading,
  ...unfreezeCreate,
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
class UnfreezeCreate extends PureComponent {
  constructor(props) {
    super(props);

    this.dataTable = React.createRef();
  }

  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10 });
  }

  fetchData = params => {
    const {
      dispatch,
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    const that = this;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, chargeResId: extInfo.resId },
    });
  };

  handleSubmit = () => {
    const { selectedRows } = this.dataTable.current.state;
    if (isEmpty(selectedRows)) {
      createMessage({ type: 'warn', description: '请至少选择一条冻结记录进行解冻！' });
      return;
    }
    const chargeResIds = selectedRows.map(row => row.chargeResId);
    if (new Set(chargeResIds).size > 1) {
      createMessage({ type: 'warn', description: '请选择审批人相同的冻结记录' });
      return;
    }
    const dtlEntities = selectedRows.map(row => ({
      balId: row.id,
      ledgerId: row.ledgerId,
      unfreezeEqva: row.qty,
      unfreezeAmt: row.amt,
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
            approveResId: chargeResIds[0],
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
      dataSource,
      formData,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
      dispatch,
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      total,
      dataSource,
      ref: this.dataTable,
      // searchForm:{selectedRowKeys:[15]},
      onChange: filters => {
        this.fetchData(filters);
      },
      onRowChecked: (selectedRowKeys, selectedRows) => {
        const unfreezeEqva = selectedRows.reduce((sum, row) => {
          const qty = !Number.isNaN(Number(row.qty)) ? Number(row.qty) : 0;
          return sum + qty;
        }, 0);
        const unfreezeAmt = selectedRows.reduce((sum, row) => {
          const amt = !Number.isNaN(Number(row.amt)) ? Number(row.amt) : 0;
          return sum + amt;
        }, 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { formData: { ...formData, unfreezeEqva, unfreezeAmt } },
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
              source={() => selectProjectConditional({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '收入资源',
          dataIndex: 'resId',
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={SEL_COL}
              placeholder="请选择解冻审批人"
              showSearch
            />
          ),
        },
        {
          title: '合同',
          dataIndex: 'contractId',
          tag: (
            <Selection.Columns
              source={() => selectSubContract()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={SEL_COL}
              placeholder="请选择合同"
              showSearch
            />
          ),
        },
        {
          title: '冻结日期',
          dataIndex: 'inTime',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '预计释放日期',
          dataIndex: 'avalDate',
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
      ],
      leftButtons: [
        {
          key: 'submit',
          icon: 'submit',
          className: 'tw-btn-primary',
          title: '提交解冻',
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
          title: '冻结账户名称',
          dataIndex: 'ledgerName',
          align: 'center',
        },
        {
          title: '冻结当量',
          dataIndex: 'qty',
          align: 'center',
        },
        {
          title: '冻结金额',
          dataIndex: 'amt',
          align: 'center',
        },
        {
          title: '解冻审批人',
          dataIndex: 'chargeResName',
          align: 'center',
        },
        {
          title: '冻结时间',
          dataIndex: 'inTime',
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
        {
          title: '相关结算单号',
          dataIndex: 'settleNo',
          align: 'center',
          render: (value, row, key) => (
            <Link className="tw-link" to={`/plat/intelStl/list/common/preview?id=${row.sourceId}`}>
              {value}
            </Link>
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="解冻">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
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
              label="解冻人"
              decorator={{
                initialValue: formData.resId || (extInfo && extInfo.resId),
              }}
            >
              <Select disabled>
                <Option value={extInfo.resId}>{extInfo.resName}</Option>
              </Select>
            </Field>
            <Field
              name="unfreezeNo"
              label="解冻单号"
              decorator={{
                initialValue: formData.unfreezeNo,
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
              name="unfreezeEqva"
              label="解冻当量"
              decorator={{
                initialValue: formData.unfreezeEqva ? formData.unfreezeEqva.toFixed(2) : 0,
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} />
            </Field>
            <Field
              name="unfreezeAmt"
              label="解冻金额"
              decorator={{
                initialValue: formData.unfreezeAmt ? formData.unfreezeAmt.toFixed(2) : 0,
              }}
            >
              <InputNumber disabled style={{ width: '100%' }} placeholder="解冻金额" />
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
        <Card title="冻结列表" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default UnfreezeCreate;
