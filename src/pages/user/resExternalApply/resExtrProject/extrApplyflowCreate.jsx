import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, InputNumber, Radio, Switch, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import { pushFlowTask } from '@/services/gen/flow';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { formatMessage } from 'umi/locale';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { stringify } from 'qs';
import ExtrApplyViewDetail from './ExtrApplyViewDetail';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
// import ResCapacity from './table/ResCapacity';

// import ProjMemberReview from './table/ProjMemberReview';
// import EvalPoint from './table/EvalPoint';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 10 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const DOMAIN = 'extrApplyflowCreate';

@connect(({ loading, extrApplyflowCreate, dispatch, user, userProject }) => ({
  loading,
  extrApplyflowCreate,
  dispatch,
  user,
  userProject,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class ExtrApplyflowCreate extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId, mode } = fromQs();

    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/queryProjList` });
    dispatch({
      type: `${DOMAIN}/typeChange`,
    });
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      }).then(res => {
        const {
          extrApplyflowCreate: { formData },
        } = this.props;
        // 拉取资源已有单项能力和复核能力
        formData.resId &&
          dispatch({
            type: `${DOMAIN}/resAbility`,
            payload: { resId: formData.resId },
          });

        // 获取复合能力
        dispatch({
          type: `${DOMAIN}/getCapaSetList`,
        });
        formData.jobClass1 &&
          dispatch({
            type: `${DOMAIN}/updateListType2`,
            payload: formData.jobClass1,
          });
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

  // 岗位分类一 -> 岗位分类二
  handleChangeType1 = value => {
    const { dispatch, form } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        jobClass2: null,
      });
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll },
      extrApplyflowCreate: {
        formData,
        resDataSource,
        baseBuDataSource,
        projList,
        resultChkList,
        flowForm,
        fieldsConfig,
        getPointList,
        type2,
        jobClass2List,
        capaSetList,
      },
    } = this.props;
    const {
      panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, prcId, from, mode } = fromQs();
    const urls = getUrl();
    const offerFrom = stringify({ offerFrom: urls });

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
                    remark,
                    result: key,
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
            if (taskKey === 'ACC_A46_04_FILE_MESSAGE_b') {
              const { resId } = formData;
              if (key === 'allResMsg') {
                router.push(`/user/center/infoEdit?id=${resId}&mode=update&tab=basic&${offerFrom}`);
              }
            }
            if (taskKey === 'ACC_A46_05_NOTARIZE_MESSAGE_b') {
              const { resId } = formData;
              if (key === 'resQuery') {
                router.push(`/hr/res/profile/list/resQuery?id=${resId}&${offerFrom}`);
              }
            }

            if (key === 'APPROVED' || key === 'APPLIED') {
              validateFieldsAndScroll((error, values) => {
                if (!error) {
                  if (taskKey === 'ACC_A46_04_FILE_MESSAGE_b') {
                    dispatch({
                      type: `${DOMAIN}/fourthNodeSubmit`,
                      payload: {
                        taskId,
                        result: key,
                        procRemark: remark,
                        submit: 'true',
                      },
                    });
                  } else {
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
                }
              });
            }
            return Promise.resolve(false);
          }}
        >
          {mode === 'edit' && (
            <Card
              className="tw-card-adjust"
              style={{ marginTop: '6px' }}
              title={<Title icon="profile" text="外部资源引入申请" />}
              bordered={false}
            >
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                {hasIn('resId', disabledOrHidden) && (
                  <Field
                    name="resId"
                    label="姓名"
                    decorator={{
                      initialValue: formData.resName || '',
                    }}
                  >
                    <Input disabled={!!disabledOrHidden.resId} placeholder="请选择资源" />
                  </Field>
                )}
                {hasIn('gender', disabledOrHidden) && (
                  <Field
                    name="gender"
                    label="性别"
                    decorator={{
                      initialValue: formData.gender || '',
                      rules: [
                        {
                          required: !disabledOrHidden.gender && true,
                          message: '请选择性别',
                        },
                      ],
                    }}
                  >
                    <UdcSelect
                      disabled={!!disabledOrHidden.gender}
                      code="COM.GENDER"
                      placeholder="请选择性别"
                    />
                  </Field>
                )}
                {hasIn('mobile', disabledOrHidden) && (
                  <Field
                    name="mobile"
                    label="手机号"
                    decorator={{
                      initialValue: formData.mobile || '',
                      rules: [
                        {
                          required: !disabledOrHidden.mobile && true,
                          message: '请输入手机号！',
                        },
                      ],
                    }}
                  >
                    <Input disabled={!!disabledOrHidden.mobile} placeholder="请输入手机号" />
                  </Field>
                )}
                {hasIn('baseBuId', disabledOrHidden) && (
                  <FieldLine label="资源类型">
                    <Field
                      name="resType1"
                      decorator={{
                        initialValue: formData.resType1 || undefined,
                        rules: [{ message: '资源类型一' }],
                      }}
                      wrapperCol={{ span: 23, xxl: 23 }}
                    >
                      <Selection.UDC
                        code="RES:RES_TYPE1"
                        placeholder="资源类型一"
                        disabled={!!disabledOrHidden.resType1}
                      />
                    </Field>
                    <Field
                      name="resType2"
                      decorator={{
                        initialValue: formData.resType2 || undefined,
                      }}
                      wrapperCol={{ span: 23, xxl: 23 }}
                    >
                      <Selection
                        source={type2}
                        placeholder="资源类型二"
                        disabled={!!disabledOrHidden.resType2}
                      />
                    </Field>
                  </FieldLine>
                )}
                {hasIn('baseBuId', disabledOrHidden) && (
                  <Field
                    name="baseBuId"
                    label="BaseBU"
                    decorator={{
                      initialValue: formData.baseBuId || '',
                      rules: [
                        {
                          required: !disabledOrHidden.baseBuId && true,
                          message: '请选择BaseBU',
                        },
                      ],
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={baseBuDataSource}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      disabled={!!disabledOrHidden.baseBuId}
                    />
                  </Field>
                )}
                {hasIn('presId', disabledOrHidden) && (
                  <Field
                    name="presId"
                    label="上级"
                    decorator={{
                      initialValue: Number(formData.presId) || undefined,
                      rules: [
                        {
                          required: !disabledOrHidden.presId && true,
                          message: '请选择上级',
                        },
                      ],
                    }}
                  >
                    <Selection.Columns
                      className="x-fill-100"
                      source={() => selectUserMultiCol()}
                      columns={particularColumns}
                      transfer={{ key: 'id', code: 'id', name: 'name' }}
                      dropdownMatchSelectWidth={false}
                      showSearch
                      onColumnsChange={value => {}}
                      placeholder="请选择上级领导"
                      disabled={!!disabledOrHidden.presId}
                    />
                  </Field>
                )}
                {hasIn('coopType', disabledOrHidden) && (
                  <Field
                    name="coopType"
                    label="合作方式"
                    decorator={{
                      initialValue: formData.coopType,
                      rules: [
                        {
                          required: !disabledOrHidden.coopType && true,
                          message: '请选择合作方式',
                        },
                      ],
                    }}
                  >
                    <UdcSelect
                      disabled={!!disabledOrHidden.coopType}
                      code="COM.COOPERATION_MODE"
                      placeholder="请选择合作方式"
                    />
                  </Field>
                )}
                {hasIn('eqvaRatio', disabledOrHidden) && (
                  <Field
                    name="eqvaRatio"
                    label="当量系数"
                    decorator={{
                      initialValue: formData.eqvaRatio,
                      rules: [
                        {
                          required: !disabledOrHidden.eqvaRatio && true,
                          message: '请输入当量系数',
                        },
                      ],
                    }}
                  >
                    <InputNumber
                      className="x-fill-100"
                      placeholder="请输入当量系数"
                      precision={1}
                      min={0}
                      max={999999999999}
                      disabled={!!disabledOrHidden.eqvaRatio}
                    />
                  </Field>
                )}
                {hasIn('emailFlag', disabledOrHidden) && (
                  <Field
                    name="emailFlag"
                    label="开通邮箱"
                    decorator={{
                      initialValue: formData.emailFlag + '' || '1',
                      rules: [
                        {
                          required: !disabledOrHidden.emailFlag && true,
                          message: '请选择是否开通邮箱',
                        },
                      ],
                    }}
                  >
                    <Radio.Group disabled={!!disabledOrHidden.emailFlag}>
                      <Radio value="1">是</Radio>
                      <Radio value="0">否</Radio>
                    </Radio.Group>
                  </Field>
                )}
                {hasIn('elpFlag', disabledOrHidden) && (
                  <Field
                    name="elpFlag"
                    label="开通E-Learning账号"
                    style={{ letterSpacing: '-1px' }}
                    decorator={{
                      initialValue: formData.elpFlag + '' || '1',
                      rules: [
                        {
                          required: !disabledOrHidden.elpFlag && true,
                          message: '请选择是否开通E-Learning账号',
                        },
                      ],
                    }}
                  >
                    <Radio.Group disabled={!!disabledOrHidden.elpFlag}>
                      <Radio value="1">是</Radio>
                      <Radio value="0">否</Radio>
                    </Radio.Group>
                  </Field>
                )}
                {hasIn('entryType', disabledOrHidden) && (
                  <Field
                    name="entryType"
                    label="入职类型"
                    style={{ letterSpacing: '-1px' }}
                    decorator={{
                      initialValue: formData.entryType,
                      rules: [
                        {
                          required: !disabledOrHidden.entryType && true,
                          message: '请选择入职类型',
                        },
                      ],
                    }}
                  >
                    <Selection.UDC
                      code="RES:ENTRY_LEAVE_TYPE"
                      placeholder="请选择入职类型"
                      disabled={
                        taskKey === 'ACC_A46_01_SUBMIT_i'
                          ? formData.oldResStatus === '1'
                          : !!disabledOrHidden.entryType
                      }
                      filters={[{ sphd2: 'ENTRY_EXTERNAL' }]}
                    />
                  </Field>
                )}
                {hasIn('periodFlag', disabledOrHidden) && (
                  <Field
                    name="periodFlag"
                    label="长期/短期"
                    decorator={{
                      initialValue: formData.periodFlag || undefined,
                      rules: [
                        {
                          required: false,
                          message: '请选择资源类别',
                        },
                      ],
                    }}
                  >
                    <RadioGroup
                      disabled={!!disabledOrHidden.periodFlag}
                      initialValue={formData.periodFlag || ''}
                    >
                      <Radio value="LONG">长期资源</Radio>
                      <Radio value="SHORT">短期资源</Radio>
                    </RadioGroup>
                  </Field>
                )}
                {hasIn('jobClass1', disabledOrHidden) && (
                  <Field
                    name="jobClass1"
                    key="jobClass1"
                    label="工种分类一"
                    decorator={{
                      initialValue: formData.jobClass1 || undefined,
                      rules: [
                        {
                          required: !disabledOrHidden.jobClass1,
                          message: '请选择工种分类一',
                        },
                      ],
                    }}
                  >
                    <Selection.UDC
                      code="RES:JOB_TYPE1"
                      placeholder="请选择工种分类一"
                      disabled={!!disabledOrHidden.jobClass1}
                      onChange={e => {
                        this.handleChangeType1(e);
                      }}
                    />
                  </Field>
                )}
                {hasIn('jobClass2', disabledOrHidden) && (
                  <Field
                    name="jobClass2"
                    key="jobClass2"
                    label="工种分类二"
                    decorator={{
                      initialValue: formData.jobClass2 || undefined,
                      rules: [
                        {
                          required: jobClass2List.length > 0,
                          message: '请选择工种分类二',
                        },
                      ],
                    }}
                  >
                    <Selection
                      source={jobClass2List}
                      placeholder="请选择工种分类二"
                      disabled={!!disabledOrHidden.jobClass2}
                    />
                  </Field>
                )}
                {hasIn('jobCapaSetId', disabledOrHidden) && (
                  <Field
                    name="jobCapaSetLevelDId"
                    key="jobCapaSetId"
                    label="复合能力"
                    decorator={{
                      initialValue: formData.jobCapaSetLevelDId || undefined,
                      rules: [
                        {
                          required: formData.periodFlag === 'LONG',
                          message: '请选择复合能力',
                        },
                      ],
                    }}
                  >
                    <Selection
                      source={capaSetList}
                      placeholder="请选择复合能力"
                      disabled={!!disabledOrHidden.jobCapaSetId}
                    />
                  </Field>
                )}
                {hasIn('remark', disabledOrHidden) && (
                  <Field
                    name="remark"
                    label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    decorator={{
                      initialValue: formData.remark || '',
                    }}
                  >
                    <Input.TextArea
                      disabled={!!disabledOrHidden.remark}
                      rows={3}
                      placeholder="请输入备注"
                    />
                  </Field>
                )}
                {hasIn('applyResId', disabledOrHidden) && (
                  <Field
                    name="applyResId"
                    label="申请人"
                    decorator={{
                      initialValue: formData.applyResName || '',
                    }}
                  >
                    <Input disabled />
                  </Field>
                )}
                {hasIn('applyDate', disabledOrHidden) && (
                  <Field
                    name="applyDate"
                    label="申请时间"
                    decorator={{
                      initialValue: formData.applyDate || '',
                    }}
                  >
                    <Input disabled />
                  </Field>
                )}
                {hasIn('email', disabledOrHidden) && (
                  <Field
                    name="email"
                    label="邮箱"
                    decorator={{
                      initialValue: formData.email || undefined,
                      rules: [
                        {
                          required: !disabledOrHidden.email && formData.emailFlag === '1' && true,
                          message: '请输入邮箱',
                        },
                      ],
                    }}
                  >
                    <Input disabled={!!disabledOrHidden.email || formData.emailFlag === '0'} />
                  </Field>
                )}
                {hasIn('elpId', disabledOrHidden) && (
                  <Field
                    name="elpId"
                    label="E-Learning账号"
                    decorator={{
                      initialValue: formData.elpId || '',
                      rules: [
                        {
                          required: !disabledOrHidden.elpId && formData.elpFlag === '1' && true,
                          message: '请输入E-Learning账号',
                        },
                      ],
                    }}
                  >
                    <Input disabled={!!disabledOrHidden.elpId || formData.elpFlag === '0'} />
                  </Field>
                )}
                {/* {hasIn('capacity', disabledOrHidden) && (
                  <>
                    <Divider dashed />
                    <ResCapacity />
                  </>
                )} */}
              </FieldList>
            </Card>
          )}
          {mode === 'view' && <ExtrApplyViewDetail />}
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default ExtrApplyflowCreate;
