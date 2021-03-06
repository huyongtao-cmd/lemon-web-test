import React from 'react';
import { connect } from 'dva';
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
// @ts-ignore
import { productReportPaging } from '@/services/production/report';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import { treeToList, treeListForeach } from '@/utils/production/TreeUtil.ts';
import { Tooltip } from 'antd';
import Button from '@/components/production/basic/Button.tsx';
import styles from '@/pages/production/bud/budget/budgetDisplayPage.less';

const DOMAIN = 'productReport';

@connect(({ loading, dispatch, productReport, user: { user } }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...productReport,
  user,
}))
class ProductReport extends React.PureComponent {
  state = {};

  componentDidMount() {}

  fetchData = async params => {
    let wrappedParam = { ...params };
    if (params.actualPaymentDateRange) {
      [wrappedParam.dateFrom, wrappedParam.dateTo] = params.actualPaymentDateRange;
      delete wrappedParam.actualPaymentDateRange;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(productReportPaging, wrappedParam);
    this.setState({ reportData: data.rows });
    return data;
  };

  onExpand = (expanded, record) => {
    const { expandedRowKeys } = this.state;
    const set = new Set(expandedRowKeys);
    if (!expanded) {
      set.delete(record.key);
    } else {
      set.add(record.key);
    }
    // this.updateModelState({ unExpandedRowKeys: [...set] });
    this.setState({ expandedRowKeys: [...set] });
  };

  handleExpand = () => {
    const { reportData } = this.state;
    const keys = new Set();
    treeListForeach(reportData, row => {
      keys.add(row.key);
    });
    this.setState({ expandedRowKeys: [...keys] });
  };

  handleNorrow = () => {
    const keys = [];
    this.setState({ expandedRowKeys: [...keys] });
  };

  // ??????model???state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // ??????model???????????????
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  renderSearchForm = extInfo => [
    <SearchFormItem
      label="??????"
      // mode="multiple"
      fieldKey="productId"
      key="productId"
      fieldType="ProductManagementSelect"
      defaultShow
      queryParam={{
        productStatusList: ['ACTIVE', 'CLOSE'].join(','),
      }}
    />,

    <SearchFormItem
      key="actualPaymentDateFrom"
      fieldType="BaseDateRangePicker"
      label="????????????????????????"
      fieldKey="actualPaymentDateRange"
      defaultShow
    />,
  ];

  render() {
    const {
      form,
      formData,
      user: { extInfo = {} },
      ...rest
    } = this.props;
    const { expandedRowKeys = [], reportData = '' } = this.state;

    const rightButtons = [
      <Tooltip key="expand" placement="top" title="????????????">
        <Button
          className={styles.expandBtns}
          size="large"
          icon="plus"
          style={{ marginRight: 4 }}
          onClick={this.handleExpand}
        />
      </Tooltip>,
      <Tooltip key="norrow" placement="top" title="????????????">
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
        title: '??????',
        dataIndex: 'category',
        ellipsis: true,
        key: 'category',
      },
      {
        title: '??????',
        dataIndex: 'expect',
        ellipsis: true,
        key: 'expect',
        width: '20%',
        align: 'right',
        render: (val, row, index) => val.toLocaleString(),
      },
      {
        title: '??????',
        dataIndex: 'actual',
        ellipsis: true,
        key: 'actual',
        width: '20%',
        align: 'right',
        render: (val, row, index) => val.toLocaleString(),
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          searchTitle="???????????????"
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm(extInfo)}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          showExport={false}
          showColumnSwitch={false}
          autoSearch={false}
          selectType={null}
          tableExtraProps={{
            expandedRowKeys,
            onExpand: this.onExpand,
            buttons: rightButtons,
            pagination: false,
          }}
          rowKey="key"
          // tableExtraProps={{ scroll: { x: 2400 } }}
        />
      </PageWrapper>
    );
  }
}

export default ProductReport;
