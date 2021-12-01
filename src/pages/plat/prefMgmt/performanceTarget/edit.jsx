import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form } from 'antd';
import update from 'immutability-helper';
import { add, genFakeId } from '@/utils/mathUtils';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/production/stringUtil';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import EditTable from '@/components/production/business/EditTable';
import DataTable from '@/components/production/business/DataTable.tsx';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { closeThenGoto } from '@/layouts/routerControl';
import { pushFlowTask } from '@/services/gen/flow';
import BpmWrapper from '../../../gen/BpmMgmt/BpmWrapper';

// namespace声明
const DOMAIN = 'performanceTarget';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, performanceTarget, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...performanceTarget,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      if (Array.isArray(tempValue)) {
        tempValue.forEach((temp, index) => {
          Object.keys(temp).forEach(detailKey => {
            fields[`${key}[${index}].${detailKey}`] = Form.createFormField({
              value: temp[detailKey],
            });
          });
        });
      } else {
        fields[key] = Form.createFormField({ value: tempValue });
      }
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
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class PerformanceTargetEdit extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    const {
      dispatch,
      user: {
        extInfo: { resId },
      }, // 取当前登陆人的resId
    } = this.props;
    const { id, mode, taskId } = fromQs();
    if (mode === 'replaceEdit') {
      dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          createUserId: resId,
        },
      });
    } else {
      this.fetchData(id);
    }
    dispatch({
      type: `${DOMAIN}/getPeriodList`,
    });
    taskId && this.callModelEffects('fetchConfig', taskId);
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getDetail`,
      payload: { id: params },
    });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  /**
   * 调用model层异步方法
   * 这个方法是仅是封装一个小方法,后续修改调异步方法时不需要每次都解构dispatch
   * @param method 异步方法名称
   * @param params 调用方法参数
   */
  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = cb => {
    this.commitFormData({ submit: false }, cb);
  };

  /**
   * 提交
   */
  handleSubmitProcess = cb => {
    this.commitFormData({ submit: true, result: 'APPROVED' }, cb);
  };

  /**
   * 提交表单数据
   */
  commitFormData = (params, cb) => {
    const { dispatch, form, formData } = this.props;
    const { mode } = fromQs();
    form.validateFieldsAndScroll((error, values) => {
      const allWeight = formData.indexList.reduce((x, y) => add(x, Number(y.indexWeight)), 0);
      if (!error) {
        if (formData.indexList && (!isEmpty(formData.indexList) || !isNil(formData.indexList))) {
          if (allWeight === 100) {
            if (mode === 'change') {
              dispatch({
                type: `${DOMAIN}/save`,
                payload: {
                  ...params,
                  ...formData,
                  indexVersion: 2,
                  indexList: formData.indexList.map(v => ({
                    ...v,
                    id: undefined,
                    targetId: formData.id || undefined,
                    version: 2,
                  })),
                },
              });
            } else {
              dispatch({
                type: `${DOMAIN}/save`,
                payload: {
                  ...params,
                  ...formData,
                  indexList: formData.indexList.map(v => ({
                    ...v,
                    targetId: formData.id || undefined,
                    version: formData.indexVersion || 1,
                  })),
                  status: formData.status || 'CREATE',
                  indexVersion: formData.indexVersion || 1,
                  targetName:
                    formData.targetName ||
                    `${formData.ouName}-${formData.baseBuName}-${formData.resName}-${
                      formData.periodName
                    }`,
                },
              });
            }
          } else {
            createMessage({ type: 'error', description: '权重总和必须等于100%' });
          }
        } else {
          createMessage({ type: 'error', description: '请添加指标数据' });
        }
      }
    });
  };

  render() {
    const {
      form,
      formData,
      dispatch,
      formMode,
      loading,
      saveLoading,
      targetPeriodList,
      fieldsConfig,
      flowForm,
    } = this.props;
    const { mode, taskId } = fromQs();
    const { indexList = [] } = formData;
    const { taskKey } = fieldsConfig;
    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: 'KPI_K01', title: 'KPI目标设定流程' }];

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading || saveLoading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            if (key === 'FLOW_COMMIT') {
              this.commitFormData(
                {
                  submit: true,
                  result: 'APPROVED',
                  taskId,
                  procRemark: remark,
                  branch,
                },
                () => {
                  const url = getUrl().replace('edit', 'view');
                  closeThenGoto(url);
                }
              );
              return Promise.resolve(false);
            }
            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    remark,
                    result: 'REJECTED',
                    branch,
                  }).then(({ status, response }) => {
                    if (status === 200) {
                      createMessage({ type: 'success', description: '操作成功' });
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                    return Promise.resolve(false);
                  }),
              });
            }
            if (key === 'FLOW_PASS') {
              if (taskKey === 'Activity_1l0ueh5') {
                this.commitFormData({
                  submit: true,
                  result: 'APPROVED',
                  taskId,
                  procRemark: remark,
                  branch,
                  dryRunFlag: true,
                });
              } else {
                return Promise.resolve(true);
              }
              return Promise.resolve(false);
            }
            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {[
              // <Button
              //   size="large"
              //   key="save"
              //   type="primary"
              //   onClick={() => {
              //     this.handleSave();
              //   }}
              //   loading={saveLoading}
              // >
              //   保存
              // </Button>,
              <Button
                size="large"
                type="primary"
                key="submit"
                onClick={() => {
                  this.handleSubmitProcess(() => {
                    closeThenGoto(`/user/flow/process?type=procs`);
                  });
                }}
                loading={saveLoading}
              >
                提交
              </Button>,
            ]}
          </ButtonCard>
          <BusinessForm title="基本信息" form={form} formData={formData} defaultColumnStyle={8}>
            <FormItem
              fieldType="BaseInput"
              label="目标名称"
              placeholder="自动生成"
              fieldKey="targetName"
              disabled
            />
            <FormItem
              fieldType="ResSimpleSelect"
              label="员工姓名"
              placeholder="请选择员工姓名"
              required
              fieldKey="resId"
              disabled={!(mode === 'replaceEdit' || mode === 'Edit')}
              onChange={value => {
                dispatch({
                  type: `${DOMAIN}/getResDetail`,
                  payload: {
                    resId: value,
                  },
                });
              }}
            />
            <FormItem fieldType="BaseInput" label="部门" disabled fieldKey="baseBuName" />
            <FormItem fieldType="BaseInput" label="职位" disabled fieldKey="position" />
            <FormItem fieldType="BaseInput" label="职级" disabled fieldKey="jobGrade" />
            <FormItem fieldType="BaseInput" label="直属负责人" disabled fieldKey="presName" />
            <FormItem label="入职日期" fieldKey="enrollDate" fieldType="BaseDatePicker" disabled />
            <FormItem
              label="现岗位任职日期"
              fieldKey="positionTakeDate"
              fieldType="BaseDatePicker"
              disabled
            />
            <FormItem
              label="目标周期"
              fieldType="BaseSelect"
              fieldKey="periodId"
              placeholder="请选择目标周期"
              disabled={!(mode === 'replaceEdit' || mode === 'Edit')}
              descList={targetPeriodList}
              required
              onChange={(value, option) => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    periodName: option[0].periodName,
                    ouName: option[0].ouName,
                  },
                });
              }}
            />
            <FormItem
              label="创建人"
              fieldKey="createUserId"
              fieldType="UserSimpleSelect"
              initialValue={formData.createUserId}
              disabled
            />
          </BusinessForm>
          {taskKey === 'Activity_1l0ueh5' ||
          mode === 'replaceEdit' ||
          mode === 'Edit' ||
          mode === 'change' ? (
            <EditTable
              form={form}
              title="指标管理"
              dataSource={indexList}
              columns={[
                {
                  title: 'KPI指标',
                  align: 'center',
                  dataIndex: 'indexName',
                  render: (text, record, index) => (
                    <FormItem
                      form={form}
                      fieldType="BaseInput"
                      fieldKey={`indexList[${index}].indexName`}
                      required
                    />
                  ),
                },
                {
                  title: '评估标准',
                  align: 'center',
                  dataIndex: 'assessStandard',
                  render: (text, record, index) => (
                    <FormItem
                      form={form}
                      fieldType="BaseInputTextArea"
                      fieldKey={`indexList[${index}].assessStandard`}
                      required
                    />
                  ),
                },
                {
                  title: '权重（%，所有项权重总值为1）',
                  align: 'center',
                  dataIndex: 'indexWeight',
                  render: (text, record, index) => (
                    <FormItem
                      form={form}
                      fieldType="BaseInputNumber"
                      max={100}
                      min={0}
                      required
                      fieldKey={`indexList[${index}].indexWeight`}
                    />
                  ),
                },
              ]}
              onAddClick={() => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    indexList: update(indexList, {
                      $push: [
                        {
                          id: genFakeId(-1),
                        },
                      ],
                    }),
                  },
                });
              }}
              onDeleteConfirm={keys => {
                const newDataSource = indexList.filter(row => keys.indexOf(row.id) < 0);
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: { indexList: newDataSource },
                });
              }}
            />
          ) : (
            <DataTable
              title="指标管理"
              form={form}
              columns={[
                {
                  title: 'KPI指标',
                  dataIndex: 'indexName',
                  align: 'center',
                },
                {
                  title: '评估标准',
                  dataIndex: 'assessStandard',
                  align: 'center',
                },
                {
                  title: '权重',
                  dataIndex: 'indexWeight',
                  align: 'center',
                  render: value => (value ? `${value}%` : undefined),
                },
              ]}
              dataSource={indexList}
              rowSelectAble={false}
              showExport={false}
              showColumnSwitch={false}
            />
          )}
        </BpmWrapper>
        {/* {!taskId && <BpmConnection source={allBpm} />} */}
      </PageWrapper>
    );
  }
}

export default PerformanceTargetEdit;
