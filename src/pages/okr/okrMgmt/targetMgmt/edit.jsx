/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Input,
  Form,
  Button,
  Progress,
  Switch,
  Card,
  Icon,
  InputNumber,
  Table,
  Divider,
  Tabs,
} from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty, isNil } from 'ramda';
import { selectUsersWithBu, selectInternalOus } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { genFakeId, mul, div, add } from '@/utils/mathUtils';
import update from 'immutability-helper';
import createMessage from '@/components/core/AlertMessage';
import GradeType from './component/GradeType';
import GradeTypeView from './component/GradeTypeView';
import Loading from '@/components/core/DataLoading';

const { Field, FieldLine } = FieldList;
const { TabPane } = Tabs;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'targetMgmt';

@connect(({ loading, targetMgmt, user, gradeType, dispatch }) => ({
  targetMgmt,
  user,
  gradeType,
  dispatch,
  loading,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    const { keyresultName, keyresultWeight, keyresultDesc } = changedValues;
    if (!isNil(keyresultName) || !isNil(keyresultWeight) || !isNil(keyresultDesc)) {
      return;
    }

    const { publicTag } = changedValues;
    if (!isNil(publicTag)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: {
          publicTag: publicTag ? 'true' : 'false',
        },
      });
      return;
    }

    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class TargetMgmtEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id, _refresh } = fromQs();
    !(_refresh === '0') &&
      dispatch({ type: `${DOMAIN}/clean` }).then(res => {
        dispatch({
          type: `${DOMAIN}/queryUserPrincipal`,
        }).then(response => {
          dispatch({
            type: `${DOMAIN}/queryImplementList`,
            payload: {
              limit: 0,
              sortBy: 'id',
              sortDirection: 'DESC',
            },
          });
          dispatch({
            type: `${DOMAIN}/queryObjectiveSupList`,
          });
          id &&
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: {
                pageNo: 'OKR_OBJTEMP_EDIT',
              },
            }) &&
            dispatch({
              type: `${DOMAIN}/queryDetail`,
              payload: {
                id,
              },
            }).then(() => {
              const {
                targetMgmt: {
                  objectiveList,
                  formData: { supObjectiveId },
                },
              } = this.props;
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  supObjectiveMsg: !isEmpty(objectiveList.filter(v => v.id === supObjectiveId))
                    ? objectiveList.filter(v => v.id === supObjectiveId)[0]
                    : {},
                },
              });
            });
          !id &&
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: {
                pageNo: 'OKR_OBJTEMP_SAVE',
              },
            });
        });
      });
  }

  // 如果有关键结果，内容必填，而且权重之和等于100%
  keyresultListMustFill = () => {
    const {
      targetMgmt: { keyresultList },
    } = this.props;

    // 关键结果所有信息必填
    const tt = keyresultList.filter(
      v =>
        isNil(v.keyresultName) ||
        isNil(v.keyresultWeight) ||
        isNil(v.keyresultDesc) ||
        isNil(v.keyresultType) ||
        isNil(v.curProg) ||
        ((v.keyresultType !== 'tag' && isNil(v.iniValue)) ||
          (v.keyresultType !== 'tag' && isNil(v.objValue)))
    );
    if (tt.length) {
      createMessage({ type: 'warn', description: '请填写关键结果的所有信息' });
      return false;
    }

    if (!isEmpty(keyresultList)) {
      // 关键结果权重总和必须等于100%
      const allWeight = keyresultList.reduce((x, y) => add(x, Number(y.keyresultWeight)), 0);
      if (allWeight !== 100) {
        createMessage({ type: 'warn', description: '关键结果权重总和必须等于100%' });
        return false;
      }
    }

    const noKrGrade = keyresultList.filter(v => !v.gradeType && (isEmpty(v.krGrade) || !v.krGrade));
    if (!isEmpty(keyresultList) && noKrGrade.length) {
      // 关键结果必须设置打分规则
      createMessage({
        type: 'warn',
        description: `请设置关键结果${noKrGrade[0].keyresultName}的打分规则`,
      });
      return false;
    }

    return true;
  };

  // 关键行动KA必填信息校验
  keyresultWorkPlanListMustFill = () => {
    const {
      targetMgmt: { keyresultWorkPlanList },
    } = this.props;

    // 关键结果所有信息必填
    const tt = keyresultWorkPlanList.filter(
      v => isNil(v.workPlanName) || isNil(v.startDate) || isNil(v.endDate) || isNil(v.relevantResId)
    );
    if (tt.length) {
      createMessage({ type: 'warn', description: '请填写关键行动KA的必填信息' });
      return false;
    }
    return true;
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      targetMgmt: { formData, keyresultList },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.objectiveType === 'PERSON') {
          if (isEmpty(keyresultList)) {
            createMessage({ type: 'warn', description: '个人目标关键结果KR不能为空' });
            return;
          }
        }

        // 关键结果所有信息必填
        const flag = this.keyresultListMustFill();
        if (!flag) {
          return;
        }

        // 关键行动KA所有必填信息校验
        const keyresultFlag = this.keyresultWorkPlanListMustFill();
        if (!keyresultFlag) {
          return;
        }

        dispatch({
          type: `${DOMAIN}/newSubmit`,
          payload: {
            flow: null,
            isPublish: 'save',
          },
        }).then(response => {
          if (response.ok) {
            // 保存成功之后拉取新的详情，主要为了id
            const { id } = response.datum;
            dispatch({
              type: `${DOMAIN}/queryDetail`,
              payload: {
                id,
              },
            });
            createMessage({ type: 'success', description: '保存成功' });
          } else {
            createMessage({ type: 'error', description: response.reason || '保存失败' });
          }
        });
      }
    });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      targetMgmt: { formData, searchForm, keyresultList },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (formData.objectiveType === 'PERSON') {
          if (isEmpty(keyresultList)) {
            createMessage({ type: 'warn', description: '个人目标关键结果KR不能为空' });
            return;
          }
        }

        // 关键结果所有信息必填
        const flag = this.keyresultListMustFill();
        if (!flag) {
          return;
        }

        // 关键行动KA所有必填信息
        const keyresultFlag = this.keyresultWorkPlanListMustFill();
        if (!keyresultFlag) {
          return;
        }

        dispatch({
          type: `${DOMAIN}/newSubmit`,
          payload: {
            flow: null,
            isPublish: 'publish',
          },
        }).then(response => {
          if (response.ok) {
            dispatch({
              type: `${DOMAIN}/submitFlow`,
              payload: {
                defkey: 'ORG_G01',
                value: { id: response.datum.id },
              },
            }).then(res => {
              if (res.ok) {
                createMessage({ type: 'success', description: '操作成功' });
                closeThenGoto('/okr/okrMgmt/targetMgmt?_refresh=0');
                dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
              }
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  // 直接保存，不提交流程，后门，慎用
  submit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      targetMgmt: { searchForm, keyresultList },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 关键结果所有信息必填
        const flag = this.keyresultListMustFill();
        if (!flag) {
          return;
        }

        dispatch({
          type: `${DOMAIN}/submit`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            closeThenGoto('/okr/okrMgmt/targetMgmt?_refresh=0');
            dispatch({ type: `${DOMAIN}/query`, payload: searchForm });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  // 行编辑触发事件 - 关键结果KR
  onCellChanged = (index, value, name) => {
    const {
      targetMgmt: { keyresultList },
      dispatch,
    } = this.props;

    const newDataSource = keyresultList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { keyresultList: newDataSource },
    });
  };

  // 行编辑触发事件 - 关键行动KA
  onWorkPlanCellChanged = (index, value, name) => {
    const {
      targetMgmt: { keyresultWorkPlanList },
      dispatch,
    } = this.props;

    const newDataSource = keyresultWorkPlanList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { keyresultWorkPlanList: newDataSource },
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  renderPage = () => {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      targetMgmt: {
        formData,
        implementList,
        objectiveProgList,
        keyresultList,
        keyresultListDel,
        keyresultWorkPlanList,
        keyresultWorkPlanListDel,
        pageConfig,
      },
      gradeType: { gradeTypeFormData, gradeTypeList, gradeTypeListDel },
      user: {
        user: { extInfo },
      },
    } = this.props;
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentBlockConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (
        view.blockKey === 'OKR_OBJTEMP_SAVE_TARGET' ||
        view.blockKey === 'OKR_OBJTEMP_EDIT_TARGET'
      ) {
        currentBlockConfig = view;
      }
    });
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const {
      objectiveName = {},
      objectiveType = {},
      objectiveSubject = {},
      objectiveResId = {},
      publicTag = {},
      objRange = {},
      objectiveCurProg = {},
      okrPeriodId = {},
      objectiveStatus = {},
      supObjectiveId = {},
      supObjectiveMsg = {},
      createUserId = {},
      createTime = {},
      keyResult = {},
      keyWorkPlan = {},
      rangeBu = {},
      rangeRes = {},
    } = pageFieldJson;
    const fields = [
      <Field
        name="objectiveName"
        key="objectiveName"
        label={objectiveName.displayName}
        sortno={objectiveName.sortNo}
        decorator={{
          initialValue: formData.objectiveName || undefined,
          rules: [
            {
              required: !!objectiveName.requiredFlag,
              message: `请输入${objectiveName.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${objectiveName.displayName}`} />
      </Field>,
      <Field
        name="objectiveType"
        key="objectiveType"
        label={objectiveType.displayName}
        sortno={objectiveType.sortNo}
        decorator={{
          initialValue: formData.objectiveType || undefined,
          rules: [
            {
              required: !!objectiveType.requiredFlag,
              message: `请选择${objectiveType.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="OKR:OBJ_TYPE"
          allowedOptions={objectiveType.permissionValues} // 根据可配置的权限控制用户可以选择哪些值
          onChange={e => {
            // 每次切换目标层次，清除上级目标
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                supObjectiveId: undefined,
                supObjectiveMsg: {},
              },
            });
            setFieldsValue({
              supObjectiveId: undefined,
            });

            if (e === 'PERSON' && !isNil(extInfo)) {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  objectiveSubject: extInfo.resId,
                  objectiveResId: extInfo.resId,
                },
              });
              setFieldsValue({
                objectiveResId: extInfo.resId,
                objectiveSubject: extInfo.resId,
              });
            } else {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  objectiveSubject: undefined,
                },
              });
              setFieldsValue({
                objectiveSubject: undefined,
              });
            }
          }}
          placeholder={`请选择${objectiveType.displayName}`}
        />
      </Field>,
      <Field
        name="objectiveSubject"
        key="objectiveSubject"
        label={objectiveSubject.displayName}
        sortno={objectiveSubject.sortNo}
        decorator={{
          initialValue: Number(formData.objectiveSubject) || undefined,
          rules: [
            {
              required: !!objectiveSubject.requiredFlag,
              message: `请选择${objectiveSubject.displayName}`,
            },
          ],
        }}
      >
        {formData.objectiveType === 'BU' ? (
          <Selection.ColumnsForBu
            key={formData.objectiveType}
            columnsCode={['code', 'name', 'ouName']}
            resTransform={list => list.filter(v => v.inchargeResId === extInfo.resId)}
          />
        ) : formData.objectiveType === 'PERSON' ? (
          <Selection.Columns
            key={getFieldValue('objectiveType') && formData.objectiveSubject}
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${objectiveSubject.displayName}`}
            limit={20}
          />
        ) : formData.objectiveType === 'COMPANY' ? (
          <Selection
            key="COMPANY"
            className="x-fill-100"
            source={() => selectInternalOus()}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${objectiveSubject.displayName}`}
          />
        ) : (
          <Input disabled placeholder={`请选择${objectiveSubject.displayName}`} />
        )}
      </Field>,
      <Field
        name="objectiveResId"
        key="objectiveResId"
        label={objectiveResId.displayName}
        sortno={objectiveResId.sortNo}
        decorator={{
          initialValue: Number(formData.objectiveResId) || undefined,
          rules: [
            {
              required: !!objectiveResId.requiredFlag,
              message: `请选择${objectiveResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          key={getFieldValue('objectiveType')}
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          limit={20}
          onChange={e => {
            // dispatch({
            //   type: `${DOMAIN}/isPre`,
            //   payload: {
            //     resId: e,
            //   },
            // });
          }}
          placeholder={`请选择${objectiveResId.displayName}`}
        />
      </Field>,
      <Field
        name="publicTag"
        key="publicTag"
        label={publicTag.displayName}
        sortno={publicTag.sortNo}
        decorator={{
          initialValue: formData.publicTag === 'true',
          rules: [
            {
              required: !!publicTag.requiredFlag,
              message: `请选择${publicTag.displayName}`,
            },
          ],
        }}
        labelCol={{ span: 6, xxl: 6 }}
        wrapperCol={{ span: 16, xxl: 16 }}
      >
        <Switch checked={formData.publicTag === 'true'} />
      </Field>,
      formData.publicTag === 'true' ? (
        <Field
          name="objRange"
          key="objRange"
          label={objRange.displayName}
          sortno={objRange.sortNo}
          decorator={{
            initialValue: formData.objRange || undefined,
            rules: [
              {
                required: !!objRange.requiredFlag,
                message: `请选择${objRange.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="OKR:OBJ_RANGE"
            onChange={e => {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  rangeRes: [],
                  rangeBu: [],
                },
              });
            }}
            placeholder={`请选择${objRange.displayName}`}
          />
        </Field>
      ) : (
        <div key="objRange" />
      ),
      formData.publicTag === 'true' && formData.objRange === 'BU' ? (
        <Field
          name="rangeBu"
          key="rangeBu"
          label={rangeBu.displayName}
          sortno={rangeBu.sortNo}
          decorator={{
            initialValue: formData.rangeBu || undefined,
            rules: [
              {
                required: formData.objRange === 'BU',
                message: `请选择${rangeBu.displayName}`,
              },
            ],
          }}
        >
          <Selection.ColumnsForBu mode="multiple" columnsCode={['code', 'name', 'ouName']} />
        </Field>
      ) : (
        <div key="rangeBu" />
      ),
      formData.publicTag === 'true' && formData.objRange === 'RES' ? (
        <Field
          name="rangeRes"
          key="rangeRes"
          label={rangeRes.displayName}
          sortno={rangeRes.sortNo}
          decorator={{
            initialValue: formData.rangeRes || undefined,
            rules: [
              {
                required: formData.objRange === 'RES',
                message: `请选择${rangeRes.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            key={getFieldValue('objRange')}
            mode="multiple"
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            limit={20}
            placeholder={`请选择${rangeRes.displayName}`}
          />
        </Field>
      ) : (
        <div key="rangeRes" />
      ),
      <Field
        name="objectiveCurProj"
        key="objectiveCurProg"
        label={objectiveCurProg.displayName}
        sortno={objectiveCurProg.sortNo}
        decorator={{
          initialValue: 0 || undefined,
        }}
      >
        <Progress
          // 当选择数字型时，要自行算百分比
          percent={keyresultList
            .reduce(
              (x, y) =>
                x +
                mul(
                  mul(
                    div(Number(y.keyresultWeight || 0), 100),
                    div(
                      y.keyresultType !== 'NUMBER'
                        ? Number(y.curProg || 0)
                        : mul(div(Number(y.curProg || 0), Number(y.objValue || 0)), 100),
                      100
                    )
                  ),
                  100
                ),
              0
            )
            .toFixed(2)}
          status="active"
          format={(percent, successPercent) => `${Math.round(percent)}%`}
        />
      </Field>,
      <Field
        name="okrPeriodId"
        key="okrPeriodId"
        label={okrPeriodId.displayName}
        sortno={okrPeriodId.sortNo}
        decorator={{
          initialValue: (formData.okrPeriodId && Number(formData.okrPeriodId)) || undefined,
          rules: [
            {
              required: !!okrPeriodId.requiredFlag,
              message: `请选择${okrPeriodId.displayName}`,
            },
          ],
        }}
      >
        <Selection
          className="x-fill-100"
          source={implementList}
          transfer={{ key: 'id', code: 'id', name: 'periodName' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${okrPeriodId.displayName}`}
          // disabled={!isNil(formData.supObjectiveId)}
        />
      </Field>,
      <Field
        name="objectiveStatus"
        key="objectiveStatus"
        label={objectiveStatus.displayName}
        sortno={objectiveStatus.sortNo}
        decorator={{
          initialValue: formData.objectiveStatus || undefined,
          rules: [
            {
              required: !!objectiveStatus.requiredFlag,
              message: `请选择${objectiveStatus.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC code="OKR:OB_STATUS" placeholder={`请选择${objectiveStatus.displayName}`} />
      </Field>,
      <Field
        name="supObjectiveId"
        key="supObjectiveId"
        label={supObjectiveId.displayName}
        sortno={supObjectiveId.sortNo}
        decorator={{
          initialValue: Number(formData.supObjectiveId) || undefined,
        }}
      >
        {formData.objectiveType ? (
          <Selection
            className="x-fill-100"
            source={
              formData.objectiveType === 'COMPANY'
                ? objectiveProgList.filter(v => v.objectiveType === 'COMPANY')
                : formData.objectiveType === 'BU'
                  ? objectiveProgList.filter(
                      v => v.objectiveType === 'COMPANY' || v.objectiveType === 'BU'
                    )
                  : formData.objectiveType === 'PERSON'
                    ? objectiveProgList
                    : []
            }
            transfer={{ key: 'id', code: 'id', name: 'objectiveName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onValueChange={value => {
              if (value) {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    supObjectiveMsg: { ...value },
                    okrPeriodId: value.okrPeriodId,
                  },
                });
                setFieldsValue({
                  okrPeriodId: value.okrPeriodId,
                });
              } else {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: { supObjectiveMsg: {}, okrPeriodId: null },
                });
                setFieldsValue({
                  okrPeriodId: null,
                });
              }
            }}
            placeholder={`请选择${supObjectiveId.displayName}`}
          />
        ) : (
          <Input disabled placeholder={`请选择${supObjectiveId.displayName}`} />
        )}
      </Field>,
      <Field
        // key={formData.createUserId}
        key="createUserId"
        name="createUserId"
        label={createUserId.displayName}
        sortno={createUserId.sortNo}
        decorator={{
          initialValue: Number(formData.createUserId) || undefined,
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          limit={20}
          onChange={e => {}}
          placeholder={`请选择${createUserId.displayName}`}
          disabled
        />
      </Field>,
      !isEmpty(formData.supObjectiveMsg) ? (
        <Field
          name="supObjectiveMsg"
          key="supObjectiveMsg"
          label={supObjectiveMsg.displayName}
          sortno={supObjectiveMsg.sortNo}
          decorator={{
            initialValue: Number(formData.supObjectiveMsg) || undefined,
          }}
          presentational
        >
          <Card bodyStyle={{ padding: 10 }} style={{ padding: '5px' }}>
            <div>
              目标名称：
              {(formData.supObjectiveMsg && formData.supObjectiveMsg.objectiveName) || ''}
            </div>
            <div>
              目标主体：
              {(formData.supObjectiveMsg && formData.supObjectiveMsg.objectiveSubjectName) || ''}
            </div>
            <div>
              负责人：
              {(formData.supObjectiveMsg && formData.supObjectiveMsg.objectiveResName) || ''}
            </div>
          </Card>
        </Field>
      ) : (
        <div key="supObjectiveMsg" />
      ),
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
    return (
      <FieldList legend="目标" layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      targetMgmt: {
        formData,
        implementList,
        objectiveProgList,
        keyresultList,
        keyresultListDel,
        keyresultWorkPlanList,
        keyresultWorkPlanListDel,
        pageConfig,
      },
      gradeType: { gradeTypeFormData, gradeTypeList, gradeTypeListDel },
      user: {
        user: { extInfo },
      },
    } = this.props;
    const { visible } = this.state;

    const submitBtn =
      loading.effects[`${DOMAIN}/newSubmit`] || loading.effects[`${DOMAIN}/submitFlow`];

    const setGradeTypeFlag = !(
      (!isNil(extInfo) && extInfo.resId === Number(formData.supObjectiveMsg.objectiveResId)) ||
      formData.isPres
    );

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentBlockConfigKR = [];
    let currentBlockConfigKA = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'OKR_OBJTEMP_SAVE_KR' || view.blockKey === 'OKR_OBJTEMP_EDIT_KR') {
        currentBlockConfigKR = view;
      } else if (
        view.blockKey === 'OKR_OBJTEMP_SAVE_KA' ||
        view.blockKey === 'OKR_OBJTEMP_EDIT_KA'
      ) {
        currentBlockConfigKA = view;
      }
    });
    const { pageFieldViews: pageFieldViewsKR } = currentBlockConfigKR;
    const { pageFieldViews: pageFieldViewsKA } = currentBlockConfigKA;

    const pageFieldJsonKR = {};
    const pageFieldJsonKA = {};
    pageFieldViewsKR.forEach(field => {
      pageFieldJsonKR[field.fieldKey] = field;
    });
    pageFieldViewsKA.forEach(field => {
      pageFieldJsonKA[field.fieldKey] = field;
    });
    const {
      keyresultName = {},
      keyresultWeight = {},
      keyresultDesc = {},
      keyresultType = {},
      gradeType = {},
      iniValue = {},
      objValue = {},
      curProg = {},
      acheiveTag = {},
      keyResultName = {},
      keyresultTypeName = {},
      iniObjValue = {},
      gradeTypeName = {},
      customRuleEnd = {},
      gradeScore = {},
      gradeRemark = {},
    } = pageFieldJsonKR;
    const {
      workPlanName = {},
      planNo = {},
      priority = {},
      dateFrom = {},
      relevantResId = {},
      remark = {},
    } = pageFieldJsonKA;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          {!(fromQs().id && fromQs().approvalStatus === 'APPROVED') ? (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={e => this.handleSave()}
              disabled={submitBtn}
            >
              保存
            </Button>
          ) : null}

          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={e => this.handleSubmit()}
            disabled={submitBtn}
          >
            提交
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <GradeType
          onChange={v => {
            if (v) {
              this.onCellChanged(gradeTypeFormData.index, gradeTypeList, 'krGrade');
              this.onCellChanged(gradeTypeFormData.index, gradeTypeFormData.gradeType, 'gradeType');
              this.onCellChanged(gradeTypeFormData.index, gradeTypeListDel, 'deleteGradeKeys');
              if (gradeTypeFormData.gradeType === 'LINEAR') {
                this.onCellChanged(gradeTypeFormData.index, [{ gradeType: 'LINEAR' }], 'krGrade');
              }
            }
            this.toggleVisible();
          }}
          visible={visible}
        />
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="目标维护" />}
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
        </Card>

        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <Tabs onChange={() => {}} type="card">
            <TabPane tab="关键结果KR" key="1">
              <>
                <FieldList layout="horizontal" getFieldDecorator={() => void 0} col={2} />
                {keyresultList.map((item, index) => {
                  const tableColumns = [
                    keyresultType.visibleFlag && {
                      title: (
                        <span className="ant-form-item-required">
                          {`${keyresultType.displayName}`}
                        </span>
                      ),
                      dataIndex: 'keyresultType',
                      key: 'keyresultType',
                      sortno: `${keyresultType.sortNo}`,
                      render: value => (
                        <Selection.UDC
                          value={value}
                          code="OKR:RESULTE_TYPE"
                          placeholder={`请选择${keyresultType.displayName}`}
                          allowClear={false}
                          onChange={e => {
                            this.onCellChanged(index, e, 'keyresultType'); // 更新值
                            this.onCellChanged(index, 0, 'curProg'); // 每次切换清空当前进度
                            if (e === 'PERCENT') {
                              // 结果衡量类型是百分比时，起始值和目标值自动赋值为0和100
                              this.onCellChanged(index, 0, 'iniValue');
                              this.onCellChanged(index, 100, 'objValue');
                            } else if (e === 'tag') {
                              // 结果衡量类型是是否型时，结果达成置为true，当前进度置为100%
                              this.onCellChanged(index, 'false', 'acheiveTag');
                              this.onCellChanged(index, 0, 'curProg');
                              this.onCellChanged(index, '', 'iniValue');
                              this.onCellChanged(index, '', 'objValue');
                            } else {
                              // 结果衡量类型是数字变化型时，清空起始值和目标值
                              this.onCellChanged(index, null, 'iniValue');
                              this.onCellChanged(index, null, 'objValue');
                            }
                            // 切换结果衡量类型时，将打分规则重新默认为线性
                            this.onCellChanged(index, [{ gradeType: 'LINEAR' }], 'krGrade');
                            this.onCellChanged(index, [], 'deleteGradeKeys');
                            // this.onCellChanged(index, 'LINEAR', 'gradeType');
                          }}
                          onValueChange={e => {
                            this.onCellChanged(index, e.name, 'keyresultTypeName'); // 更新值
                          }}
                        />
                      ),
                    },
                    gradeType.visibleFlag && {
                      title: (
                        <span className="ant-form-item-required">{`${gradeType.displayName}`}</span>
                      ),
                      dataIndex: 'gradeType',
                      key: 'gradeType',
                      sortno: `${gradeType.sortNo}`,
                      align: 'center',
                      render: value => (
                        <Button
                          onClick={() => {
                            dispatch({
                              type: `gradeType/updateGradeTypeForm`,
                              payload: {
                                ...item,
                                index,
                                gradeType:
                                  item.krGrade && !isEmpty(item.krGrade)
                                    ? item.krGrade[0].gradeType
                                    : undefined,
                              },
                            });
                            dispatch({
                              type: `gradeType/updateState`,
                              payload: {
                                gradeTypeList: item.krGrade,
                                deleteGradeKeys: item.gradeTypeListDel,
                              },
                            });
                            this.toggleVisible();
                          }}
                          // style={{ position: 'absolute', right: '-150px', top: '-5px' }}
                          // disabled={isNil(item.keyresultType) || setGradeTypeFlag}
                          disabled={isNil(item.keyresultType)}
                        >
                          {`设置${gradeType.displayName}`}
                        </Button>
                      ),
                    },
                    iniValue.visibleFlag && {
                      title: (
                        <span className="ant-form-item-required">{`${iniValue.displayName}`}</span>
                      ),
                      dataIndex: 'iniValue',
                      key: 'iniValue',
                      sortno: `${iniValue.sortNo}`,
                      hidden: 'tag',
                      render: value => (
                        <InputNumber
                          precision={0}
                          min={0}
                          max={item.keyresultType === 'PERCENT' ? 100 : 999999999999999999999}
                          // disabled={item.keyresultType === 'PERCENT'}
                          value={value}
                          className="x-fill-100"
                          placeholder={`请输入${iniValue.displayName}`}
                          onChange={e => {
                            this.onCellChanged(index, e || 0, 'iniValue');
                          }}
                        />
                      ),
                    },
                    objValue.visibleFlag && {
                      title: (
                        <span className="ant-form-item-required">{`${objValue.displayName}`}</span>
                      ),
                      dataIndex: 'objValue',
                      key: 'objValue',
                      sortno: `${objValue.sortNo}`,
                      hidden: 'tag',
                      render: value => (
                        <InputNumber
                          precision={0}
                          min={0}
                          max={item.keyresultType === 'PERCENT' ? 100 : 999999999999999999999}
                          // disabled={item.keyresultType === 'PERCENT'}
                          value={value}
                          className="x-fill-100"
                          placeholder={`请输入${objValue.displayName}`}
                          onChange={e => {
                            this.onCellChanged(index, e || 0, 'objValue');
                          }}
                        />
                      ),
                    },
                    acheiveTag.visibleFlag && {
                      title: (
                        <span className="ant-form-item-required">
                          {`${acheiveTag.displayName}`}
                        </span>
                      ),
                      dataIndex: 'acheiveTag',
                      key: 'acheiveTag',
                      sortno: `${acheiveTag.sortNo}`,
                      align: 'center',
                      hidden: 'NUMBER,PERCENT',
                      render: value => (
                        <Switch
                          checked={value === 'true'}
                          onChange={e => {
                            this.onCellChanged(index, e ? 'true' : 'false', 'acheiveTag');
                            if (!e) {
                              this.onCellChanged(index, 0, 'curProg');
                            } else {
                              this.onCellChanged(index, 100, 'curProg');
                            }
                          }}
                        />
                      ),
                    },
                    curProg.visibleFlag && {
                      title: (
                        <span className="ant-form-item-required">{`${curProg.displayName}`}</span>
                      ),
                      dataIndex: 'curProg',
                      key: 'curProg',
                      sortno: `${curProg.sortNo}`,
                      render: value =>
                        item.keyresultType !== 'NUMBER' ? (
                          <>
                            <InputNumber
                              precision={0}
                              disabled={item.keyresultType === 'tag'}
                              value={value}
                              min={0}
                              max={100}
                              style={{ width: '80%' }}
                              onChange={e => {
                                this.onCellChanged(index, e || 0, 'curProg');
                              }}
                              placeholder={`请输入${curProg.displayName}`}
                            />
                            <span> %</span>
                          </>
                        ) : (
                          <>
                            <InputNumber
                              precision={0}
                              style={{ width: '80%' }}
                              value={value || 0}
                              min={0}
                              max={item.objValue || 100}
                              onChange={e => {
                                this.onCellChanged(index, e || 0, 'curProg');
                              }}
                              placeholder={`请输入${curProg.displayName}`}
                            />
                            &nbsp;
                            <span>
                              {Math.round(
                                item.objValue
                                  ? mul(div(Number(value || 0), Number(item.objValue || 0)), 100)
                                  : 0
                              )}
                              %
                            </span>
                          </>
                        ),
                    },
                  ]
                    .filter(Boolean)
                    .sort((field1, field2) => field1.sortno - field2.sortno);
                  const fields = [
                    <Field
                      name="keyresultName"
                      key="keyresultName"
                      label={
                        <span className="ant-form-item-required">
                          {`${keyresultName.displayName}`}
                        </span>
                      }
                      sortno={keyresultName.sortNo}
                      decorator={{
                        initialValue: item.keyresultName || undefined,
                        rules: [
                          {
                            required: !!keyresultName.requiredFlag,
                            message: `请输入${keyresultName.displayName}`,
                          },
                        ],
                      }}
                      labelCol={{ span: 8, xxl: 8 }}
                      wrapperCol={{ span: 16, xxl: 16 }}
                      presentational
                    >
                      <Input
                        value={item.keyresultName}
                        placeholder={`请输入${keyresultName.displayName}`}
                        onChange={e => {
                          this.onCellChanged(index, e.target.value, 'keyresultName');
                        }}
                      />
                    </Field>,
                    <Field
                      name="keyresultWeight"
                      key="keyresultWeight"
                      sortno={keyresultWeight.sortNo}
                      label={
                        <span className="ant-form-item-required">
                          {`${keyresultWeight.displayName}`}
                        </span>
                      }
                      labelCol={{ span: 8, xxl: 8 }}
                      wrapperCol={{ span: 16, xxl: 16 }}
                      presentational
                    >
                      <>
                        <InputNumber
                          precision={0}
                          value={item.keyresultWeight}
                          style={{ width: '90%' }}
                          min={0}
                          max={100}
                          onChange={e => {
                            this.onCellChanged(index, e || 0, 'keyresultWeight');
                          }}
                          placeholder={`请输入${keyresultWeight.displayName}`}
                        />
                        <span> %</span>
                      </>
                    </Field>,
                    <Field
                      name="keyresultDesc"
                      key="keyresultDesc"
                      sortno={keyresultDesc.sortNo}
                      label={
                        <span className="ant-form-item-required">
                          {`${keyresultDesc.displayName}`}
                        </span>
                      }
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 4 }}
                      wrapperCol={{ span: 20, xxl: 20 }}
                      presentational
                    >
                      <Input.TextArea
                        value={item.keyresultDesc}
                        rows={3}
                        placeholder={`请输入${keyresultDesc.displayName}`}
                        onChange={e => {
                          this.onCellChanged(index, e.target.value, 'keyresultDesc');
                        }}
                      />
                    </Field>,
                  ];
                  const filterList = fields
                    .filter(field => !field.key || pageFieldJsonKR[field.key].visibleFlag === 1)
                    .sort((field1, field2) => field1.props.sortno - field2.props.sortno);

                  return (
                    <Card
                      key={item.id}
                      style={{
                        borderRadius: '6px',
                        marginBottom: '10px',
                        width: '95%',
                      }}
                    >
                      <Icon
                        type="close-circle"
                        theme="filled"
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          fontSize: '20px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const { okrKeyresultId } = item;
                          const newDataSource = keyresultList.filter(
                            row => row.okrKeyresultId !== okrKeyresultId
                          );
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: {
                              keyresultList: newDataSource,
                              keyresultListDel: [...keyresultListDel, okrKeyresultId].filter(
                                v => v > 0
                              ),
                            },
                          });
                        }}
                      />
                      <FieldList
                        key={item.id}
                        layout="horizontal"
                        getFieldDecorator={getFieldDecorator}
                        col={2}
                      >
                        {filterList}
                      </FieldList>
                      <Divider dashed />
                      <Table
                        rowKey={item.id}
                        width={800}
                        dataSource={[{ ...item }]}
                        pagination={false}
                        columns={tableColumns.filter(
                          v => !v.hidden || (v.hidden && !v.hidden.includes(item.keyresultType))
                        )}
                      />
                    </Card>
                  );
                })}

                <a
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        keyresultList: update(keyresultList, {
                          $push: [
                            {
                              okrKeyresultId: genFakeId(-1),
                              keyresultName: null,
                              keyresultWeight: null,
                              keyresultDesc: null,
                              keyresultType: null,
                              iniValue: null,
                              objValue: null,
                              acheiveTag: null,
                              curProg: null,
                              krGrade: [{ gradeType: 'LINEAR' }],
                            },
                          ],
                        }),
                      },
                    });
                  }}
                >
                  <Icon type="plus-circle" />
                  &nbsp; 新建关键结果KR
                </a>
              </>
            </TabPane>
            <TabPane tab="关键行动KA" key="2">
              <>
                <FieldList layout="horizontal" getFieldDecorator={() => void 0} col={2} />
                {keyresultWorkPlanList.map((item, index) => {
                  const fields = [
                    <Field
                      name="workPlanName"
                      key="workPlanName"
                      label={
                        <span className="ant-form-item-required">
                          {`${workPlanName.displayName}`}
                        </span>
                      }
                      sortno={workPlanName.sortNo}
                      labelCol={{ span: 8, xxl: 8 }}
                      wrapperCol={{ span: 16, xxl: 16 }}
                      presentational
                    >
                      <Input
                        value={item.workPlanName}
                        placeholder={`请输入${workPlanName.displayName}`}
                        onChange={e => {
                          this.onWorkPlanCellChanged(index, e.target.value, 'workPlanName');
                        }}
                      />
                    </Field>,
                    <FieldLine
                      label={planNo.displayName + '/' + priority.displayName}
                      labelCol={{ span: 8, xxl: 8 }}
                      wrapperCol={{ span: 16, xxl: 16 }}
                      key="priority"
                      sortno={priority.sortNo}
                    >
                      <Field name="planNo" wrapperCol={{ span: 23, xxl: 23 }} presentational>
                        <Input
                          value={item.planNo}
                          placeholder={`请输入${planNo.displayName}`}
                          onChange={e => {
                            this.onWorkPlanCellChanged(index, e.target.value, 'planNo');
                          }}
                        />
                      </Field>
                      <Field name="priority" wrapperCol={{ span: 23, xxl: 23 }} presentational>
                        <InputNumber
                          value={item.priority}
                          min={0}
                          placeholder={`请输入${priority.displayName}`}
                          className="x-fill-100"
                          onChange={e => {
                            this.onWorkPlanCellChanged(index, e, 'priority');
                          }}
                        />
                      </Field>
                    </FieldLine>,
                    <Field
                      name="dates"
                      key="dateFrom"
                      sortno={dateFrom.sortNo}
                      label={
                        <span className="ant-form-item-required">{`${dateFrom.displayName}`}</span>
                      }
                      labelCol={{ span: 8, xxl: 8 }}
                      wrapperCol={{ span: 16, xxl: 16 }}
                      presentational
                    >
                      <DatePicker.RangePicker
                        value={[item.startDate || undefined, item.endDate || undefined]}
                        onChange={e => {
                          this.onWorkPlanCellChanged(index, e[0], 'startDate');
                          this.onWorkPlanCellChanged(index, e[1], 'endDate');
                        }}
                        className="x-fill-100"
                        format="YYYY-MM-DD"
                      />
                    </Field>,
                    <Field
                      name="relevantResId"
                      key="relevantResId"
                      sortno={relevantResId.sortNo}
                      label={
                        <span className="ant-form-item-required">
                          {`${relevantResId.displayName}`}
                        </span>
                      }
                      labelCol={{ span: 8, xxl: 8 }}
                      wrapperCol={{ span: 16, xxl: 16 }}
                      presentational
                    >
                      <Selection.Columns
                        value={
                          item.relevantResId
                            ? item.relevantResId.split(',').map(v => Number(v))
                            : undefined
                        }
                        className="x-fill-100"
                        source={() => selectUsersWithBu()}
                        columns={particularColumns}
                        transfer={{ key: 'id', code: 'id', name: 'name' }}
                        dropdownMatchSelectWidth={false}
                        showSearch
                        onColumnsChange={value => {}}
                        placeholder={`请选择${relevantResId.displayName}`}
                        mode="multiple"
                        limit={20}
                        onChange={e => {
                          this.onWorkPlanCellChanged(index, e.join(','), 'relevantResId');
                        }}
                      />
                    </Field>,
                    <Field
                      name="remark"
                      key="remark"
                      sortno={remark.sortNo}
                      label={remark.displayName}
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 4 }}
                      wrapperCol={{ span: 20, xxl: 20 }}
                      presentational
                    >
                      <Input.TextArea
                        value={item.remark || ''}
                        onChange={e => {
                          this.onWorkPlanCellChanged(index, e.target.value, 'remark');
                        }}
                        rows={3}
                        placeholder={`请输入${remark.displayName}`}
                      />
                    </Field>,
                  ];
                  const filterList = fields
                    .filter(field => !field.key || pageFieldJsonKA[field.key].visibleFlag === 1)
                    .sort((field1, field2) => field1.props.sortno - field2.props.sortno);
                  return (
                    <Card
                      // eslint-disable-next-line react/no-array-index-key
                      key={index}
                      style={{
                        borderRadius: '6px',
                        marginBottom: '10px',
                        width: '95%',
                      }}
                    >
                      <Icon
                        type="close-circle"
                        theme="filled"
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '-10px',
                          fontSize: '20px',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          const { id } = item;
                          const newDataSource = keyresultWorkPlanList.filter(row => row.id !== id);
                          dispatch({
                            type: `${DOMAIN}/updateState`,
                            payload: {
                              keyresultWorkPlanList: newDataSource,
                              keyresultWorkPlanListDel: [...keyresultWorkPlanListDel, id].filter(
                                v => v > 0
                              ),
                            },
                          });
                        }}
                      />
                      <FieldList
                        key={item.id}
                        layout="horizontal"
                        getFieldDecorator={getFieldDecorator}
                        col={2}
                      >
                        {filterList}
                      </FieldList>
                    </Card>
                  );
                })}

                <a
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        keyresultWorkPlanList: update(keyresultWorkPlanList, {
                          $push: [
                            {
                              id: genFakeId(-1),
                              workPlanName: undefined,
                              planNo: undefined,
                              priority: undefined,
                              startDate: undefined,
                              endDate: undefined,
                              relevantResId: undefined,
                              remark: undefined,
                            },
                          ],
                        }),
                      },
                    });
                  }}
                >
                  <Icon type="plus-circle" />
                  &nbsp; 新建关键行动KA
                </a>
              </>
            </TabPane>
          </Tabs>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TargetMgmtEdit;
