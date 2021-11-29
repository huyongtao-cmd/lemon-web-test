import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { Tooltip } from 'antd';
import { isEmpty } from 'ramda';
import { mountToTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { fromQs } from '@/utils/stringUtils';
import { sub } from '@/utils/mathUtils';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import createMessage from '@/components/core/AlertMessage';
// import ParamConfig from './paramConfigModal';
// import BatchEditModal from './batchEditModal';
import { outputHandle } from '@/utils/production/outputUtil';
import { vacationList, vacationDeleteRq } from '@/services/production/res/vacation';

const DOMAIN = 'vacationMgmtNew';

@connect(({ loading, vacationMgmtNew, user }) => ({
  // loading,
  user,
  vacationMgmtNew,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class VacationMgmt extends PureComponent {
  state = {
    visible: false,
    failedList: [],
    uploading: false,
    paramConfigVisible: false,
    batchEditVisible: false,
  };

  componentDidMount() {
    const {
      dispatch,
      user: { user },
    } = this.props;

    const { _refresh } = fromQs();
    // !(_refresh === '0') && dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    if (_refresh === '0') {
      const { getInternalState } = this.state;
      const { refreshData } = getInternalState();
      refreshData();
    }
    dispatch({ type: `${DOMAIN}/baseBU` });
    dispatch({
      type: `${DOMAIN}/queryTemporaryTime`,
    });
  }

  fetchData = async payload => {
    const { vacationDate, ...params } = payload;
    if (Array.isArray(vacationDate) && vacationDate[0] && vacationDate[1]) {
      [params.expirationDateStart, params.expirationDateEnd] = vacationDate;
    }
    delete params.baseBu;
    const { response } = await vacationList(params);
    return response.data;
  };

  deleteData = async keys =>
    outputHandle(vacationDeleteRq, { ids: keys.join(',') }, undefined, false);

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  handleUpload = fileList => {
    this.setState({
      uploading: true,
    });

    const fileData = new FormData();
    fileList.forEach(file => {
      fileData.append('excel', file);
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      this.setState({
        uploading: false,
      });
      if (res.ok && isEmpty(res.data)) {
        this.toggleVisible();
        const { getInternalState } = this.state;
        const { refreshData } = getInternalState();
        refreshData();
        return null;
      }
      if (res.data && Array.isArray(res.data.data) && !isEmpty(res.data.data)) {
        createMessage({
          type: 'error',
          description: '部分数据上传失败，请下载错误数据进行更正',
        });
        this.setState({
          failedList: res.data.data,
        });
      } else {
        createMessage({ type: 'error', description: res.errors[0].msg || '上传失败,返回结果为空' });
        this.toggleVisible();
      }
      return null;
    });
  };

  renderColumns = () => {
    const { pageConfig } = this.props;
    // const { getInternalState } = this.state;

    const fields = [
      {
        title: '编号',
        dataIndex: 'resNo',
        align: 'center',
      },
      {
        title: '姓名',
        dataIndex: 'resName',
        align: 'center',
      },
      {
        title: '公司',
        dataIndex: 'companyDesc',
        align: 'center',
      },
      {
        title: '部门',
        dataIndex: 'buName',
        align: 'center',
      },
      {
        title: '假期类型',
        dataIndex: 'vacationTypeName',
        align: 'center',
      },
      {
        title: '年度',
        dataIndex: 'vacationYear',
        align: 'center',
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
        align: 'center',
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
        align: 'center',
      },
      {
        title: '有效截止日期',
        dataIndex: 'expirationDate',
        align: 'center',
      },
      {
        title: '总天数',
        dataIndex: 'totalDays',
        align: 'center',
      },
      {
        title: '已用天数',
        dataIndex: 'usedDays',
        align: 'center',
      },
      {
        title: '可用天数',
        dataIndex: 'availableDays',
        align: 'center',
      },
      {
        title: '未开放天数',
        dataIndex: 'frozenDay',
        align: 'center',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (value, row, key) =>
          value && value.length > 15 ? (
            <Tooltip placement="left" title={<pre>{value}</pre>}>
              <span>{`${value.substr(0, 15)}...`}</span>
            </Tooltip>
          ) : (
            <span>{value}</span>
          ),
      },
    ];

    return fields;
  };

  renderSearchForm = () => {
    const { pageConfig } = this.props;
    const fields = [
      <SearchFormItem key="resId" fieldType="ResSimpleSelect" label="姓名" fieldKey="resId" />,
      <SearchFormItem
        key="company"
        label="所属公司"
        fieldType="BaseCustomSelect"
        fieldKey="company"
        parentKey="CUS:INTERNAL_COMPANY"
        defaultShow
      />,
      <SearchFormItem
        key="inchargeBuId"
        label="部门"
        fieldType="BuSimpleSelect"
        fieldKey="baseBuId"
        defaultShow
      />,
      <SearchFormItem
        key="vacationType"
        label="假期类型"
        fieldType="BaseCustomSelect"
        fieldKey="vacationType"
        parentKey="RES:VAC_TYPE"
        defaultShow
      />,
      <SearchFormItem
        key="year"
        fieldType="BaseInputNumber"
        label="年度"
        fieldKey="vacationYear"
        defaultShow
      />,
      <SearchFormItem
        key="vacationYear"
        fieldType="BaseDateRangePicker"
        label="有效期截止日"
        fieldKey="vacationDate"
        defaultShow
      />,
    ];

    return fields;
  };

  render() {
    const { visible, failedList, uploading, paramConfigVisible, batchEditVisible } = this.state;
    const { userId } = this.props;
    const excelImportProps = {
      templateUrl: location.origin + `/template/newVacationImport.xlsx`, // eslint-disable-line
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '假期功能_假期数据导入失败记录', // 表名
            sheetFilter: [
              'resNo',
              'resName',
              'company',
              'buName',
              'vacationType',
              'vacationYear',
              'startDate',
              'endDate',
              'expirationDate',
              'totalDays',
              'usedDays',
              'remark',
              'errorMessage',
            ], // 列过滤
            sheetHeader: [
              '编号',
              '姓名',
              '公司',
              '部门',
              '假期类型',
              '年度',
              '开始日',
              '结束日',
              '有效截止日期',
              '总天数',
              '已用天数',
              '备注',
              '失败原因',
            ], // 第一行标题
            columnWidths: [4, 6, 6, 6, 8, 8, 8, 8, 8, 12], // 列宽 需与列顺序对应
          },
        ],
      },
      controlModal: {
        visible,
        failedList,
        uploading,
      },
    };

    return (
      <PageHeaderWrapper title="假期管理">
        <ExcelImportExport
          {...excelImportProps}
          closeModal={this.toggleVisible}
          handleUpload={this.handleUpload}
        />
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          showExport={!userId} // 是否显示导出按钮
          showColumnSwitch={!userId} // 是否显示列控制器
          searchForm={!userId ? this.renderSearchForm() : []}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          selectType={!userId}
          onAddClick={
            !userId ? () => router.push('/hr/attendanceMgmt/vacApplyListPage/edit') : null
          }
          onEditClick={
            !userId
              ? data =>
                  router.push(`/hr/attendanceMgmt/vacApplyListPage/edit?id=${data.id}&mode=EDIT`)
              : null
          }
          deleteData={!userId ? data => this.deleteData(data) : null}
          extraButtons={
            !userId
              ? [
                  {
                    key: 'importExcel',
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
                ]
              : []
          }
        />
      </PageHeaderWrapper>
    );
  }
}

export default VacationMgmt;
