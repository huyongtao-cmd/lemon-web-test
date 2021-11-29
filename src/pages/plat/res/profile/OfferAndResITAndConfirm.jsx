import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import moment from 'moment';
import { isEmpty, isNil, hasIn } from 'ramda';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Radio,
  TimePicker,
  InputNumber,
  Select,
  Switch,
} from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import OfferAndResView from './OfferAndResView';
import { formatMessage } from 'umi/locale';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { pushFlowTask } from '@/services/gen/flow';
import { stringify } from 'qs';
import { selectInternalOus } from '@/services/gen/list';
import { getUrl } from '@/utils/flowToRouter';
import createMessage from '@/components/core/AlertMessage';
import { formatDT } from '@/utils/tempUtils/DateTime';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'offerAndResFlow';

@connect(({ loading, offerAndResFlow, dispatch }) => ({
  loading,
  offerAndResFlow,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class OfferAndResITAndConfirm extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();

    id && dispatch({ type: `${DOMAIN}/query`, payload: { resId: id } });

    dispatch({
      type: `${DOMAIN}/entryItemList`,
      payload: {
        twofferId: id,
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
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/noSubmit` });
    dispatch({
      type: `${DOMAIN}/typeChange`,
    });
  }

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      offerAndResFlow: { dataSource },
      dispatch,
    } = this.props;

    const newDataSource = dataSource;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { validateFieldsAndScroll, getFieldDecorator, setFieldsValue, getFieldValue },
      offerAndResFlow: {
        formData,
        resDataSource,
        baseBuDataSource,
        notSubmitList,
        fieldsConfig,
        dataSource,
        type2,
      },
      nowTitle,
    } = this.props;

    // loading完成之前将按钮设为禁用
    const {
      panels: { disabledOrHidden },
    } = fieldsConfig;
    const {
      enrollDate,
      regularDate,
      contractSignDate,
      contractExpireDate,
      probationBeginDate,
      probationEndDate,
    } = formData;

    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      dataSource,
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      rowSelection: {
        getCheckboxProps: (rowKey, rows) => {
          if (rowKey.checkNethod === 'AUTO') {
            return false;
          }
          return true;
        },
      },
      enableDoubleClick: false,
      columns: [
        {
          title: '检查方式',
          align: 'center',
          dataIndex: '',
          width: '10%',
          render: (value, row, index) => {
            if (row.checkNethod === 'AUTO') {
              return '系统自动检查';
            }
            return '人工检查';
          },
        },
        {
          title: '检查事项',
          align: 'center',
          width: '15%',
          dataIndex: 'chkItemName',
        },
        {
          title: '检查说明',
          width: '30%',
          dataIndex: 'chkDesc',
          render: val => <pre>{val}</pre>,
        },
        {
          title: '完成状态',
          width: '15%',
          dataIndex: 'finishStatus',
          align: 'center',
          render: (val, row, index) => (
            <Switch
              checkedChildren="已完成"
              unCheckedChildren="未处理"
              checked={val === '已完成'}
              onChange={bool => {
                const parmas = bool ? '已完成' : '未处理';
                this.onCellChanged(index, parmas, 'finishStatus');
              }}
            />
          ),
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '30%',
          render: (value, row, index) => (
            <Input.TextArea
              autosize={{ minRows: 1, maxRows: 3 }}
              className="x-fill-100"
              value={row.remark || ''}
              onChange={e => {
                this.onCellChanged(index, e.target.value, 'remark');
              }}
            />
          ),
        },
      ],
    };

    return (
      <>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title
              icon="profile"
              id={nowTitle || 'ui.menu.plat.res.OfferApply'}
              defaultMessage="Offer发放申请"
            />
          }
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            {hasIn('resId', disabledOrHidden) && (
              <Field
                name="resId"
                label="资源"
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
                  initialValue: formData.gender || 'M',
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
            {/* {hasIn('resId', disabledOrHidden) && (
              <Field
                name="resType1"
                key="resType1"
                label="资源类型一"
                decorator={{
                  initialValue: formData.resType1 || undefined,
                }}
              >
                <Selection.UDC code="RES:RES_TYPE1" placeholder="请选择资源类型一" disabled />
              </Field>
            )}
            {hasIn('resId', disabledOrHidden) && (
              <Field
                name="resType2"
                key="resType2"
                label="资源类型二"
                decorator={{
                  initialValue: formData.resType2 || undefined,
                }}
              >
                <Selection source={type2} placeholder="请选择资源类型二" disabled />
              </Field>
            )} */}
            {hasIn('foreignName', disabledOrHidden) && (
              <Field
                name="foreignName"
                label="英文名"
                decorator={{
                  initialValue: formData.foreignName || '',
                  rules: [
                    {
                      required: !disabledOrHidden.foreignName && true,
                      message: '请输入英文名',
                    },
                  ],
                }}
              >
                <Input disabled={!!disabledOrHidden.foreignName} placeholder="请输入英文名" />
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
            {hasIn('idType', disabledOrHidden) && (
              <Field
                name="idType"
                label="证件类型"
                decorator={{
                  initialValue: formData.idType,
                  rules: [
                    {
                      required: !disabledOrHidden.idType && true,
                      message: '请选择证件类型',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  code="COM.ID_TYPE"
                  placeholder="请选择证件类型"
                  style={{ flex: 1 }}
                  disabled={!!disabledOrHidden.idType}
                />
              </Field>
            )}

            {hasIn('idType', disabledOrHidden) && (
              <Field
                name="idNo"
                label="证件号码"
                decorator={{
                  initialValue: formData.idNo,
                  rules: [
                    {
                      required: !disabledOrHidden.idType && true,
                      message: '请输入证件号码',
                    },
                  ],
                }}
              >
                <Input
                  style={{ flex: 3 }}
                  disabled={!!disabledOrHidden.idType}
                  placeholder="请输入证件号码"
                />
              </Field>
            )}
            {hasIn('birthday', disabledOrHidden) && (
              <Field
                name="birthday"
                label="出生日期"
                decorator={{
                  initialValue: formData.birthday ? moment(formData.birthday) : null,
                  rules: [
                    {
                      required: !disabledOrHidden.birthday && true,
                      message: '请选择出生日期',
                    },
                  ],
                }}
              >
                <DatePicker disabled={!!disabledOrHidden.birthday} className="x-fill-100" />
              </Field>
            )}
            {hasIn('baseBuId', disabledOrHidden) && (
              <Field
                name="baseBuId"
                label="BaseBU"
                decorator={{
                  initialValue: formData.baseBuId || '',
                  rules: [
                    { required: !disabledOrHidden.baseBuId && true, message: '请选择BaseBU' },
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
            {hasIn('baseCity', disabledOrHidden) && (
              <Field
                name="baseCity"
                label="Base地"
                decorator={{
                  initialValue: formData.baseCity && formData.baseCity,
                  rules: [
                    { required: !disabledOrHidden.baseCity && true, message: '请选择Base地' },
                  ],
                }}
              >
                <UdcSelect
                  disabled={!!disabledOrHidden.baseCity}
                  code="COM.CITY"
                  placeholder="请选择Base地"
                />
              </Field>
            )}
            {hasIn('job', disabledOrHidden) && (
              <Field
                name="job"
                label="岗位"
                decorator={{
                  initialValue: formData.job || '',
                  rules: [
                    {
                      required: !disabledOrHidden.job && true,
                      message: '请输入岗位',
                    },
                  ],
                }}
              >
                <Input disabled={!!disabledOrHidden.job} placeholder="请输入岗位" />
              </Field>
            )}

            {hasIn('resId', disabledOrHidden) && (
              <FieldLine
                label="资源类型"
                key="resType1"
                fieldCol={2}
                required={!disabledOrHidden.resId && true}
              >
                <Field
                  name="resType1"
                  key="resType1"
                  decorator={{
                    initialValue: formData.resType1 || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.resId && true,
                        message: '请选择资源类型一',
                      },
                    ],
                  }}
                  wrapperCol={{ span: 23, xxl: 24 }}
                >
                  <Selection.UDC code="RES:RES_TYPE1" placeholder="请选择资源类型一" disabled />
                </Field>
                <Field
                  name="resType2"
                  key="resType2"
                  decorator={{
                    initialValue: formData.resType2 || undefined,
                    rules: [
                      {
                        required: !disabledOrHidden.resId && true,
                        message: '请选择资源类型二',
                      },
                    ],
                  }}
                  wrapperCol={{ span: 23, xxl: 24 }}
                >
                  <Selection
                    source={type2}
                    placeholder="请选择资源类型二"
                    disabled={!!disabledOrHidden.resId}
                  />
                </Field>
              </FieldLine>
            )}
            {hasIn('entryType', disabledOrHidden) && (
              <Field
                name="entryType"
                key="entryType"
                label="入职类型"
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
                  disabled={!!disabledOrHidden.entryType}
                  filters={[{ sphd1: 'ENTRY_INTERNAL' }]}
                />
              </Field>
            )}
            {hasIn('buFlag', disabledOrHidden) && (
              <Field
                name="buFlag"
                key="buFlag"
                label="是否延用原销售BU"
                decorator={{
                  initialValue: formData.buFlag,
                }}
              >
                <RadioGroup initialValue={formData.buFlag} disabled>
                  <Radio value="YES">是</Radio>
                  <Radio value="NO">否</Radio>
                </RadioGroup>
              </Field>
            )}

            {hasIn('oldSaleBu', disabledOrHidden) && (
              <Field
                name="oldSaleBu"
                key="oldSaleBu"
                label="原销售BU"
                decorator={{
                  initialValue: formData.oldSaleBu || '',
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
                  disabled
                />
              </Field>
            )}

            {hasIn('jobGrade', disabledOrHidden) && (
              <Field
                name="jobGrade"
                label="职级"
                decorator={{
                  initialValue: formData.jobGrade,
                  rules: [{ required: !disabledOrHidden.jobGrade && true, message: '请输入职级' }],
                }}
              >
                <Input disabled={!!disabledOrHidden.jobGrade} placeholder="请输入职级" />
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
            {hasIn('presId', disabledOrHidden) && (
              <Field
                name="presId"
                label="直属领导"
                decorator={{
                  initialValue: formData.presId || '',
                  rules: [
                    {
                      required: !disabledOrHidden.presId && true,
                      message: '请选择直属领导',
                    },
                  ],
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
                  disabled={!!disabledOrHidden.presId}
                />
              </Field>
            )}
            {hasIn('inLieuFlag', disabledOrHidden) && (
              <Field
                name="inLieuFlag"
                label="无加班人员"
                decorator={{
                  initialValue: formData.inLieuFlag,
                  rules: [
                    {
                      required: !disabledOrHidden.inLieuFlag && true,
                      message: '请选择是否无加班人员',
                    },
                  ],
                }}
              >
                <RadioGroup
                  disabled={!!disabledOrHidden.inLieuFlag}
                  initialValue={formData.inLieuFlag || ''}
                >
                  <Radio value="NO">是</Radio>
                  <Radio value="YES">否</Radio>
                </RadioGroup>
              </Field>
            )}
            {hasIn('busiTrainFlag', disabledOrHidden) && (
              <Field
                name="busiTrainFlag"
                label="参加商务基本资质培训"
                decorator={{
                  initialValue: formData.busiTrainFlag,
                  rules: [
                    {
                      required: !disabledOrHidden.busiTrainFlag && true,
                      message: '参加商务基本资质培训',
                    },
                  ],
                }}
                labelCol={{ span: 8, xxl: 8 }}
              >
                <RadioGroup
                  disabled={!!disabledOrHidden.busiTrainFlag}
                  initialValue={formData.busiTrainFlag || ''}
                >
                  <Radio value="YES">是</Radio>
                  <Radio value="NO">否</Radio>
                </RadioGroup>
              </Field>
            )}
            {hasIn('accessLevel', disabledOrHidden) && (
              <Field
                name="accessLevel"
                label="安全级别"
                decorator={{
                  initialValue: formData.accessLevel || '10',
                  rules: [
                    {
                      required: false,
                      message: '请输入安全级别',
                    },
                    {
                      pattern: /^([1-9][0-9]{0,1}|100)$/,
                      message: '安全级别可输入值1-100',
                    },
                  ],
                }}
              >
                <InputNumber
                  disabled={!!disabledOrHidden.accessLevel}
                  placeholder="请输入安全级别"
                  className="x-fill-100"
                />
              </Field>
            )}
            {hasIn('ouId', disabledOrHidden) && (
              <Field
                name="ouId"
                label="所属公司"
                decorator={{
                  initialValue: formData.ouId || '',
                  rules: [{ required: !disabledOrHidden.ouId && true, message: '请选择所属公司' }],
                }}
              >
                <AsyncSelect
                  source={() => selectInternalOus().then(resp => resp.response)}
                  placeholder="请选择所属公司"
                  disabled={!!disabledOrHidden.ouId}
                />
              </Field>
            )}
            {hasIn('empNo', disabledOrHidden) && (
              <Field
                name="empNo"
                label="工号"
                decorator={{
                  initialValue: formData.empNo,
                  rules: [
                    {
                      required: !disabledOrHidden.empNo && true,
                      message: '请输入工号',
                    },
                  ],
                }}
              >
                <Input disabled={!!disabledOrHidden.empNo} placeholder="请输入工号" />
              </Field>
            )}
            {formData.resType2 !== '5'
              ? hasIn('enrollDate', disabledOrHidden) && (
                  // eslint-disable-next-line react/jsx-indent
                  <Field
                    name="enrollDate"
                    label="入职日期"
                    decorator={{
                      initialValue: formData.enrollDate ? moment(formData.enrollDate) : null,
                      rules: [
                        {
                          required: !disabledOrHidden.enrollDate && formData.deliverOffer === 'YES',
                          message: '请选择入职日期',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              isNil(value) ||
                              isEmpty(value) ||
                              isNil(regularDate) ||
                              isEmpty(regularDate)
                            )
                              return callback();
                            const timeCheck = moment(formatDT(value)).isSameOrBefore(
                              formatDT(regularDate)
                            );
                            if (!timeCheck) {
                              return callback(['入职日期不能大于转正日期']);
                            }
                            return callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      disabled={!!disabledOrHidden.enrollDate}
                      className="x-fill-100"
                      format="YYYY-MM-DD"
                    />
                  </Field>
                )
              : null}

            {formData.resType2 !== '5'
              ? hasIn('regularDate', disabledOrHidden) && (
                  // eslint-disable-next-line react/jsx-indent
                  <Field
                    name="regularDate"
                    label="转正日期"
                    decorator={{
                      initialValue: formData.regularDate ? moment(formData.regularDate) : null,
                      rules: [
                        {
                          required:
                            !disabledOrHidden.regularDate && formData.deliverOffer === 'YES',
                          message: '请选择转正日期',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              isNil(value) ||
                              isEmpty(value) ||
                              isNil(enrollDate) ||
                              isEmpty(enrollDate)
                            )
                              return callback();
                            const timeCheck = moment(formatDT(value)).isSameOrAfter(
                              formatDT(enrollDate)
                            );
                            if (!timeCheck) {
                              return callback(['转正日期不能小于入职日期']);
                            }
                            return callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      disabled={!!disabledOrHidden.regularDate}
                      className="x-fill-100"
                      format="YYYY-MM-DD"
                    />
                  </Field>
                )
              : null}
            {formData.resType2 !== '5'
              ? hasIn('contractSignDate', disabledOrHidden) && (
                  // eslint-disable-next-line react/jsx-indent
                  <Field
                    name="contractSignDate"
                    label="合同签订日期"
                    decorator={{
                      initialValue: formData.contractSignDate
                        ? moment(formData.contractSignDate)
                        : null,
                      rules: [
                        {
                          required:
                            !disabledOrHidden.contractSignDate && formData.deliverOffer === 'YES',
                          message: '请选择合同签订日期',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              isNil(value) ||
                              isEmpty(value) ||
                              isNil(contractExpireDate) ||
                              isEmpty(contractExpireDate)
                            )
                              return callback();
                            const timeCheck = moment(formatDT(value)).isSameOrBefore(
                              formatDT(contractExpireDate)
                            );
                            if (!timeCheck) {
                              return callback(['合同签订日期不能大于合同到期日期']);
                            }
                            return callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      disabled={!!disabledOrHidden.contractSignDate}
                      className="x-fill-100"
                    />
                  </Field>
                )
              : null}
            {formData.resType2 !== '5'
              ? hasIn('contractExpireDate', disabledOrHidden) && (
                  // eslint-disable-next-line react/jsx-indent
                  <Field
                    name="contractExpireDate"
                    label="合同到期日期"
                    decorator={{
                      initialValue: formData.contractExpireDate
                        ? moment(formData.contractExpireDate)
                        : null,
                      rules: [
                        {
                          required:
                            !disabledOrHidden.contractExpireDate && formData.deliverOffer === 'YES',
                          message: '请选择合同到期日期',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              isNil(value) ||
                              isEmpty(value) ||
                              isNil(contractSignDate) ||
                              isEmpty(contractSignDate)
                            )
                              return callback();
                            const timeCheck = moment(formatDT(value)).isSameOrAfter(
                              formatDT(contractSignDate)
                            );
                            if (!timeCheck) {
                              return callback(['合同到期日期不能小于合同签订日期']);
                            }
                            return callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      disabled={!!disabledOrHidden.contractExpireDate}
                      className="x-fill-100"
                    />
                  </Field>
                )
              : null}
            {formData.resType2 !== '5'
              ? hasIn('probationBeginDate', disabledOrHidden) && (
                  // eslint-disable-next-line react/jsx-indent
                  <Field
                    name="probationBeginDate"
                    label="试用期开始日期"
                    decorator={{
                      initialValue: formData.probationBeginDate
                        ? moment(formData.probationBeginDate)
                        : null,
                      rules: [
                        {
                          required:
                            !disabledOrHidden.probationBeginDate && formData.deliverOffer === 'YES',
                          message: '请选择试用期开始日期',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              isNil(value) ||
                              isEmpty(value) ||
                              isNil(probationEndDate) ||
                              isEmpty(probationEndDate)
                            )
                              return callback();
                            const timeCheck = moment(formatDT(value)).isSameOrBefore(
                              formatDT(probationEndDate)
                            );
                            if (!timeCheck) {
                              return callback(['试用期开始日期不能大于试用期结束日期']);
                            }
                            return callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      disabled={!!disabledOrHidden.probationBeginDate}
                      className="x-fill-100"
                    />
                  </Field>
                )
              : null}
            {formData.resType2 !== '5'
              ? hasIn('probationEndDate', disabledOrHidden) && (
                  // eslint-disable-next-line react/jsx-indent
                  <Field
                    name="probationEndDate"
                    label="试用期结束日期"
                    decorator={{
                      initialValue: formData.probationEndDate
                        ? moment(formData.probationEndDate)
                        : null,
                      rules: [
                        {
                          required:
                            !disabledOrHidden.probationEndDate && formData.deliverOffer === 'YES',
                          message: '请选择试用期结束日期',
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (
                              isNil(value) ||
                              isEmpty(value) ||
                              isNil(probationBeginDate) ||
                              isEmpty(probationBeginDate)
                            )
                              return callback();
                            const timeCheck = moment(formatDT(value)).isSameOrAfter(
                              formatDT(probationBeginDate)
                            );
                            if (!timeCheck) {
                              return callback(['试用期结束日期不能小于试用期开始日期']);
                            }
                            return callback();
                          },
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      disabled={!!disabledOrHidden.probationEndDate}
                      className="x-fill-100"
                    />
                  </Field>
                )
              : null}
            {hasIn('telfeeQuota', disabledOrHidden) && (
              <Field
                name="telfeeQuota"
                label="话费额度"
                decorator={{
                  initialValue: formData.telfeeQuota || '',
                  rules: [
                    {
                      required: !disabledOrHidden.telfeeQuota && true,
                      message: '请输入话费额度',
                    },
                  ],
                }}
              >
                <Input disabled={!!disabledOrHidden.telfeeQuota} placeholder="请输入话费额度" />
              </Field>
            )}
            {hasIn('compfeeQuota', disabledOrHidden) && (
              <Field
                name="compfeeQuota"
                label="电脑额度"
                decorator={{
                  initialValue: formData.compfeeQuota || '',
                  rules: [
                    {
                      required: !disabledOrHidden.compfeeQuota && true,
                      message: '请输入电脑额度',
                    },
                  ],
                }}
              >
                <Input disabled={!!disabledOrHidden.compfeeQuota} placeholder="请输入电脑额度" />
              </Field>
            )}
            {formData.resType2 === '5'
              ? hasIn('internDate', disabledOrHidden) && (
                  // eslint-disable-next-line react/jsx-indent
                  <Field
                    name="internDate"
                    label="实习入职时间"
                    decorator={{
                      initialValue: formData.internDate ? moment(formData.internDate) : null,
                      rules: [
                        {
                          required:
                            !disabledOrHidden.internDate &&
                            formData.resType2 === '5' &&
                            formData.deliverOffer === 'YES',
                          message: '请选择实习入职时间',
                        },
                      ],
                    }}
                  >
                    <DatePicker
                      disabled={!!disabledOrHidden.internDate}
                      className="x-fill-100"
                      format="YYYY-MM-DD"
                    />
                  </Field>
                )
              : null}
            {hasIn('emailAddr', disabledOrHidden) && (
              <Field
                name="emailAddr"
                label="邮箱"
                decorator={{
                  initialValue: formData.emailAddr || `${formData.foreignName}@elitesland.com`,
                  rules: [
                    {
                      required: !disabledOrHidden.emailAddr && true,
                      message: '请输入邮箱',
                    },
                    {
                      type: 'email',
                      message: '请输入正确格式邮箱',
                    },
                  ],
                }}
              >
                <Input
                  disabled={!!disabledOrHidden.emailAddr}
                  type="email"
                  placeholder="请输入邮箱"
                />
              </Field>
            )}
            {hasIn('password', disabledOrHidden) && (
              <Field
                name="password"
                label="初始密码"
                decorator={{
                  initialValue: formData.password || 'password',
                  rules: [
                    {
                      required: !disabledOrHidden.password && true,
                      message: '请输入初始密码',
                    },
                  ],
                }}
              >
                <Input
                  disabled={!!disabledOrHidden.password}
                  placeholder="请输入初始密码"
                  className="x-fill-100"
                />
              </Field>
            )}
          </FieldList>
        </Card>
        {hasIn('entryItem', disabledOrHidden) && (
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title="入职事项办理"
            bordered={false}
          >
            <FieldList>
              <DataTable {...tableProps} scroll={{ y: 480 }} />
            </FieldList>
          </Card>
        )}
      </>
    );
  }
}

export default OfferAndResITAndConfirm;
