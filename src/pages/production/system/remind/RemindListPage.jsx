import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';

// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable from '@/components/production/business/SearchTable';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import { outputHandle } from '@/utils/production/outputUtil';

// 调用service引入
// @ts-ignore
import {
  systemRemindListPaging,
  systemRemindLogicalDelete,
  systemRemindClearCache,
} from '@/services/production/system';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import Button from '@/components/production/basic/Button.tsx';
import message from '@/components/production/layout/Message.tsx';

// namespace声明
const DOMAIN = 'remindListPage';

/**
 * 单表案例 列表页面
 */
@connect(({ dispatch, remindListPage }) => ({
  dispatch,
  ...remindListPage,
}))
class RemindListPage extends React.PureComponent {
  /**
   * 查询数据方法,传给SearchTable组件使用
   * @param params 查询参数
   * @returns {Promise<*>} 查询到的结果,给SearchTable组件使用,展示数据
   */
  fetchData = async params => {
    const { data } = await outputHandle(systemRemindListPaging, params);
    return data;
  };

  /**
   * 删除数据方法,传给SearchTable组件使用
   * @param keys 要删除的数据主键
   * @returns {Promise<*>} 删除结果,给SearchTable组件使用
   */
  deleteData = async keys => {
    const { data } = await outputHandle(systemRemindLogicalDelete, { keys: keys.join(',') });
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
  renderSearchForm = () => [
    <SearchFormItem
      key="remindCode"
      fieldType="BaseInput"
      label="消息码"
      fieldKey="remindCode"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="remindContent"
      fieldType="BaseInput"
      label="消息内容"
      fieldKey="remindContent"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="remindType"
      fieldType="BaseSelect"
      parentKey="FUNCTION:SYSTEM_REMIND:TYPE"
      label="消息类型"
      fieldKey="remindType"
      defaultShow
      advanced
    />,
  ];

  /**
   * 清空后端缓存
   * @returns {Promise<any>}
   */
  clearCache = async () => {
    const { data } = await outputHandle(systemRemindClearCache);
    message({ type: 'success' });
  };

  render() {
    // 表格展示列
    const columns = [
      {
        title: '消息码',
        dataIndex: 'remindCode',
        sorter: true,
        render: (value, row, index) => (
          <Link twUri={`/back/production/systemRemindDisplay?id=${row.id}&mode=DESCRIPTION`}>
            {value}
          </Link>
        ),
      },
      {
        title: '消息内容',
        dataIndex: 'remindContent',
      },
      {
        title: '国际化码',
        dataIndex: 'remindContentLocale',
      },
      {
        title: '消息类型',
        dataIndex: 'remindTypeDesc',
      },
      {
        title: '说明',
        dataIndex: 'remark',
      },
    ];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button onClick={this.clearCache}>清空缓存</Button>
        </ButtonCard>
        <SearchTable
          searchForm={this.renderSearchForm()} // 查询条件
          defaultSearchForm={{}} // 查询条件默认值,重置时查询条件默认这里面的值
          fetchData={this.fetchData} // 获取数据的方法,请注意获取数据的格式
          columns={columns} // 要展示的列
          onAddClick={() => router.push('/back/production/systemRemindDisplay?mode=EDIT')} // 新增按钮逻辑,不写不展示
          onEditClick={data =>
            router.push(`/back/production/systemRemindDisplay?id=${data.id}&mode=EDIT`)
          } // 编辑按钮逻辑,不写不显示
          onCopyClick={data =>
            router.push(`/back/production/systemRemindDisplay?id=${data.id}&copy=true&mode=EDIT`)
          } // 复制按钮逻辑,不写不显示
          deleteData={this.deleteData} // 删除按钮逻辑,不写不显示
          defaultAdvancedSearch // 查询条件默认为高级查询
          autoSearch // 进入页面默认查询数据
        />
      </PageWrapper>
    );
  }
}

export default RemindListPage;
