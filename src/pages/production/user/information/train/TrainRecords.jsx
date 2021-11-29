// 框架类
import React, { Component } from 'react';
import { Form } from 'antd';
import router from 'umi/router';

// 产品化组件
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable from '@/components/production/business/SearchTable';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import ExcelImportExport from '@/components/common/ExcelImportExport';

/***
 * 培训记录
 */
@Form.create()
class TrainRecords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      failedList: [],
    };
  }

  componentDidMount() {}

  // 搜索条件
  renderSearchForm = () => [
    <SearchFormItem
      key="testDate"
      fieldType="BaseInput"
      label="课程名称"
      fieldKey="testDate"
      defaultShow={false} // 判断默认查询是否显示该字段
      advanced // 是否高级查询条件,默认为否
    />,
    <SearchFormItem
      key="name"
      fieldType="BaseInput"
      label="姓名"
      fieldKey="name"
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
      key="baseBuId"
      fieldType="BuSimpleSelect"
      label="所属BU"
      fieldKey="baseBuId"
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
  };

  render() {
    const { visible, failedList } = this.state;
    const { userId } = this.props;

    // 列表操作按钮
    const actionButtons = [
      {
        key: 'addTrain',
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
        key: 'addTrain',
        title: '新增',
        type: 'primary',
        size: 'large',
        loading: false,
        cb: internalState => {
          router.push(`/hr/train/trainView?mode=EDIT`);
        },
      },
      {
        key: 'editTrain',
        title: '修改',
        type: 'primary',
        size: 'large',
        loading: false,
        cb: internalState => {
          const { selectedRows } = internalState;
          router.push(`/hr/train/trainView?mode=EDIT&id=${selectedRows[0].id}`);
        },
        // disabled: internalState => {
        //   const { selectedRowKeys } = internalState;
        //   return selectedRowKeys.length !== 1;
        // },
      },
      {
        key: 'view',
        title: '详情',
        type: 'primary',
        size: 'large',
        loading: false,
        cb: internalState => {
          router.push(`/hr/train/trainView?mode=DESCRIPTION`);
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
            sheetFilter: [], // 列过滤
            sheetHeader: [
              '工号',
              '姓名',
              '入职时间',
              '职位',
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
    const columns = [
      {
        title: '课程名称',
        dataIndex: '',
        // sorter: true,
        // render: (value, row, index) => (
        //   <Link twUri={`/demo/prod/case/singleCaseDetail?id=${row.id}&mode=DESCRIPTION`}>
        //     {value}
        //   </Link>
        // ),
      },
      {
        title: '姓名',
        dataIndex: 'name',
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
        dataIndex: 'presName',
      },
      {
        title: '入职日期',
        dataIndex: 'enrollDate',
      },
      {
        title: '课程类型',
        dataIndex: '',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
      },
      {
        title: '课程时间',
        dataIndex: '',
      },
      {
        title: '课程时长',
        dataIndex: '',
      },
      {
        title: '费用',
        dataIndex: '',
      },
      {
        title: '供应商',
        dataIndex: '',
      },
      {
        title: '备注',
        dataIndex: '',
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
          tableTitle={!userId ? '' : '培训记录'}
          defaultAdvancedSearch={false} // 查询条件默认为高级查询
          showSearchCardTitle={false} // 是否展示查询区域Card的头部
          searchForm={!userId ? this.renderSearchForm() : []} // 查询条件
          selectType={null} // 禁止勾选
          showExport={!userId} // 是否显示导出按钮
          showColumnSwitch={!userId} // 是否显示列控制器
          defaultSortBy="id"
          // fetchData={this.fetchData}
          defaultSortDirection="DESC"
          columns={columns} // 要展示的列
          autoSearch={false} // 进入页面默认查询数据
          tableExtraProps={{ scroll: { x: 2400 } }}
          extraButtons={!userId ? actionButtons : []}
        />
      </PageWrapper>
    );
  }
}

export default TrainRecords;
