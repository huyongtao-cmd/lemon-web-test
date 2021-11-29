import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Link from 'umi/link';
import { Input } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatDT } from '@/utils/tempUtils/DateTime';
import DataTable from '@/components/common/DataTable';
import createMessage from '@/components/core/AlertMessage';
// import { UdcSelect } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import Loading from '@/components/core/DataLoading';

const DOMAIN = 'userMyLeads';
const CREATE = 'CREATE';
@connect(({ loading, userMyLeads }) => ({
  userMyLeads,
  loading: loading.effects[`${DOMAIN}/getPageConfig`] || loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class UserMyLeads extends PureComponent {
  componentDidMount() {
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });]
    const { dispatch } = this.props;
    // 页面可配置化数据请求
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'LEADS_MANAGEMENT_MY_LIST' },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, isMyLeads: true },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userMyLeads: { dataSource, total, searchForm, pageConfig },
    } = this.props;

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentListConfig = [];
    let currentQueryConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'LEADS_MANAGEMENT_MY_LIST') {
        currentListConfig = view;
      } else if (view.blockKey === 'LEADS_MANAGEMENT_MY_QUERY') {
        currentQueryConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsList } = currentListConfig;
    const { pageFieldViews: pageFieldViewsQuery } = currentQueryConfig;
    const pageFieldJsonList = {};
    const pageFieldJsonQuery = {};
    if (pageFieldViewsList) {
      pageFieldViewsList.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsQuery) {
      pageFieldViewsQuery.forEach(field => {
        pageFieldJsonQuery[field.fieldKey] = field;
      });
    }

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading,
      total,
      dataSource,
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
        pageFieldJsonQuery.leadsName.visibleFlag && {
          title: `${pageFieldJsonQuery.leadsName.displayName}`,
          dataIndex: 'leadsName',
          sortNo: `${pageFieldJsonQuery.leadsName.sortNo}`,
          options: {
            initialValue: searchForm.leadsName,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.leadsName.displayName}`} />,
        },
        pageFieldJsonQuery.leadsNo.visibleFlag && {
          title: `${pageFieldJsonQuery.leadsNo.displayName}`,
          dataIndex: 'leadsNo',
          sortNo: `${pageFieldJsonQuery.leadsNo.sortNo}`,
          options: {
            initialValue: searchForm.leadsNo,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.leadsNo.displayName}`} />,
        },
        pageFieldJsonQuery.custName.visibleFlag && {
          title: `${pageFieldJsonQuery.custName.displayName}`,
          dataIndex: 'custName',
          sortNo: `${pageFieldJsonQuery.custName.sortNo}`,
          options: {
            initialValue: searchForm.custName,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.custName.displayName}`} />,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        pageFieldJsonList.leadsNo.visibleFlag && {
          title: `${pageFieldJsonList.leadsNo.displayName}`,
          dataIndex: 'leadsNo',
          sortNo: `${pageFieldJsonList.leadsNo.sortNo}`,
          align: 'center',
          sorter: true,
          render: (value, row, key) => {
            const urls = getUrl();
            const from = stringify({ from: urls });
            const href = `/user/center/leadsView?id=${row.id}&${from}`;
            return (
              <Link className="tw-link" to={href}>
                {value}
              </Link>
            );
          },
        },
        pageFieldJsonList.leadsName.visibleFlag && {
          title: `${pageFieldJsonList.leadsName.displayName}`,
          dataIndex: 'leadsName',
          sortNo: `${pageFieldJsonList.leadsName.sortNo}`,
          sorter: true,
        },
        pageFieldJsonList.leadsStatus.visibleFlag && {
          title: `${pageFieldJsonList.leadsStatus.displayName}`,
          dataIndex: 'leadsStatusDesc',
          sortNo: `${pageFieldJsonList.leadsStatus.sortNo}`,
          align: 'center',
        },
        pageFieldJsonList.isReward.visibleFlag && {
          title: `${pageFieldJsonList.isReward.displayName}`,
          dataIndex: 'isRewardValue',
          align: 'center',
          sortNo: `${pageFieldJsonList.isReward.sortNo}`,
        },
        pageFieldJsonList.isRewardReason.visibleFlag && {
          title: `${pageFieldJsonList.isRewardReason.displayName}`,
          dataIndex: 'isRewardReason',
          align: 'center',
          sortNo: `${pageFieldJsonList.isRewardReason.sortNo}`,
        },
        pageFieldJsonList.rewardPrice.visibleFlag && {
          title: `${pageFieldJsonList.rewardPrice.displayName}`,
          dataIndex: 'rewardPrice',
          align: 'center',
          sortNo: `${pageFieldJsonList.rewardPrice.sortNo}`,
        },
        pageFieldJsonList.rewardBuId.visibleFlag && {
          title: `${pageFieldJsonList.rewardBuId.displayName}`,
          dataIndex: 'rewardBuIdName',
          align: 'center',
          sortNo: `${pageFieldJsonList.rewardBuId.sortNo}`,
        },
        pageFieldJsonList.isReceived.visibleFlag && {
          title: `${pageFieldJsonList.isReceived.displayName}`,
          dataIndex: 'isReceivedValue',
          align: 'center',
          sortNo: `${pageFieldJsonList.isReceived.sortNo}`,
        },
        pageFieldJsonList.reimId.visibleFlag && {
          title: `${pageFieldJsonList.reimId.displayName}`,
          dataIndex: 'reimId',
          align: 'center',
          sortNo: `${pageFieldJsonList.reimId.sortNo}`,
        },
        pageFieldJsonList.custName.visibleFlag && {
          title: `${pageFieldJsonList.custName.displayName}`,
          dataIndex: 'custName',
          sortNo: `${pageFieldJsonList.custName.sortNo}`,
        },
        pageFieldJsonList.custContact.visibleFlag && {
          title: `${pageFieldJsonList.custContact.displayName}`,
          dataIndex: 'custContact',
          sortNo: `${pageFieldJsonList.custContact.sortNo}`,
        },
        pageFieldJsonList.contactPhone.visibleFlag && {
          title: `${pageFieldJsonList.contactPhone.displayName}`,
          dataIndex: 'contactPhone',
          sortNo: `${pageFieldJsonList.contactPhone.sortNo}`,
        },
        pageFieldJsonList.createUserId.visibleFlag && {
          title: `${pageFieldJsonList.createUserId.displayName}`,
          dataIndex: 'createUserName',
          sortNo: `${pageFieldJsonList.createUserId.sortNo}`,
        },
        pageFieldJsonList.createTime.visibleFlag && {
          title: `${pageFieldJsonList.createTime.displayName}`,
          dataIndex: 'createTime',
          sortNo: `${pageFieldJsonList.createTime.sortNo}`,
          render: value => formatDT(value),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRows[0].leadsStatus === CREATE) {
              router.push(
                `/sale/management/leadsedit?id=${selectedRowKeys[0]}&mode=update&page=myleads`
              );
            } else {
              createMessage({ type: 'warn', description: '仅新建的线索能够修改' });
            }
          },
        },
        {
          key: 'acceptReward',
          className: 'tw-btn-primary',
          title: '领奖',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows) => {
            if (!(selectedRows[0].isRewardValue === '是' && !selectedRows[0].isReceivedValue)) {
              createMessage({ type: 'warn', description: '仅有奖的线索且没有领取过才可以领奖哦' });
              return;
            }
            router.push(
              `/plat/expense/normal/create?rewardFlag=true&rm=${
                selectedRows[0].rewardPrice
              }&bz=CNY&expenseBu=${selectedRows[0].rewardBuId}&expenseOuId=${
                selectedRows[0].expenseOuId
              }&leadNo=${selectedRows[0].leadsNo}&leadName=${
                selectedRows[0].leadsName
              }&expenseBuName=${selectedRows[0].rewardBuIdName}&leadsId=${selectedRows[0].id}`
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="我报备的线索">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default UserMyLeads;
