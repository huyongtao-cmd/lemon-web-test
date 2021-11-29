import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Table, Tabs, Input, Modal, InputNumber } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import confirm from '@/components/production/layout/Confirm';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import { flatten, unique } from '@/utils/arrayUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import PlanModal from './component/PlanModal';

import styles from './style.less';

const { TabPane } = Tabs;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'reportEdit';

@connect(({ loading, reportEdit, dispatch, global }) => ({
  loading,
  ...reportEdit,
  dispatch,
  global,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class indexCom extends Component {
  state = {
    visible: false,
    submitVisible: false,
    memberType: 'MANAGEMENT',
    memberTypeDesc: '管理组',
  };

  componentDidMount() {
    const { dispatch } = this.props;

    const { id, scene, planType, projectId, phaseId, sourceType } = fromQs();
    this.setState({
      id,
      projectId,
      phaseId,
      sourceType,
    });

    // 关联计划的执行状态
    dispatch({
      type: `${DOMAIN}/queryUdcFun`,
      payload: { key: 'PRO:EXECUTE_STATUS' },
    });

    // 项目计划列表
    projectId &&
      dispatch({
        type: `${DOMAIN}/projectPlanList`,
        payload: { limit: 0, projectId },
      });

    // 相关成员
    dispatch({
      type: `${DOMAIN}/getMemberGroup`,
      payload: { key: 'CUS:MEMBER_GROUP' },
    });
    if (id) {
      this.pageConfig(scene);

      dispatch({
        type: `${DOMAIN}/dailyDetail`,
        payload: { id },
      }).then(res => {
        if (res) {
          const {
            reportConfigurableField1,
            reportConfigurableField2,
            reportConfigurableField3,
            reportConfigurableField4,
            reportConfigurableField5,
            reportConfigurableField6,
            reportConfigurableField7,
          } = res;
          const { planViews = [] } = res;

          // 不为空说明生成过报告
          const firstFlag =
            Array.isArray(planViews) && !isEmpty(planViews.filter(v => v.sourceType === 'REPORT'));
          if (
            reportConfigurableField1 ||
            reportConfigurableField2 ||
            reportConfigurableField3 ||
            reportConfigurableField4 ||
            reportConfigurableField5 ||
            reportConfigurableField6 ||
            reportConfigurableField7 ||
            firstFlag
          ) {
            // 报告相关的但凡有一个字段有值，都不是第一次进入
            dispatch({
              type: `${DOMAIN}/dailyReportDetail`,
              payload: { id },
            }).then(r => {
              if (r) {
                //一切只是为了相关成员的回显，捯饬来捯饬去，都要跟projectAllMemberList靠齐
                const { memberViews = [] } = res;
                const tt = Array.isArray(memberViews)
                  ? memberViews.map(v => ({
                      ...v,
                      id: v.projectMemberId,
                      reportConfigurableField1: v.reportConfigurableField1
                        ? v.reportConfigurableField1
                        : v.scheduleConfigurableField1,
                      reportConfigurableField2: v.reportConfigurableField2
                        ? v.reportConfigurableField2
                        : v.scheduleConfigurableField2,
                      reportConfigurableField3: v.reportConfigurableField3
                        ? v.reportConfigurableField3
                        : v.scheduleConfigurableField3,
                    }))
                  : [];
                // 拉取项目成员列表
                projectId &&
                  this.getProjectMember({ limit: 0, projectId, flag: true, memberViews: tt });
              }
            });
          } else {
            dispatch({
              type: `${DOMAIN}/dailyPlanDetail`,
              payload: { id },
            }).then(r => {
              if (r) {
                //一切只是为了相关成员的回显，捯饬来捯饬去，都要跟projectAllMemberList靠齐
                const { memberViews = [] } = res;

                const tt = Array.isArray(memberViews)
                  ? memberViews.map(v => ({
                      ...v,
                      id: v.projectMemberId,
                      reportConfigurableField1: v.reportConfigurableField1
                        ? v.reportConfigurableField1
                        : v.scheduleConfigurableField1,
                      reportConfigurableField2: v.reportConfigurableField2
                        ? v.reportConfigurableField2
                        : v.scheduleConfigurableField2,
                      reportConfigurableField3: v.reportConfigurableField3
                        ? v.reportConfigurableField3
                        : v.scheduleConfigurableField3,
                    }))
                  : [];

                // 拉取项目成员列表
                projectId &&
                  this.getProjectMember({ limit: 0, projectId, flag: true, memberViews: tt });
              }
            });
          }
        }
      });
    } else {
      // 暂时不会出现没有id的情况}
    }
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

  pageConfig = scene => {
    const { dispatch } = this.props;

    scene
      ? dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `DAILY_REPORT_EDIT:${scene}` },
        })
      : dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `DAILY_REPORT_EDIT` },
        });
  };

  getProjectMember = parmas => {
    const { dispatch } = this.props;
    const { flag, memberViews = [], ...restParmas } = parmas;
    dispatch({
      type: `${DOMAIN}/projectMemberPage`,
      payload: { ...restParmas },
    }).then(res => {
      if (flag) {
        this.dealProjectMemberList(memberViews);
      }
    });
  };

  handleSave = commitFlag => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      projectMemberList,
      dataListSelected,
      relatedPlanList,
    } = this.props;
    const {
      formData: { ...newFormData },
    } = this.props;

    const { projectId, phaseId, sourceType } = fromQs();

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/dailyIncrease`,
          payload: {
            ...newFormData,
            ...values,
            projectId,
            phaseId,
            memberEntities: projectMemberList.map(v => ({ ...v, projectMemberId: v.id })),
            // .filter(v => dataListSelected.map(item => item.id).includes(v.id))
            // .map(v => ({ ...v, projectMemberId: v.id })),
            planEntities: relatedPlanList.map(v => ({
              ...v,
              id: null,
              sourceType: v.sourceType ? v.sourceType : sourceType,
            })),
            commitFlag,
            dailyStatus: 'REPORTING',
            port: window.location.port ? window.location.port : null,
          },
        }).then(res => {
          if (res && commitFlag) {
            this.setState({
              submitVisible: false,
            });
          }
        });
      }
    });
  };

  // 行编辑触发事件
  onMemberCellChanged = (index, value, name) => {
    const { projectMemberList, dispatch } = this.props;

    const newDataSource = projectMemberList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateProjectMemberList`,
      payload: newDataSource,
    });
  };

  // 行编辑触发事件
  onRelatedPlanCellChanged = (index, value, name) => {
    const { relatedPlanList, dispatch } = this.props;

    const newDataSource = relatedPlanList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateRelatedPlanList`,
      payload: newDataSource,
    });
  };

  renderColumns = () => {
    const { pageConfig, executeStatusList, form } = this.props;

    const fields = [
      {
        title: '序号',
        // key: 'sortNo',
        dataIndex: 'sortNo',
        align: 'center',
      },
      {
        title: '场次',
        key: 'planName',
        dataIndex: 'planName',
        align: 'center',
      },
      {
        title: '集数',
        key: 'configurableField1',
        dataIndex: 'configurableField1',
        align: 'center',
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
        align: 'center',
      },
      {
        title: '姓名',
        key: 'projectRole',
        dataIndex: 'projectRole',
        align: 'center',
      },
      {
        title: '服化道提示',
        key: 'configurableField7',
        dataIndex: 'configurableField7',
        align: 'center',
      },
      {
        title: '执行状态',
        key: 'executeStatus',
        dataIndex: 'executeStatus',
        align: 'center',
        required: true,
        render: (val, row, index) => (
          <Selection
            value={val}
            transfer={{ key: 'selectionValue', code: 'selectionValue', name: 'selectionName' }}
            source={executeStatusList}
            placeholder="请选择"
            allowClear={false}
            onChange={e => {
              this.onRelatedPlanCellChanged(index, e, 'executeStatus');
              if (e === 'FINISHED') {
                this.onRelatedPlanCellChanged(index, 100, 'progress');
              } else {
                this.onRelatedPlanCellChanged(index, 0, 'progress');
              }
            }}
          />
        ),
      },
      {
        title: '完成百分比',
        key: 'progress',
        dataIndex: 'progress',
        align: 'center',
        // render: val => `${val}%`,
        render: (val, row, index) => (
          <InputNumber
            value={val}
            min={0}
            max={100}
            onChange={e => {
              this.onRelatedPlanCellChanged(index, e || 0, 'progress');
            }}
          />
        ),
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'letf',
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_REPORT_PLAN',
      fields
    );

    return fieldsConfig;
  };

  renderColumns1 = () => {
    const {
      dispatch,
      pageConfig,
      projectMemberList,
      projectAllMemberList,
      dataListSelected,
      formMode,
    } = this.props;
    const { memberType } = this.state;

    const fields = [
      {
        title: '角色',
        key: 'role',
        dataIndex: 'role',
        align: 'center',
      },
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        align: 'center',
        render: (value, row, index) =>
          row.keyFlag ? (
            <Selection.Columns
              className="x-fill-100"
              value={value}
              source={projectAllMemberList
                .filter(v => v.memberGroup === memberType)
                .filter(v => projectMemberList.map(item => item.id).indexOf(v.id) === -1)}
              dropdownMatchSelectWidth={false}
              showSearch
              transfer={{ key: 'id', code: 'id', name: 'memberName' }}
              placeholder="请选择"
              allowClear={false}
              onValueChange={e => {
                if (e) {
                  const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                  const newDataSource = projectMemberList;
                  newDataSource[newIndex] = {
                    ...newDataSource[newIndex],
                    ...e,
                    // id: genFakeId(-1),
                  };
                  dispatch({
                    type: `${DOMAIN}/updateProjectMemberList`,
                    payload: newDataSource,
                  });
                } else {
                  const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                  const newDataSource = projectMemberList;
                  newDataSource[newIndex] = {
                    keyFlag: genFakeId(-1),
                    id: genFakeId(-1),
                    memberGroup: memberType,
                  };
                  dispatch({
                    type: `${DOMAIN}/updateProjectMemberList`,
                    payload: newDataSource,
                  });
                }
              }}
            />
          ) : (
            value
          ),
      },
      {
        title: '出发时间',
        key: 'reportConfigurableField1',
        dataIndex: 'reportConfigurableField1',
        align: 'center',
        render: (val, row, index) =>
          formMode === 'EDIT' ? (
            <Input
              value={val}
              onChange={e => {
                const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                this.onMemberCellChanged(newIndex, e.target.value, 'reportConfigurableField1');
              }}
              // disabled={dataListSelected.map(v => v.id).indexOf(row.id) === -1}
            />
          ) : (
            val
          ),
      },
      {
        title: '化妆时长',
        key: 'reportConfigurableField2',
        dataIndex: 'reportConfigurableField2',
        align: 'center',
        render: (val, row, index) =>
          formMode === 'EDIT' ? (
            <Input
              value={val}
              onChange={e => {
                const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                this.onMemberCellChanged(newIndex, e.target.value, 'reportConfigurableField2');
              }}
              // disabled={dataListSelected.map(v => v.id).indexOf(row.id) === -1}
            />
          ) : (
            val
          ),
      },
      {
        title: '交妆时间',
        key: 'reportConfigurableField3',
        dataIndex: 'reportConfigurableField3',
        align: 'center',
        render: (val, row, index) =>
          formMode === 'EDIT' ? (
            <Input
              value={val}
              onChange={e => {
                const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                this.onMemberCellChanged(newIndex, e.target.value, 'reportConfigurableField3');
              }}
              // disabled={dataListSelected.map(v => v.id).indexOf(row.id) === -1}
            />
          ) : (
            val
          ),
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_REPORT_MEMBER',
      fields
    );

    return fieldsConfig;
  };

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="名称"
        key="dailyName"
        fieldKey="dailyName"
        fieldType="BaseInput"
        initialValue={formData.dailyName}
        required
      />,
      <FormItem
        label="日期"
        fieldKey="dailyDate"
        key="dailyDate"
        fieldType="BaseDatePicker"
        initialValue={formData.dailyDate}
      />,
      <FormItem
        label="可配置字段1"
        fieldKey="reportConfigurableField1"
        key="reportConfigurableField1"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField1}
      />,
      <FormItem
        label="可配置字段2"
        fieldKey="reportConfigurableField2"
        key="reportConfigurableField2"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField2}
      />,
      <FormItem
        label="可配置字段3"
        fieldKey="reportConfigurableField3"
        key="reportConfigurableField3"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField3}
      />,
      <FormItem
        label="可配置字段4"
        fieldKey="reportConfigurableField4"
        key="reportConfigurableField4"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField4}
      />,
      <FormItem
        label="可配置字段5"
        fieldKey="reportConfigurableField5"
        key="reportConfigurableField5"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField5}
      />,
      <FormItem
        label="可配置字段6"
        fieldKey="reportConfigurableField6"
        key="reportConfigurableField6"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField6}
      />,
      <FormItem
        label="可配置字段7"
        fieldKey="reportConfigurableField7"
        key="reportConfigurableField7"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField7}
      />,
      <FormItem
        label="可配置字段8"
        fieldKey="reportConfigurableField8"
        key="reportConfigurableField8"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField8}
      />,
      <FormItem
        label="可配置字段9"
        fieldKey="reportConfigurableField9"
        key="reportConfigurableField9"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField9}
      />,
      <FormItem
        label="可配置字段10"
        fieldKey="reportConfigurableField10"
        key="reportConfigurableField10"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField10}
      />,
      <FormItem
        label="备注"
        key="remarkReport"
        fieldKey="remarkReport"
        fieldType="BaseInputTextArea"
        initialValue={formData.remarkReport}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_REPORT_MAIN',
      fields
    );

    return (
      <>
        <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
          {fieldsConfig}
        </BusinessForm>
      </>
    );
  };

  // 选中项目
  handleModelOk = (e, selectedRows) => {
    const { dispatch } = this.props;
    const { sourceType } = this.state;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        relatedPlanList: selectedRows.map((v, i) => ({
          ...v,
          projectPlanId: v.id,
          sortNo: i + 1,
          sourceType,
        })),
      },
    });

    // const relatedPlanMemerIdList = Array.from(
    //   new Set(flatten(selectedRows.map(v => v.merberList.map(item => item.projectMemberId))))
    // );
    const tt = unique(
      Array.from(new Set(flatten(selectedRows.map(v => v.merberList)))),
      'projectMemberId'
    );
    this.dealProjectMemberList(tt);

    this.toggleVisible();
  };

  dealProjectMemberList = memberViews => {
    const { dispatch, projectMemberList, projectAllMemberList } = this.props;
    const tt = memberViews.map(v => ({
      ...v,
      ...projectAllMemberList.filter(item => item.id === v.projectMemberId)[0],
    }));

    // 取并集，不会覆盖已经添加的相关成员
    // const tt1 = projectMemberList.concat(
    //   tt.filter(v => !(projectMemberList.map(v1 => v1.id).indexOf(v.id) > -1))
    // );

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        projectMemberList: tt,
      },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      dispatch,
      loading,
      form,
      formData,
      formMode,
      memberGroupList,
      projectMemberList = [],
      projectAllMemberList = [],
      dataListSelected = [],
      dataListSelectedDel = [],
      relatedPlanList = [],
      relatedPlanDelList = [],
      relatedRowSelectionSelected = [],
      global: { userList = [] },
    } = this.props;

    const {
      visible,
      projectId,
      phaseId,
      id,
      submitVisible,
      memberType,
      memberTypeDesc,
    } = this.state;

    const disabledBtn =
      loading.effects[`${DOMAIN}/dailyPlanDetail`] || loading.effects[`${DOMAIN}/projectPlanEdit`];

    const rowSelection1 = {
      selectedRowKeys: dataListSelected.map(v => v.id),
      // getCheckboxProps: record => ({
      //   disabled: formMode !== 'EDIT',
      //   // || record.memberType === 'TEMPORARY_RES',
      // }),
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.concat([record]),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.filter(v => v.id !== record.id),
            },
          });
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.concat(changeRows),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.filter(
                v => !changeRows.map(item => item.id).includes(v.id)
              ),
            },
          });
        }
      },
    };

    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: record.sourceType === 'SCHEDULE',
      }),
      selectedRowKeys: relatedRowSelectionSelected.map(v => v.id),
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              relatedRowSelectionSelected: relatedRowSelectionSelected.concat([record]),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              relatedRowSelectionSelected: relatedRowSelectionSelected.filter(
                v => v.id !== record.id
              ),
            },
          });
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              relatedRowSelectionSelected: relatedRowSelectionSelected.concat(changeRows),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              relatedRowSelectionSelected: relatedRowSelectionSelected.filter(
                v => !changeRows.map(item => item.id).includes(v.id)
              ),
            },
          });
        }
      },
    };

    return (
      <PageWrapper>
        <Modal
          title="请选择汇报对象"
          visible={submitVisible}
          onOk={e => {
            if (isNil(formData.commitUser) || isEmpty(formData.commitUser)) {
              createMessage({ type: 'warn', description: '请选择汇报对象' });
              return;
            }
            this.handleSave(true);
          }}
          confirmLoading={loading.effects[`${DOMAIN}/projectPlanEdit`]}
          onCancel={() => {
            this.setState({
              submitVisible: false,
            });
          }}
          width={600}
          destroyOnClose
        >
          <Selection.Columns
            value={formData.commitUser}
            className="x-fill-100"
            source={userList}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            onChange={e => {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  commitUser: e,
                },
              });
            }}
            placeholder="请选择汇报对象"
            mode="multiple"
          />
        </Modal>
        {!loading.effects[`${DOMAIN}/dailyPlanDetail`] && (
          <PlanModal
            title="选择场次信息"
            domain={DOMAIN}
            visible={visible}
            dispatch={dispatch}
            onOk={this.handleModelOk}
            onCancel={this.toggleVisible}
            projectId={projectId}
            phaseId={phaseId}
            alearySelected={relatedPlanList}
            disabled
          />
        )}
        <ButtonCard>
          {formMode === 'EDIT' ? (
            <Button
              icon="save"
              size="large"
              type="primary"
              onClick={() => {
                this.handleSave(false);
              }}
              disabled={disabledBtn}
            >
              保存
            </Button>
          ) : null}
          {id && formMode === 'EDIT' ? (
            <Button
              size="large"
              type="primary"
              onClick={() => {
                this.setState({
                  submitVisible: true,
                });
              }}
              disabled={disabledBtn}
            >
              提交
            </Button>
          ) : null}
        </ButtonCard>
        {this.renderPage()}
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={24}>
            <BusinessFormTitle title="关联计划" />
            <Table
              rowSelection={formMode === 'EDIT' ? rowSelection : null}
              rowKey="id"
              bordered
              columns={this.renderColumns()}
              dataSource={relatedPlanList}
              footer={
                formMode === 'EDIT'
                  ? () => (
                      // eslint-disable-next-line react/jsx-indent
                      <>
                        <Button
                          key="add"
                          type="primary"
                          onClick={() => {
                            this.toggleVisible();
                          }}
                        >
                          新增
                        </Button>
                        &nbsp; &nbsp;
                        <Button
                          key="delete"
                          type="danger"
                          disabled={relatedRowSelectionSelected.length <= 0}
                          onClick={() => {
                            confirm({
                              onOk: () => {
                                const newDataSource = relatedPlanList.filter(
                                  row =>
                                    !relatedRowSelectionSelected.map(v => v.id).includes(row.id)
                                );

                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: {
                                    relatedPlanList: newDataSource,
                                  },
                                });

                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: {
                                    relatedPlanDelList: [
                                      ...relatedPlanDelList,
                                      ...relatedRowSelectionSelected.map(v => v.id),
                                    ],
                                    relatedRowSelectionSelected: [],
                                  },
                                });
                              },
                            });
                          }}
                        >
                          删除
                        </Button>
                      </>
                    )
                  : null
              }
            />
          </BusinessForm>
        </div>
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={null} formMode={formMode} defaultColumnStyle={24}>
            <BusinessFormTitle title="相关成员" />
            <Tabs
              onChange={e => {
                const tt = memberGroupList.filter(v => v.selectionValue === e);
                this.setState({
                  memberType: e,
                  memberTypeDesc: tt[0]?.selectionName,
                });
              }}
              type="card"
              activeKey={memberType}
            >
              {memberGroupList.map(v => (
                <TabPane tab={v.title} key={v.value}>
                  <Table
                    bordered
                    rowKey="id"
                    rowSelection={rowSelection1}
                    columns={this.renderColumns1()}
                    dataSource={projectMemberList
                      .filter(item => item.memberGroup === v.value)
                      .map(item => ({
                        ...item,
                        projectMemberId: item.id,
                        role: item.projectRole,
                        name: item.memberName,
                      }))}
                    loading={loading.effects[`${DOMAIN}/projectMemberPage`]}
                    footer={() => (
                      <>
                        <Button
                          key="add"
                          type="primary"
                          onClick={() => {
                            const allResFlag =
                              projectMemberList.filter(v1 => v1.memberGroup === memberType)
                                .length ===
                              projectAllMemberList.filter(v1 => v1.memberGroup === memberType)
                                .length;

                            if (allResFlag) {
                              createMessage({
                                type: 'warn',
                                description: memberTypeDesc
                                  ? `项目下所有${memberTypeDesc}成员已全部添加！`
                                  : '项目该类型成员已全部添加完毕',
                              });
                              return;
                            }
                            dispatch({
                              type: `${DOMAIN}/updateState`,
                              payload: {
                                projectMemberList: update(projectMemberList, {
                                  $push: [
                                    {
                                      keyFlag: genFakeId(-1),
                                      id: genFakeId(-1),
                                      memberGroup: memberType,
                                    },
                                  ],
                                }),
                              },
                            });
                          }}
                        >
                          新增
                        </Button>
                        &nbsp; &nbsp;
                        <Button
                          key="delete"
                          type="danger"
                          disabled={dataListSelected.length <= 0}
                          onClick={() => {
                            confirm({
                              onOk: () => {
                                const newDataSource = projectMemberList.filter(
                                  row => !dataListSelected.map(item => item.id).includes(row.id)
                                );

                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: {
                                    projectMemberList: newDataSource,
                                  },
                                });

                                dispatch({
                                  type: `${DOMAIN}/updateState`,
                                  payload: {
                                    dataListSelectedDel: [
                                      ...dataListSelectedDel,
                                      ...dataListSelected.map(item => item.id),
                                    ],
                                    dataListSelected: [],
                                  },
                                });
                              },
                            });
                          }}
                        >
                          删除
                        </Button>
                      </>
                    )}
                  />
                </TabPane>
              ))}
            </Tabs>
          </BusinessForm>
        </div>
      </PageWrapper>
    );
  }
}

export default indexCom;
