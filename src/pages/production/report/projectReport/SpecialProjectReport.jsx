import React from 'react';
import { connect } from 'dva';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
// @ts-ignore
import { specialProjectReportPaging } from '@/services/production/report';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import { treeToList, treeListForeach } from '@/utils/production/TreeUtil.ts';
import { Checkbox, Tooltip } from 'antd';
import Button from '@/components/production/basic/Button.tsx';
import styles from '@/pages/production/bud/budget/budgetDisplayPage.less';
import { formatDT } from '@/utils/tempUtils/DateTime';

const DOMAIN = 'specialProjectReport';

@connect(({ loading, dispatch, specialProjectReport }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...specialProjectReport,
}))
class SpecialProjectReport extends React.PureComponent {
  state = {};

  componentDidMount() {}

  fetchData = async params => {
    let wrappedParam = { ...params };
    if (params.actualPaymentDateRange) {
      [wrappedParam.dateFrom, wrappedParam.dateTo] = params.actualPaymentDateRange;
      delete wrappedParam.actualPaymentDateRange;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(specialProjectReportPaging, wrappedParam);
    this.setState({
      reportData: data.rows,
      projectIds: data.projectIds,
      projectNameLists: data.projectNameLists,
    });
    return data;
  };

  onExpand = (expanded, record) => {
    const { expandedRowKeys } = this.state;
    const set = new Set(expandedRowKeys);
    if (!expanded) {
      set.delete(record.budgetItemCode);
    } else {
      set.add(record.budgetItemCode);
    }
    // this.updateModelState({ unExpandedRowKeys: [...set] });
    this.setState({ expandedRowKeys: [...set] });
  };

  handleExpand = () => {
    const { reportData } = this.state;
    const keys = new Set();
    treeListForeach(reportData, row => {
      keys.add(row.budgetItemCode);
    });
    this.setState({ expandedRowKeys: [...keys] });
  };

  handleNorrow = () => {
    const keys = [];
    this.setState({ expandedRowKeys: [...keys] });
  };

  getColumns = () => {
    const { projectIds = [], projectNameLists = [] } = this.state;

    const columns = projectIds.map((item, index) => ({
      title: projectNameLists[index],
      children: [
        {
          title: '预算金额',
          dataIndex: 'budgetAmt_' + item,
          ellipsis: true,
          key: 'budgetAmt_' + item,
          align: 'right',
          render: (val, row, i) => val.toLocaleString(),
        },
        {
          title: '拨款金额',
          dataIndex: 'appropriationAmt_' + item,
          ellipsis: true,
          key: 'appropriationAmt_' + item,
          align: 'right',
          render: (val, row, i) => val.toLocaleString(),
        },
        {
          title: '占用及使用金额',
          dataIndex: 'occupiedAndUsedAmt_' + item,
          ellipsis: true,
          key: 'occupiedAndUsedAmt_' + item,
          align: 'right',
          render: (val, row, i) => val.toLocaleString(),
        },
      ],
    }));

    return columns;
  };

  // 修改model层state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // 调用model层异步方法
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  renderSearchForm = () => [
    <SearchFormItem
      key="actualPaymentDateFrom"
      fieldType="BaseDateRangePicker"
      label="实际金额发生期间"
      fieldKey="actualPaymentDateRange"
      defaultShow
    />,
  ];

  render() {
    const { form, formData, ...rest } = this.props;
    const { expandedRowKeys = [], reportData = [], projectIds = [] } = this.state;

    const rightButtons = [
      <Tooltip key="expand" placement="top" title="全部展开">
        <Button
          className={styles.expandBtns}
          size="large"
          icon="plus"
          style={{ marginRight: 4 }}
          onClick={this.handleExpand}
        />
      </Tooltip>,
      <Tooltip key="norrow" placement="top" title="全部缩起">
        <Button
          className={styles.expandBtns}
          size="large"
          icon="minus"
          style={{ marginRight: 4 }}
          onClick={this.handleNorrow}
        />
      </Tooltip>,
    ];

    const columns = [
      {
        title: '类别',
        dataIndex: 'budgetItemName',
        ellipsis: true,
        key: 'budgetItemName',
        width: '300px',
        fixed: 'left',
      },
    ];
    columns.push(...this.getColumns());

    return (
      <PageWrapper>
        <SearchTable
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          showExport={false}
          showColumnSwitch={false}
          selectType={null}
          tableExtraProps={{
            expandedRowKeys,
            onExpand: this.onExpand,
            buttons: rightButtons,
            pagination: false,
            scroll: { x: 4000 },
          }}
          rowKey="budgetItemCode"
        />
      </PageWrapper>
    );
  }
}

export default SpecialProjectReport;
