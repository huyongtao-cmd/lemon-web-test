import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Select } from 'antd';
import Link from 'umi/link';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab } from '@/layouts/routerControl';
import { Selection, BuVersion } from '@/pages/gen/field';
import { selectBus } from '@/services/org/bu/bu';
import { selectUsersWithBu } from '@/services/gen/list';
import { getParam, editParam, addParam } from '@/utils/urlUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import moment from 'moment';
import ProjectShModal from './modal/ProjectShModal';
import ExtrworkModal from './modal/ExtrworkModal';
import { fromQs } from '@/utils/stringUtils';
import { getBuVersionAndBuParams } from '@/utils/buVersionUtils';

const DOMAIN = 'userProject';
const applyColumns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

// 项目成员管理明细初始化
const formDataModel = {
  id: null,
  projId: null, // 项目ID
  role: null, // 角色
  resId: null, // 资源
  jobType1: null, // 工种
  jobType2: null, // 工种子类
  capasetLevelId: '', // 复合能力级别ID
  planStartDate: null, // 预计开始日期
  planEndDate: null, // 预计结束日期
  planEqva: null, // 规划当量
  workbenchFlag: null, // 工作台默认显示
  remark: null, // 备注
};

// 项目成员管理明细初始化
const extrworkFormDataModel = {
  id: null,
  extWorkDay: undefined,
  workBegDate: undefined,
  workEndDate: undefined,
  workContent: undefined,
  workReasonId: undefined,
  role: undefined, // 角色
  resId: undefined, // 资源
};

