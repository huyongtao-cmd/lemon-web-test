import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import Button from '@/components/production/basic/Button';
import SearchTable from '@/components/production/business/SearchTable';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import { outputHandle } from '@/utils/production/outputUtil';
// 调用service引入
// @ts-ignore
import { budgetOccupyInfo } from '@/services/production/bud';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import { fromQs } from '@/utils/production/stringUtil.ts';

// namespace声明
const DOMAIN = 'singleCaseListDemo';

/**
 * 预算类型与路由映射
 * @type {{}}
 */
const uriMap = {
  EXPENSE_CLAIM: '/workTable/cos/regularExpenseDisplay?mode=DESCRIPTION',
  PURCHASE_ORDER: '/workTable/pur/purchaseDisplayPage?mode=DESCRIPTION',
  PURCHASE_PAYMENT: '/workTable/pur/paymentRequestDisplayPage?mode=DESCRIPTION',
  TRIP_EXPENSE: '/workTable/user/myTripApplyDisplay?mode=DESCRIPTION',
  LOAN_APPLY: '/workTable/cos/loanDisplay?mode=DESCRIPTION',
  OTHER_PAYMENT: '/plat/othersExpense/othersPaymentDisplay?mode=DESCRIPTION',
  BOOKING_BY_ADMIN: '/workTable/adm/bookingByAdminDisplay?mode=DESCRIPTION',
};

/**
 * 预算项目占用信息
 */
@connect(({ dispatch, singleCaseListDemo }) => ({
  dispatch,
  ...singleCaseListDemo,
}))
class OccupyInfoList extends React.PureComponent {
  constructor(props) {
    super(props);
    const param = fromQs();
    this.state = {
      param,
    };
  }

  componentDidMount() {}

  /**
   * 查询数据方法,传给SearchTable组件使用
   * @param params 查询参数
   * @returns {Promise<*>} 查询到的结果,给SearchTable组件使用,展示数据
   */
  fetchData = async params => {
    const { param } = this.state;
    const { data } = await outputHandle(budgetOccupyInfo, {
      ...params,
      budgetId: param.budgetId,
      budgetItemIds: param.budgetItemId,
    });
    return data;
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 组装查询条件
   * @returns {*[]} 查询条件集合
   */
  renderSearchForm = () => [];

  render() {
    const { getInternalState } = this.state;

    // 表格展示列
    const columns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '占用金额',
        dataIndex: 'occupiedAmt',
      },
      {
        title: '已使用金额',
        dataIndex: 'usedAmt',
      },
      {
        title: '来源类型',
        dataIndex: 'docTypeDesc',
      },
      {
        title: '操作',
        dataIndex: 'remark',
        render: (value, row, index) => (
          <Link twUri={`${uriMap[row.docType]}&id=${row.mainDocId}`}>查看单据</Link>
        ),
      },
    ];

    return (
      <PageWrapper>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          searchForm={this.renderSearchForm()} // 查询条件
          defaultSearchForm={{}} // 查询条件默认值,重置时查询条件默认这里面的值
          defaultSortBy="id"
          defaultSortDirection="DESC"
          fetchData={this.fetchData} // 获取数据的方法,请注意获取数据的格式
          columns={columns} // 要展示的列
        />
      </PageWrapper>
    );
  }
}

export default OccupyInfoList;
