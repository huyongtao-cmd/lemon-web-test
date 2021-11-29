import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Table, Radio, Tabs, Input, Icon, InputNumber } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import confirm from '@/components/production/layout/Confirm';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import createMessage from '@/components/core/AlertMessage';
import { flatten, unique } from '@/utils/arrayUtils';
import { Selection } from '@/pages/gen/field';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import PlanModal from './component/PlanModal';

import styles from './style.less';

const { TabPane } = Tabs;

const DOMAIN = 'dailyReportEdit';

@connect(({ loading, dailyReportEdit, dispatch }) => ({
  loading,
  ...dailyReportEdit,
  dispatch,
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
        type: `${DOMAIN}/dailyPlanDetail`,
        payload: { id },
      }).then(res => {
        if (res) {
          //一切只是为了相关成员的回显，捯饬来捯饬去，都要跟projectAllMemberList靠齐
          const { memberViews = [] } = res;
          // 拉取项目成员列表
          projectId && this.getProjectMember({ limit: 0, projectId, flag: true, memberViews });
        }
      });
    } else {
      this.pageConfig(scene);

      planType &&
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { planType },
        });

      projectId && this.getProjectMember({ limit: 0, projectId });
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
          payload: { pageNo: `DAILY_PLAN_EDIT:${scene}` },
        })
      : dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `DAILY_PLAN_EDIT` },
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

  handleSave = issueFlag => {
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

    const { projectId, phaseId, dailyType } = fromQs();

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
            planEntities: relatedPlanList.map(v => ({ ...v, id: null })),
            issueFlag,
            dailyType: newFormData.dailyType ? newFormData.dailyType : 'CALLSHEET',
            port: window.location.port ? window.location.port : null,
          },
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
  onCellChanged = (index, value, name) => {
    const { relatedPlanList, dispatch } = this.props;

    const newDataSource = relatedPlanList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { relatedPlanList: newDataSource },
    });
  };

  renderColumns = () => {
    const { pageConfig, form } = this.props;

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
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'letf',
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'RELATE_PLAN',
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
        dataIndex: 'projectRole',
        align: 'center',
      },
      {
        title: '名称',
        key: 'name',
        dataIndex: 'memberName',
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
        key: 'scheduleConfigurableField1',
        dataIndex: 'scheduleConfigurableField1',
        align: 'center',
        render: (val, row, index) =>
          formMode === 'EDIT' ? (
            <Input
              value={val}
              onChange={e => {
                const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                this.onMemberCellChanged(newIndex, e.target.value, 'scheduleConfigurableField1');
              }}
              // disabled={dataListSelected.map(v => v.id).indexOf(row.id) === -1}
            />
          ) : (
            val
          ),
      },
      {
        title: '化妆时长',
        key: 'scheduleConfigurableField2',
        dataIndex: 'scheduleConfigurableField2',
        align: 'center',
        render: (val, row, index) =>
          formMode === 'EDIT' ? (
            <Input
              value={val}
              onChange={e => {
                const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                this.onMemberCellChanged(newIndex, e.target.value, 'scheduleConfigurableField2');
              }}
              // disabled={dataListSelected.map(v => v.id).indexOf(row.id) === -1}
            />
          ) : (
            val
          ),
      },
      {
        title: '交妆时间',
        key: 'scheduleConfigurableField3',
        dataIndex: 'scheduleConfigurableField3',
        align: 'center',
        render: (val, row, index) =>
          formMode === 'EDIT' ? (
            <Input
              value={val}
              onChange={e => {
                const newIndex = projectMemberList.findIndex(v => v.id === row.id);
                this.onMemberCellChanged(newIndex, e.target.value, 'scheduleConfigurableField3');
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
      'DAILY_MEMBER',
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
        fieldKey="scheduleConfigurableField1"
        key="scheduleConfigurableField1"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField1}
      />,
      <FormItem
        label="可配置字段2"
        fieldKey="scheduleConfigurableField2"
        key="scheduleConfigurableField2"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField2}
      />,
      <FormItem
        label="可配置字段3"
        fieldKey="scheduleConfigurableField3"
        key="scheduleConfigurableField3"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField3}
      />,
      <FormItem
        label="可配置字段4"
        fieldKey="scheduleConfigurableField4"
        key="scheduleConfigurableField4"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField4}
      />,
      <FormItem
        label="可配置字段5"
        fieldKey="scheduleConfigurableField5"
        key="scheduleConfigurableField5"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField5}
      />,
      <FormItem
        label="可配置字段6"
        fieldKey="scheduleConfigurableField6"
        key="scheduleConfigurableField6"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField6}
      />,
      <FormItem
        label="可配置字段7"
        fieldKey="scheduleConfigurableField7"
        key="scheduleConfigurableField7"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField7}
      />,
      <FormItem
        label="可配置字段8"
        fieldKey="scheduleConfigurableField8"
        key="scheduleConfigurableField8"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField8}
      />,
      <FormItem
        label="可配置字段9"
        fieldKey="scheduleConfigurableField9"
        key="scheduleConfigurableField9"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField9}
      />,
      <FormItem
        label="可配置字段10"
        fieldKey="scheduleConfigurableField10"
        key="scheduleConfigurableField10"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField10}
      />,
      <FormItem
        label="备注"
        key="remarkPlan"
        fieldKey="remarkPlan"
        fieldType="BaseInputTextArea"
        initialValue={formData.remarkPlan}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_EDIT_DEFLAUT',
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
    } = this.props;

    const { visible, projectId, phaseId, id, memberType, memberTypeDesc } = this.state;

    const disabledBtn =
      loading.effects[`${DOMAIN}/dailyPlanDetail`] || loading.effects[`${DOMAIN}/dailyIncrease`];

    const rowSelection1 = {
      selectedRowKeys: dataListSelected.map(v => v.id),
      getCheckboxProps: record => ({
        disabled: formMode !== 'EDIT',
        // || record.memberType === 'TEMPORARY_RES',
      }),
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
                this.handleSave(true);
              }}
              disabled={disabledBtn}
            >
              下发
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
                        role: v.projectRole,
                        name: v.memberName,
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
