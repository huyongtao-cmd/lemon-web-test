// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, InputNumber, Modal, Tooltip, Switch } from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto, injectUdc } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import { Selection, DatePicker } from '@/pages/gen/field';
import router from 'umi/router';
import { add, checkIfNumber, div, mul, sub } from '@/utils/mathUtils';
import moment from 'moment';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import update from 'immutability-helper';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { selectUsersWithBu } from '@/services/gen/list';

const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const { Description } = DescriptionList;

const DOMAIN = 'withdrawDetail';

@connect(({ loading, withdrawDetail, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...withdrawDetail,
  dispatch,
  user,
}))
@injectUdc(
  {
    tsStatus: 'TSK:TIMESHEET_STATUS', // 状态
    vacationUdc: 'TSK:TIMESHEET_VACATION', // 休假的活动
    notaskUdc: 'TSK:TIMESHEET_NOTASK', // 无任务的活动
  },
  DOMAIN
)
@mountToTab()
class WithdrawDetail extends PureComponent {
  state = {
    timeSheetInfoModalVisible: false,
    eqvaSalaryInfoModalVisible: false,
    amtShareModalVisible: false,
    totalAmt: undefined,
    startDate: formatDT(
      moment()
        .startOf('month')
        .subtract(1, 'month')
    ),
    endDate: formatDT(
      moment()
        .subtract(1, 'month')
        .endOf('month')
    ),
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { startDate, endDate } = this.state;
    const params = fromQs();
    this.fetchData(params);

    params.taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: params.taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {},
          },
        });
    dispatch({
      type: `${DOMAIN}/queryWorkHours`,
      payload: {
        startDate,
        endDate,
      },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
  };

  fetchTimeSheetData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/queryTimeSheet`, payload: params });
  };

  fetchEqvaSalaryData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/queryEqvaSalary`, payload: params });
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dataSource, formData, dispatch } = this.props;

    let value = rowFieldValue;

    // input框赋值转换
    value = value && value.target ? value.target.value : value;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    if (rowField === 'amt') {
      const amt = newDataSource.reduce(
        (sum, row) => sum + (!Number.isNaN(row.amt) ? row.amt : 0),
        0
      );
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { dataSource: newDataSource, formData: { ...formData, amt } },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { dataSource: newDataSource },
      });
    }
  };

  handleSubmit = params => {
    const { dispatch, formData, dataSource, deleteKeys } = this.props;
    const unLegalRows = dataSource.filter(data => isNil(data.amt));
    if (!isEmpty(unLegalRows)) {
      createMessage({ type: 'warn', description: '行编辑未通过，请检查输入项。' });
      return;
    }
    dispatch({
      type: `${DOMAIN}/submit`,
      payload: {
        entity: {
          ...formData,
          submit: true,
          ...params,
        },
        dtlEntities: dataSource,
      },
    });
  };

  switchTimeSheetInfoModal = () => {
    const { timeSheetInfoModalVisible } = this.state;
    this.setState({ timeSheetInfoModalVisible: !timeSheetInfoModalVisible });
  };

  switchEqvaSalaryInfoModal = () => {
    const { eqvaSalaryInfoModalVisible } = this.state;
    this.setState({ eqvaSalaryInfoModalVisible: !eqvaSalaryInfoModalVisible });
  };

  switchAmtShareInfoModal = () => {
    const { amtShareModalVisible } = this.state;
    this.setState({ amtShareModalVisible: !amtShareModalVisible });
  };

  totalAmtChange = value => {
    this.setState({ totalAmt: value });
  };

  handleShareAmtOk = () => {
    const { totalAmt } = this.state;
    const { dataSource, formData, dispatch } = this.props;
    let newDataSource = [...dataSource];
    if (!isEmpty(newDataSource)) {
      const totalEqva = newDataSource.reduce((total, data) => total + data.eqva, 0);
      let amtTemp = 0;
      for (let i = 0; i < newDataSource.length - 1; i += 1) {
        const amt = Math.round(((totalAmt * newDataSource[i].eqva) / totalEqva) * 100) / 100;
        newDataSource = update(newDataSource, { [i]: { amt: { $set: amt } } });
        // newDataSource[i].amt= amt;
        amtTemp += amt;
      }
      const lastAmt = Math.round((totalAmt - amtTemp) * 100) / 100;
      // newDataSource[dataSource.length-1].amt=lastAmt;
      const lastIndex = dataSource.length - 1;
      newDataSource = update(newDataSource, { [lastIndex]: { amt: { $set: lastAmt } } });

      const newTotalAmt =
        Math.round(newDataSource.reduce((total, data) => total + data.amt, 0) * 100) / 100;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          formData: {
            ...formData,
            amt: newTotalAmt,
          },
          dataSource: newDataSource,
        },
      });
      this.switchAmtShareInfoModal();
    }
  };

  render() {
    const {
      loading,
      dataSource,
      formData,
      dispatch,
      fieldsConfig: config,
      flowForm,
      timeSheetSource,
      timeSheetTotal,
      salarySource,
      salaryTotal,
      workHours,
    } = this.props;
    const { taskKey } = config;
    const {
      timeSheetInfoModalVisible,
      eqvaSalaryInfoModalVisible,
      amtShareModalVisible,
      totalAmt,
      startDate,
      endDate,
    } = this.state;
    const { _udcMap = {} } = this.state;
    const { tsStatus = [], vacationUdc = [], notaskUdc = [] } = _udcMap;

    let editAmtAbleFlag = false;
    if (taskKey === 'ACC_A33_02_INCHARGE_APPROVE_b') {
      editAmtAbleFlag = true;
    }
    // const disabledBtn = loading.effects[`${DOMAIN}/query`];
    // console.log(loading+"===================")
    const { taskId, id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A33', title: '提现申请流程' }];
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '申请提现当量',
          dataIndex: 'eqva',
          align: 'center',
        },
        {
          title: '申请提现金额',
          dataIndex: 'applyAmt',
          align: 'center',
        },
        {
          title: '调整提现金额',
          dataIndex: 'amt',
          align: 'center',
        },
        {
          title: '相关结算单号',
          dataIndex: 'settleNo',
          align: 'center',
          render: (value, row, key) => {
            const { settleType } = row;
            let url;
            if (settleType === 'TASK_BY_PACKAGE')
              url = `/plat/intelStl/list/sum/preview?id=${row.settleId}`;
            else if (settleType === 'TASK_BY_MANDAY')
              url = `/plat/intelStl/list/single/preview?id=${row.settleId}`;
            else url = `/plat/intelStl/list/common/preview?id=${row.settleId}`;
            return (
              <Link className="tw-link" to={url}>
                {value}
              </Link>
            );
          },
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
        /* {
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
        }, */
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

    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource,
      showCopy: false,
      showAdd: false,
      showDelete: false,

      columns: [
        {
          title: '申请提现当量',
          dataIndex: 'eqva',
          align: 'center',
        },
        {
          title: '申请提现金额',
          dataIndex: 'applyAmt',
          align: 'center',
        },
        {
          title: '调整提现金额',
          dataIndex: 'amt',
          required: true,
          align: 'center',
          options: {
            rules: [
              {
                required: true,
                message: '请输入提现金额!',
              },
            ],
          },
          render: (value, row, index) => (
            <InputNumber
              className="x-fill-100"
              value={value}
              onChange={this.onCellChanged(index, 'amt')}
            />
          ),
        },
        {
          title: '相关结算单号',
          dataIndex: 'settleNo',
          align: 'center',
          render: (value, row, key) => {
            const { settleType } = row;
            let url;
            if (settleType === 'TASK_BY_PACKAGE')
              url = `/plat/intelStl/list/sum/preview?id=${row.settleId}`;
            else if (settleType === 'TASK_BY_MANDAY')
              url = `/plat/intelStl/list/single/preview?id=${row.settleId}`;
            else url = `/plat/intelStl/list/common/preview?id=${row.settleId}`;
            return (
              <Link className="tw-link" to={url}>
                {value}
              </Link>
            );
          },
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
      buttons: [
        {
          key: 'showTimeSheetInfo',
          className: 'tw-btn-primary',
          title: '查看工时',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.switchTimeSheetInfoModal(),
        },
        {
          key: 'showEqvaSalaryInfo',
          className: 'tw-btn-primary',
          title: '查看当量收入',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.switchEqvaSalaryInfoModal(),
        },
        {
          key: 'amtShareInfo',
          className: 'tw-btn-primary',
          title: '分摊提现金额',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.switchAmtShareInfoModal(),
        },
      ],
    };
    const param = fromQs();

    const totalWorkHours = timeSheetSource.reduce((a, b) => add(a, b.workHour), 0);
    // const TOTAL_LABEL = 'myTotal';
    // const myDataSource = timeSheetSource.concat({
    //   id: TOTAL_LABEL,
    //   workHour: timeSheetSource.reduce((a, b) => add(a, b.workHour), 0),
    //   workDate:'合计',
    // });

    const timeSheetTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      total: timeSheetTotal,
      dataSource: timeSheetSource,
      limit: 100,
      // rowSelection: {
      //   getCheckboxProps: record => ({
      //     disabled: record.id === TOTAL_LABEL,
      //   }),
      // },
      onChange: filters => {
        this.fetchTimeSheetData(filters);
      },
      // onSearchBarChange: (changedValues, allValues) => {
      //   dispatch({
      //     type: `${DOMAIN}/updateSearchForm`,
      //     payload: allValues,
      //   });
      // },
      searchBarForm: [
        {
          title: '填报人',
          dataIndex: 'tsResId',
          options: {
            initialValue: formData.resId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
        {
          title: '日期范围',
          dataIndex: 'dateRange',
          options: {
            initialValue: [startDate, endDate],
          },
          tag: <DatePicker.RangePicker />,
        },
        {
          title: '任务包工时',
          dataIndex: 'taskFlag',
          options: {
            initialValue: true,
          },
          tag: <Switch defaultChecked />,
        },
        {
          title: '状态',
          dataIndex: 'tsStatus',
          options: {
            initialValue: 'APPROVED',
          },
          tag: <Selection.UDC code="TSK:TIMESHEET_STATUS" placeholder="请选择状态" />,
        },
      ],
      columns: [
        {
          title: '工作日期',
          dataIndex: 'workDate',
        },
        {
          title: '状态',
          dataIndex: 'tsStatusDesc',
          align: 'center',
        },
        {
          title: 'BU',
          dataIndex: 'buName',
          // align: 'center',
        },
        {
          title: '填报人',
          dataIndex: 'tsResName',
        },
        {
          title: '项目',
          dataIndex: 'projName',
        },
        {
          title: '任务包',
          dataIndex: 'taskId',
          render: (value, row, index) => {
            if (value) {
              const timesheetViews = !isEmpty(row.timesheetViews)
                ? row.timesheetViews.filter(item => item.id === row.taskId)
                : [];
              const { taskName = null } = timesheetViews[0] || {};
              return taskName;
            }
            return row.tsTaskIdenDesc;
          },
        },
        {
          title: '费用承担BU',
          dataIndex: 'expenseBuName',
        },
        {
          title: '活动',
          dataIndex: 'actId',
          render: (value, row, index) => {
            if (value) {
              const timesheetViews = !isEmpty(row.timesheetViews)
                ? row.timesheetViews.filter(item => item.id === row.taskId)
                : [];
              const { resActivities = [] } = timesheetViews[0] || {};
              const { actName = null } = resActivities[0] || {};
              return actName;
            }
            if (row.tsActIden && row.tsTaskIden === 'VACATION') {
              const { name = null } = !isEmpty(vacationUdc)
                ? vacationUdc.filter(i => i.code === row.tsActIden)[0] || {}
                : {};
              return name;
            }
            if (row.tsActIden && row.tsTaskIden === 'NOTASK') {
              const { name = null } = !isEmpty(notaskUdc)
                ? notaskUdc.filter(i => i.code === row.tsActIden)[0] || {}
                : {};
              return name;
            }
            return row.tsActIdenDesc;
          },
        },
        {
          title: '工时',
          dataIndex: 'workHour',
          align: 'right',
        },
        {
          title: '工作说明',
          dataIndex: 'workDesc',
          render: (value, row, index) =>
            value && value.length > 30 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 30)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [],
    };

    const eqvaSalaryTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      total: salaryTotal,
      dataSource: salarySource,
      // rowSelection: {
      //   getCheckboxProps: record => ({
      //     disabled: record.id === TOTAL_LABEL,
      //   }),
      // },
      onChange: filters => {
        this.fetchEqvaSalaryData(filters);
      },
      // onSearchBarChange: (changedValues, allValues) => {
      //   dispatch({
      //     type: `${DOMAIN}/updateSearchForm`,
      //     payload: allValues,
      //   });
      // },
      searchBarForm: [
        {
          title: '填报人',
          dataIndex: 'resId',
          options: {
            initialValue: formData.resId,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu({})}
              columns={SEL_COL}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ width: 440 }}
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '资源名称',
          dataIndex: 'resName',
        },
        {
          title: '年度',
          dataIndex: 'finYear',
          align: 'right',
        },
        {
          title: '期间',
          dataIndex: 'finPeriod',
          align: 'right',
        },
        {
          title: 'BU',
          dataIndex: 'buName',
          align: 'right',
        },
        {
          title: '项目',
          dataIndex: 'projName',
          align: 'right',
        },
        {
          title: '单位当量收入',
          dataIndex: 'preeqvaAmt',
          align: 'right',
        },
        {
          title: '结算方式',
          dataIndex: 'settleMethodDesc',
          align: 'right',
        },
        {
          title: '状态',
          dataIndex: 'lineStatusDesc',
          align: 'center',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [],
    };

    const titleMessage = `工时情况 (${startDate}~${endDate}之间工作日数为:${workHours /
      8}天,当前查询工时列表总天数为:${totalWorkHours / 8}天)`;

    return (
      <PageHeaderWrapper title="提现">
        <BpmWrapper
          fieldsConfig={config}
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { key } = operation;
            const payload = {
              taskId,
              remark: bpmForm.remark,
            };

            if (editAmtAbleFlag && key === 'APPROVED') {
              this.handleSubmit({
                procTaskId: param.taskId,
                procRemark: bpmForm.remark,
              });
              return Promise.resolve(false);
            }

            if (key === 'APPROVED') {
              return Promise.resolve(true);
            }

            if (key === 'REJECTED') {
              return Promise.resolve(true);
            }

            return Promise.resolve(false);
          }}
        >
          <Card className="tw-card-rightLine">
            {/* <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSubmit}
            >
              提交
            </Button> */}
          </Card>
          <Card
            title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
            bordered={false}
            className="tw-card-adjust"
          >
            <DescriptionList size="large" col={2} hasSeparator>
              <Description term="提现人">{formData.resName}</Description>
              <Description term="提现单号">{formData.withdrawNo}</Description>
              <Description term="申请日期">{formData.applyDate}</Description>
              <Description term="审批状态">{formData.apprStatusDesc}</Description>
              <Description term="申请提现当量">{formData.eqva}</Description>
              <Description term="申请提现金额">{formData.applyAmt}</Description>
              <Description term="调整提现金额">{formData.amt}</Description>
              <Description term="内部资源类型">{formData.resInnerTypeDesc}</Description>
              <Description term="HR处理批次号">{formData.hrBatchNo}</Description>
              <Description term="备注">{formData.remark}</Description>
            </DescriptionList>
          </Card>
          <br />
          <Card title="提现列表" bordered={false} className="tw-card-adjust">
            {editAmtAbleFlag ? (
              <EditableDataTable {...editTableProps} />
            ) : (
              <DataTable {...tableProps} />
            )}
          </Card>
        </BpmWrapper>
        {!taskId && !loading && <BpmConnection source={allBpm} />}

        <Modal
          title="资源工时情况"
          visible={timeSheetInfoModalVisible}
          onOk={this.onSelectTmp}
          onCancel={this.switchTimeSheetInfoModal}
          width="80%"
          footer={null}
        >
          <Card title={titleMessage} bordered={false} className="tw-card-adjust">
            <DataTable {...timeSheetTableProps} />
          </Card>
        </Modal>

        <Modal
          title="资源当量收入情况"
          visible={eqvaSalaryInfoModalVisible}
          onCancel={this.switchEqvaSalaryInfoModal}
          width="80%"
          footer={null}
        >
          <Card title="资源当量收入情况" bordered={false} className="tw-card-adjust">
            <DataTable {...eqvaSalaryTableProps} />
          </Card>
        </Modal>

        <Modal
          title="分摊提现金额"
          visible={amtShareModalVisible}
          onCancel={this.switchAmtShareInfoModal}
          onOk={this.handleShareAmtOk}
        >
          <InputNumber
            value={totalAmt}
            className="x-fill-100"
            placeholder="请输入总金额"
            onChange={this.totalAmtChange}
          />
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default WithdrawDetail;
