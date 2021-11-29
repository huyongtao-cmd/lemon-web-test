import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { isNil, isEmpty, pickAll } from 'ramda';
import moment from 'moment';
import { Card, Button, Form, Input, DatePicker, Select, InputNumber } from 'antd';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import AsyncSelect from '@/components/common/AsyncSelect';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { mul, parseIfNumeric, checkIfNumber, div, add } from '@/utils/mathUtils';
import { toIsoDate } from '@/utils/timeUtils';
import { getGuid, fromQs } from '@/utils/stringUtils';
import { getSettleType } from '@/services/user/equivalent/equivalent';

const DOMAIN = 'CommonCreate';
const { Field, FieldLine } = FieldList;

@connect(({ loading, CommonCreate, user }) => ({
  loading,
  CommonCreate,
  user,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    const {
      CommonCreate: { projectList, taskList, resList, formData },
      dispatch,
    } = props;
    let payload = {};
    // 选择项目的处理逻辑
    if (name === 'projCode') {
      if (!value) {
        payload = {
          applySettleAmt: undefined,
          settlePrice: undefined,
          eqvaSalary: undefined,
          projId: undefined,
          resAmt: undefined,
          taskId: undefined,
          taskCode: undefined,
          expenseBuId: undefined,
          incomeResId: undefined,
          resBuId: undefined,
        };
        dispatch({
          type: 'updateState',
          payload: {
            taskList: [],
          },
        });
        // setFieldsValue({ taskCode: undefined});
      } else {
        const { id, buId } = projectList.find(project => project.code === value);
        payload = {
          expenseBuId: buId,
          projId: id,
          taskId: undefined,
          taskCode: undefined,
        };
        dispatch({
          type: `${DOMAIN}/fetchTaskListByProjectId`,
          payload: id,
        });
      }
    }

    // 选择任务的处理逻辑
    if (name === 'taskCode') {
      if (!value) {
        payload = {
          settlePrice: undefined,
          eqvaSalary: undefined,
          applySettleAmt: undefined,
          resAmt: undefined,
          taskId: undefined,
        };
      } else {
        const { id } = taskList.find(task => task.code === value);
        dispatch({
          type: `${DOMAIN}/fetchTaskInfo`,
          payload: id,
        });
      }
    }

    // 选择费用承担BU的处理逻辑
    if (name === 'expenseBuId') {
      payload = {
        [name]: value,
      };
      dispatch({
        type: `${DOMAIN}/queryTaskSettleByCondition`,
        payload: {
          jobType1: formData.jobType1,
          expenseBuId: value,
          receiverBuId: formData.resBuId,
          receiverResId: formData.incomeResId,
          settlePriceFlag: formData.settlePriceFlag,
          buSettlePrice: formData.buSettlePrice,
        },
      });
    }

    // 选择收入资源的处理逻辑
    if (name === 'incomeResId') {
      if (!value) {
        payload = {
          resBuId: undefined,
        };
      } else {
        // tag :: valSphd1 资源所属 BU 的 id
        const { valSphd1 } = resList.find(res => res.code === value);
        payload = {
          resBuId: valSphd1,
        };
      }
      dispatch({
        type: `${DOMAIN}/queryTaskSettleByCondition`,
        payload: {
          jobType1: formData.jobType1,
          expenseBuId: formData.expenseBuId,
          receiverBuId: payload.resBuId,
          receiverResId: value,
          settlePriceFlag: formData.settlePriceFlag,
          buSettlePrice: formData.buSettlePrice,
        },
      });
    }

    // 选择收入资源BU的处理逻辑
    if (name === 'resBuId') {
      payload = {
        [name]: value,
      };
      dispatch({
        type: `${DOMAIN}/queryTaskSettleByCondition`,
        payload: {
          jobType1: formData.jobType1,
          expenseBuId: formData.expenseBuId,
          receiverBuId: value,
          receiverResId: formData.incomeResId,
          settlePriceFlag: formData.settlePriceFlag,
          buSettlePrice: formData.buSettlePrice,
        },
      });
    }

    // 实际BU结算价的处理逻辑
    if (name === 'buSettlePrice') {
      const settlePrice = value
        ? div(mul(value, add(100, formData.taxRate || 0)), 100).toFixed(2)
        : 0;
      const applySettleAmt =
        formData.applySettleEqva && settlePrice
          ? mul(formData.applySettleEqva, settlePrice).toFixed(2)
          : 0;

      payload = {
        [name]: value,
        settlePrice,
        applySettleAmt,
      };
    }

    // 申请结算当量的处理逻辑
    if (name === 'applySettleEqva') {
      const applySettleAmt =
        formData.settlePrice && value ? mul(formData.settlePrice, value).toFixed(2) : 0;
      const resAmt = formData.eqvaSalary && value ? mul(formData.eqvaSalary, value).toFixed(2) : 0;

      payload = {
        [name]: value,
        resAmt,
        applySettleAmt,
      };
    }

    // 缺省
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        ...payload,
        [name]: value,
      },
    });
  },
})
@mountToTab()
class DetailCommonCreate extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/queryList` });
  }

  handleSave = () => {
    const {
      dispatch,
      CommonCreate: { formData },
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const settleDate = toIsoDate(values.settleDate);
      const params = pickAll(
        [
          'applyResId',
          // 'applyDate',
          'applySettleEqva',
          'settleType',
          'settlePrice',
          'eqvaSalary',
          'projId',
          'taskId',
          'expenseBuId',
          'incomeResId',
          'resBuId',
          'remark',
        ],
        { ...values, ...formData }
      );
      const payload = {
        settleDate,
        ...params,
        submitted: false,
      };
      dispatch({ type: `${DOMAIN}/saveData`, payload });
    });
  };

  handleSubmit = () => {
    const {
      dispatch,
      CommonCreate: { formData },
      form: { validateFieldsAndScroll },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (error) return;
      const settleDate = toIsoDate(values.settleDate);
      const params = pickAll(
        [
          'applyResId',
          // 'applyDate',
          'applySettleEqva',
          'settleType',
          'settlePrice',
          'eqvaSalary',
          'projId',
          'taskId',
          'expenseBuId',
          'incomeResId',
          'resBuId',
          'remark',
        ],
        { ...values, ...formData }
      );
      const payload = {
        settleDate,
        ...params,
        submitted: true,
      };
      dispatch({ type: `${DOMAIN}/submitData`, payload });
    });
  };

  calcMoney = value => {
    const {
      dispatch,
      CommonCreate: { formData },
    } = this.props;
    const { settlePrice, eqvaSalary } = formData;
    const applySettleAmt = mul(value || 0, settlePrice || 0);
    const resAmt = mul(value || 0, eqvaSalary || 0);
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        applySettleAmt,
        resAmt,
      },
    });
  };

  // 工种 -> 工种子类
  handleChangeJobType1 = value => {
    const {
      dispatch,
      form,
      CommonCreate: { formData },
    } = this.props;
    const { expenseBuId, resBuId, incomeResId, settlePriceFlag, buSettlePrice } = formData;
    const params = {
      jobType1: value,
      expenseBuId,
      receiverBuId: resBuId,
      receiverResId: incomeResId,
      settlePriceFlag,
      buSettlePrice,
    };
    dispatch({
      type: `${DOMAIN}/queryTaskSettleByCondition`,
      payload: params,
    });
    dispatch({
      type: `${DOMAIN}/updateJobType2`,
      payload: value,
    }).then(() => {
      form.setFieldsValue({
        jobType2: null,
        capasetLeveldId: null,
      });
    });
  };

  handleChangeJobType2 = value => {
    const {
      dispatch,
      form,
      CommonCreate: { formData },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateCapasetLeveldList`,
      payload: {
        jobType1: formData.jobType1,
        jobType2: value,
      },
    }).then(() => {
      form.setFieldsValue({
        capasetLeveldId: null,
      });
    });
  };

  render() {
    const {
      loading,
      form: { getFieldDecorator, setFieldsValue, setFields },
      CommonCreate: {
        formData,
        projectList,
        taskList,
        resList,
        buList,
        jobType2List,
        capasetLeveldList,
      },
      user: {
        user: { extInfo = {} },
      },
      dispatch,
    } = this.props;
    const { sourceUrl } = fromQs();
    const disabledBtn =
      loading.effects[`${DOMAIN}/queryList`] ||
      loading.effects[`${DOMAIN}/saveData`] ||
      loading.effects[`${DOMAIN}/submitData`];

    return (
      <PageHeaderWrapper title="当量结算泛用">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSubmit}
          >
            提交
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() =>
              sourceUrl ? closeThenGoto(sourceUrl) : closeThenGoto('/plat/intelStl/list')
            }
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList legend="当量结算基本信息" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="settleNo"
              label="结算单号"
              decorator={{
                initialValue: formData.settleNo,
              }}
            >
              <Input disabled placeholder="系统生成" />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResId || (extInfo && extInfo.resId),
              }}
            >
              <AsyncSelect source={resList} disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || moment().format('YYYY-MM-DD'),
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="settleDate"
              label="结算日期"
              decorator={{
                initialValue: formData.settleDate ? moment(formData.settleDate) : moment(),
                rules: [{ required: true, message: '请选择结算日期' }],
              }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>
            <Field
              name="applySettleEqva"
              label="申请结算当量"
              decorator={{
                initialValue: formData.applySettleEqva,
                rules: [
                  {
                    required: true,
                    message: '请输入申请结算当量',
                  },
                  // {
                  //   validator: (rule, value, callback) => {
                  //     if (isNil(value) || !value) {
                  //       dispatch({
                  //         type: `${DOMAIN}/updateForm`,
                  //         payload: {
                  //           applySettleAmt: undefined,
                  //           resAmt: undefined,
                  //         },
                  //       });
                  //       callback();
                  //     } else {
                  //       const error = [];
                  //       if (!checkIfNumber(value)) error.push('输入类型不正确');
                  //       // if (!parseIfNumeric(value)) error.push('输入类型不正确');
                  //       else if (formData.taskId) {
                  //         parseIfNumeric(value);
                  //         this.calcMoney(value);
                  //       }
                  //       callback();
                  //     }
                  //   },
                  // },
                ],
              }}
            >
              <Input
                type="number"
                placeholder="请输入申请结算当量"
                // onChange={e => {
                //   const {value} = e.target;
                //   const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
                //   if ((!Number.isNaN(value) && reg.test(value)) || value === '' || value === '-') {
                //     // do nothing
                //   } else {
                //     setFields({value, errors: [new Error('输入类型不正确')]});
                //   }
                // }}
                // onBlur={e => {
                //   const {value} = e.target;
                //   if (value.charAt(value.length - 1) === '.' || value === '-') {
                //     setFieldsValue({applySettleEqva: value.slice(0, -1)});
                //   }
                // }}
              />
            </Field>
            <Field
              name="settleType"
              label="结算类型"
              decorator={{
                initialValue: formData.settleType,
                rules: [{ required: true, message: '请选择结算类型' }],
              }}
            >
              <AsyncSelect
                source={() => getSettleType().then(resp => resp.response.datum)}
                placeholder="请选择结算类型"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>

            {/* #107 需求修改 */}
            <FieldLine label="复合能力" fieldCol={2} required>
              <Field
                name="jobType1"
                decorator={{
                  initialValue: formData.jobType1,
                  rules: [{ required: true, message: '请选择工种' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <UdcSelect
                  code="COM.JOB_TYPE1"
                  placeholder="请选择工种"
                  onChange={this.handleChangeJobType1}
                />
              </Field>
              <Field
                name="jobType2"
                decorator={{
                  initialValue: formData.jobType2,
                  rules: [{ required: true, message: '请选择工种子类' }],
                }}
                wrapperCol={{ span: 23 }}
              >
                <AsyncSelect
                  source={jobType2List}
                  placeholder="请选择工种子类"
                  onChange={this.handleChangeJobType2}
                />
              </Field>
              <Field
                name="capasetLeveldId"
                decorator={{
                  initialValue: formData.capasetLeveldId,
                  rules: [{ required: true, message: '请选择级别' }],
                }}
                wrapperCol={{ span: 24 }}
              >
                <AsyncSelect
                  source={capasetLeveldList}
                  placeholder="请选择级别"
                  // onChange={this.handleChangeCapasetLeveldId}
                />
              </Field>
            </FieldLine>
            <Field presentational />
            <Field
              name="suggestSettlePrice"
              label="参考BU结算价格"
              decorator={{
                initialValue: formData.suggestSettlePrice,
              }}
            >
              <Input disabled placeholder="参考BU结算价格" />
            </Field>
            <Field
              name="taxRate"
              label="税率"
              decorator={{
                initialValue: formData.taxRate,
                rules: [
                  {
                    required: false,
                    message: '请输入税率',
                  },
                ],
              }}
            >
              <Input placeholder="税率" disabled />
            </Field>
            <Field
              name="settlePriceFlag"
              label="自定义BU结算价格"
              decorator={{
                initialValue: formData.settlePriceFlag ? '' + formData.settlePriceFlag : '0',
                rules: [{ required: true, message: '请计算自定义BU结算价格' }],
              }}
            >
              <Select
                placeholder="请选择自定义BU结算价格"
                onChange={value => {
                  // 不自定义BU结算价格时，默认按参考价处理
                  if (value === '0') {
                    setFieldsValue({
                      buSettlePrice: formData.suggestSettlePrice, // 实际BU结算价格
                      settlePrice: div(
                        formData.suggestSettlePrice * 100,
                        add(100, formData.taxRate)
                      ).toFixed(2), // 最终结算单价
                    });
                  }
                }}
                disabled // 让暂时变成 disabled 了
              >
                <Select.Option value="1">是</Select.Option>
                <Select.Option value="0">否</Select.Option>
              </Select>
            </Field>
            <Field
              name="buSettlePrice"
              label="实际BU结算价格"
              decorator={{
                initialValue: formData.buSettlePrice,
                rules: [
                  {
                    required: formData.settlePriceFlag === '1',
                    message: '请计算实际BU结算价格',
                  },
                ],
              }}
            >
              <InputNumber
                className="x-fill-100"
                placeholder="BU结算价"
                precision={2}
                min={0}
                max={999999999999}
                disabled={formData.settlePriceFlag !== '1'}
              />
            </Field>

            <Field
              name="applySettleAmt"
              label="申请结算金额"
              decorator={{
                initialValue: formData.applySettleAmt,
              }}
            >
              <Input disabled style={{ color: 'red' }} />
            </Field>
            <Field
              name="settlePrice"
              label="结算单价/当量工资"
              // decorator={{
              //   initialValue: `${formData.settlePrice || ''} / ${
              //     formData.eqvaSalary ? formData.eqvaSalary : ''
              //   }`,
              // }}
            >
              <Input
                disabled
                style={{ color: 'red' }}
                placeholder={`${formData.settlePrice !== undefined ? formData.settlePrice : ''} / ${
                  formData.eqvaSalary !== undefined ? formData.eqvaSalary : ''
                }`}
                // addonAfter={formData.eqvaSalary ? formData.eqvaSalary : undefined}
              />
            </Field>
            <Field
              name="projCode"
              label="相关项目"
              decorator={{
                initialValue: formData.projCode,
                // rules: [{ required: true, message: '请选择相关项目' }],
              }}
            >
              <AsyncSelect
                source={projectList}
                placeholder="请选择相关项目"
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                onChange={value => {
                  if (!value) setFieldsValue({ taskCode: undefined });
                }}
              />
            </Field>
            <Field
              name="resAmt"
              label="资源当量收入金额"
              decorator={{
                initialValue: formData.resAmt,
              }}
            >
              <Input disabled style={{ color: 'red' }} />
            </Field>
            <Field
              name="taskCode"
              label="相关任务"
              decorator={{
                initialValue: formData.taskCode,
                // rules: [{ required: true, message: '请选择相关任务' }],
              }}
            >
              <AsyncSelect
                key={getGuid()}
                source={taskList}
                placeholder="请选择相关任务"
                disabled={!formData.projId}
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
            <Field
              name="expenseBuId"
              label="支出BU"
              decorator={{
                initialValue: formData.expenseBuId,
                rules: [{ required: true, message: '请选择支出BU' }],
              }}
            >
              <Selection.ColumnsForBu disabled={!!formData.projId} />
            </Field>
            <Field
              name="incomeResId" // incomeResId
              label="收入资源"
              decorator={{
                initialValue: formData.incomeResId,
                // rules: [{ required: true, message: '请选择收入资源' }],
              }}
            >
              <AsyncSelect
                source={resList}
                placeholder="请选择收入资源"
                showSearch
                filterOption={(input, option) =>
                  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Field>
            <Field
              name="resBuId"
              label="收入BU"
              decorator={{
                initialValue: formData.resBuId,
                rules: [{ required: true, message: '请选择收入BU' }],
              }}
            >
              <Selection.ColumnsForBu />
            </Field>
            <Field
              name="remark"
              label="结算说明"
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入结算说明" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DetailCommonCreate;
