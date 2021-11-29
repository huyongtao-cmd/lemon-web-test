import React from 'react';
import { connect } from 'dva';
import { Modal } from 'antd';
import router from 'umi/router';
import { isEmpty, isNil } from 'ramda';
import SearchFormItem from '@/components/production/business/SearchFormItem';
import Link from '@/components/production/basic/Link';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import SearchTable, { DataOutput } from '@/components/production/business/SearchTable';
import { outputHandle } from '@/utils/production/outputUtil';
import BusinessForm from '@/components/production/business/BusinessForm';
import { createConfirm } from '@/components/core/Confirm';
import { remindString } from '@/components/production/basic/Remind';
import {
  ProductTableColumnsBlockConfig,
  ProductSearchFormItemBlockConfig,
} from '@/utils/pageConfigUtils';
import PlanTypeModal from './component/PlanTypeModal';
import { fromQs } from '@/utils/production/stringUtil';

import {
  wbsTreeRq,
  projectPlanDeleteRq,
  projectPlanPartialRq,
  projectPhasePartialRq,
  projectPhaseDeleteRq,
} from '@/services/workbench/project';
import createMessage from '@/components/core/AlertMessage';
import styles from './style.less';

const DOMAIN = 'projectPlanMgmt';

@connect(({ loading, dispatch, projectPlanMgmt }) => ({
  loading,
  dispatch,
  ...projectPlanMgmt,
}))
class index extends React.PureComponent {
  state = {
    visible: false,
    expandedRowKeys: [],
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

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  fetchData = async params => {
    if (fromQs().projectId) {
      const { response } = await wbsTreeRq({ ...params });
      this.setState({
        expandedRowKeys: response.data.map(v => v.uuid),
      });
      return {
        rows: response.data.map(v => ({
          ...v,
          planNo: v.phaseNo,
          planName: v.phaseName,
        })),
        total: 0,
      };
    }

    if (!params.projectId) {
      createMessage({ type: 'warn', description: '请先选择项目，再进行查询！' });
      return { rows: [], total: 0 };
    }

    const { response } = await wbsTreeRq({ ...params });
    if (response.data) {
      this.setState({
        expandedRowKeys: response.data.map(v => v.uuid),
      });
      return {
        rows: response.data.map(v => ({
          ...v,
          planNo: v.phaseNo,
          planName: v.phaseName,
        })),
        total: 0,
      };
    }
    return {
      rows: [],
      total: 0,
    };
  };

  deleteData = async parmars => {
    const { planType, ...resParams } = parmars;
    // 计划删除
    if (planType) {
      const { response } = await projectPlanDeleteRq(resParams);
      return response.data;
    }

    // 阶段删除
    const { response } = await projectPhaseDeleteRq(resParams);
    return response.data;
  };

  changeStatus = async parmars => {
    const { planType, ...resParams } = parmars;
    // 计划状态更新
    if (planType) {
      const { response } = await projectPlanPartialRq(resParams);
      return response.data;
    }

    // 阶段状态更新
    const { response } = await projectPhasePartialRq(resParams);
    return response.data;
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
    ];

    // const fieldsConfig = ProductSearchFormItemBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'PRODUCT_TABLE_SAERCHFORM',
    //   fields
    // );

    return fields;
  };

