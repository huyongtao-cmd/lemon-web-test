// 框架类
import React, { Component } from 'react';
import { Form } from 'antd';
import router from 'umi/router';

// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable from '@/components/production/business/SearchTable';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import { outputHandle } from '@/utils/production/outputUtil';
import Link from '@/components/production/basic/Link';
import { createConfirm } from '@/components/core/Confirm';
import { fromQs } from '@/utils/stringUtils';

// 接口
import { trainList, trainDelete } from '@/services/production/user';
import createMessage from '@/components/core/AlertMessage';
import { isEmpty } from 'ramda';
import { connect } from 'dva';

/***
 * 培训记录
 */

const DOMAIN = 'userTrain';

@connect(({ loading, dispatch, userTrain }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  loading,
  dispatch,
  ...userTrain,
}))
@Form.create()
class TrainRecords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      failedList: [],
    };
  }

  componentDidMount() {
    // this.fetchData();
  }

  // 列表查询
  fetchData = async params => {
    const { id } = fromQs();
    let wrappedParam = { ...params, userId: id && id };
    wrappedParam = handleEmptyProps(wrappedParam); // 处理空属性,可以处理list,{},字符串
    const { data } = await outputHandle(trainList, wrappedParam);
    return data;
  };

  // 删除
  deleteBatch = async ids => {
    outputHandle(trainDelete, { keys: ids.join(',') }, undefined, false);
  };

  // 搜索条件
  renderSearchForm = () => [
    <SearchFormItem
      key="className"
      fieldType="BaseInput"
      label="课程名称"
      fieldKey="className"
      defaultShow={false} // 判断默认查询是否显示该字段
      advanced // 是否高级查询条件,默认为否
    />,
    <SearchFormItem
      key="userName"
      fieldType="BaseInput"
      label="姓名"
      fieldKey="userName"
      defaultShow={false} // 判断默认查询是否显示该字段
      advanced // 是否高级查询条件,默认为否
    />,
    <SearchFormItem
      key="resNo"
      fieldType="BaseInput"
      label="员工编号"
      fieldKey="resNo"
      defaultShow={false} // 判断默认查询是否显示该字段
      advanced // 是否高级查询条件,默认为否
    />,
    <SearchFormItem
      key="ouId"
      fieldType="BaseAllOuSimpleSelect"
      label="所属公司"
      fieldKey="ouId"
      defaultShow // 判断默认查询是否显示该字段
      advanced // 是否高级查询条件,默认为否
    />,
    <SearchFormItem
      key="buId"
      fieldType="BuSimpleSelect"
      label="所属BU"
      fieldKey="buId"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="baseCity"
      fieldType="BaseCustomSelect"
      label="工作地"
      fieldKey="baseCity"
      defaultShow
      advanced
      parentKey="CUS:CITY"
    />,
  ];

  // 关闭导入弹窗
  toggleImportVisible = () => {
    const { visible } = this.state;
    this.setState({
      visible: false,
    });
  };

  // 上传
  handleUpload = fileList => {
    const fileData = new FormData();
    fileList.forEach(file => {
      fileData.append('excel', file);
    });
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      if (res.ok) {
        createMessage({ type: 'success', description: '上传成功' });
        this.toggleImportVisible();

        const { getInternalState } = this.state;
        const { refreshData } = getInternalState();
        refreshData();
        return;
      }

      if (res.data && Array.isArray(res.data) && !isEmpty(res.data)) {
        createMessage({
          type: 'warn',
          description: res.msg || '部分数据上传失败，请下载错误数据进行更正',
        });
        this.setState({
          failedList: res.data,
        });
      } else {
        createMessage({
          type: 'error',
          description: res.errors ? res.errors[0]?.msg : '部分数据上传失败,返回结果为空',
        });
        this.toggleImportVisible();
      }
    });
  };

  render() {
    // const { visible, failedList } = this.state;
    const { getInternalState, visible, failedList } = this.state;
    const { userId } = this.props;

    // 列表操作按钮
    const actionButtons = [
      {
        key: 'import',
        title: '导入Excel',
        type: 'primary',
        size: 'large',
        loading: false,
        cb: internalState => {
          this.setState({
            visible: true,
          });
        },
      },
      {
        key: 'create',
        title: '新增',
        type: 'primary',
        size: 'large',
        loading: false,
        cb: internalState => {
          router.push(`/hr/train/trainView?mode=EDIT`);
        },
      },
      {
        key: 'edit',
        title: '修改',
        type: 'primary',
        size: 'large',
        loading: false,
        cb: internalState => {
          const { selectedRows } = internalState;
          router.push(`/hr/train/trainView?mode=EDIT&id=${selectedRows[0].id}`);
        },
        disabled: internalState => {
          const { selectedRowKeys } = internalState;
          return selectedRowKeys.length !== 1;
        },
      },
      {
        key: 'delete',
        title: '删除',
        type: 'danger',
        size: 'large',
        loading: false,
        cb: async internalState => {
          const { selectedRowKeys } = internalState;
          createConfirm({
            content: '确定删除吗？',
            onOk: async () => {
              await this.deleteBatch(selectedRowKeys);
              const { refreshData } = internalState;
              refreshData();
            },
          });
        },
        disabled: internalState => {
          const { selectedRowKeys } = internalState;
          return selectedRowKeys.length === 0;
        },
      },
    ];

    const excelImportProps = {
      // eslint-disable-next-line no-restricted-globals
      templateUrl: location.origin + `/template/trainRecords.xlsx`, // 模板下载URL

      // 失败信息存放
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '导入失败记录', // 表名
            sheetFilter: [
              'resNo',
              'userName',
              'enrollDate',
              'position',
              'buName',
              'baseCityDesc',
              'jobGrade',
              'parentName',
              'className',
              'classType',
              'classDate',
              'classTime',
              'classExpenses',
              'supplierName',
              'remark',
            ], // 列过滤
            sheetHeader: [
              '工号',
              '姓名',
              '入职时间',
              '职位',
              '部门',
              '工作地点',
              '职级',
              '直接主管',
              '课程名称',
              '课程类型',
              '课程时间',
              '课程时长',
              '费用',
              '供应商',
              '备注',
            ], // 第一行标题
            // columnWidths: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], // 列宽 需与列顺序对应
          },
        ],
      },
      controlModal: {
        visible, // 弹窗控制
        failedList,
        // uploading: loading.effects[`${DOMAIN}/upload`], // 确认上传按钮loading
      },
    };
    // 表格列
    const columns = [
      {
        title: '课程名称',
        dataIndex: 'className',
        sorter: true,
        render: (value, row, index) => (
          <Link twUri={`/hr/train/trainView?mode=DESCRIPTION&id=${row.id}`}>{value}</Link>
        ),
      },
      {
        title: '姓名',
        dataIndex: 'userName',
      },
      {
        title: '员工编号',
        dataIndex: 'resNo',
      },
      {
        title: '所属公司',
        dataIndex: 'ouName',
      },
      {
        title: '所属BU',
        dataIndex: 'buName',
      },
      {
        title: '工作地',
        dataIndex: 'baseCityDesc',
      },
      {
        title: '职级',
        dataIndex: 'jobGrade',
      },
      {
        title: '职位',
        dataIndex: 'position',
      },
      {
        title: '直属上级',
        dataIndex: 'parentName',
      },
      {
        title: '入职日期',
        dataIndex: 'enrollDate',
      },
      {
        title: '课程类型',
        dataIndex: 'classType',
      },
      {
        title: '邮箱',
        dataIndex: 'emailAddr',
      },
      {
        title: '课程日期',
        dataIndex: 'classDate',
      },
      {
        title: '课程时长',
        dataIndex: 'classTime',
      },
      {
        title: '费用',
        dataIndex: 'classExpenses',
      },
      {
        title: '供应商',
        dataIndex: 'supplierName',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    return (
      <PageWrapper>
        <ExcelImportExport
          {...excelImportProps}
          closeModal={this.toggleImportVisible}
          handleUpload={this.handleUpload}
        />
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          tableTitle={!userId ? '' : '培训记录'}
          defaultAdvancedSearch={false} // 查询条件默认为高级查询
          showSearchCardTitle={false} // 是否展示查询区域Card的头部
          searchForm={!userId && this.renderSearchForm()} // 查询条件
          selectType={!userId} // 禁止勾选
          showExport={!userId} // 是否显示导出按钮
          showColumnSwitch={!userId} // 是否显示列控制器
          defaultSortBy="id"
          fetchData={this.fetchData}
          defaultSortDirection="DESC"
          columns={columns} // 要展示的列
          autoSearch // 进入页面默认查询数据
          tableExtraProps={{ scroll: { x: 2400 } }}
          extraButtons={!userId ? actionButtons : []}
        />
      </PageWrapper>
    );
  }
}

export default TrainRecords;
