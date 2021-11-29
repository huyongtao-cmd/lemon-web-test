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
import { testMainListPaging, testMainLogicalDelete } from '@/services/demo/prod';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';

// namespace声明
const DOMAIN = 'singleCaseListDemo';

/**
 * 单表案例 列表页面
 */
@connect(({ dispatch, singleCaseListDemo }) => ({
  dispatch,
  ...singleCaseListDemo,
}))
class SingleCaseListDemo extends React.PureComponent {
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
    const { data } = await outputHandle(testMainListPaging, params);
    return data;
  };

  /**
   * 删除数据方法,传给SearchTable组件使用
   * @param keys 要删除的数据主键
   * @returns {Promise<*>} 删除结果,给SearchTable组件使用
   */
  deleteData = async keys =>
    outputHandle(testMainLogicalDelete, { keys: keys.join(',') }, undefined, false);

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
      key="testNo"
      fieldType="BaseInput"
      label="编码"
      fieldKey="testNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="testName"
      fieldType="BaseInput"
      label="名称"
      fieldKey="testName"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="testAge"
      fieldType="BaseInputNumber"
      label="年龄"
      fieldKey="testAge"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="testDate"
      fieldType="BaseDatePicker"
      label="日期"
      fieldKey="testDate"
      defaultShow={false}
      advanced
    />,
    <SearchFormItem
      key="resId"
      fieldType="ResSimpleSelect"
      label="资源"
      fieldKey="resId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="userId"
      fieldType="UserSimpleSelect"
      label="用户"
      fieldKey="userId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="planDate"
      fieldType="BaseDateRangePicker"
      label="日期范围"
      fieldKey="planDate"
    />,
    <SearchFormItem
      key="udcCode"
      fieldType="BaseUdcSelect"
      label="旧版UDC"
      udcCode="ACC:ACC_CAT02"
      fieldKey="udcCode"
    />,
    <SearchFormItem
      key="baseSelect"
      fieldType="BaseSelect"
      label="系统选择项"
      fieldKey="baseSelect"
      parentKey="FUNCTION:SYSTEM_REMIND:TYPE"
    />,
  ];

  render() {
    const { getInternalState } = this.state;

    // 表格展示列
    const columns = [
      {
        title: '编码',
        dataIndex: 'testNo',
        sorter: true,
        render: (value, row, index) => (
          <Link twUri={`/demo/prod/case/singleCaseDetail?id=${row.id}&mode=DESCRIPTION`}>
            {value}
          </Link>
        ),
      },
      {
        title: '名称',
        dataIndex: 'testName',
        sorter: true,
      },
      {
        title: '年龄',
        dataIndex: 'testAge',
        sorter: true,
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    return (
      <PageWrapper>
        <ButtonCard>
          <Button
            onClick={() => {
              const internalState = getInternalState();
              // eslint-disable-next-line no-console
              console.log('内部状态：', internalState);
              internalState.form.setFieldsValue({ testNo: '123' });
            }}
          >
            获取选择项
          </Button>
        </ButtonCard>
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
          onAddClick={() => router.push('/demo/prod/case/singleCaseDetail?mode=EDIT')} // 新增按钮逻辑,不写不展示
          onEditClick={data =>
            router.push(`/demo/prod/case/singleCaseDetail?id=${data.id}&mode=EDIT`)
          } // 编辑按钮逻辑,不写不显示
          onCopyClick={data =>
            router.push(`/demo/prod/case/singleCaseDetail?id=${data.id}&copy=true&mode=EDIT`)
          } // 复制按钮逻辑,不写不显示
          deleteData={this.deleteData} // 删除按钮逻辑,不写不显示
          defaultAdvancedSearch // 查询条件默认为高级查询
          autoSearch={false} // 进入页面默认查询数据
          extraButtons={[
            {
              key: 'test',
              title: '其它按钮（选中一条可用）',
              type: 'info',
              size: 'large',
              loading: false,
              cb: internalState => {
                // eslint-disable-next-line no-console
                console.log(internalState);
                // 获得刷新数据方法，并且刷新数据
                const { refreshData } = internalState;
                refreshData();
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length < 1;
              },
            },
          ]}
        />
      </PageWrapper>
    );
  }
}

export default SingleCaseListDemo;
