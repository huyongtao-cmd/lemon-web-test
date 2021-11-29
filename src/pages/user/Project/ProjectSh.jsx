import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Tooltip } from 'antd';
import moment from 'moment';
import { clone } from 'ramda';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';

import { createConfirm } from '@/components/core/Confirm';
import { closeThenGoto } from '@/layouts/routerControl';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';

import ProjectShModal from './modal/ProjectShModal';
import ExtrworkModal from './modal/ExtrworkModal';

const DOMAIN = 'userProjectSh';

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

const tabList = [
  { key: 'member', tab: '成员管理' },
  // { key: 'extrwork', tab: '成员加班管理' }
];

const columns = [
  { dataIndex: 'code', title: '编号', span: 12 },
  { dataIndex: 'name', title: '名称', span: 12 },
];

@connect(({ loading, userProjectSh }) => ({
  userProjectSh,
  loading: ``,
}))
class ProjectSh extends PureComponent {
  state = {
    operationkey: 'member',
    projectshVisible: false, // 项目成员管理弹框显示
    extrworkVisible: false, // 项目成员管理弹框显示
    formData: { ...formDataModel },
    extrworkFormData: { ...extrworkFormDataModel },
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC' });
    this.fetchExtrworkData();
    dispatch({ type: `${DOMAIN}/selectProjRes`, payload: id });
    dispatch({
      type: `${DOMAIN}/vacation`,
      payload: {
        startDate: moment()
          .subtract(2, 'weeks')
          .startOf('weeks')
          .format('YYYY-MM-DD'),
        endDate: moment()
          .add(2, 'weeks')
          .endOf('weeks')
          .format('YYYY-MM-DD'),
      },
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { ...params, projId: id },
    });
  };

