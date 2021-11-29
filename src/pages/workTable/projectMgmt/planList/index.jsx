import React from 'react';
import { connect } from 'dva';
import { Switch, Modal } from 'antd';
import router from 'umi/router';
import { isEmpty } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import { createConfirm } from '@/components/core/Confirm';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';

import { projectPlanListRq, projectPlanDeleteRq } from '@/services/workbench/project';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/production/stringUtil';
import ExcelImportExport from '@/components/common/ExcelImportExport';
import PlanTypeModal from './component/PlanTypeModal';

const DOMAIN = 'planList';

@connect(({ loading, dispatch, planList }) => ({
  loading,
  dispatch,
  ...planList,
}))
class index extends React.PureComponent {
  state = {
    visible: false,
    failedList: [],
  };

  componentDidMount() {
    // const { dispatch } = this.props;
    // dispatch({
    //   type: `${DOMAIN}/getPageConfig`,
    //   payload: { pageNo: 'PRODUCT_TABLE' },
    // });
    const { projectId } = fromQs();
    this.setState({
      projectId,
    });
  }

  fetchData = async params => {
    if (fromQs().projectId) {
      const {
        match: { url },
      } = this.props;
      // 场次管理，只查询planType=SCENE的
      if (url.includes('sessionMgmt')) {
        // eslint-disable-next-line no-param-reassign
        params.planType = 'SCENE';
      }

      const { response } = await projectPlanListRq({ ...params });
      return { ...response.data, rows: response.data.rows.map(v => ({ ...v, children: null })) };
    }

    const { projectId } = params;
    if (!projectId) {
      createMessage({ type: 'warn', description: '请先选择项目，再进行查询！' });
      return { rows: [], total: 0 };
    }

    const {
      match: { url },
    } = this.props;
    // 场次管理，只查询planType=SCENE的
    if (url.includes('sessionMgmt')) {
      // eslint-disable-next-line no-param-reassign
      params.planType = 'SCENE';
    }

    const { response } = await projectPlanListRq({ ...params });
    return { ...response.data, rows: response.data.rows.map(v => ({ ...v, children: null })) };
  };

  deleteData = async keys =>
    outputHandle(projectPlanDeleteRq, { ids: keys.join(',') }, undefined, false);

  renderColumns = () => {
    const {
      pageConfig,
      match: { url },
    } = this.props;
    const { getInternalState } = this.state;

    const fields = [
      {
        title: '编号',
        key: 'planNo',
        dataIndex: 'planNo',
        align: 'center',
      },
      {
        title: '场次',
        key: 'planName',
        dataIndex: 'planName',
        align: 'center',
        render: (value, row) => {
          // 场次管理
          if (url.includes('sessionMgmt')) {
            return (
              <Link
                onClick={() =>
                  router.push(
                    `/workTable/projectMgmt/sessionMgmt/detail?id=${row.id}&mode=DESCRIPTION`
                  )
                }
              >
                {value}
              </Link>
            );
          }

          return (
            <Link
              onClick={() =>
                router.push(`/workTable/projectMgmt/planList/detail?id=${row.id}&mode=DESCRIPTION`)
              }
            >
              {value}
            </Link>
          );
        },
      },
      {
        title: '集数',
        key: 'configurableField1',
        dataIndex: 'configurableField1',
        align: 'center',
        // render: value => {
        //   if (value === null) {
        //     return <span>{value}</span>;
        //   }
        //   const data = isNaN(value) ? value : parseInt(value);
        //   return <span>{data}</span>;
        // },
      },
      {
        title: '气氛',
        key: 'configurableField2',
        dataIndex: 'configurableField2',
        align: 'center',
      },
      {
        title: '页数',
        key: 'configurableField3',
        dataIndex: 'configurableField3',
        align: 'center',
      },
      {
        title: '主场景',
        key: 'configurableField4',
        dataIndex: 'configurableField4',
        align: 'center',
      },
      {
        title: '次场景',
        key: 'configurableField5',
        dataIndex: 'configurableField5',
        align: 'center',
      },
      {
        title: '主要内容',
        key: 'configurableField6',
        dataIndex: 'configurableField6',
        align: 'left',
      },
      {
        title: '演员',
        key: 'actors',
        dataIndex: 'actors',
        align: 'center',
      },
      {
        title: '服化道提示',
        key: 'configurableField7',
        dataIndex: 'configurableField7',
        align: 'center',
      },
      {
        title: '状态',
        key: 'executeStatus',
        dataIndex: 'executeStatusDesc',
        align: 'center',
      },
      {
        title: '日期起',
        key: 'planStartDate',
        dataIndex: 'planStartDate',
        align: 'center',
      },
      {
        title: '日期止',
        key: 'planEndDate',
        dataIndex: 'planEndDate',
        align: 'center',
      },
      {
        title: '负责人',
        key: 'inchargeResId',
        dataIndex: 'inchargeResIdDesc',
        align: 'center',
      },
      {
        title: '所属阶段',
        key: 'phaseNo',
        dataIndex: 'phaseIdDesc',
        align: 'center',
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'left',
      },
    ];

    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_COLUMNS',
    //   fields
    // );

    return fields;
  };

