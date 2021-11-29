import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable from '@/components/production/business/SearchTable';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import { outputHandle } from '@/utils/production/outputUtil';
import message from '@/components/production/layout/Message';

// 调用service引入
// @ts-ignore
import {
  tripApplyListPaging,
  tripApplyLogicalDelete,
} from '../../../../services/production/adm/trip/tripApply';

// namespace声明
const DOMAIN = 'tripDisplayPage';

/**
 * 单表案例 列表页面
 */
@connect(({ dispatch, tripDisplayPage }) => ({
  dispatch,
  ...tripDisplayPage,
}))
class TripApplyList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 查询数据方法,传给SearchTable组件使用
   * @param params 查询参数
   * @returns {Promise<*>} 查询到的结果,给SearchTable组件使用,展示数据
   */
  fetchData = async params => {
    const { startEndDate, applyDate } = params;
    const queryParms = params;
    if (startEndDate !== null && startEndDate !== undefined && startEndDate.length === 2) {
      const start = new Date(startEndDate[0]);
      const end = new Date(startEndDate[1]);
      Object.assign(queryParms, { strStartDate: start.valueOf(), strEndDate: end.valueOf() });
      delete queryParms.startEndDate;
    }
    if (applyDate !== null && applyDate !== undefined && applyDate.length === 2) {
      const start = new Date(applyDate[0]);
      const end = new Date(applyDate[1]);
      Object.assign(queryParms, {
        strStartApplyDate: start.valueOf(),
        strEndApplyDate: end.valueOf(),
      });
      delete queryParms.applyDate;
    }
    const { data } = await outputHandle(tripApplyListPaging, queryParms);
    return data;
  };

  /**
   * 删除数据方法,传给SearchTable组件使用
   * @param keys 要删除的数据主键
   * @returns {Promise<*>} 删除结果,给SearchTable组件使用
   */
  deleteData = async keys =>
    outputHandle(tripApplyLogicalDelete, { keys: keys.join(',') }, undefined, false);

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
  renderSearchForm = () => [
    <SearchFormItem
      key="tripNoOrName"
      fieldType="BaseInput"
      label="申请单号/名称"
      fieldKey="tripNoOrName"
      defaultShow
    />,
    <SearchFormItem
      key="tripApplyStatus"
      fieldType="BaseSelect"
      label="申请单状态"
      fieldKey="tripApplyStatus"
      defaultShow
      advanced
      parentKey="COM:DOC_STATUS"
    />,
    <SearchFormItem
      key="startEndDate"
      fieldType="BaseDateRangePicker"
      label="出差日期"
      fieldKey="startEndDate"
      defaultShow={false}
      advanced
    />,
    <SearchFormItem
      key="chargeProjectId"
      fieldType="ProjectSimpleSelect"
      label="费用承担项目"
      fieldKey="chargeProjectId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="resId"
      fieldType="BuSimpleSelect"
      label="费用承担部门"
      fieldKey="chargeBuId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      fieldType="BaseCustomSelect"
      label="费用承担公司"
      fieldKey="chargeCompany"
      parentKey="CUS:INTERNAL_COMPANY"
    />,
    <SearchFormItem
      key="applyResId"
      fieldType="ResSimpleSelect"
      label="申请人"
      fieldKey="applyResId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="applyDate"
      fieldType="BaseDateRangePicker"
      label="申请日期"
      fieldKey="applyDate"
      parentKey="FUNCTION:SYSTEM_REMIND:TYPE"
    />,
  ];

  render() {
    const { getInternalState } = this.state;

    // 表格展示列
    const columns = [
      {
        title: '申请单号',
        dataIndex: 'tripNo',
        sorter: true,
        render: (value, row, index) =>
          value ? (
            <Link twUri={`/workTable/user/myTripApplyDisplay?id=${row.id}&mode=DESCRIPTION`}>
              {value}
            </Link>
          ) : (
            value
          ),
      },
      {
        title: '申请单名称',
        dataIndex: 'tripName',
        sorter: false,
      },
      {
        title: '出发日期',
        dataIndex: 'startDate',
        sorter: false,
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        sorter: false,
      },
      {
        title: '申请单状态',
        dataIndex: 'tripApplyStatusDesc',
        sorter: false,
      },
      {
        title: '费用归属',
        dataIndex: 'chargeClassificationDesc',
        sorter: false,
      },
      {
        title: '费用承担项目',
        dataIndex: 'chargeProjectName',
        sorter: false,
      },
      {
        title: '费用承担部门',
        dataIndex: 'chargeBuName',
        sorter: false,
      },
      {
        title: '费用承担公司',
        dataIndex: 'chargeCompanyName',
        sorter: false,
      },
      {
        title: '申请人',
        dataIndex: 'applyResName',
        sorter: true,
        sortBy: 'applyResId',
      },
      {
        title: '申请日期',
        dataIndex: 'applyDate',
        sorter: true,
      },
    ];

    const extraButtons = [];

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
          defaultSearchAreaVisible="false"
          fetchData={this.fetchData} // 获取数据的方法,请注意获取数据的格式
          columns={columns} //{columns} // 要展示的列
          // 出差申请管理功能，只需要让行政管理员查看就行了
          // 修改和删除的功能 就都不需要了，暂时屏蔽调，时间就了还不开启的话就可以删掉了
          // onEditClick={data => {
          //   if (data.tripApplyStatus === 'CREATE') {
          //     router.push(`/workTable/user/myTripApplyDisplay?id=${data.id}&mode=EDIT`);
          //   } else {
          //     message({ type: 'error', content: '只有新建状态可以修改！' });
          //   }
          // }} // 编辑按钮逻辑,不写不显示
          // deleteData={this.deleteData} // 删除按钮逻辑,不写不显示
          defaultAdvancedSearch={false} // 查询条件默认为高级查询
          showSearchCardTitle={false} // 现实查询表单的title
          autoSearch // 进入页面默认查询数据
          extraButtons={extraButtons}
        />
      </PageWrapper>
    );
  }
}

export default TripApplyList;
