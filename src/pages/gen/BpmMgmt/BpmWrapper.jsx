import React from 'react';
import { formatMessage } from 'umi/locale';
import api from '@/api';
import { isEmpty } from 'ramda';
import { Modal, Form } from 'antd';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import FieldList from '@/components/layout/FieldList';
import { request } from '@/utils/networkUtils';
import { fromQs, toUrl, toQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import BpmOperations from './BpmOperations';
import BpmFormsWrapper from './BpmFormsWrapper';
import BpmLogs from './BpmLogs';
import BpmRollbackModal from './BpmRollbackModal';
import { selectIamUsers } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';

const { doTask } = api.bpm;
const { passAndReturn, addSign } = api.flowHandle;

const TOOL_TAG_FOR_B_AREA = 'tw-card-rightLine';
const hasClass = (source, op = '') => source.props.className.includes(op);

const { Field } = FieldList;

@Form.create({
  onValuesChange(props, changedValues, allValues) {
    // console.log(props, changedValues, allValues)
  },
})

/**
 * loading的过程中，只显示要保留的按钮
 * loading完成之后，会拿到inflow，根据是否在流程中，来看是否允许做按钮逻辑操作（className 有 stand 的就保留）
 */
class BpmWrapper extends React.Component {
  constructor(props) {
    super(props);
    const { mode, prcId, taskId, inflow } = fromQs();
    const { flowForm = {} } = props;
    const { dirty = false, remark, cc, ...rest } = flowForm;
    this.state = {
      bpmForm: {
        remark: dirty ? undefined : remark || undefined,
        cc: dirty ? undefined : cc || undefined,
      },
      formData: dirty ? undefined : rest || {},
      viewMode: mode === 'view',
      prcId: prcId || undefined,
      taskId: taskId || undefined,
      // inflow: inflow || undefined,
      visible: false,
      branchCode: undefined,
      branches: [],
      btnCanUse: true,
      signVisible: false,
      confiremLoading: false,
      signTitle: '加签',
    };
  }

  componentDidMount() {
    // request viewConf && bpmn info
  }

  componentWillUnmount() {
    const { onBpmChanges, fieldsConfig, flowForm } = this.props;
    const { dirty = false } = flowForm;
    const { prcId } = this.state;
    if (!prcId || !this.formRef) return;
    if (isEmpty(fieldsConfig)) return;
    if (onBpmChanges) {
      const { bpmForm } = this.state;
      const formDynamic = this.formRef.props.form.getFieldsValue();
      const payload = {
        ...bpmForm,
        ...formDynamic,
        dirty,
        // remark: null, // 提交成功后清除备注信息
      };
      onBpmChanges(payload);
    }
  }

  wrapperClick = (onBtnClick, params) => {
    onBtnClick(params).then(result => {
      if (result) {
        //btnClick返回resolve(true)才走架构方法，返回resolve(false)不走架构方法
        const { operation, bpmForm } = params;
        const { key, title } = operation;
        const { viewMode, taskId } = this.state;
        const { branch, remark } = bpmForm;
        const upgradeFlow = key === 'FLOW_PASS' || key === 'FLOW_COMMIT' || key === 'FLOW_RETURN';
        const resultParams = {
          FLOW_PASS: 'APPROVED',
          FLOW_COMMIT: 'APPLIED',
          FLOW_RETURN: 'REJECTED',
        };
        if (key === 'FLOW_COUNTERSIGN') {
          //加签
          this.setState({ signVisible: true, signTitle: title });
          return;
        }
        if (upgradeFlow) {
          const body = {
            remark,
            result: resultParams[key],
            branch,
          };
          this.setState({
            btnCanUse: false,
          });
          this.defaultTaskOperationUpgradeFlow({ body, title, taskId }); // 走新流程审批
          return;
        }
        if (!viewMode) {
          this.setState({
            btnCanUse: false,
          });
          // 提交审批意见
          const body = branch
            ? {
                remark,
                result: key,
                branch,
              }
            : {
                remark,
                result: key,
              };
          this.defaultTaskOperation({ body, title, taskId }); //旧流程完成任务
        }
      }
    });
  };

  defaultTaskOperation = ({ body, title, taskId }) =>
    request
      .post(toUrl(doTask, { id: taskId }), {
        // 就流程完成任务
        body,
      })
      .then(({ status, response }) => {
        this.setState({
          btnCanUse: true,
        });
        if (status === 200 && response.ok) {
          // change fileds status
          createMessage({
            type: 'success',
            description: formatMessage({ id: `${title}.sms`, desc: 'who care' }),
          });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else if (status === 100) {
          // 主动取消请求，不做操作
        } else {
          createMessage({ type: 'error', description: response.reason || '流程审批失败' });
        }
      });

  defaultTaskOperationUpgradeFlow = ({ body, title, taskId }) =>
    request
      .post(toUrl(passAndReturn, { id: taskId }), {
        // 新流程的流程审批
        body,
      })
      .then(({ status, response }) => {
        this.setState({
          btnCanUse: true,
        });
        if (status === 200 && response.ok) {
          // change fileds status
          createMessage({
            type: 'success',
            description: `${title}${formatMessage({ id: 'misc.success', desc: '成功' })}`,
          });
          const url = getUrl().replace('edit', 'view');
          closeThenGoto(url);
        } else if (status === 100) {
          // 主动取消请求，不做操作
        } else {
          createMessage({
            type: 'error',
            description: `${title}${formatMessage({ id: 'misc.fail', desc: '失败' })}`,
          });
        }
      });

  onOperationsChange = (type, operation) => {
    if (type !== 'button') {
      const { bpmForm } = this.state;
      this.setState({
        bpmForm: {
          ...bpmForm,
          remark: operation.target.value,
        },
      });
    } else if (type === 'cc') {
      const { bpmForm } = this.state;
      this.setState({
        bpmForm: {
          ...bpmForm,
          cc: operation,
        },
      });
    } else {
      const { onBtnClick } = this.props;
      if (!onBtnClick) return;
      const { bpmForm } = this.state;
      const { fieldsConfig } = this.props;
      const { fields } = fieldsConfig;
      const param = {
        operation,
        bpmForm,
      };
      const { branches = [] } = operation;
      if (!isEmpty(fields)) {
        // 有表单，要校验
        this.formRef.props.form.validateFields((errors, values) => {
          if (errors) {
            return;
          }
          if (!isEmpty(branches)) {
            if (branches.length === 1) {
              param.bpmForm.branch = branches[0].code;
              this.wrapperClick(onBtnClick, { ...param, formData: values });
              return;
            }
            this.setState({ visible: true, branches, param: { ...param, formData: values } });
            return;
          }
          this.wrapperClick(onBtnClick, { ...param, formData: values });
        });
      } else {
        if (!isEmpty(branches)) {
          if (branches.length === 1) {
            param.bpmForm.branch = branches[0].code;
            this.wrapperClick(onBtnClick, { ...param, formData: {} });
            return;
          }
          this.setState({ visible: true, branches, param: { ...param, formData: {} } });
          return;
        }
        this.wrapperClick(onBtnClick, { ...param, formData: {} });
      }
    }
  };

  onBranchSelect = branchCode => {
    this.setState({ visible: false });
    if (!branchCode) return;
    const { param } = this.state;
    const newBpmForm = {
      ...param.bpmForm,
      branch: branchCode,
    };
    const { onBtnClick } = this.props;
    this.wrapperClick(onBtnClick, { ...param, bpmForm: newBpmForm });
  };

  bpmCancel = () =>
    new Promise((resolve, reject) => {
      const { onBpmChanges, fieldsConfig } = this.props;
      if (isEmpty(fieldsConfig)) {
        resolve();
        return;
      }
      if (onBpmChanges) {
        const { bpmForm } = this.state;
        const formDynamic = this.formRef ? this.formRef.props.form.getFieldsValue() : {};
        const payload = {
          ...bpmForm,
          ...formDynamic,
          dirty: true,
        };
        onBpmChanges(payload);
      }
      resolve();
    });

  signOk = () => {
    const {
      bpmForm: { remark },
    } = this.state;
    const { form } = this.props;
    this.setState({
      confiremLoading: true,
    });
    form.validateFields((err, values) => {
      const { param } = this.state;
      const { taskId } = fromQs();
      const params = {
        taskId,
        addSignUserIds: values.addSignUserIds.join(','), // addSignUserIds[0]=1&addSignUserIds[1]=2
        comment: remark,
      };
      if (!err) {
        request.post(toQs(addSign, params)).then(({ status, response }) => {
          this.setState({
            confiremLoading: false,
          });
          const { signTitle: title } = this.state;
          form.resetFields();
          if (status === 200 && response.ok) {
            this.setState({
              signVisible: false,
            });
            // change fileds status
            createMessage({
              type: 'success',
              description: `${title}${formatMessage({ id: 'misc.success', desc: '成功' })}`,
            });
            const url = getUrl().replace('edit', 'view');
            closeThenGoto(url);
          } else if (status === 100) {
            // 主动取消请求，不做操作
          } else {
            createMessage({
              type: 'error',
              description: `${title}${formatMessage({ id: 'misc.fail', desc: '失败' })}`,
            });
          }
        });
      }
    });
  };

  signCancel = () => {
    const { form } = this.props;
    this.setState({ signVisible: false });
    form.resetFields();
  };

  render() {
    const {
      viewMode,
      bpmForm,
      prcId,
      inflow,
      formData,
      visible,
      branchCode,
      branches,
      btnCanUse,
      confiremLoading,
      signVisible,
    } = this.state;
    const {
      children,
      fields,
      fieldsConfig,
      scope = '',
      disableBpm = false,
      buttonLoading,
      extraButtons,
      form: { getFieldDecorator },
    } = this.props;
    const OriginDom =
      prcId && disableBpm === false
        ? React.Children.map(children, child => {
            if (!child) return null;
            if (child.type.displayName === 'ButtonCard') return null;
            if (!child.props.className) return child;
            if (hasClass(child, TOOL_TAG_FOR_B_AREA)) return null;
            return child;
          }).filter(Boolean)
        : children;
    // inflow 不要了，确认需求后决定，本组件不再控制 业务单据 的业务操作按钮
    // React.Children.map(children, child => {
    //     if (hasClass(child, TOOL_TAG_FOR_B_AREA)) {
    //       if (!inflow) return child;
    //       const lineChildren = React.Children.map(child.props.children, cc => {
    //         if (hasClass(cc, 'stand')) return cc;
    //         return null;
    //       }).filter(Boolean);
    //       const newChild = {
    //         ...child,
    //         props: {
    //           ...child.props,
    //           children: lineChildren,
    //         },
    //       };
    //       return newChild;
    //     }
    //     return child;
    //   });

    const { buttons = [], fields: FieldExtra = [] } = fieldsConfig;

    return (
      <>
        {prcId &&
          disableBpm === false && (
            <>
              {/* 顶部的操作按钮 */}
              <BpmOperations
                viewMode={viewMode}
                bpmForm={bpmForm}
                operations={buttons}
                onChange={this.onOperationsChange}
                prcId={prcId}
                printRef={this.printRef}
                bpmCancel={this.bpmCancel}
                scope={scope}
                buttonLoading={buttonLoading}
                extraButtons={extraButtons}
                btnCanUse={btnCanUse}
              />
            </>
          )}
        <div
          ref={el => {
            this.printRef = el;
          }}
        >
          {prcId &&
            !viewMode && (
              <>
                {/* 表单操作 */}
                <BpmFormsWrapper
                  fieldsConfig={FieldExtra}
                  fields={fields}
                  formData={formData}
                  wrappedComponentRef={form => {
                    this.formRef = form;
                  }}
                />
              </>
            )}
          {OriginDom}
          {/* 工作流 */}
          {prcId && <BpmLogs prcId={prcId} useTable />}
        </div>
        <BpmRollbackModal
          visible={visible}
          branchValue={branchCode}
          onBranchSelect={this.onBranchSelect}
          branches={branches}
        />
        <Modal
          title="请选择加签人员"
          visible={signVisible}
          onOk={this.signOk}
          onCancel={this.signCancel}
          confiremLoading={confiremLoading}
          width={800}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
            <Field // 一定要有FieldList否则会报错：Invalid attempt to spread non-iterable instance
              label="加签人"
              name="addSignUserIds"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 19 }}
              decorator={{
                rules: [
                  {
                    required: true,
                    message: '请选择加签人',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={selectIamUsers}
                columns={[
                  { title: '用户ID', dataIndex: 'code', span: 10 },
                  { title: '姓名', dataIndex: 'name', span: 7 },
                ]} // 列表显示的列明
                transfer={{ key: 'id', code: 'id', name: 'name' }} // 数据值、显示值
                mode="multiple" // 多选
                dropdownMatchSelectWidth={false} // 不强制下拉和选择器同宽
                showSearch
                placeholder="请选择加签人员"
              />
            </Field>
          </FieldList>
        </Modal>
      </>
    );
  }
}

export default BpmWrapper;
