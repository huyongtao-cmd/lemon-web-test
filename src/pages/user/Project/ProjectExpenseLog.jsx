import React, { Component } from 'react';
import router from 'umi/router';
import Link from 'umi/link';
import classnames from 'classnames';
import { Button, Card, DatePicker, Checkbox, Input } from 'antd';
import { connect } from 'dva';
import { isNil, isEmpty, omit } from 'ramda';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import AsyncSelect from '@/components/common/AsyncSelect';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import DataTable from '@/components/common/DataTable';
import { selectInternalOus } from '@/services/gen/list';
import { selectUsers } from '@/services/sys/user';
import { selectBus } from '@/services/org/bu/bu';
import { UdcSelect } from '@/pages/gen/field';
import { TagOpt } from '@/utils/tempUtils';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import { formatDTHM, formatDT } from '@/utils/tempUtils/DateTime';
import SelectWithCols from '@/components/common/SelectWithCols';

const { Description } = DescriptionList;

const DOMAIN = 'userProjectExpenseLog';

const buColumns = [
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

@connect(({ loading, userProjectExpenseLog, dispatch }) => ({
  loading,
  userProjectExpenseLog,
  dispatch,
}))
@mountToTab()
class ProjectExpenseLog extends Component {
  state = {
    cacheResList: undefined,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { reasonId } = fromQs();
    const initialState = {
      searchForm: {},
      dataSource: [],
      total: 0,
      formData: {},
    };
    dispatch({ type: `${DOMAIN}/updateState`, payload: initialState });
    dispatch({ type: `${DOMAIN}/queryInfo`, payload: reasonId });
    dispatch({ type: `${DOMAIN}/queryBuSelect` });
    this.fetchData({ reasonId });
  }

  fetchData = params => {
    const { applyDate, reimResId } = params || {};
    const newApplyDate = {};
    const newReimRes = {};
    if (isNil(applyDate) || isEmpty(applyDate)) {
      // do nothing
    } else {
      newApplyDate.applyDateStart = formatDT(applyDate[0]);
      newApplyDate.applyDateEnd = formatDT(applyDate[1]);
    }
    if (isNil(reimResId) || isEmpty(reimResId)) {
      // do nothing
    } else {
      newReimRes.reimResId = reimResId.id;
    }
    const { dispatch } = this.props;
    const standardParams = {
      reasonId: fromQs().reasonId,
    };
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...newApplyDate,
        ...newReimRes,
        ...omit(['applyDate', 'reimResId'], params),
        ...standardParams,
      },
    });
  };

  getTableProps = () => {
    const { dispatch, loading, userProjectExpenseLog } = this.props;
    const { searchForm, dataSource, total, buList } = userProjectExpenseLog;
    const { cacheResList } = this.state;

    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      // scroll: { x: 2100 },
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      searchForm,
      enableSelection: false,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      leftButtons: [
        {
          key: 'export',
          className: 'tw-btn-primary',
          icon: 'export',
          title: '导出全部明细',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { reasonId } = fromQs();
            window.location.href =
              SERVER_URL + `/api/op/v1/project/reimInfo/export?reasonId=${reasonId}`;
          },
        },
      ],
      searchBarForm: [
        {
          title: '填报人',
          dataIndex: 'reimResId',
          options: {
            initialValue: searchForm.reimResId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择填报人"
              columns={buColumns}
              dataSource={isNil(cacheResList) ? buList : cacheResList}
              selectProps={{
                className: 'x-fill-100',
                showSearch: true,
                onSearch: value => {
                  if (isNil(value)) this.setState({ cacheResList: undefined });
                  else
                    this.setState({
                      cacheResList: buList.filter(
                        d =>
                          d.code.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    });
                },
                allowClear: true,
              }}
            />
          ),
        },
        {
          title: '报销单号',
          dataIndex: 'reimNo',
          options: {
            initialValue: searchForm.reimNo,
          },
          tag: <Input placeholder="报销单号" />,
        },
        {
          title: '报销类型',
          dataIndex: 'reimType1',
          options: {
            initialValue: searchForm.reimType1,
          },
          tag: <UdcSelect code="ACC:REIM_TYPE1" placeholder="请选择报销类型" />,
        },
        {
          title: '费用类型',
          dataIndex: 'reimType2',
          options: {
            initialValue: searchForm.reimType2,
          },
          tag: <UdcSelect code="ACC:REIM_TYPE2" placeholder="请选择费用类型" />,
        },
        {
          title: '报销单状态',
          dataIndex: 'reimStatus',
          options: {
            initialValue: searchForm.reimStatus,
          },
          tag: <UdcSelect code="ACC:REIM_STATUS" placeholder="报销单状态" />,
        },
        {
          title: '日期区间',
          dataIndex: 'applyDate',
          options: {
            initialValue: [searchForm.applyDateStart, searchForm.applyDateEnd],
          },
          tag: (
            <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} className="x-fill-100" />
          ),
        },
      ],
      columns: [
        {
          title: '填报日期',
          dataIndex: 'applyDate',
          align: 'center',
          // render: applyDate => formatDT(applyDate),
        },
        {
          title: '填报人',
          dataIndex: 'reimResName',
        },
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
            const from = encodeURIComponent(
              `/user/project/projectExpenseLogs?reasonId=${fromQs().reasonId}`
            );
            return (
              <Link className="tw-link" to={`/plat/expense/${type}/view?id=${row.id}&from=${from}`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '单据状态',
          dataIndex: 'reimStatusDesc',
          align: 'center',
        },
        {
          title: '审批状态',
          dataIndex: 'apprStatusDesc',
          align: 'center',
        },
        {
          title: '报销费用',
          dataIndex: 'taxedReimAmt',
          align: 'right',
          render: value => (value ? value.toFixed(2) : null),
        },
        {
          title: '调整后费用',
          dataIndex: 'totalAdjustedAmt',
          align: 'right',
          render: value => (value ? value.toFixed(2) : null),
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
      ],
    };
  };

  render() {
    const {
      loading,
      dispatch,
      userProjectExpenseLog: { formData },
    } = this.props;
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`];

    const param = fromQs();

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() => closeThenGoto(`/user/project/projectDetail?id=${param.reasonId}`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={<Title icon="profile" text="项目报销记录" />}
          bordered={false}
        >
          <DescriptionList size="large" title="项目简况" col={2}>
            <Description term="项目名称">{formData.projName}</Description>
            <Description term="预算编码">{formData.budgetNo}</Description>
            <Description term="版本号">{formData.versionNo}</Description>
            <Description term="费用预算总金额">{formData.feeBudgetAmt}</Description>
            <Description term="已使用金额">{formData.userdAmt}</Description>
            <Description term="申请中金额">{formData.approvingAmt}</Description>
          </DescriptionList>
        </Card>
        <Card>
          <DataTable {...this.getTableProps()} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectExpenseLog;
