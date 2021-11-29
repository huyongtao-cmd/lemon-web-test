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

const DOMAIN = 'buWithdrawDetail';

@connect(({ loading, buWithdrawDetail, dispatch, user }) => ({
  loading,
  ...buWithdrawDetail,
  dispatch,
  user,
}))
@mountToTab()
class BuWithdrawDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
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
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: params });
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

  render() {
    const { loading, dataSource, formData, dispatch, fieldsConfig: config, flowForm } = this.props;
    const { taskKey } = config;

    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const { taskId, id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A48', title: 'BU提现申请流程' }];
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
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
        /* {
          title: '调整提现金额',
          dataIndex: 'amt',
          align: 'center',
        }, */
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
      buttons: [],
    };
    const param = fromQs();

    return (
      <PageHeaderWrapper title="提现">
        <BpmWrapper
          fieldsConfig={config}
          flowForm={flowForm}
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
              <Description term="提现类型">{formData.withdrawTypeDesc}</Description>
              <Description term="提现账户">{formData.ledgerName}</Description>

              <Description term="申请提现当量">{formData.eqva}</Description>
              <Description term="申请提现金额">{formData.applyAmt}</Description>
              {/* <Description term="调整提现金额">{formData.amt}</Description> */}
              <Description term="备注">{formData.remark}</Description>
            </DescriptionList>
          </Card>
          <br />
          <Card title="提现列表" bordered={false} className="tw-card-adjust">
            <DataTable {...tableProps} />
          </Card>
        </BpmWrapper>
        {!taskId && !disabledBtn && <BpmConnection source={allBpm} />}
      </PageHeaderWrapper>
    );
  }
}

export default BuWithdrawDetail;
