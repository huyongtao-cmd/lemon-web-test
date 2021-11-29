import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import { DatePicker, Input, Form, Radio, Modal, Checkbox } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { formatDT } from '@/utils/tempUtils/DateTime';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import { stringify } from 'qs';
import { selectBus, selectCusts, selectIamUsers, selectInternalOus } from '@/services/gen/list';
import { selectProject } from '@/services/user/project/projectLogList';
import { isEmpty } from 'ramda';
import moment from 'moment';
import { createConfirm } from '@/components/core/Confirm';

const RadioGroup = Radio.Group;
const { Field } = FieldList;
const { RangePicker } = DatePicker;

const DOMAIN = 'projectLogList';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, projectLogList }) => ({
  projectLogList,
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
}))
@Form.create({})
@mountToTab()
class ProjectLogList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      importVisible: false,
      confirmLoading: false,
      radioFlag: true,
      fuzzyVisible: false,
      uploading: false,
      failedList: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanSearchForm` });
    dispatch({ type: `${DOMAIN}/res` });
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PROJECT_LOG_LIST' },
    });
    this.fetchData({});
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params },
    });
  };

  toggleImportVisible = () => {
    const { importVisible } = this.state;
    this.setState({ importVisible: !importVisible });
  };

  handleUpload = fileList => {
    this.setState({
      uploading: true,
    });

    const fileData = new FormData();
    fileList.forEach(file => {
      fileData.append('file', file);
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      this.setState({
        uploading: false,
      });
      if (res.ok) {
        createMessage({ type: 'success', description: '上传成功' });
        this.toggleImportVisible();
        this.fetchData();
        return null;
      }
      if (
        res.datum &&
        Array.isArray(res.datum.failExcelData) &&
        !isEmpty(res.datum.failExcelData)
      ) {
        createMessage({ type: 'error', description: res.datum.msg || '上传失败' });
        this.setState({
          failedList: res.datum.failExcelData,
        });
      } else {
        createMessage({ type: 'error', description: res.datum.msg || '上传失败,返回结果为空' });
        this.toggleImportVisible();
      }
      return null;
    });
  };

  render() {
    const {
      projectLogList: {
        list,
        total,
        searchForm,
        resDataSource,
        cityList,
        searchFuzzyForm,
        pageConfig,
      },
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      loading,
    } = this.props;

    // 按钮的可配置化
    const buttonLists = {};
    if (pageConfig.pageButtonViews && pageConfig.pageButtonViews.length > 0) {
      pageConfig.pageButtonViews.forEach(field => {
        buttonLists[field.buttonKey] = field;
      });
    }

    // 查询条件 && 列表展示字段的可配置化
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    // let currentListConfig = [];
    // let currentQueryConfig = [];

    const currentListConfig = pageConfig.pageBlockViews[0];
    const currentQueryConfig = pageConfig.pageBlockViews[1];

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
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'ASC',
      scroll: { x: '100%' },
      loading,
      total,
      dataSource: list,
      showExport: true,
      onChange: filters => this.fetchData(filters),
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchForm,
      searchBarForm: [
        pageFieldJsonQuery.title.visibleFlag && {
          title: `${pageFieldJsonQuery.title.displayName}`,
          dataIndex: 'title',
          sortNo: `${pageFieldJsonQuery.title.sortNo}`,
          options: {
            initialValue: searchForm.title || undefined,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.title.displayName}`} />,
        },
        pageFieldJsonQuery.toProject.visibleFlag && {
          title: `${pageFieldJsonQuery.toProject.displayName}`,
          dataIndex: 'toProject',
          sortNo: `${pageFieldJsonQuery.toProject.sortNo}`,
          options: {
            initialValue: searchForm.toProject || undefined,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={particularColumns}
              source={() => selectProject()}
              placeholder="请选择项目"
              showSearch
            />
          ),
        },
        pageFieldJsonQuery.logMentionTime.visibleFlag && {
          title: `${pageFieldJsonQuery.logMentionTime.displayName}`,
          dataIndex: 'logMentionTime',
          options: {
            initialValue: searchForm.logMentionTime || undefined,
          },
          tag: (
            <DatePicker.RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        pageFieldJsonQuery.importanDegree.visibleFlag && {
          title: `${pageFieldJsonQuery.importanDegree.displayName}`,
          dataIndex: 'importanDegree',
          sortNo: `${pageFieldJsonQuery.importanDegree.sortNo}`,
          options: {
            initialValue: searchForm.importanDegree || undefined,
          },
          tag: (
            <Selection.UDC
              code="ACC:PROJECT_DEGREE"
              placeholder={`请选择${pageFieldJsonQuery.importanDegree.displayName}`}
              filters={[{ sphd1: 'FIRST_APPR' }]}
            />
          ),
        },
        pageFieldJsonQuery.logPriority.visibleFlag && {
          title: `${pageFieldJsonQuery.logPriority.displayName}`,
          dataIndex: 'logPriority',
          sortNo: `${pageFieldJsonQuery.logPriority.sortNo}`,
          options: {
            initialValue: searchForm.logPriority || undefined,
          },
          tag: (
            <Selection.UDC
              code="ACC:PROJECT_PRIORITY"
              placeholder={`请选择${pageFieldJsonQuery.logPriority.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.belongsType.visibleFlag && {
          title: `${pageFieldJsonQuery.belongsType.displayName}`,
          dataIndex: 'belongsType',
          sortNo: `${pageFieldJsonQuery.belongsType.sortNo}`,
          options: {
            initialValue: searchForm.belongsType || undefined,
          },
          tag: (
            <Selection.UDC
              code="ACC:PROJECT_LOG_TYPE"
              placeholder={`请选择${pageFieldJsonQuery.belongsType.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.responsibilityUserId.visibleFlag && {
          title: `${pageFieldJsonQuery.responsibilityUserId.displayName}`,
          dataIndex: 'respUserId',
          sortNo: `${pageFieldJsonQuery.responsibilityUserId.sortNo}`,
          options: {
            initialValue: searchForm.responsibilityUserId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.responsibilityUserId.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.appointedTime.visibleFlag && {
          title: `${pageFieldJsonQuery.appointedTime.displayName}`,
          dataIndex: 'appointedTime',
          options: {
            initialValue: searchForm.appointedTime || undefined,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        pageFieldJsonQuery.actualTime.visibleFlag && {
          title: `${pageFieldJsonQuery.actualTime.displayName}`,
          dataIndex: 'actualTime',
          options: {
            initialValue: searchForm.actualTime || undefined,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        pageFieldJsonQuery.solveUserId.visibleFlag && {
          title: `${pageFieldJsonQuery.solveUserId.displayName}`,
          dataIndex: 'solveUserId',
          sortNo: `${pageFieldJsonQuery.solveUserId.sortNo}`,
          options: {
            initialValue: searchForm.solveUserId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.solveUserId.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.solveUserId.visibleFlag && {
          title: `最后跟踪日期`,
          dataIndex: 'traceTime',
          options: {
            initialValue: searchForm.traceTime || undefined,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        pageFieldJsonQuery.state.visibleFlag && {
          title: `${pageFieldJsonQuery.state.displayName}`,
          dataIndex: 'state',
          sortNo: `${pageFieldJsonQuery.state.sortNo}`,
          options: {
            initialValue: searchForm.state || undefined,
          },
          tag: (
            <Selection.UDC
              code="ACC:PROJECT_LOG_STATE"
              placeholder={`请选择${pageFieldJsonQuery.state.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.createUserId.visibleFlag && {
          title: `${pageFieldJsonQuery.createUserId.displayName}`,
          dataIndex: 'createUserId',
          sortNo: `${pageFieldJsonQuery.createUserId.sortNo}`,
          options: {
            initialValue: searchForm.createUserId || undefined,
          },
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={resDataSource}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder={`请选择${pageFieldJsonQuery.createUserId.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.createTime.visibleFlag && {
          title: `${pageFieldJsonQuery.createTime.displayName}`,
          dataIndex: 'createTime',
          options: {
            initialValue: searchForm.createTime || undefined,
          },
          tag: (
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
              className="x-fill-100"
            />
          ),
        },
        pageFieldJsonQuery.apprStatus.visibleFlag && {
          title: `${pageFieldJsonQuery.apprStatus.displayName}`,
          dataIndex: 'apprStatus',
          sortNo: `${pageFieldJsonQuery.apprStatus.sortNo}`,
          options: {
            initialValue: searchForm.apprStatus || undefined,
          },
          tag: (
            <Selection.UDC
              code="COM:APPR_STATUS"
              placeholder={`请选择${pageFieldJsonQuery.apprStatus.displayName}`}
            />
          ),
        },
        pageFieldJsonQuery.taskId.visibleFlag && {
          title: `${pageFieldJsonQuery.taskId.displayName}`,
          dataIndex: 'relateTask',
          sortNo: `${pageFieldJsonQuery.taskId.sortNo}`,
          options: {
            initialValue: searchForm.relateTask || undefined,
          },
          tag: <Input placeholder={`请输入${pageFieldJsonQuery.taskId.displayName}（模糊查询）`} />,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      columns: [
        pageFieldJsonList.title.visibleFlag && {
          title: `${pageFieldJsonList.title.displayName}`,
          dataIndex: 'title',
          sortNo: `${pageFieldJsonList.title.sortNo}`,
          align: 'center',
          width: 220,
          render: (val, row, index) => (
            <Link
              className="tw-link"
              to={`/user/project/logDetails?mode=detail&logId=${
                row.id
              }&refresh=${new Date().getTime()}`}
            >
              {val}
            </Link>
          ),
        },
        pageFieldJsonList.toProject.visibleFlag && {
          title: `${pageFieldJsonList.toProject.displayName}`,
          dataIndex: 'projName',
          sortNo: `${pageFieldJsonList.toProject.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.logUserId.visibleFlag && {
          title: `${pageFieldJsonList.logUserId.displayName}`,
          dataIndex: 'logUserName',
          sortNo: `${pageFieldJsonList.logUserId.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.logMentionTime.visibleFlag && {
          title: `${pageFieldJsonList.logMentionTime.displayName}`,
          dataIndex: 'logMentionTime',
          sortNo: `${pageFieldJsonList.logMentionTime.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.importanDegree.visibleFlag && {
          title: `${pageFieldJsonList.importanDegree.displayName}`,
          dataIndex: 'importanDegreeDesc',
          sortNo: `${pageFieldJsonList.importanDegree.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.logPriority.visibleFlag && {
          title: `${pageFieldJsonList.logPriority.displayName}`,
          dataIndex: 'logPriorityDesc',
          sortNo: `${pageFieldJsonList.logPriority.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.belongsType.visibleFlag && {
          title: `${pageFieldJsonList.belongsType.displayName}`,
          dataIndex: 'belongsTypeDesc',
          sortNo: `${pageFieldJsonList.belongsType.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.hopeResolveTime.visibleFlag && {
          title: `${pageFieldJsonList.hopeResolveTime.displayName}`,
          dataIndex: 'hopeResolveTime',
          sortNo: `${pageFieldJsonList.hopeResolveTime.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.responsibilityUserId.visibleFlag && {
          title: `${pageFieldJsonList.responsibilityUserId.displayName}`,
          dataIndex: 'respUserName',
          sortNo: `${pageFieldJsonList.responsibilityUserId.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.appointedTime.visibleFlag && {
          title: `${pageFieldJsonList.appointedTime.displayName}`,
          dataIndex: 'appointedTime',
          sortNo: `${pageFieldJsonList.appointedTime.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.solveUserId.visibleFlag && {
          title: `${pageFieldJsonList.solveUserId.displayName}`,
          dataIndex: 'solveUserName',
          sortNo: `${pageFieldJsonList.solveUserId.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.actualTime.visibleFlag && {
          title: `${pageFieldJsonList.actualTime.displayName}`,
          dataIndex: 'actualTime',
          sortNo: `${pageFieldJsonList.actualTime.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.actualTime.visibleFlag && {
          title: `${pageFieldJsonList.actualTime.displayName}`,
          dataIndex: 'actualTime',
          sortNo: `${pageFieldJsonList.actualTime.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.solveUserId.visibleFlag && {
          title: `最后跟踪日期`,
          dataIndex: 'traceTime',
          align: 'center',
          width: 120,
        },
        pageFieldJsonList.expectedHours.visibleFlag && {
          title: `${pageFieldJsonList.expectedHours.displayName}`,
          dataIndex: 'expectedHours',
          sortNo: `${pageFieldJsonList.expectedHours.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.createUserId.visibleFlag && {
          title: `${pageFieldJsonList.createUserId.displayName}`,
          dataIndex: 'createUserName',
          sortNo: `${pageFieldJsonList.createUserId.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.createTime.visibleFlag && {
          title: `${pageFieldJsonList.createTime.displayName}`,
          dataIndex: 'createTime',
          sortNo: `${pageFieldJsonList.createTime.sortNo}`,
          align: 'center',
          width: 120,
          render: (record, obj, index) => (
            <span>{moment(record).format('YYYY-MM-DD HH:mm:ss')}</span>
          ),
        },
        pageFieldJsonList.state.visibleFlag && {
          title: `${pageFieldJsonList.state.displayName}`,
          dataIndex: 'stateDesc',
          sortNo: `${pageFieldJsonList.state.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.apprStatus.visibleFlag && {
          title: `${pageFieldJsonList.apprStatus.displayName}`,
          dataIndex: 'apprStatusDesc',
          sortNo: `${pageFieldJsonList.apprStatus.sortNo}`,
          align: 'center',
          width: 80,
        },
        pageFieldJsonList.taskId.visibleFlag && {
          title: `关联任务包`,
          dataIndex: 'taskName',
          sortNo: `${pageFieldJsonList.taskId.sortNo}`,
          align: 'center',
          width: 220,
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      leftButtons: [
        buttonLists.create.visible && {
          key: 'add',
          icon: 'plus-circle',
          className: 'tw-btn-primary',
          title: '新增',
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            router.push(`/user/project/logAdd?mode=create`);
          },
        },
        buttonLists.genTaskPkg.visible && {
          key: 'generate_package',
          icon: 'account-book',
          className: 'tw-btn-primary',
          title: '生成任务包',
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let errorGenerateFlag = false;
            let errorSameProjectFlag = false;
            let errorApproveFlag = false;
            let errorResponseFlag = false;
            const firstProject = selectedRows[0].toProject;
            const responseUserId = selectedRows[0].respUserId;
            selectedRows.forEach(item => {
              if (item.toProject !== firstProject) {
                errorSameProjectFlag = true;
              }
              if (item.taskName !== null) {
                errorGenerateFlag = true;
              }
              if (item.belongsType === '05' && item.apprStatus !== 'APPROVED') {
                errorApproveFlag = true;
              }
              if (item.respUserId !== responseUserId) {
                errorResponseFlag = true;
              }
            });
            if (errorSameProjectFlag) {
              createMessage({
                type: 'error',
                description: '需要选择相同项目的数据，请检查',
              });
              return;
            }
            if (errorGenerateFlag) {
              createMessage({
                type: 'error',
                description: '所选数据已生成任务包，请检查',
              });
              return;
            }
            if (errorApproveFlag) {
              createMessage({
                type: 'error',
                description: '所属类型为"业务需求"的数据，需要审批通过才可以生成任务包',
              });
              return;
            }
            if (errorResponseFlag) {
              createMessage({
                type: 'error',
                description: '任务包需要关联相同责任人，请检查数据',
              });
              return;
            }
            router.push(`/user/task/edit?mode=generatePackage&lodIds=${selectedRowKeys.join(',')}`);
          },
        },
        buttonLists.adjustEqva.visible && {
          key: 'hour_adjust',
          icon: 'tool',
          className: 'tw-btn-primary',
          title: '当量调整',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let errorSameProjectFlag = false;
            let errorApproveFlag = false;
            let errorResponseFlag = false;
            let errorGeneratedFlag = false;
            let errorGenerateFlag = false;
            let errorSamePackage = false;
            let inProcess = false;
            let packageName = []; // eslint-disable-line
            const firstProject = selectedRows[0].toProject;
            const responseUserId = selectedRows[0].respUserId;
            selectedRows.forEach(item => {
              if (item.taskName !== null) {
                if (item.taskStatus !== 'IN PROCESS') {
                  inProcess = true;
                }
              }
              if (item.toProject !== firstProject) {
                errorSameProjectFlag = true;
              }
              if (item.belongsType === '05' && item.apprStatus !== 'APPROVED') {
                errorApproveFlag = true;
              }
              if (item.respUserId !== responseUserId) {
                errorResponseFlag = true;
              }
              if (item.taskName === null) {
                errorGeneratedFlag = true;
              }
              if (item.taskName !== null) {
                errorGenerateFlag = true;
              }
              if (item.taskName !== null) {
                packageName.push(item.taskName);
              }
            });
            if (inProcess) {
              createMessage({
                type: 'error',
                description: '任务包的状态为处理中，才允许调整当量',
              });
              return;
            }
            const packageNameDiff = new Set(packageName).size;
            if (packageNameDiff !== 1) {
              errorSamePackage = true;
            }
            if (errorSameProjectFlag) {
              createMessage({
                type: 'error',
                description: '需要选择相同项目的数据，请检查',
              });
              return;
            }
            if (errorApproveFlag) {
              createMessage({
                type: 'error',
                description: '所属类型为"业务需求"的数据，需要审批通过才可以当量调整',
              });
              return;
            }
            if (errorResponseFlag) {
              createMessage({
                type: 'error',
                description: '任务包需要关联相同责任人，请检查数据',
              });
              return;
            }
            if (!errorGeneratedFlag) {
              createMessage({
                type: 'error',
                description: '请选择至少一条未生成任务包的项目日志',
              });
              return;
            }
            if (!errorGenerateFlag) {
              createMessage({
                type: 'error',
                description: '请选择至少一条生成过任务包的项目日志',
              });
              return;
            }
            if (errorSamePackage) {
              createMessage({
                type: 'error',
                description: '请选择相同关联任务包进行当量调整',
              });
              return;
            }
            router.push(`/user/task/edit?mode=updatePackage&lodIds=${selectedRowKeys.join(',')}`);
          },
        },
        buttonLists.logchange.visible && {
          key: 'log_change',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '变更',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/user/project/logChange?mode=change&logId=${id}`);
          },
        },
        buttonLists.edit.visible && {
          key: 'edit',
          icon: 'form',
          className: 'tw-btn-primary',
          title: '编辑',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const { id } = selectedRows[0];
            router.push(`/user/project/logEdit?mode=edit&logId=${id}`);
          },
        },
        buttonLists.delete.visible && {
          key: 'remove',
          icon: 'tw-btn-error',
          className: 'tw-btn-error',
          title: '删除',
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            let errorFlag = false;
            selectedRows.forEach(item => {
              if (item.belongsType === '05' && item.apprStatus !== 'NOTSUBMIT') {
                errorFlag = true;
              }
            });
            if (errorFlag) {
              createMessage({ type: 'error', description: '不允许删除已生成审批流程数据' });
            } else {
              createConfirm({
                content: '确认删除所选记录？',
                onOk: () =>
                  dispatch({
                    type: `${DOMAIN}/delete`,
                    payload: { ids: selectedRowKeys.join(',') },
                  }),
              });
            }
          },
        },
        buttonLists.importLog.visible && {
          key: 'import_log',
          icon: 'file-excel',
          className: 'tw-btn-primary',
          title: '导入项目日志',
          loading: false,
          hidden: false,
          disabled: loading,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.toggleImportVisible();
          },
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
    };

    const {
      visible,
      importVisible,
      failedList,
      uploading,
      confirmLoading,
      radioFlag,
      fuzzyVisible,
    } = this.state;
    const excelImportProps = {
      templateUrl: location.origin + `/template/projectLogTemplate.xlsx`, // eslint-disable-line
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '项目日志记录数据导入失败记录', // 表名
            sheetFilter: [
              'errorMsg',
              'importNumber',
              'title',
              'toProject',
              'logPriority',
              'logUserId',
              'logMentionTime',
              'belongsType',
              'hopeResolveTime',
              'respUserId',
              'appointedTime',
              'actualTime',
              'solveUserId',
              'expectedHours',
              'state',
            ], // 列过滤
            sheetHeader: [
              '失败原因',
              '编号',
              '标题',
              '所属项目',
              '优先级',
              '提出人',
              '提出日期',
              '所属类型',
              '希望解决时间',
              '责任人',
              '指派时间',
              '实际解决时间',
              '实际解决人',
              '预计工时',
              '当前状态',
            ], // 第一行标题
            columnWidths: [12, 4, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 6], // 列宽 需与列顺序对应
          },
        ],
      },
      controlModal: {
        visible: importVisible,
        failedList,
        uploading,
      },
    };
    return (
      <PageHeaderWrapper title="项目日志列表">
        <ExcelImportExport
          {...excelImportProps}
          closeModal={this.toggleImportVisible}
          handleUpload={this.handleUpload}
        />
        <DataTable {...tableProps} scroll={{ x: 3000 }} />
      </PageHeaderWrapper>
    );
  }
}

export default ProjectLogList;