  renderSearchForm = () => {
    // const { pageConfig } = this.props;
    const { projectId } = fromQs();

    const fields = [
      <SearchFormItem
        label="项目"
        key="projectId"
        fieldKey="projectId"
        fieldType="ProjectSimpleSelect"
        defaultShow
        initialValue={projectId}
        onChange={e => {
          this.setState({
            projectId: e,
          });
        }}
      />,
      <SearchFormItem
        label="场次"
        key="planName"
        fieldKey="planName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="集数"
        key="configurableField1"
        fieldKey="configurableField1"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="主场景"
        key="configurableField4"
        fieldKey="configurableField4"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="角色/演员"
        key="roleName"
        fieldKey="roleName"
        fieldType="BaseInput"
        defaultShow
      />,
      <SearchFormItem
        label="状态"
        key="executeStatus"
        fieldKey="executeStatus"
        fieldType="BaseSelect"
        defaultShow
        parentKey="PRO:EXECUTE_STATUS"
      />,
      <SearchFormItem
        label="气氛"
        key="configurableField2"
        fieldKey="configurableField2"
        fieldType="BaseInput"
        defaultShow
      />,
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
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
      fileData.append('file', file);
    });

    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      if (res.ok) {
        createMessage({ type: 'success', description: '上传成功' });
        this.toggleImportVisible();

        const { projectId } = this.state;
        this.fetchData({
          projectId,
        });
        return;
      }

      if (res.datum && Array.isArray(res.datum) && !isEmpty(res.datum)) {
        createMessage({
          type: 'warn',
          description: res.msg || '部分数据上传失败，请下载错误数据进行更正',
        });
        this.setState({
          failedList: res.datum,
        });
      } else {
        createMessage({ type: 'error', description: res.msg || '部分数据上传失败,返回结果为空' });
        this.toggleImportVisible();
      }
    });
  };

  render() {
    const {
      dispatch,
      loading,
      match: { url },
    } = this.props;

    const urlPathname = window.location.pathname;

    const { getInternalState, visible, failedList, projectId } = this.state;

    const excelImportProps = {
      // eslint-disable-next-line no-restricted-globals
      templateUrl: location.origin + `/template/sessionImport.xls`,
      option: {
        fileName: '导入失败记录',
        datas: [
          {
            sheetName: '导入失败记录', // 表名
            sheetFilter: [
              'projectNo',
              'phaseName',
              'planNo',
              'planName',
              'executeStatus',
              'configurableField1',
              'configurableField2',
              'configurableField3',
              'configurableField4',
              'configurableField5',
              'configurableField6',
              'configurableField7',
              'roleName',
              'remark',
              'errorMsg',
            ], // 列过滤
            sheetHeader: [
              '项目编号',
              '所属阶段',
              '计划编号',
              '场次',
              '执行状态',
              '集数',
              '气氛',
              '页数',
              '主场景',
              '次场景',
              '主要内容',
              '服化道提示',
              '角色-姓名',
              '备注',
              '失败原因',
            ], // 第一行标题
            columnWidths: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], // 列宽 需与列顺序对应
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
        <PlanTypeModal projectId={projectId} url={urlPathname} />

        <ExcelImportExport
          {...excelImportProps}
          closeModal={this.toggleImportVisible}
          handleUpload={this.handleUpload}
        />
        <SearchTable
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          // onAddClick={() => {
          //   if (!projectId) {
          //     createMessage({ type: 'warn', description: '请先选择项目，再新增计划！' });
          //     return;
          //   }
          //   dispatch({
          //     type: `${DOMAIN}/updateState`,
          //     payload: {
          //       planTypeVisible: true,
          //     },
          //   });
          // }}
          // onEditClick={data => {
          //   router.push(
          //     `/workTable/projectMgmt/planList/edit?projectId=${projectId}&id=${data.id}&mode=EDIT`
          //   );
          // }}
          // deleteData={data => this.deleteData(data)}
          extraButtons={[
            {
              key: 'increased',
              title: '新增',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    planTypeVisible: true,
                  },
                });
              },
              disabled: internalState => !projectId,
            },
            {
              key: 'update',
              title: '修改',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;

                // 阶段没有planType
                return selectedRows.length !== 1;
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                if (url.includes('sessionMgmt')) {
                  router.push(
                    `/workTable/projectMgmt/sessionMgmt/edit?projectId=${projectId}&id=${
                      selectedRows[0].id
                    }&mode=EDIT`
                  );
                } else {
                  router.push(
                    `/workTable/projectMgmt/planList/edit?projectId=${projectId}&id=${
                      selectedRows[0].id
                    }&mode=EDIT`
                  );
                }
              },
            },
            {
              key: 'deletePhase',
              title: '删除',
              type: 'danger',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;
                return selectedRows.length <= 0;
              },
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                createConfirm({
                  content: '确定删除吗？',
                  onOk: () => {
                    this.deleteData(selectedRowKeys).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
            },
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
          ]}
        />
      </PageWrapper>
    );
  }
}

export default index;