  renderColumns = () => {
    // const { pageConfig } = this.props;

    const fields = [
      {
        title: '编号',
        key: 'planNo',
        dataIndex: 'planNo',
        align: 'left',
        render: (value, row) => {
          const { planType } = row;
          if (planType) {
            return (
              <Link
                onClick={() =>
                  router.push(
                    `/workTable/projectMgmt/planList/detail?id=${row.id}&mode=DESCRIPTION`
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
                router.push(
                  `/workTable/projectMgmt/projectPlanMgmt/detail?id=${row.id}&mode=DESCRIPTION`
                )
              }
            >
              {value}
            </Link>
          );
        },
      },
      {
        title: '类型',
        key: 'planType',
        dataIndex: 'planTypeDesc',
        align: 'center',
      },
      {
        title: '名称',
        key: 'planName',
        dataIndex: 'planName',
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
        title: '状态',
        key: 'executeStatus',
        dataIndex: 'executeStatusDesc',
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

  handleOk = () => {};

  onExpand = (expanded, record) => {
    const { expandedRowKeys } = this.state;
    if (expanded) {
      this.setState({
        expandedRowKeys: [...expandedRowKeys, record.uuid],
      });
    } else {
      this.setState({
        expandedRowKeys: expandedRowKeys.filter(v => v !== record.uuid),
      });
    }
  };

  render() {
    const { dispatch } = this.props;

    const { getInternalState, visible, expandedRowKeys, executeStatus, projectId } = this.state;

    return (
      <PageWrapper>
        <Modal
          title="更新状态"
          visible={visible}
          onOk={() => {
            if (!executeStatus) {
              createMessage({
                type: 'warn',
                description: `请选择更新状态！`,
              });
              return;
            }

            const { selectedRows, refreshData } = getInternalState();
            const { planType: pt } = selectedRows[0];

            this.changeStatus({
              id: selectedRows[0].id,
              executeStatus,
              planType: pt,
            }).then(res => {
              this.setState({
                visible: false,
              });
              refreshData();
            });
          }}
          onCancel={() => {
            this.setState({
              visible: false,
            });
          }}
          width="500px"
          afterClose={() => {
            this.setState({
              executeStatus: undefined,
              visible: false,
            });
          }}
        >
          <div className={styles.boxWarp}>
            <BusinessForm formData={{}} form={null} formMode="EDIT" defaultColumnStyle={24}>
              <FormItem
                label="状态"
                key="planType"
                fieldKey="planType"
                fieldType="BaseSelect"
                value={executeStatus}
                form={null}
                parentKey="PRO:EXECUTE_STATUS"
                onChange={(value, option, allOptions) => {
                  this.setState({
                    executeStatus: value,
                  });
                }}
              />
            </BusinessForm>
          </div>
        </Modal>
        <SearchTable
          rowKey="uuid"
          wrapperInternalState={internalState => {
            this.setState({ getInternalState: internalState });
          }}
          defaultSortBy="id"
          defaultSortDirection="DESC"
          showSearchCardTitle={false}
          searchForm={this.renderSearchForm()}
          fetchData={this.fetchData}
          columns={this.renderColumns()}
          tableExtraProps={{
            pagination: false,
            expandedRowKeys,
            onExpand: this.onExpand,
          }}
          extraButtons={[
            {
              key: 'increasedPhase',
              title: '新增阶段',
              type: 'primary',
              size: 'large',
              loading: false,
              cb: internalState => {
                router.push(
                  `/workTable/projectMgmt/projectPlanMgmt/edit?projectId=${projectId}&mode=EDIT`
                );
              },
              disabled: internalState => !projectId,
            },
            {
              key: 'updatePhase',
              title: '修改阶段',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;

                // 阶段没有planType
                return selectedRows.length !== 1 || selectedRows.filter(v => v.planType).length > 0;
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                router.push(
                  `/workTable/projectMgmt/projectPlanMgmt/edit?id=${
                    selectedRows[0].id
                  }&projectId=${projectId}&mode=EDIT`
                );
              },
            },
            {
              key: 'deletePhase',
              title: '删除阶段',
              type: 'danger',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;
                return selectedRows.length <= 0 || selectedRows.filter(v => v.planType).length > 0;
              },
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const { planType: pt } = selectedRows[0];
                createConfirm({
                  content: '确定删除吗？',
                  onOk: () => {
                    this.deleteData({
                      ids: selectedRows.map(v => v.id).join(','),
                      planType: pt,
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
            },
            {
              key: 'increasedPlan',
              title: '新增计划',
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
              key: 'updatePlan',
              title: '修改计划',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows = [] } = internalState;

                // 计划有planType
                return (
                  selectedRows.length !== 1 || selectedRows.filter(v => !v.planType).length > 0
                );
              },
              cb: internalState => {
                const { selectedRows } = internalState;
                const { id, planTypeVal1, planType: pt } = selectedRows[0];

                router.push(
                  `/workTable/projectMgmt/planList/edit?id=${id}&projectId=${projectId}&scene=${planTypeVal1}&planType=${pt}&mode=EDIT&from=PLAN`
                );
              },
            },
            {
              key: 'deletePlan',
              title: '删除计划',
              type: 'danger',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRows } = internalState;
                return selectedRows.length <= 0 || selectedRows.filter(v => !v.planType).length > 0;
              },
              cb: internalState => {
                const { selectedRowKeys, selectedRows } = internalState;
                const { planType: pt } = selectedRows[0];
                createConfirm({
                  content: '确定删除吗？',
                  onOk: () => {
                    this.deleteData({
                      ids: selectedRows.map(v => v.id).join(','),
                      planType: pt,
                    }).then(res => {
                      const { refreshData } = internalState;
                      refreshData();
                    });
                  },
                });
              },
            },
            {
              key: 'changeStatus',
              title: '更新状态',
              type: 'primary',
              size: 'large',
              loading: false,
              disabled: internalState => {
                const { selectedRowKeys } = internalState;
                return selectedRowKeys.length !== 1;
              },
              cb: internalState => {
                this.setState({
                  visible: true,
                });
              },
            },
          ]}
        />
        <PlanTypeModal projectId={projectId} />
      </PageWrapper>
    );
  }
}

export default index;
