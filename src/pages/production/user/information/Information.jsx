// 框架类
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, isNil, omit } from 'ramda';
import { toQs } from '@/utils/stringUtils';
import Link from '@/components/production/basic/Link.tsx';
// 产品化组件
import SearchFormItem from '@/components/production/business/SearchFormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import SearchTable from '@/components/production/business/SearchTable.tsx';
import message from '@/components/production/layout/Message';
import ExcelImportExport from '@/components/common/ExcelImportExport';

// 业务组件
import ExportModal from './ExportModal';

// 接口
import {
  informationListPaging,
  openAccount,
  exportEmployeeInformation,
} from '@/services/production/user';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import { handleEmptyProps } from '@/utils/production/objectUtils.ts';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { remindString } from '@/components/production/basic/Remind.tsx';
import { templateList } from '../../../../services/production/user';

const DOMAIN = 'information';

@connect(({ loading, dispatch, information }) => ({
  // treeLoading: loading.effects[`${DOMAIN}/init`],
  loading,
  dispatch,
  ...information,
}))
class Information extends React.PureComponent {
  state = {
    visible: false,
    failedList: [],
    exportVisible: false,
    dataList: [],
    wParam: {},
    templates: [],
  };

  componentDidMount() {}

  fetchData = async params => {
    const { wParam } = this.state;
    let wrappedParam = { ...params };
    this.setState({
      wParam: wrappedParam,
    });
    //paymentAmtRange  expectedPaymentDateRange  actualPaymentDateRange
    if (params.enrollDateDateRange) {
      [wrappedParam.enrollDateDateFrom, wrappedParam.enrollDateDateTo] = params.enrollDateDateRange;
      delete wrappedParam.enrollDateDateRange;
    }
    if (params.birthdayDateRange) {
      [wrappedParam.birthdayDateFrom, wrappedParam.birthdayDateTo] = params.birthdayDateRange;
      delete wrappedParam.birthdayDateRange;
    }
    if (params.syncTime) {
      [wrappedParam.syncTimeStart, wrappedParam.syncTimeEnd] = params.syncTime;
      delete wrappedParam.syncTime;
    }
    wrappedParam = handleEmptyProps(wrappedParam);
    const { data } = await outputHandle(informationListPaging, wrappedParam);
    this.setState({
      dataList: data,
    });
    return data;
  };

  openAccount = async (params, cb) => {
    const data = await outputHandle(openAccount, params);
    cb(data);
  };

  toggleImportVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible }, () => {
      this.setState({
        failedList: [],
      });
    });
  };

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

  // 修改model层state
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  // 调用model层异步方法
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  renderSearchForm = () => [
    //用户名、姓名、员工编号、所属公司、所属BU、Base地、职级、职位、直属上级、入职日期（时间区间）、手机号、生日（时间区间）、性别。
    <SearchFormItem
      key="login"
      fieldType="BaseInput"
      label="用户名"
      fieldKey="login"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="name"
      fieldType="BaseInput"
      label="姓名"
      fieldKey="name"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="resNo"
      fieldType="BaseInput"
      label="员工编号"
      fieldKey="resNo"
      defaultShow
      advanced
    />,
    <SearchFormItem
      key="ouId"
      fieldType="BaseAllOuSimpleSelect"
      label="所属公司"
      fieldKey="ouId"
      defaultShow
      advanced
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
      label="Base地"
      fieldKey="baseCity"
      defaultShow
      advanced
      parentKey="CUS:CITY"
    />,

    <SearchFormItem
      key="jobGrade"
      fieldType="BaseInput"
      label="职级"
      fieldKey="jobGrade"
      defaultShow
      advanced
    />,

    <SearchFormItem
      key="position"
      fieldType="BaseInput"
      label="职位"
      fieldKey="position"
      defaultShow
      advanced
    />,

    <SearchFormItem
      key="pResName"
      fieldType="BaseInput"
      label="直属上级"
      fieldKey="pResName"
      defaultShow
      advanced
    />,

    <SearchFormItem
      key="enrollDateDateRange"
      fieldType="BaseDateRangePicker"
      label="入职日期"
      fieldKey="enrollDateDateRange"
      defaultShow
    />,

    <SearchFormItem
      key="phone"
      fieldType="BaseInputNumber"
      label="手机号"
      fieldKey="phone"
      defaultShow
      advanced
    />,

    <SearchFormItem
      key="birthdayDateRange"
      fieldType="BaseDateRangePicker"
      label="生日"
      fieldKey="birthdayDateRange"
      defaultShow
    />,

    <SearchFormItem
      key="gender"
      fieldType="BaseSelect"
      label="性别"
      fieldKey="gender"
      defaultShow
      advanced
      parentKey="COM:GENDER"
    />,
    <SearchFormItem
      fieldKey="syncStatus"
      label="同步状态"
      fieldType="BaseCustomSelect"
      parentKey="COM:DATA_SYNC:SYNC_STATUS"
      defaultShow
      advanced
    />,
    <SearchFormItem
      fieldKey="syncTime"
      label="同步时间"
      fieldType="BaseDateRangePicker"
      defaultShow
      advanced
    />,
  ];

  // 导出
  handleExport = async (params, btnType, template) => {
    const { wParam } = this.state;
    let basicParam = { ...params };
    basicParam = handleEmptyProps(basicParam);
    const o = {
      ...wParam,
      ...basicParam,
      saveTemplate: btnType === 'saveAndExport',
      templateId: !template ? -1 : template.id,
    };
    const url = toQs(`${SERVER_URL}/api/production/user/information/payExport`, o);
    window.open(url);
  };

  handleOk = async () => {
    this.setState({
      exportVisible: false,
    });
  };

  handleCancel = () => {
    this.setState({
      exportVisible: false,
    });
  };

  render() {
    const { form, formData, loading, ...rest } = this.props;
    const {
      getInternalState,
      visible,
      failedList,
      exportVisible,
      dataList,
      templates,
    } = this.state;

    const columns = [
      {
        title: '用户名',
        dataIndex: 'login',
        ellipsis: true,
        render: (value, row) => (
          <Link
            onClick={() =>
              // router.push(`/hr/resource/informationDetail?mode=DESCRIPTION&id=` + row.id)
              router.push(`/hr/resource/informationDetail?id=${row.id}`)
            }
          >
            {value}
          </Link>
        ),
      },
      {
        title: '姓名',
        dataIndex: 'name',
        ellipsis: true,
      },
      {
        title: '员工编号',
        dataIndex: 'resNo',
        ellipsis: true,
        sorter: true,
      },
      {
        title: '所属公司',
        dataIndex: 'ouName',
        ellipsis: true,
      },
      {
        title: '所属BU',
        dataIndex: 'buName',
        ellipsis: true,
      },
      {
        title: 'Base地',
        dataIndex: 'baseCityDesc',
        ellipsis: true,
      },
      {
        title: '职级',
        dataIndex: 'jobGrade',
      },
      {
        title: '职位',
        dataIndex: 'position',
        ellipsis: true,
      },
      {
        title: '直属上级',
        dataIndex: 'presName',
        ellipsis: true,
      },
      {
        title: '入职日期',
        dataIndex: 'enrollDate',
        ellipsis: true,
      },
      {
        title: '手机号',
        dataIndex: 'phone',
        ellipsis: true,
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        ellipsis: true,
      },
      {
        title: '生日',
        dataIndex: 'birthday',
        ellipsis: true,
      },
      {
        title: '资源类型一',
        dataIndex: 'resType1Desc',
        ellipsis: true,
      },
      {
        title: '性别',
        dataIndex: 'genderDesc',
        ellipsis: true,
      },
      {
        title: '是否开通系统账号',
        dataIndex: 'hasSystemAccount',
        ellipsis: true,
      },
      {
        title: '银行',
        dataIndex: 'bankName',
        ellipsis: true,
      },
      {
        title: '户名',
        dataIndex: 'holderName',
        ellipsis: true,
      },
      {
        title: '账号',
        dataIndex: 'accountNo',
        ellipsis: true,
      },
      {
        title: '同步状态',
        dataIndex: 'syncStatus',
        render: (value, row, index) => row.syncStatusDesc,
        ellipsis: true,
      },
      {
        title: '上次同步时间',
        dataIndex: 'syncTime',
        ellipsis: true,
      },
    ];

    const excelImportProps = {
      // eslint-disable-next-line no-restricted-globals
      templateUrl: location.origin + `/template/userInformationTemplate.xlsx`,
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '导入失败记录', // 表名
            sheetFilter: [
              'login',
              'name',
              'resNo',
              'ouName',
              'buName',
              'baseCityDesc',
              'jobGrade',
              'position',
              'pResName',
              'enrollDate',
              'phone',
              'email',
              'birthday',
              'resType1Desc',
              'genderDesc',
              'hasSystemAccountDesc',
              'bankName',
              'holderName',
              'accountNo',
              'errorMessage',
            ], // 列过滤
            sheetHeader: [
              '用户名',
              '姓名',
              '员工编号',
              '所属公司',
              '所属BU',
              'Base地',
              '职级',
              '职位',
              '直属上级',
              '入职日期',
              '手机号',
              '邮箱',
              '生日',
              '资源类型一',
              '性别',
              '是否开通系统账号',
              '银行',
              '户名',
              '账号',
              '失败原因',
            ], // 第一行标题
            // columnWidths: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], // 列宽 需与列顺序对应
          },
        ],
      },
      controlModal: {
        visible,
        failedList,
        uploading: loading.effects[`${DOMAIN}/upload`],
      },
    };

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
          searchTitle={undefined}
          defaultAdvancedSearch={false}
          showSearchCardTitle={false}
          defaultSortBy="id"
          rowKey="resNo"
          defaultSortDirection="DESC"
          searchForm={this.renderSearchForm()}
          defaultSearchForm={{}}
          fetchData={this.fetchData}
          columns={columns}
          tableExtraProps={{ scroll: { x: 2400 } }}
          extraButtons={[
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
            {
              key: 'openAccount',
              title: '开通账号',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                const { hasSystemAccount } = selectedRows[0];
                if (hasSystemAccount === '是') {
                  createMessage({
                    type: 'info',
                    description: remindString({
                      remindCode: '',
                      defaultMessage: '该用户已经开通过系统账户！',
                    }),
                  });
                } else {
                  this.openAccount(selectedRows[0], data => {
                    if (data.ok) {
                      message({ type: 'success' });
                      // const { getInternalState } = this.state;
                      const { refreshData } = getInternalState();
                      refreshData();
                    }
                  });
                }
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'modifyInformation',
              title: '修改',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(`/hr/resource/informationDisplay?mode=EDIT&id=` + selectedRows[0].id);
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'informationMove',
              title: '异动',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(`/hr/resource/informationMove?mode=EDIT&id=` + selectedRows[0].id);
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'informationDimission',
              title: '离职',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(
                  `/hr/resource/informationDimission?mode=EDIT&userId=` + selectedRows[0].id
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'informationVacation',
              title: '假期',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(`/hr/resource/informationVacation?mode=EDIT&id=` + selectedRows[0].id);
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'informationAssess',
              title: '考核',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(
                  `/hr/resource/informationAssess?mode=EDIT&userId=` + selectedRows[0].id
                );
              },
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
            },
            {
              key: 'informationAdd',
              title: '入职',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(`/hr/resource/informationAdd`);
              },
            },
            {
              key: 'sync',
              title: '同步到用友',
              type: 'primary',
              size: 'large',
              loading: loading.effects['interface/insertPsnToU8cFn'],
              cb: param => {
                //param是state
                const keys = param.selectedRowKeys;
                const rows = param.selectedRows;
                const thisAlias = this;
                //校验状态
                if (!keys || keys.length === 0) {
                  createMessage({ type: 'info', description: '请先选择要同步的记录！' });
                  return;
                }
                if (rows.filter(r => r.syncStatus === 'SYNCED').length > 0) {
                  createMessage({ type: 'warn', description: '已同步的不能再次同步!' });
                  return;
                }
                createConfirm({
                  content: '即将同步记录到用友，同步成功后不允许再次同步，确认同步吗？',
                  onOk: () => {
                    const { dispatch } = this.props;
                    const resNos = rows.map(r => r.resNo).join(',');
                    dispatch({
                      type: 'interface/insertPsnToU8cFn',
                      payload: { resNos },
                    }).then(resp => {
                      const is = getInternalState();
                      let fieldsValue = is.form.getFieldsValue();
                      fieldsValue = handleEmptyProps(fieldsValue);
                      this.fetchData(fieldsValue);
                    });
                  },
                });
              },
            },
            {
              key: 'exportSection',
              title: '导出',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: async internalState => {
                this.setState({
                  exportVisible: true,
                });
                // await this.getTemplateList();
              },
            },
          ]}
        />
        <ExportModal
          visible={exportVisible}
          handleCancel={this.handleCancel}
          handleOk={this.handleOk}
          columns={columns}
          dataSource={dataList.rows}
          destroyOnClose
          handleExport={this.handleExport}
          templates={templates}
        />
      </PageWrapper>
    );
  }
}

export default Information;