@connect(({ loading, userProject }) => ({
  userProject,
  loading: loading.effects[`${DOMAIN}/query`],
}))
@mountToTab()
class Project extends PureComponent {
  state = {
    // operationkey: 'member',
    // projectshVisible: false, // 项目成员管理弹框显示
    extrworkVisible: false, // 项目成员管理弹框显示
    // formData: { ...formDataModel },
    extrworkFormData: { ...extrworkFormDataModel },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchExtrworkData();
    const defaultSearchForm = {
      projectSearchKey: null, // 项目名称/编号
      userdefinedNo: null, // 参考合同号
      deliBuId: null, // 交付BU
      pmResId: null, // 项目经理
      workType: null, // 工作类型
      projStatus: null, // 项目状态
      salesmanResId: null, // 销售负责人
      contractSearchKey: null, // 子合同编号/名称
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        searchForm: defaultSearchForm,
        dataSource: [],
        total: 0,
      },
    });
    // this.fetchData({ offset: 0, limit: 10, sortBy: 'projNo', sortDirection: 'ASC' });
  }

  fetchExtrworkData = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryExtrwork`,
      payload: { ...params, workReasonId: id, workReasonType: 'WORK_PROJECT' },
    });
  };

  // 项目成员加班管理新增弹出窗。
  extrworkToggleModal = () => {
    const { extrworkVisible } = this.state;
    this.setState({
      extrworkVisible: !extrworkVisible,
      extrworkFormData: {
        ...extrworkFormDataModel,
      },
    });
  };

  // 项目成员加班管理保存按钮事件
  extrworkSubmitModal = () => {
    const { extrworkVisible, extrworkFormData } = this.state;
    const {
      dispatch,
      userProject: {
        searchForm: { selectedRowKeys },
      },
    } = this.props;

    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/saveExtrwork`,
      payload: { formData: { ...extrworkFormData, workReasonId: +selectedRowKeys[0] } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        extrworkVisible: !extrworkVisible,
        extrworkFormData,
      });
      this.fetchExtrworkData();
    });
  };

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: {
        ...params,
        ...getBuVersionAndBuParams(params.deliBuId, 'deliBuId', 'deliBuVersionId'),
      },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      userProject: { dataSource, total, searchForm, jumpData, vacation },
    } = this.props;

    const { extrworkFormData, extrworkVisible } = this.state;
    // 获取url上的参数
    const param = fromQs();

    const tableProps = {
      rowKey: 'id',
      sortBy: 'projNo',
      sortDirection: 'ASC',
      columnsCache: DOMAIN,
      scroll: { x: 2500 },
      loading,
      total,
      dataSource,
      searchForm,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '项目名称/编号', // TODO: 国际化
          dataIndex: 'projectSearchKey',
          options: {
            initialValue: searchForm.projectSearchKey,
          },
          tag: <Input placeholder="请输入项目名称/编号" />,
        },
        {
          title: '参考合同号', // TODO: 国际化
          dataIndex: 'userdefinedNo',
          options: {
            initialValue: searchForm.userdefinedNo,
          },
          tag: <Input placeholder="请输入参考合同号" />,
        },
        {
          title: '交付BU', // TODO: 国际化
          dataIndex: 'deliBuId',
          options: {
            initialValue: searchForm.deliBuId,
          },
          tag: <BuVersion />,
        },
        {
          title: '项目经理', // TODO: 国际化
          dataIndex: 'pmResId',
          options: {
            initialValue: searchForm.pmResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              showSearch
              placeholder="请选择项目经理"
            />
          ),
        },
        {
          title: '交付负责人',
          dataIndex: 'deliResId',
          options: {
            initialValue: searchForm.deliResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              placeholder="请选择交付负责人"
              showSearch
            />
          ),
        },
        {
          title: '工作类型', // TODO: 国际化
          dataIndex: 'workType',
          options: {
            initialValue: searchForm.workType,
          },
          tag: <Selection.UDC code="TSK.WORK_TYPE" placeholder="请选择工作类型" />,
        },
        {
          title: '项目状态', // TODO: 国际化
          dataIndex: 'projStatus',
          options: {
            initialValue: searchForm.projStatus,
          },
          tag: <Selection.UDC code="TSK.PROJ_STATUS" placeholder="请选择项目状态" />,
        },
        {
          title: '销售负责人', // TODO: 国际化
          dataIndex: 'salesmanResId',
          options: {
            initialValue: searchForm.salesmanResId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              source={() => selectUsersWithBu()}
              showSearch
              placeholder="请选择销售负责人"
            />
          ),
        },
        {
          title: '合同编号/名称', // TODO: 国际化
          dataIndex: 'contractSearchKey',
          options: {
            initialValue: searchForm.contractSearchKey,
          },
          tag: <Input placeholder="请输入子合同编号/名称" />,
        },
        {
          title: '项目难度', // TODO: 国际化
          dataIndex: 'projectDifficult',
          options: {
            initialValue: searchForm.projectDifficult,
          },
          tag: <Selection.UDC code="ACC:PROJECT_DIFFICULTY" placeholder="请选择项目难度" />,
        },
        {
          title: '项目重要度', // TODO: 国际化
          dataIndex: 'projectImportance',
          options: {
            initialValue: searchForm.projectImportance,
          },
          tag: <Selection.UDC code="ACC:PROJECT_IMPORTANCE" placeholder="请选择项目重要度" />,
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResId',
          options: {
            initialValue: searchForm.pmoResId,
          },
          tag: (
            <Selection.Columns
              source={() => selectUsersWithBu()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={applyColumns}
              placeholder="请选择PMO"
              showSearch
            />
          ),
        },
      ],
      columns: [
        {
          title: '项目编号', // TODO: 国际化
          dataIndex: 'projNo',
          align: 'center',
          sorter: true,
          defaultSortOrder: 'ascend',
          width: 120,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/project/projectDetail?id=${row.id}`}>
              {value}
            </Link>
          ),
        },
        {
          title: '项目名称', // TODO: 国际化
          dataIndex: 'projName',
          width: 200,
        },
        {
          title: '参考合同号', // TODO: 国际化
          dataIndex: 'userdefinedNo',
          align: 'center',
          width: 100,
        },
        {
          title: '工作类型', // TODO: 国际化
          dataIndex: 'workTypeName',
          align: 'center',
          width: 100,
        },
        {
          title: '项目状态', // TODO: 国际化
          dataIndex: 'projStatusName',
          align: 'center',
          width: 100,
        },
        {
          title: '交付BU', // TODO: 国际化
          dataIndex: 'deliBuName',
          width: 130,
        },
        {
          title: '项目难度', // TODO: 国际化
          dataIndex: 'projectDifficultName',
          align: 'center',
          width: 100,
        },
        {
          title: '项目重要度', // TODO: 国际化
          dataIndex: 'projectImportanceName',
          align: 'center',
          width: 100,
        },
        {
          title: '项目经理', // TODO: 国际化
          dataIndex: 'pmResName',
          width: 100,
        },
        {
          title: '销售负责人', // TODO: 国际化
          dataIndex: 'salesmanResName',
          width: 100,
        },
        {
          title: 'PMO',
          dataIndex: 'pmoResIdName',
          align: 'center',
          width: 100,
        },
        {
          title: '子合同编号', // TODO: 国际化
          dataIndex: 'contractNo',
          width: 100,
        },
        {
          title: '子合同名称', // TODO: 国际化
          dataIndex: 'contractName',
          width: 150,
          render: (value, row, key) => (
            <Link
              className="tw-link"
              to={`/sale/contract/salesSubDetail?mainId=${row.mainContractId}&id=${row.contractId}`}
            >
              {value}
            </Link>
          ),
        },
        {
          title: '创建日期', // TODO: 国际化
          dataIndex: 'createTime',
          width: 120,
        },
        {
          title: '项目总金额',
          dataIndex: 'sumAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '已开票金额',
          dataIndex: 'invAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '已收款金额',
          dataIndex: 'actualRecvAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '未收款金额',
          dataIndex: 'unRecvAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总当量预算',
          dataIndex: 'totalEqvaBudget',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总当量',
          dataIndex: 'totalEqvaActual',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总费用预算',
          dataIndex: 'totalReimbursement',
          align: 'right',
          width: 100,
        },
        {
          title: '项目总费用',
          dataIndex: 'totalAmt',
          align: 'right',
          width: 100,
        },
        {
          title: '项目进度状态',
          dataIndex: 'projProcessStatus',
          align: 'right',
          width: 100,
        },
        {
          title: '最近汇报期间',
          dataIndex: 'recentReportPeriodName',
          align: 'right',
          width: 100,
        },
        {
          title: '资源规划更新日',
          dataIndex: 'planningModifyDate',
          align: 'right',
          width: 100,
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !(selectedRows.length === 1 && selectedRows[0].projStatus !== 'CLOSING'),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // id、状态
            const { id, projStatus } = selectedRows[0];
            router.push(`/user/project/projectEdit?id=${selectedRowKeys}&mode=update`);
            // 创建状态可修改
            /* if (projStatus === 'CREATE') {
              router.push(`/user/project/projectEdit?id=${selectedRowKeys}&mode=update`);
            } else {
              createMessage({ type: 'warn', description: '所选记录不符合修改操作，请重新选择' });
            } */
          },
        },
        {
          key: 'workbench',
          className: 'tw-btn-info',
          icon: 'form',
          title: formatMessage({ id: `ui.menu.user.project.workbench`, desc: '工作台' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // id、状态
            const { id, projStatus } = selectedRows[0];
            router.push(`/user/project/workbench?id=${selectedRowKeys}`);
            // 创建状态可修改
            /* if (projStatus === 'CREATE') {
              router.push(`/user/project/projectEdit?id=${selectedRowKeys}&mode=update`);
            } else {
              createMessage({ type: 'warn', description: '所选记录不符合修改操作，请重新选择' });
            } */
          },
        },
        {
          key: 'projectBI',
          className: 'tw-btn-info',
          icon: 'form',
          title: '项目执行情况表',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // id、状态
            const { id } = selectedRows[0];
            let reportUrl = '';
            dispatch({ type: `${DOMAIN}/projExecutionInfo` }).then(data => {
              if (getParam(data.reportUrl, 'projID')) {
                reportUrl = editParam(data.reportUrl, 'projID', id);
              } else {
                reportUrl = addParam(data.reportUrl, 'projID', id);
              }
              window.sessionStorage.setItem(
                'reportParms',
                JSON.stringify({
                  ...data,
                  reportUrl,
                })
              );
              router.push(`/user/project/projectWaitAuth?id=${id}&type=PROJ`);
            });
          },
        },
        {
          key: 'finshProject',
          className: 'tw-btn-info',
          icon: 'check-circle',
          title: '结项申请',
          loading: false,
          hidden: false,
          disabled: selectedRows =>
            !(
              selectedRows.length === 1 &&
              (selectedRows[0].projStatus === 'ACTIVE' || selectedRows[0].projStatus === 'PENDING')
            ),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // id、状态
            const { id } = selectedRows[0];
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/user/project/finishProject/flowCreate?id=${id}&${from}&list=true`);
          },
        },
        // {
        //   key: 'add',
        //   className: 'tw-btn-primary',
        //   icon: 'plus-circle',
        //   title: '安排加班',
        //   loading: false,
        //   hidden: false,
        //   minSelections: 0,
        //   disabled: selectedRows => selectedRows.length !== 1,
        //   cb: (selectedRowKeys, selectedRows, queryParams) => {
        //     dispatch({ type: `userProjectSh/selectProjRes`, payload: selectedRowKeys[0] }).then(
        //       res => {
        //         dispatch({
        //           type: `${DOMAIN}/vacation`,
        //           payload: {
        //             startDate: moment()
        //               .subtract(2, 'weeks')
        //               .startOf('weeks')
        //               .format('YYYY-MM-DD'),
        //             endDate: moment()
        //               .add(2, 'weeks')
        //               .endOf('weeks')
        //               .format('YYYY-MM-DD'),
        //           },
        //         });
        //         this.extrworkToggleModal();
        //       }
        //     );
        //   },
        // },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...tableProps} />
        <ExtrworkModal
          formData={extrworkFormData}
          vacation={vacation}
          visible={extrworkVisible}
          handleCancel={this.extrworkToggleModal}
          handleOk={this.extrworkSubmitModal}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Project;
