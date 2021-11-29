import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit } from 'ramda';
import { Form, Tooltip, Progress, Modal, InputNumber } from 'antd';

// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm.tsx';
import FormItem from '@/components/production/business/FormItem.tsx';
import PageWrapper from '@/components/production/layout/PageWrapper.tsx';
import ButtonCard from '@/components/production/layout/ButtonCard.tsx';
import Button from '@/components/production/basic/Button.tsx';
import confirm from '@/components/production/layout/Confirm';
import message from '@/components/production/layout/Message';

import { fromQs } from '@/utils/production/stringUtil.ts';
// service方法
import { subjectTemplateListPaging } from '@/services/production/acc';
import { outputHandle } from '@/utils/production/outputUtil.ts';
import EditTable from '@/components/production/business/EditTable.tsx';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import DataTable from '@/components/production/business/DataTable.tsx';

import { listToTreePlus } from '@/utils/production/TreeUtil.ts';
import moment from 'moment';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

// namespace声明
const DOMAIN = 'appropriationDisplayPage';

/**
 * 拨款 综合展示页面
 */
@connect(({ loading, dispatch, appropriationDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...appropriationDisplayPage,
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
class AppropriationDisplayPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fundsScaleVisible: false,
      fundsScale: 50,
    };
  }

  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode, budgetId, taskId } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    // 把url的参数保存到state
    this.updateModelState({ formMode, copy, taskId });
    this.callModelEffects('updateForm', { id, budgetId });
    this.callModelEffects('init');
    taskId && this.callModelEffects('fetchConfig', taskId);
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

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
  callModelEffects = async (method, params) => {
    const { dispatch } = this.props;
    return dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 保存
   */
  handleSave = () => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.budgetDate) {
          [formData.budgetStartDate, formData.budgetEndDate] = formData.budgetDate;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
          },
        });
      }
    });
  };

  /**
   * 提交
   */
  handleSubmit = (param, cb) => {
    const { form, formData } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.budgetDate) {
          [formData.budgetStartDate, formData.budgetEndDate] = formData.budgetDate;
        }
        this.callModelEffects('save', {
          formData: {
            ...formData,
            ...omit(['details'], values),
            ...param,
            submit: true,
          },
        }).then(data => {
          cb && cb();
        });
      }
    });
  };

  /**
   * 切换编辑模式
   */
  switchEdit = () => {
    this.callModelEffects('init');
    this.updateModelState({ formMode: 'EDIT' });
  };

  onExpand = (expanded, record) => {
    const { unExpandedRowKeys } = this.props;
    const set = new Set(unExpandedRowKeys);
    if (!expanded) {
      set.add(record.id);
    } else {
      set.delete(record.id);
    }
    this.updateModelState({ unExpandedRowKeys: [...set] });
  };

  /**
   * 级联修改上级金额
   */
  recursionUpdateAmt = (record, amt) => {
    const {
      formData: { details },
    } = this.props;
    // eslint-disable-next-line eqeqeq
    const parentRecord = details.filter(item => item.budgetItemId + '' == record.parentId)[0];
    const index = details.indexOf(parentRecord);
    if (parentRecord) {
      this.callModelEffects('recursionUpdateAmt', {
        index,
        applyDetailAmt: (parentRecord.applyDetailAmt || 0) + amt,
      });
      this.recursionUpdateAmt(parentRecord, amt);
    }
  };

  handleOk = () => {
    const { fundsScale } = this.state;
    const { dispatch, formData } = this.props;
    let { details } = formData;
    this.setState({
      fundsScaleVisible: false,
    });
    if (!fundsScale) {
      message.warning('请填写拨款比例!');
      return;
    }
    let sum = 0;
    details = details.map(item => {
      const applyDetailAmt =
        Number(item.detailBudgetAmt) * (fundsScale / 100) - Number(item.detailAppropriationAmt);
      const parentList = details.filter(e => e.budgetItemId === item.parentId);
      !item.parentId || parentList.length < 1 ? (sum += applyDetailAmt) : (sum += 0);
      return { ...item, applyDetailAmt };
    });
    dispatch({
      type: `${DOMAIN}/updateDetails`,
      payload: {
        details,
      },
    });
    this.callModelEffects('updateForm', {
      applyAmt: sum,
    });
  };

  handleCancel = () => {
    this.setState({
      fundsScaleVisible: false,
    });
  };

  render() {
    const {
      form,
      formData,
      formMode,
      unExpandedRowKeys,
      loading,
      saveLoading,
      taskId,
      fieldsConfig,
      flowForm,
      user: { extInfo = {} }, // 取当前登录人的resId
      attachments,
    } = this.props;
    const { fundsScaleVisible, fundsScale } = this.state;
    // 其他流程
    const allBpm = [{ docId: formData.id, procDefKey: 'BUD_B02', title: '预算拨款流程' }];

    const { details } = formData;
    const expandedRowKeys = details
      .map(d => d.id)
      .filter(detail => unExpandedRowKeys.indexOf(detail) === -1);

    const tempDetails = details
      .sort((d1, d2) => d1.budgetItemCode.localeCompare(d2.budgetItemCode))
      .map(d => ({ ...d, parentId: d.parentId + '' }));
    const wrappedDetails = listToTreePlus(tempDetails, undefined, 'budgetItemId');

    const editColumns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
      },
      {
        title: '已拨款金额',
        dataIndex: 'detailAppropriationAmt',
      },
      {
        title: '本次申请金额',
        dataIndex: 'applyDetailAmt',
        required: true,
        render: (text, record, index) => (
          <FormItem
            form={form}
            disabled={record.children && record.children.length > 0}
            fieldType="BaseInputAmt"
            required
            // max={(record.detailBudgetAmt || 0) - (record.detailAppropriationAmt || 0)}
            rules={[
              {
                validator: (rule, value, callback) => {
                  const maxValue =
                    (record.detailBudgetAmt || 0) - (record.detailAppropriationAmt || 0);
                  if (maxValue - value < 0) {
                    callback('不能大于(预算金额-已拨款金额)');
                  }
                  callback();
                },
              },
            ]}
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].applyDetailAmt`}
            onChange={value => {
              const changeAmt = value - (record.applyDetailAmt || 0);
              if (!Number.isNaN(changeAmt)) {
                this.recursionUpdateAmt(record, changeAmt);
                this.callModelEffects('updateForm', {
                  applyAmt: (formData.applyAmt || 0) + changeAmt,
                });
              }
            }}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="BaseInputTextArea"
            fieldKey={`details[${details.indexOf(
              details.filter(item => item.id === record.id)[0]
            )}].remark`}
          />
        ),
      },
    ];

    const descriptionColumns = [
      {
        title: '预算项目编码',
        dataIndex: 'budgetItemCode',
      },
      {
        title: '预算项目名称',
        dataIndex: 'budgetItemName',
      },
      {
        title: '预算金额',
        dataIndex: 'detailBudgetAmt',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '已拨款金额',
        dataIndex: 'detailAppropriationAmt',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '本次申请金额',
        dataIndex: 'applyDetailAmt',
        className: 'prod-number-description',
        render: (text, record, index) => (isNil(text) ? '' : text.toFixed(2)),
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
    ];

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const { taskKey } = fieldsConfig;

            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            if (taskKey === 'B02_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT' || key === 'FLOW_PASS') {
                this.handleSubmit(
                  {
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
            } else {
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
                return Promise.resolve(true);
              }
            }

            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {formMode === 'EDIT' && [
              <Button
                key="submit"
                size="large"
                type="primary"
                onClick={() =>
                  this.handleSubmit({ result: 'APPROVED' }, () => {
                    closeThenGoto(`/user/flow/process?type=procs`);
                  })
                }
                loading={saveLoading}
              >
                提交
              </Button>,
              <Button
                key="button"
                size="large"
                type="primary"
                loading={saveLoading}
                onClick={() => {
                  this.setState({
                    fundsScaleVisible: true,
                  });
                }}
              >
                按比例拨款
              </Button>,
            ]}
            {formMode === 'DESCRIPTION' &&
              formData.appropriationStatus === 'CREATE' && (
                <Button key="edit" size="large" type="primary" onClick={this.switchEdit}>
                  编辑
                </Button>
              )}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseInput"
              label="拨款名称"
              fieldKey="appropriationName"
              required
            />

            <FormItem fieldType="BaseInput" label="相关预算" fieldKey="budgetName" disabled />

            <FormItem
              fieldType="BaseInput"
              label="状态"
              fieldKey="appropriationStatusDesc"
              disabled
            />

            <FormItem
              fieldType="BaseInputAmt"
              label="预算总金额"
              fieldKey="totalBudgetAmt"
              disabled
            />

            <FormItem
              fieldType="BaseInputAmt"
              label="已拨款金额"
              fieldKey="totalAppropriationAmt"
              disabled
            />

            <FormItem fieldType="BaseInputAmt" label="已使用金额" fieldKey="usedAmt" disabled />

            <FormItem fieldType="BaseInputAmt" label="已占用金额" fieldKey="occupiedAmt" disabled />

            <FormItem fieldType="BaseInputAmt" label="本次申请金额" fieldKey="applyAmt" disabled />

            <FormItem
              fieldType="ResSimpleSelect"
              label="申请人"
              fieldKey="applyResId"
              descriptionField="applyResName"
              disabled
              initialValue={extInfo.resId}
              descList={[{ value: extInfo.resId, title: extInfo.resName }]}
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="申请日期"
              fieldKey="applyDate"
              disabled
              initialValue={moment().format('YYYY-MM-DD')}
            />

            <FormItem
              fieldType="BaseDatePicker"
              label="拨款日期"
              fieldKey="appropriationDate"
              disabled
            />

            {/* <FormItem
              fieldType="BaseFileManagerEnhance"
              label="附件"
              fieldKey="file"
              api="/api/production/bud/budgetAppropriation/sfs/token"
              dataKey={formData.id}
            /> */}

            <FormItem
              fieldType="FileUpload"
              fieldKey="file"
              label="附件"
              fileList={attachments}
              multiple
            />

            <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />
          </BusinessForm>

          {formMode === 'EDIT' && (
            <EditTable
              title="拨款明细"
              form={form}
              columns={editColumns}
              dataSource={wrappedDetails}
              expandedRowKeys={expandedRowKeys}
              onExpand={this.onExpand}
              rowSelectAble={false}
            />
          )}

          {formMode === 'DESCRIPTION' && (
            <DataTable
              title="拨款明细"
              columns={descriptionColumns}
              dataSource={wrappedDetails}
              expandedRowKeys={expandedRowKeys}
              prodSelection={false}
              onExpand={this.onExpand}
            />
          )}
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}

        <Modal
          title="拨款比例"
          visible={fundsScaleVisible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <InputNumber
            defaultValue={100}
            min={0}
            max={100}
            formatter={value => `${value}%`}
            parser={value => value.replace('%', '')}
            value={fundsScale}
            onChange={value => {
              this.setState({ fundsScale: value });
            }}
          />
        </Modal>
      </PageWrapper>
    );
  }
}

export default AppropriationDisplayPage;
