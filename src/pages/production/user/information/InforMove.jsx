// 框架类
import React, { Component } from 'react';
import { Form, Card, Col, Row } from 'antd';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';

// 产品化组件
import { fromQs } from '@/utils/production/stringUtil';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import { closeThenGoto } from '@/layouts/routerControl';
import BaseInput from '@/components/production/basic/BaseInput';
import BuSimpleSelect from '@/components/production/basic/BuSimpleSelect';
import ResSimpleSelect from '@/components/production/basic/ResSimpleSelect';
import BaseCustomSelect from '@/components/production/basic/BaseCustomSelect';
// css样式
import styles from './InforMove.less';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { getUrl } from '@/utils/flowToRouter';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

// namespace声明
const DOMAIN = 'informationMove';

/***
 * 员工异动
 */
@connect(({ loading, dispatch, informationMove, user: { user } }) => ({
  loading:
    loading.effects[`${DOMAIN}/init`] ||
    loading.effects[`${DOMAIN}/save`] ||
    loading.effects[`${DOMAIN}/flowInit`],
  dispatch,
  ...informationMove,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key]; // 获取所有的值
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
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class InformationMove extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newBuId: '',
      newParentResId: '',
      newPosition: '',
      newSalary: '',
      newJobGrade: '',
      newBaseCity: '',
      newBonusType: '',
    };
  }

  // http://localhost:3001/hr/resource/informationMove?
  // mode=EDIT&id=28&prcId=2cc57ef1-4865-11ec-8333-86edba683254&taskId=&mode=view&from=http%3A%2F%2Flocalhost%3A3001%2Fuser%2Fflow%2Fprocess%3Ftype%3Dprocs
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, mode, taskId, flag, prcId } = fromQs();
    const formMode = mode === 'edit' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    const checked = flag === 'CHECK';
    // 把url的参数保存到state
    this.updateModelState({ formMode, taskId });
    this.callModelEffects('updateForm', { id });
    !prcId && this.callModelEffects('init');
    // 調用详情接口
    taskId && this.callModelEffects('fetchConfig', taskId);
    prcId && this.callModelEffects('flowInit', { id });
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

  handleSave = (param, cb) => {
    const { formData, form } = this.props;
    const { id } = formData;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.callModelEffects('save', {
          formData: { ...param, userId: id, id },
          cb,
        });
      }
    });
  };

  render() {
    const {
      form,
      formData,
      formMode,
      loading,
      fieldsConfig,
      flowForm,
      taskId,
      user: { extInfo = {} }, // 取当前登陆人的resId
    } = this.props;
    const { getFieldDecorator } = form;
    const allBpm = [{ docId: formData.id, procDefKey: 'USER01', title: '员工异动流程' }];

    const {
      newBuId,
      newParentResId,
      newPosition,
      newJobGrade,
      newSalary,
      newBaseCity,
      newBonusType,
    } = this.state;
    const detail = {
      buId: newBuId,
      parentResId: newParentResId,
      position: newPosition,
      jobGrade: newJobGrade,
      salary: newSalary,
      baseCity: newBaseCity,
      bonusType: newBonusType,
    };
    const {
      buId,
      buName,
      oldBuName,
      oldBaseCityDesc,
      oldBonusType,
      oldJobGrade,
      oldPosition,
      oldParentResName,
      oldSalary,
      presName,
      position,
      jobGrade,
      baseCityDesc,
      salary,
      bonusType,
      changeRemark,
      effectiveDate,
    } = formData;
    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig} // 通过、退回、返回（按钮由后端返回）
          flowForm={flowForm}
          buttonLoading={loading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          // 流程按钮
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const { taskKey } = fieldsConfig;
            // 加签
            if (key === 'FLOW_COUNTERSIGN') {
              return Promise.resolve(true);
            }
            // 提交
            if (key === 'FLOW_COMMIT') {
              this.handleSave(
                {
                  result: 'APPROVED',
                  taskId,
                  procRemark: remark,
                  branch,
                },
                () => {
                  const url = getUrl().replace('edit', 'view'); // view代替edit
                  closeThenGoto(url);
                }
              );
              // promise 为false,后续组件方法不走,走自己的逻辑
              return Promise.resolve(false);
            }
            // 退回
            if (key === 'FLOW_RETURN') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () => {
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
                  });
                },
              });
            }
            // 通过
            if (key === 'FLOW_PASS') {
              this.handleSave(
                {
                  result: 'APPROVED',
                  procTaskId: taskId,
                  procRemark: remark,
                  branch,
                  dryRunFlag: true,
                  ...detail,
                  changeRemark,
                  effectiveDate,
                  submit: true,
                },
                () => {
                  createMessage({ type: 'success', description: '操作成功' });
                  const url = getUrl().replace('edit', 'view');
                  closeThenGoto(url);
                }
              );
              return Promise.resolve(false);
            }
            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {[
              <Button
                size="large"
                type="primary"
                key="save"
                onClick={() => {
                  this.handleSave(
                    {
                      ...detail,
                      changeRemark,
                      effectiveDate,
                      submit: true,
                    },
                    () => {
                      // closeThenGoto(`/hr/resource/information?refresh=` + new Date().valueOf());
                      closeThenGoto(`/user/flow/process?type=procs`);
                    }
                  );
                }}
                loading={loading}
              >
                提交
              </Button>,
            ]}
          </ButtonCard>
          <BusinessForm
            title="基本信息"
            form={form}
            formData={formData}
            formMode="DESCRIPTION"
            defaultColumnStyle={8}
          >
            <FormItem
              fieldType="BaseInput"
              label="姓名"
              fieldKey="name"
              descriptionRender={formData.userName}
            />
            <FormItem
              fieldType="BaseAllOuSimpleSelect"
              label="所属公司"
              fieldKey="ouId"
              descriptionRender={formData.ouName}
            />
            <FormItem fieldType="BaseDatePicker" label="入职日期" fieldKey="enrollDate" />
          </BusinessForm>
          <Card title="异动信息" bordered={false} className={styles.changeInfo}>
            <div className="inner">
              <div className="inner-title">
                <Row gutter={1}>
                  <Col span={6} className="inner-row">
                    <div className="inner-col">项目变更</div>
                  </Col>
                  <Col span={6} className="inner-row">
                    <div className="inner-col">当前信息</div>
                  </Col>
                  <Col span={12} className="inner-row">
                    <div className="inner-col">需变更信息</div>
                  </Col>
                </Row>
              </div>
              <div className="inner-data">
                <Row gutter={1}>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">部门</div>
                  </Col>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">
                      {formMode === 'DESCRIPTION' ? oldBuName : buName}
                    </div>
                  </Col>
                  <Col className="inner-row" span={12}>
                    <Form.Item>
                      {getFieldDecorator(formMode === 'DESCRIPTION' ? 'buId' : 'newBuId', {
                        rules: [{ required: true, message: '请选择部门' }],
                      })(
                        <BuSimpleSelect
                          id="buId"
                          placeholder="请选择"
                          disabled={formMode === 'DESCRIPTION'}
                          size="large"
                          value={formMode === 'DESCRIPTION' ? buId : newBuId || undefined}
                          onChange={value =>
                            this.setState({
                              newBuId: value,
                            })
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={1}>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">直属领导</div>
                  </Col>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">
                      {formMode === 'DESCRIPTION' ? oldParentResName : presName}
                    </div>
                  </Col>
                  <Col className="inner-row" span={12}>
                    <Form.Item>
                      {getFieldDecorator(
                        formMode === 'DESCRIPTION' ? 'parentResId' : 'newParentResId',
                        {
                          rules: [{ required: true, message: '请选择直属领导' }],
                        }
                      )(
                        <ResSimpleSelect
                          id="parentResId"
                          placeholder="请选择"
                          disabled={formMode === 'DESCRIPTION'}
                          size="large"
                          value={newParentResId || undefined}
                          onChange={value =>
                            this.setState({
                              newParentResId: value,
                            })
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={1}>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">职位</div>
                  </Col>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">
                      {formMode === 'DESCRIPTION' ? oldPosition : position}
                    </div>
                  </Col>
                  <Col className="inner-row" span={12}>
                    <Form.Item>
                      {getFieldDecorator(formMode === 'DESCRIPTION' ? 'position' : 'newPosition', {
                        rules: [{ required: true, message: '请选输入职位' }],
                      })(
                        <BaseInput
                          id="position"
                          fieldKey="position"
                          size="large"
                          disabled={formMode === 'DESCRIPTION'}
                          value={newPosition}
                          onChange={value =>
                            this.setState({
                              newPosition: value,
                            })
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={1}>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">职级</div>
                  </Col>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">
                      {formMode === 'DESCRIPTION' ? oldJobGrade : jobGrade}
                    </div>
                  </Col>
                  <Col className="inner-row" span={12}>
                    <Form.Item>
                      {getFieldDecorator(formMode === 'DESCRIPTION' ? 'jobGrade' : 'newJobGrade', {
                        rules: [{ required: true, message: '请选择职级' }],
                      })(
                        <BaseCustomSelect
                          id="jobGrade"
                          size="large"
                          disabled={formMode === 'DESCRIPTION'}
                          value={newJobGrade || undefined}
                          onChange={value =>
                            this.setState({
                              newJobGrade: value,
                            })
                          }
                          parentKey="CUS:JOB_GRADE"
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={1}>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">薪资</div>
                  </Col>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">
                      {formMode === 'DESCRIPTION' ? oldSalary : salary}
                    </div>
                  </Col>
                  <Col className="inner-row" span={12}>
                    <Form.Item>
                      {getFieldDecorator(formMode === 'DESCRIPTION' ? 'salary' : 'newSalary', {
                        rules: [{ required: true, message: '请输入薪资' }],
                      })(
                        <BaseInput
                          id="salary"
                          fieldKey="salary"
                          disabled={formMode === 'DESCRIPTION'}
                          size="large"
                          value={newSalary}
                          onChange={value =>
                            this.setState({
                              newSalary: value,
                            })
                          }
                          required
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={1}>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">奖金类型</div>
                  </Col>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">
                      {formMode === 'DESCRIPTION' ? oldBonusType : bonusType}
                    </div>
                  </Col>
                  <Col className="inner-row" span={12}>
                    <Form.Item>
                      {getFieldDecorator(
                        formMode === 'DESCRIPTION' ? 'bonusType' : 'newBonusType',
                        {
                          rules: [{ required: true, message: '请选择奖金类型' }],
                        }
                      )(
                        <BaseInput
                          id="bonusType"
                          size="large"
                          disabled={formMode === 'DESCRIPTION'}
                          value={newBonusType}
                          onChange={value =>
                            this.setState({
                              newBonusType: value,
                            })
                          }
                          // parentKey='SYSTEM_LANGUAGE'
                          fieldKey="bonusType"
                          required
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={1}>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">工作地点</div>
                  </Col>
                  <Col className="inner-row" span={6}>
                    <div className="inner-content">
                      {formMode === 'DESCRIPTION' ? oldBaseCityDesc : baseCityDesc}
                    </div>
                  </Col>
                  <Col className="inner-row" span={12}>
                    <Form.Item>
                      {getFieldDecorator(formMode === 'DESCRIPTION' ? 'baseCity' : 'newBaseCity', {
                        rules: [{ required: true, message: '请选择工作地点' }],
                      })(
                        <BaseCustomSelect
                          id="baseCity"
                          value={newBaseCity || undefined}
                          size="large"
                          disabled={formMode === 'DESCRIPTION'}
                          onChange={value =>
                            this.setState({
                              newBaseCity: value,
                            })
                          }
                          parentKey="CUS:CITY"
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </div>
            <div className="intro">
              <BusinessForm
                form={form}
                formData={formData}
                formMode={formMode}
                defaultColumnStyle={12}
              >
                <FormItem
                  fieldType="BaseDatePicker"
                  label="生效日期"
                  fieldKey="effectiveDate"
                  required
                />
                <FormItem fieldType="BaseInputTextArea" label="相关说明" fieldKey="changeRemark" />
              </BusinessForm>
            </div>
          </Card>
        </BpmWrapper>
        {!taskId && <BpmConnection source={allBpm} />}
      </PageWrapper>
    );
  }
}

export default InformationMove;
