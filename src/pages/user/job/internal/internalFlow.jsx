import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Button, Card, Form, Input, Radio, Divider, Row, Col } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, markAsTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { createConfirm } from '@/components/core/Confirm';
import { stringify } from 'qs';
import ViewDetail from './ViewDetail';
import { getUrl } from '@/utils/flowToRouter';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { selectUsersAll } from '@/services/sys/user';
import { delParam } from '@/utils/urlUtils';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const { Description } = DescriptionList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'internalFlow';

@connect(({ loading, internalFlow, dispatch }) => ({
  loading,
  internalFlow,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      if (hasIn('relatedResId', changedValues)) {
        return;
      }
      if (hasIn('resFlag', changedValues)) {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            relatedResId: '',
          },
        });
      }
      if (hasIn('resumeResult', changedValues) && changedValues.resumeResult !== 'USED') {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            relatedResId: '',
            resFlag: '',
            resumeReward: '',
          },
        });
      }
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class InternalFlow extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      internalFlow: {
        formData,
        fieldsConfig: { taskKey },
      },
    } = this.props;
    const { id, taskId, _refresh, addResId } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });

    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      });
    taskId
      ? dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: taskId,
        })
      : dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            fieldsConfig: {
              buttons: [],
              panels: {
                disabledOrHidden: {},
              },
            },
          },
        });
  }

  render() {
    const {
      loading,
      dispatch,
      form: { validateFieldsAndScroll, getFieldDecorator, setFields },
      internalFlow: { resDataSource, formData, fieldsConfig, flowForm },
    } = this.props;
    const { taskKey } = fieldsConfig;
    const { id, taskId, prcId, from, mode, addResId } = fromQs();

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark } = bpmForm;
            const { key } = operation;

            if (key === 'REJECTED') {
              createConfirm({
                content: '确定要拒绝该流程吗？',
                onOk: () =>
                  pushFlowTask(taskId, {
                    taskId,
                    result: key,
                    procRemark: remark,
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

            if (key === 'APPROVED' || key === 'APPLIED') {
              const { resumeResult, relatedResId, resFlag } = formData;
              if (
                resumeResult === 'USED' &&
                resFlag === 'YES' &&
                (isEmpty(relatedResId) || isNil(relatedResId))
              ) {
                setFields({
                  relatedResId: {
                    value: undefined,
                    errors: [new Error('请选择关联档案')],
                  },
                });
              }
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  dispatch({
                    type: `${DOMAIN}/submit`,
                    payload: {
                      taskId,
                      result: key,
                      procRemark: remark,
                      submit: 'true',
                    },
                  });
                }
              });
            }

            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' &&
            taskKey === 'ACC_A36_01_SUBMIT_i' && (
              <Card
                className="tw-card-adjust"
                style={{ marginTop: '6px' }}
                title={
                  <Title
                    icon="profile"
                    id="ui.menu.plat.res.recruitEdit"
                    defaultMessage="招聘岗位新增"
                  />
                }
                bordered={false}
              >
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="recommName"
                    label="被推荐人"
                    decorator={{
                      initialValue: formData.recommName || '',
                      rules: [
                        {
                          required: true,
                          message: '请输入被推荐人名称',
                        },
                      ],
                    }}
                  >
                    <Input placeholder="请输入被推荐人名称" />
                  </Field>
                  <Field
                    name="recommMobile"
                    label="被推荐人手机号"
                    decorator={{
                      initialValue: formData.recommMobile || '',
                      rules: [
                        {
                          required: true,
                          message: '请输入被推荐人手机号',
                        },
                      ],
                    }}
                  >
                    <Input placeholder="请输入被推荐人手机号" />
                  </Field>
                  <Field
                    name="id"
                    label="被推荐人简历"
                    decorator={{
                      initialValue: formData.id || '',
                      rules: [
                        {
                          required: true,
                          message: '请上传被推荐人简历',
                        },
                      ],
                    }}
                  >
                    <FileManagerEnhance
                      api="/api/person/v1/jobInternalRecomm/sfs/token"
                      listType="text"
                      dataKey={formData.id}
                      multiple={false}
                    />
                  </Field>
                  <Field
                    name="relationship"
                    label="与推荐人关系"
                    decorator={{
                      initialValue: formData.relationship || '',
                      rules: [
                        {
                          required: true,
                          message: '请输入与推荐人关系',
                        },
                      ],
                    }}
                  >
                    <Input placeholder="请输入与推荐人关系" />
                  </Field>

                  <Field
                    name="recommReason"
                    label="推荐理由"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.recommReason || '',
                    }}
                  >
                    <Input.TextArea rows={3} placeholder="请输入推荐理由" />
                  </Field>

                  <Field
                    name="resId"
                    label="推荐人"
                    decorator={{
                      initialValue: formData.resId || '',
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={resDataSource}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      disabled
                    />
                  </Field>
                  <Field
                    name="recommDate"
                    label="推荐日期"
                    decorator={{
                      initialValue: formData.recommDate || '',
                    }}
                  >
                    <Input disabled />
                  </Field>
                </FieldList>
              </Card>
            )}
          {mode === 'edit' &&
            taskKey === 'ACC_A36_02_SUPER_b' && (
              <Card
                className="tw-card-adjust"
                style={{ marginTop: '6px' }}
                title={
                  <Title
                    icon="profile"
                    id="ui.menu.plat.res.jobInternal"
                    defaultMessage="岗位内部推荐"
                  />
                }
                bordered={false}
              >
                <DescriptionList title="招聘岗位" size="large" col={2}>
                  <Description term="岗位">
                    {formData.jobNo || ''}
                    {formData.jobNo ? '-' : ''}
                    {formData.jobName}
                  </Description>
                  <Description term="招聘部门">{formData.buName || ''}</Description>
                  <Description term="分类">
                    {formData.jobType1Name || ''}
                    {formData.jobType2Name ? '-' : ''}
                    {formData.jobType2Name || ''}
                  </Description>
                  <Description term="工作地">
                    {formData.workplaceDesc || ''}
                    {formData.workplaceAdd ? '-' : ''}
                    {formData.workplaceAdd || ''}
                  </Description>
                  <Description term="招聘人数">{formData.recruitment || ''}</Description>
                  <Description term="兼职|全职">
                    {formData.fullPart && formData.fullPart === 'FULL' && '全职'}
                    {formData.fullPart && formData.fullPart === 'PART' && '兼职'}
                  </Description>
                  <Description term="服务方式">{formData.workStyleDesc || ''}</Description>
                  <Description term="时间要求">{formData.timeRequirementDesc || ''}</Description>
                </DescriptionList>
                <DescriptionList size="large" col={1}>
                  <Description term="岗位简介">
                    <pre>{formData.jobInfo || ''}</pre>
                  </Description>
                </DescriptionList>
                <DescriptionList size="large" col={1}>
                  <Description term="岗位要求">
                    <pre>{formData.requirements || ''}</pre>
                  </Description>
                </DescriptionList>
                <DescriptionList size="large" col={2}>
                  <Description term="内部推荐">
                    {formData.ntFlag && formData.ntFlag === 'YES' && '接受'}
                    {formData.ntFlag && formData.ntFlag === 'NO' && '不接受'}
                  </Description>
                  <Description term="招聘状态">{formData.recruitStatusDesc || ''}</Description>
                  <Description term="招聘负责人">{formData.recommPicName || ''}</Description>
                  <Description term="创建日期">{formData.createTime || ''}</Description>
                </DescriptionList>
                <Divider />
                <DescriptionList title="推荐信息" size="large" col={2}>
                  <Description term="被推荐人">{formData.recommName || ''}</Description>
                  <Description term="被推荐人手机号">{formData.recommMobile || ''}</Description>
                  <Description term="被推荐人简历">
                    <FileManagerEnhance
                      api="/api/person/v1/jobInternalRecomm/sfs/token"
                      dataKey={formData.id}
                      listType="text"
                      preview
                    />
                  </Description>
                  <Description term="与推荐人关系">{formData.relationship || ''}</Description>
                </DescriptionList>
                <DescriptionList size="large" col={1}>
                  <Description term="推荐理由">
                    <pre>{formData.recommReason || ''}</pre>
                  </Description>
                </DescriptionList>
                <DescriptionList size="large" col={2}>
                  <Description term="推荐号">{formData.recommNo || ''}</Description>
                  <Description term="推荐人">{formData.resName || ''}</Description>
                  <Description term="推荐日期">{formData.recommDate || ''}</Description>
                </DescriptionList>
                <Divider />
                <DescriptionList title="简历筛选结果" size="large" col={2} />
                <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    name="resumeResult"
                    label="简历筛选结果"
                    decorator={{
                      initialValue: formData.resumeResult || undefined,
                      rules: [
                        {
                          required: true,
                          message: '请选择简历筛选结果',
                        },
                      ],
                    }}
                  >
                    <Selection.UDC
                      code="RES:RESUME_RESULT"
                      placeholder="请选择简历筛选结果"
                      onChange={e => {
                        if (e !== 'USED') {
                          const { form } = this.props;
                          form.setFieldsValue({
                            relatedResId: '',
                            resFlag: '',
                            resumeReward: '',
                          });
                        }
                      }}
                    />
                  </Field>
                  <Field
                    name="resumeReward"
                    label="奖励金额"
                    decorator={{
                      initialValue: formData.resumeReward || '',
                      rules: [
                        {
                          required: formData.resumeResult === 'USED',
                          message: '请输入奖励金额',
                        },
                      ],
                    }}
                  >
                    <Input
                      placeholder="请输入奖励金额"
                      disabled={formData.resumeResult !== 'USED'}
                    />
                  </Field>
                  <Field
                    name="resFlag"
                    label="是否已有档案"
                    decorator={{
                      initialValue: formData.resFlag || '',
                      rules: [
                        {
                          required: formData.resumeResult === 'USED',
                          message: '请选择是否已有档案',
                        },
                      ],
                    }}
                  >
                    <RadioGroup disabled={formData.resumeResult !== 'USED'}>
                      <Radio value="YES">是</Radio>
                      <Radio value="NO">否</Radio>
                    </RadioGroup>
                  </Field>
                  <Field
                    name="relatedResId"
                    label="关联档案"
                    decorator={{
                      initialValue: formData.relatedResId || undefined,
                      rules: [
                        {
                          required: formData.resumeResult === 'USED',
                          message: '请选择关联档案',
                        },
                      ],
                    }}
                  >
                    <Row gutter={6}>
                      <Col span={formData.resFlag === 'NO' ? 16 : 24}>
                        <Selection.Columns
                          className="x-fill-100"
                          source={() => selectUsersAll()}
                          columns={particularColumns}
                          transfer={{ key: 'id', code: 'id', name: 'name' }}
                          dropdownMatchSelectWidth={false}
                          showSearch
                          placeholder="请选择关联档案"
                          disabled={formData.resumeResult !== 'USED' || formData.resFlag === 'NO'}
                          value={formData.relatedResId || undefined}
                          onColumnsChange={value => {
                            if (value) {
                              const { id: resId } = value;
                              dispatch({
                                type: `${DOMAIN}/updateForm`,
                                payload: { relatedResId: resId },
                              });
                            } else {
                              dispatch({
                                type: `${DOMAIN}/updateForm`,
                                payload: { relatedResId: '' },
                              });
                            }
                          }}
                        />
                      </Col>
                      {formData.resFlag === 'NO' && (
                        <Col span={4}>
                          <Button
                            className="tw-btn-primary"
                            onClick={() => {
                              const urls = getUrl();
                              // const urls = delParam(getUrl(), '_refresh');
                              const fromUrl = stringify({ from: `${urls}` });
                              router.push(`/hr/res/profile/list/resDetail?mode=create&${fromUrl}`);
                            }}
                          >
                            新增档案
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </Field>
                </FieldList>
              </Card>
            )}
          {mode === 'view' && <ViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default InternalFlow;