  fetchExtrworkData = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryExtrwork`,
      payload: {
        ...params,
        workReasonId: id,
        workReasonType: 'WORK_PROJECT',
        sortBy: 'workBegDate',
        sortDirection: 'DESC',
      },
    });
  };

  // 项目成员管理新增弹出窗。
  projectshToggleModal = () => {
    const { projectshVisible } = this.state;
    this.setState({
      projectshVisible: !projectshVisible,
      formData: {
        ...formDataModel,
      },
    });
  };

  // 项目成员管理修改弹出窗。
  projectshEditModal = selectedRow => {
    const { dispatch } = this.props;
    const { projectshVisible } = this.state;
    this.setState({
      projectshVisible: !projectshVisible,
      formData: {
        id: selectedRow.id,
        projId: selectedRow.projId,
        role: selectedRow.role,
        resId: selectedRow.resId,
        jobType1: selectedRow.jobType1,
        jobType2: selectedRow.jobType2,
        capasetLevelId: selectedRow.capasetLevelId,
        planStartDate: selectedRow.planStartDate,
        planEndDate: selectedRow.planEndDate,
        planEqva: selectedRow.planEqva,
        workbenchFlag: selectedRow.workbenchFlag,
        customerPrice: selectedRow.customerPrice,
        remark: selectedRow.remark,
      },
    });
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: selectedRow.jobType1,
    });
    dispatch({
      type: `${DOMAIN}/updateCapasetLevelList`,
      payload: {
        jobType1: selectedRow.jobType1,
        jobType2: selectedRow.jobType2,
      },
    });
  };

  // 项目成员管理复制弹出窗。
  projectshCopyModal = selectedRow => {
    const { dispatch } = this.props;
    const { projectshVisible } = this.state;
    this.setState({
      projectshVisible: !projectshVisible,
      formData: {
        projId: selectedRow.projId,
        role: selectedRow.role,
        resId: selectedRow.resId,
        jobType1: selectedRow.jobType1,
        jobType2: selectedRow.jobType2,
        capasetLevelId: selectedRow.capasetLevelId,
        planStartDate: selectedRow.planStartDate,
        planEndDate: selectedRow.planEndDate,
        planEqva: selectedRow.planEqva,
        workbenchFlag: selectedRow.workbenchFlag,
        customerPrice: selectedRow.customerPrice,
        remark: selectedRow.remark,
      },
    });
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: selectedRow.jobType1,
    });
    dispatch({
      type: `${DOMAIN}/updateCapasetLevelList`,
      payload: {
        jobType1: selectedRow.jobType1,
        jobType2: selectedRow.jobType2,
      },
    });
  };

  // 项目成员管理保存按钮事件
  projectshSubmitModal = () => {
    const { projectshVisible, formData } = this.state;
    const { dispatch } = this.props;
    const { id } = fromQs();
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/projectshSave`,
      payload: { formData: { ...formData, projId: param.id } },
    }).then(reason => {
      if (!reason) {
        return;
      }
      this.setState({
        projectshVisible: !projectshVisible,
        formData,
      });
      dispatch({ type: `${DOMAIN}/selectProjRes`, payload: id });
      this.fetchData();
    });
  };

  /** --------------------------------------------- */

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

  // 项目成员加班管理修改弹出窗。
  extrworkEditModal = selectedRow => {
    const { dispatch } = this.props;
    const { extrworkVisible } = this.state;
    this.setState({
      extrworkVisible: !extrworkVisible,
      extrworkFormData: clone(selectedRow),
    });
  };

  // 项目成员加班管理保存按钮事件
  extrworkSubmitModal = () => {
    const { extrworkVisible, extrworkFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/saveExtrwork`,
      payload: { formData: { ...extrworkFormData, workReasonId: +param.id } },
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

  render() {
    const {
      dispatch,
      loading,
      userProjectSh: {
        dataSource,
        total,
        searchForm,
        extrworkDataSource,
        extrworkTotal,
        projResDataSource,
        vacation,
      },
    } = this.props;
    const {
      operationkey,
      formData,
      projectshVisible,
      extrworkFormData,
      extrworkVisible,
    } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 项目成员管理表格
    const projectshTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      total,
      dataSource,
      showSearch: false,
      scroll: { x: 3000 },
      rowSelection: {
        getCheckboxProps: record => ({
          disabled: record.reasonType,
        }),
      },
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      // searchBarForm: [
      //   {
      //     title: '包含转包资源',
      //     dataIndex: 'transferFlag',
      //     tag: (
      //       <Select>
      //         <Select.Option value="0">否</Select.Option>
      //         <Select.Option value="1">是</Select.Option>
      //       </Select>
      //     ),
      //   },
      // ],
      columns: [
        {
          title: '项目角色',
          dataIndex: 'role',
        },
        {
          title: '复合能力',
          dataIndex: 'capasetLevelName',
        },
        {
          title: '资源',
          dataIndex: 'resName',
        },
        {
          title: '预计开始日期',
          dataIndex: 'planStartDate',
        },
        {
          title: '预计结束日期',
          dataIndex: 'planEndDate',
        },
        {
          title: '工作台显示',
          dataIndex: 'workbenchFlag',
          align: 'center',
          render: (value, row, index) => {
            if (value === 1) {
              return <div>显示</div>;
            }
            if (value === 0) {
              return <div>隐藏</div>;
            }
            return <div>{value}</div>;
          },
        },
        {
          title: '规划当量',
          dataIndex: 'planEqva',
          align: 'right',
        },
        // {
        //   title: '项目号',
        //   dataIndex: 'projNo',
        //   align: 'center',
        // },
        {
          title: '任务包号',
          dataIndex: 'taskNo',
          align: 'center',
        },
        {
          title: '派发当量系数',
          dataIndex: 'eqvaRatio',
          align: 'right',
        },
        {
          title: 'FromBU',
          dataIndex: 'expenseBuName',
        },
        {
          title: 'ToBU',
          dataIndex: 'receiverBuName',
        },
        {
          title: '合作类型',
          dataIndex: 'cooperationTypeDesc',
          align: 'center',
        },
        {
          title: '验收方式',
          dataIndex: 'acceptMethodName',
          align: 'center',
        },
        {
          title: '总当量',
          dataIndex: 'eqvaQty',
          align: 'right',
        },
        {
          title: '当量工资',
          dataIndex: 'eqvaSalary',
          align: 'right',
        },
        {
          title: 'BU结算价',
          dataIndex: 'buSettlePrice',
          align: 'right',
        },
        {
          title: '管理费',
          dataIndex: 'ohfeePrice',
          align: 'right',
        },
        {
          title: '税点',
          dataIndex: 'taxRate',
          align: 'right',
        },
        {
          title: '当量结算单价',
          dataIndex: 'settlePrice',
          align: 'right',
        },
        {
          title: '参考人天单价',
          dataIndex: 'mandayPrice',
          align: 'right',
        },
        {
          title: '派发金额',
          dataIndex: 'amt',
          align: 'right',
        },
        {
          title: '已结算当量数',
          dataIndex: 'settledEqva',
          align: 'right',
        },
        {
          title: '已结算金额',
          dataIndex: 'settledAmt',
          align: 'right',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.projectshToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            this.projectshEditModal(selectedRows[0]),
        },
        {
          key: 'copy',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.copy`, desc: '复制' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) =>
            this.projectshCopyModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/delete`,
                  payload: { id: selectedRowKeys, queryParams: { projId: param.id } },
                }),
            });
          },
        },
      ],
    };

    // 项目成员管理加班表格
    const extrworkTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      dataSource: extrworkDataSource,
      total: extrworkTotal,
      onChange: filters => {
        this.fetchExtrworkData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: {
            ...allValues,
            workReasonId: param.id,
            workReasonType: 'WORK_PROJECT',
          },
        });
      },
      searchBarForm: [
        {
          title: '资源名称',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId,
          },
          tag: (
            <Selection.Columns
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              columns={columns}
              source={projResDataSource}
              placeholder="请选择资源"
              showSearch
            />
          ),
        },
        {
          title: '加班日期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker className="x-fill-100" />,
        },
        {
          title: '调休安排情况',
          dataIndex: 'restInfo',
          options: {
            // initialValue: searchForm.buId,
          },
          tag: <Selection.UDC code="RES:IN_LIEU_INFO" placeholder="请选择调休安排情况" />,
        },
      ],
      columns: [
        {
          title: '资源名称',
          dataIndex: 'resIdName',
          align: 'center',
        },
        {
          title: '项目角色',
          dataIndex: 'role',
        },
        {
          title: '加班开始日期',
          dataIndex: 'workBegDate',
          align: 'center',
        },
        {
          title: '加班结束日期',
          dataIndex: 'workEndDate',
          align: 'center',
        },
        {
          title: '计划加班天数',
          dataIndex: 'extWorkDay',
          align: 'right',
          render: v => v && (+v).toFixed(1),
        },
        {
          title: '加班工作内容',
          dataIndex: 'workContent',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        {
          title: '实际加班工时',
          dataIndex: 'actTime',
          align: 'center',
          render: value => value || 0,
        },
        {
          title: '已安排调休天数',
          dataIndex: 'canRestTime',
          align: 'center',
          render: value => value || 0,
        },
        {
          title: '未安排调休天数',
          dataIndex: 'timeLeft',
          align: 'center',
          render: value => value || 0,
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.extrworkToggleModal();
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/canEdit`,
              payload: selectedRowKeys[0],
            }).then(res => {
              if (res) {
                this.extrworkEditModal(selectedRows[0]);
              } else {
                createMessage({ type: 'warn', description: '已填报工时的加班信息不可修改!' });
              }
            });
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/deleteExtrwork`,
                  payload: {
                    ids: selectedRowKeys.join(','),
                    searchForm: {
                      ...searchForm,
                      workReasonId: param.id,
                      workReasonType: 'WORK_PROJECT',
                    },
                  },
                }),
            });
          },
        },
        {
          key: 'rest',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.rest`, desc: '安排调休' }),
          loading: false,
          hidden: false, // 应为未安排调休天数查询逻辑还有问题，所以此功能暂时不开放，下周开放
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            if (selectedRowKeys.length) {
              dispatch({
                type: `${DOMAIN}/handleRest`,
                payload: selectedRows,
              });
            } else {
              createMessage({ type: 'warn', description: '请选择资源' });
            }
          },
        },
      ],
    };

    const contentList = {
      member: <DataTable {...projectshTableProps} />,
      // extrwork: <DataTable {...extrworkTableProps} />,
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto(`/user/project/projectDetail?id=${param.id}`)}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={operationkey}
          tabList={tabList}
          onTabChange={key => this.setState({ operationkey: key })}
        >
          {contentList[operationkey]}
        </Card>

        <ProjectShModal
          formData={formData}
          visible={projectshVisible}
          handleCancel={this.projectshToggleModal}
          handleOk={this.projectshSubmitModal}
        />

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

export default ProjectSh;
