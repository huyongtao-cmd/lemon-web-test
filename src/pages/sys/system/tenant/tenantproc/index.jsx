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
import BaseSwitch from '@/components/production/basic/BaseSwitch';

// 调用service引入
// @ts-ignore
import { listPaging, logicDel } from '@/services/sys/system/tenantProc';

// namespace声明
const DOMAIN = 'tenantProcList';

/**
 * 单表案例 列表页面
 */
@connect(({ dispatch, tenantProcList }) => ({
  dispatch,
  ...tenantProcList,
}))
class TenantProcList extends React.PureComponent {
  // 类名跟文件名可以不一致
  constructor(props) {
    super(props);
    this.state = {};
    this.callModelEffects('pageQuery', {});
  }

  /**
   * 查询数据方法,传给SearchTable组件使用
   * @param params 查询参数
   * @returns {Promise<*>} 查询到的结果,给SearchTable组件使用,展示数据
   */
  fetchData = async params => {
    const { data } = await outputHandle(listPaging, params);
    // const fetchD = await outputHandle(listPaging, params);// 后端返回的数据；outputHandle 已经把包裹的code status response去掉了
    // console.error('fetchD=',fetchD);
    return data;
  };

  /**
   * 删除数据方法,传给SearchTable组件使用
   * @param keys 要删除的数据主键
   * @returns {Promise<*>} 删除结果,给SearchTable组件使用
   */
  deleteData = async keys => {
    const { data } = await outputHandle(logicDel, { ids: keys.join(',') });
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

  changeEnable = (id, value) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/partial`,
      payload: { id, isEnable: value },
    }).then(() => {
      // this.fetchData().then(data => {}); // todo 怎么更新表格数据
      const { getInternalState } = this.state;
      const { refreshData } = getInternalState();
      refreshData();
    });
  };

  /**
   * 组装查询条件
   * @returns {*[]} 查询条件集合
   */
  // renderSearchForm = () => [

  // ];

  render() {
    const { getInternalState } = this.state;
    const { pageConfig } = this.props;
    const listJson = {};
    const queryJson = {};
    if (
      !pageConfig.configInfo ||
      !pageConfig.configInfo.pageBlockViews ||
      pageConfig.configInfo.pageBlockViews.length < 1
    ) {
      return <div />;
    }

    const {
      configInfo: { pageBlockViews },
    } = pageConfig;
    pageBlockViews.find(b => b.blockKey === 'TENANT_PROC_LIST').pageFieldViews.forEach(field => {
      listJson[field.fieldKey] = field;
    });
    pageBlockViews.find(b => b.blockKey === 'TENANT_PROC_QUERY').pageFieldViews.forEach(field => {
      queryJson[field.fieldKey] = field;
    });

    // 表格展示列
    const columns = [
      {
        fieldKey: 'tenantId',
        title: '所属租户',
        dataIndex: 'tenantName',
        sorter: true,
      },
      {
        fieldKey: 'procIden',
        title: '流程标识',
        dataIndex: 'procIden',
        sorter: true,
        render: (value, row, index) => (
          <Link twUri={`/back/tenant/tenantProcDetail?id=${row.id}&mode=DESCRIPTION`}>{value}</Link>
        ),
      },
      {
        fieldKey: 'procKey',
        title: '流程类型',
        dataIndex: 'procKey',
        sorter: true,
      },
      {
        fieldKey: 'procName',
        title: '流程名称',
        dataIndex: 'procName',
        sorter: true,
      },
      {
        fieldKey: 'remark',
        title: '备注',
        dataIndex: 'remark',
      },
      {
        fieldKey: 'isEnable',
        field: 'isEnable',
        title: '是否启用',
        dataIndex: 'isEnable',
        render: (value, row, index) => (
          <BaseSwitch
            id="isEnable"
            value={value}
            onChange={v => this.changeEnable(row.id, v)}
            checkedChildren="启用"
            unCheckedChildren="不启用"
          />
        ),
      },
    ]
      .filter(c => listJson[c.fieldKey] && listJson[c.fieldKey].visibleFlag) // 是否可见
      .map(c => ({
        // 显示名称
        ...c,
        title: listJson[c.fieldKey].displayName,
      }))
      .sort((c1, c2) => listJson[c1.fieldKey].sortNo - listJson[c2.fieldKey].sortNo); // 排序

    const queryForm = [
      <SearchFormItem
        key="tenantId"
        fieldType="TenantSimpleSelect"
        descriptionField="tenantName"
        label="所属租户"
        fieldKey="tenantId"
        defaultShow
        advanced
      />,
      <SearchFormItem
        key="procIden"
        fieldType="BaseInput"
        label="流程标识"
        fieldKey="procIden"
        defaultShow
        advanced
      />,
      <SearchFormItem
        key="procKey"
        fieldType="BaseInput"
        label="流程类型"
        fieldKey="procKey"
        defaultShow
        advanced
      />,
      <SearchFormItem
        key="procName"
        fieldType="BaseInput"
        label="流程名称"
        fieldKey="procName"
        defaultShow
        advanced
      />,
      <SearchFormItem
        key="isEnable"
        fieldType="BaseInput"
        label="是否启用"
        fieldKey="isEnable"
        defaultShow={false}
        advanced
      />,
      <SearchFormItem
        key="remark"
        fieldType="BaseInput"
        label="备注"
        fieldKey="remark"
        defaultShow={false}
        advanced
      />,
    ]
      .filter(c => queryJson[c.key] && queryJson[c.key].visibleFlag) // 是否可见
      .map(c => ({
        // 显示名称
        ...c,
        title: queryJson[c.key].displayName,
      }))
      .sort((c1, c2) => c1.sortNo - c2.sortNo); // 排序;
    return (
      <PageWrapper>
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          searchForm={queryForm} // 查询条件
          defaultSearchForm={{}} // 查询条件默认值,重置时查询条件默认这里面的值
          fetchData={this.fetchData} // 获取数据的方法,请注意获取数据的格式
          columns={columns} // 要展示的列
          onAddClick={() => router.push('/back/tenant/tenantProcDetail?mode=EDIT')} // 新增按钮逻辑,不写不展示
          onEditClick={data => router.push(`/back/tenant/tenantProcDetail?id=${data.id}&mode=EDIT`)} // 编辑按钮逻辑,不写不显示
          onCopyClick={data =>
            router.push(`/back/tenant/tenantProcDetail?id=${data.id}&copy=true&mode=EDIT`)
          } // 复制按钮逻辑,不写不显示
          deleteData={this.deleteData} // 删除按钮逻辑,不写不显示
          defaultAdvancedSearch // 查询条件默认为高级查询
          autoSearch // 进入页面默认查询数据
        />
      </PageWrapper>
    );
  }
}

export default TenantProcList;
