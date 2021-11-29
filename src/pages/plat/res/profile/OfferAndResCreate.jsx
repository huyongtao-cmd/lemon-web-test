import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
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
} from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import AsyncSelect from '@/components/common/AsyncSelect';
import SelectWithCols from '@/components/common/SelectWithCols';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { UdcSelect, FileManagerEnhance, Selection } from '@/pages/gen/field';
import { selectInternalOus } from '@/services/gen/list';
import Loading from '@/components/core/DataLoading';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const InputGroup = Input.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const jobInternalColumns = [
  { dataIndex: 'recommNo', title: '编号', span: 8 },
  { dataIndex: 'jobRecomm', title: '名称', span: 16 },
];

const DOMAIN = 'offerAndResCreate';

@connect(({ loading, offerAndResCreate, dispatch }) => ({
  loading,
  offerAndResCreate,
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
class offerAndResCreate extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { resId: id } });

    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });
    dispatch({ type: `${DOMAIN}/oldSaleBu`, payload: { resId: id } }); // 原销售BU
    dispatch({ type: `${DOMAIN}/noSubmit` });
    dispatch({ type: `${DOMAIN}/findJobIsUsed` });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'RES_ARCHIVES_MANAGEMENT_OFFER_APPLY' },
    });
    dispatch({
      type: `${DOMAIN}/typeChange`,
    });
  }

  handleResTypeChange = e => {
    const {
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        baseBuId: undefined,
        baseBuName: undefined,
        buFlag: undefined,
        oldSaleBu: undefined,
      },
    });
    setFieldsValue({
      baseBuId: undefined,
      baseBuName: undefined,
      buFlag: undefined,
      oldSaleBu: undefined,
    });
    if (e.target.value === 'SALES_BU') {
      dispatch({ type: `${DOMAIN}/salesBu` });
    } else if (e.target.value === 'GENERAL') {
      dispatch({ type: `${DOMAIN}/bu` });
    }
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

  renderPage = () => {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      offerAndResCreate: {
        formData,
        resDataSource,
        baseBuDataSource,
        oldSaleBuBuDataSource,
        notSubmitList,
        findJobIsUsedList,
        pageConfig,
        type2,
      },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;

    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const {
      resId = {},
      gender = {},
      resType = {},
      resType1 = {},
      resType2 = {},
      baseBuId = {},
      baseCity = {},
      preEnrollDate = {},
      job = {},
      isJobInternalRecomm = {},
      jobInternalRecommId = {},
      jobGrade = {},
      eqvaRatio = {},
      coopType = {},
      pResId = {},
      remark = {},
      applyResId = {},
      applyDate = {},
      entryType = {},
      buFlag = {},
      oldSaleBu = {},
    } = pageFieldJson;
    let fields = [];
    fields = [
      <Field
        name="resId"
        key="resId"
        label={resId.displayName}
        sortNo={resId.sortNo}
        decorator={{
          initialValue: formData.id || '',
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={notSubmitList}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          disabled
        />
      </Field>,
      <Field
        name="gender"
        key="gender"
        label={gender.displayName}
        sortNo={gender.sortNo}
        decorator={{
          initialValue: formData.gender || '',
          rules: [
            {
              required: !!gender.requiredFlag,
              message: `请选择${gender.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="COM.GENDER" placeholder={`请选择${gender.displayName}`} />
      </Field>,
      <Field
        name="resType"
        key="resType"
        label={resType.displayName}
        sortNo={resType.sortNo}
        decorator={{
          initialValue: formData.resType || 'GENERAL',
          rules: [{ required: !!resType.requiredFlag, message: `请选择${resType.displayName}` }],
        }}
      >
        <RadioGroup
          initialValue={formData.resType || 'GENERAL'}
          onChange={this.handleResTypeChange}
        >
          <Radio value="GENERAL">一般资源</Radio>
          <Radio value="SALES_BU">销售BU</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="baseBuId"
        key="baseBuId"
        label={baseBuId.displayName}
        sortNo={baseBuId.sortNo}
        decorator={{
          initialValue: formData.baseBuId || '',
          rules: [{ required: !!baseBuId.requiredFlag, message: `请选择${baseBuId.displayName}` }],
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
        />
      </Field>,
      <Field
        name="baseCity"
        key="baseCity"
        label={baseCity.displayName}
        sortNo={baseCity.sortNo}
        decorator={{
          initialValue: formData.baseCity && formData.baseCity,
          rules: [{ required: !!baseCity.requiredFlag, message: `请选择${baseCity.displayName}` }],
        }}
      >
        <UdcSelect code="COM.CITY" placeholder={`请选择${baseCity.displayName}`} />
      </Field>,
      <Field
        name="preEnrollDate"
        key="preEnrollDate"
        label={preEnrollDate.displayName}
        sortNo={preEnrollDate.sortNo}
        decorator={{
          initialValue: formData.preEnrollDate ? moment(formData.preEnrollDate) : null,
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="job"
        key="job"
        label={job.displayName}
        sortNo={job.sortNo}
        decorator={{
          initialValue: formData.job || '',
          rules: [
            {
              required: !!job.requiredFlag,
              message: `请输入${job.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${job.displayName}`} />
      </Field>,
      <Field
        name="isJobInternalRecomm"
        key="isJobInternalRecomm"
        sortNo={isJobInternalRecomm.sortNo}
        label={isJobInternalRecomm.displayName}
        decorator={{
          initialValue: formData.isJobInternalRecomm,
          rules: [
            {
              required: !!isJobInternalRecomm.requiredFlag,
              message: `请选择${isJobInternalRecomm.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          initialValue={formData.isJobInternalRecomm}
          onChange={e => {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: { jobInternalRecommId: undefined },
            });
            setFieldsValue({
              jobInternalRecommId: null,
            });
          }}
        >
          <Radio value="YES">是</Radio>
          <Radio value="NO">否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="jobInternalRecommId"
        key="jobInternalRecommId"
        label={jobInternalRecommId.displayName}
        sortNo={jobInternalRecommId.sortNo}
        decorator={{
          initialValue: formData.jobInternalRecommId || undefined,
          rules: [
            {
              required: formData.isJobInternalRecomm === 'YES',
              message: `请选择${jobInternalRecommId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={findJobIsUsedList}
          columns={jobInternalColumns}
          transfer={{
            key: 'jobInternalRecommId',
            code: 'jobInternalRecommId',
            name: 'jobDesc',
          }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${jobInternalRecommId.displayName}`}
          disabled={formData.isJobInternalRecomm !== 'YES'}
        />
      </Field>,
      <FieldLine
        label={resType1.displayName}
        required
        key="resType1"
        sortNo={resType1.sortNo}
        fieldCol={2}
      >
        <Field
          name="resType1"
          decorator={{
            initialValue: formData.resType1 || undefined,
            rules: [
              {
                required: !!resType1.requiredFlag,
                message: `请选择${resType1.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 24 }}
        >
          <Selection.UDC
            code="RES:RES_TYPE1"
            placeholder={`请选择${resType1.displayName}`}
            disabled
          />
        </Field>
        <Field
          name="resType2"
          decorator={{
            initialValue: formData.resType2 || undefined,
            rules: [
              {
                required: !!resType2.requiredFlag,
                message: `请选择${resType2.displayName}`,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 24 }}
        >
          <Selection source={type2} placeholder={`请选择${resType2.displayName}`} />
        </Field>
      </FieldLine>,
      <Field
        name="entryType"
        key="entryType"
        label={entryType.displayName}
        sortNo={entryType.sortNo}
        decorator={{
          initialValue: formData.entryType,
          rules: [
            {
              required: !!entryType.requiredFlag,
              message: `请选择${entryType.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="RES:ENTRY_LEAVE_TYPE"
          placeholder={`请选择${entryType.displayName}`}
          disabled={formData.resStatus === 1}
          filters={[{ sphd1: 'ENTRY_INTERNAL' }]}
          onChange={value => {
            if (value !== 'AGAIN_INDUCTION' || value !== 'EXTERNAL_TO_INTERNAL') {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  buFlag: undefined,
                  oldSaleBu: undefined,
                },
              });
              setFieldsValue({ buFlag: undefined, oldSaleBu: undefined });
            }
          }}
        />
      </Field>,
      <Field
        name="buFlag"
        key="buFlag"
        sortNo={buFlag.sortNo}
        label={buFlag.displayName}
        decorator={{
          initialValue: formData.buFlag,
          rules: [
            {
              required:
                formData.resType === 'SALES_BU' &&
                (formData.entryType === 'AGAIN_INDUCTION' ||
                  formData.entryType === 'EXTERNAL_TO_INTERNAL'),
              message: `请选择${buFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          initialValue={formData.buFlag}
          disabled={
            !(
              formData.resType === 'SALES_BU' &&
              (formData.entryType === 'AGAIN_INDUCTION' ||
                formData.entryType === 'EXTERNAL_TO_INTERNAL')
            )
          }
          onChange={e => {
            if (e.target.value === 'NO') {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  oldSaleBu: undefined,
                },
              });
              setFieldsValue({ oldSaleBu: undefined });
            }
          }}
        >
          <Radio value="YES">是</Radio>
          <Radio value="NO">否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="oldSaleBu"
        key="oldSaleBu"
        label={oldSaleBu.displayName}
        sortNo={oldSaleBu.sortNo}
        decorator={{
          initialValue: formData.oldSaleBu || '',
          rules: [
            { required: formData.buFlag === 'YES', message: `请选择${oldSaleBu.displayName}` },
          ],
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={oldSaleBuBuDataSource}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          disabled={formData.buFlag !== 'YES'}
        />
      </Field>,
      <Field
        name="jobGrade"
        key="jobGrade"
        label={jobGrade.displayName}
        sortNo={jobGrade.sortNo}
        decorator={{
          initialValue: formData.jobGrade,
        }}
      >
        <Input placeholder={`请输入${jobGrade.displayName}`} />
      </Field>,
      // <Field
      //   name="eqvaRatio"
      //   key="eqvaRatio"
      //   label={eqvaRatio.displayName}
      //   sortNo={eqvaRatio.sortNo}
      //   decorator={{
      //     initialValue: formData.eqvaRatio,
      //     rules: [
      //       {
      //         required: !!eqvaRatio.requiredFlag,
      //         message: `请输入${eqvaRatio.displayName}`,
      //       },
      //     ],
      //   }}
      // >
      //   <InputNumber
      //     className="x-fill-100"
      //     placeholder={`请输入${eqvaRatio.displayName}`}
      //     precision={1}
      //     min={0}
      //     max={999999999999}
      //   />
      // </Field>,
      <Field
        name="coopType"
        key="coopType"
        label={coopType.displayName}
        sortNo={coopType.sortNo}
        decorator={{
          initialValue: formData.coopType,
          rules: [
            {
              required: !!coopType.requiredFlag,
              message: `请选择${coopType.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="COM.COOPERATION_MODE" placeholder={`请选择${coopType.displayName}`} />
      </Field>,
      <Field
        name="presId"
        key="pResId"
        label={pResId.displayName}
        sortNo={pResId.sortNo}
        decorator={{
          initialValue: formData.presId || '',
          rules: [
            {
              required: !!pResId.requiredFlag,
              message: `请选择${pResId.displayName}`,
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
        />
      </Field>,
      <Field name="artThumb" label="简历附件">
        <FileManagerEnhance
          api="/api/person/v1/res/personResume/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,
      <Field
        name="remark"
        key="remark"
        label={remark.displayName}
        sortNo={remark.sortNo}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
        decorator={{
          initialValue: formData.remark || '',
          rules: [
            {
              required: !!remark.requiredFlag,
              message: `请输入${remark.displayName}`,
            },
          ],
        }}
      >
        <Input.TextArea rows={3} placeholder={`请输入${remark.displayName}`} />
      </Field>,
      <Field
        name="applyResId"
        key="applyResId"
        label={applyResId.displayName}
        sortNo={applyResId.sortNo}
        decorator={{
          initialValue: formData.applyResName || '',
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="applyDate"
        key="applyDate"
        label={applyDate.displayName}
        sortNo={applyDate.sortNo}
        decorator={{
          initialValue: formData.applyDate || '',
        }}
      >
        <Input disabled />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      offerAndResCreate: {
        formData,
        resDataSource,
        baseBuDataSource,
        notSubmitList,
        findJobIsUsedList,
        pageConfig,
      },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/noSubmit`];
    const sunmitBtn = loading.effects[`${DOMAIN}/submit`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={sunmitBtn || disabledBtn}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/res/profile/list')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="资源入职申请" />}
          bordered={false}
        >
          {loading.effects[`${DOMAIN}/getPageConfig`] ? <Loading /> : this.renderPage()}
          {/* <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="资源"
              decorator={{
                initialValue: formData.id || '',
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={notSubmitList}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                disabled
              />
            </Field>
            <Field
              name="gender"
              label="性别"
              decorator={{
                initialValue: formData.gender || '',
                rules: [
                  {
                    required: true,
                    message: '请选择性别',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.GENDER" placeholder="请选择性别" />
            </Field>
            <Field
              name="resType"
              label="资源类别"
              decorator={{
                initialValue: formData.resType || 'GENERAL',
                rules: [{ required: true, message: '请选择资源类别' }],
              }}
            >
              <RadioGroup
                initialValue={formData.resType || 'GENERAL'}
                onChange={this.handleResTypeChange}
              >
                <Radio value="GENERAL">一般资源</Radio>
                <Radio value="SALES_BU">销售BU</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="baseBuId"
              label="BaseBU"
              decorator={{
                initialValue: formData.baseBuId || '',
                rules: [{ required: true, message: '请选择BaseBU' }],
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
              />
            </Field>
            <Field
              name="baseCity"
              label="Base地"
              decorator={{
                initialValue: formData.baseCity && formData.baseCity,
                rules: [{ required: true, message: '请选择Base地' }],
              }}
            >
              <UdcSelect code="COM.CITY" placeholder="请选择Base地" />
            </Field>
            <Field
              name="preEnrollDate"
              label="预定入职日期"
              decorator={{
                initialValue: formData.preEnrollDate ? moment(formData.preEnrollDate) : null,
              }}
            >
              <DatePicker className="x-fill-100" />
            </Field>
            <Field
              name="job"
              label="岗位"
              decorator={{
                initialValue: formData.job || '',
                rules: [
                  {
                    required: true,
                    message: '请输入岗位',
                  },
                ],
              }}
            >
              <Input placeholder="请输入岗位" />
            </Field>
            <Field
              name="isJobInternalRecomm"
              IS_JOB_INTERNAL_RECOMM
              label="是否内部推荐资源"
              decorator={{
                initialValue: formData.isJobInternalRecomm,
                rules: [{ required: true, message: '请选择是否内部推荐资源' }],
              }}
            >
              <RadioGroup
                initialValue={formData.isJobInternalRecomm}
                onChange={e => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { jobInternalRecommId: undefined },
                  });
                  setFieldsValue({
                    jobInternalRecommId: null,
                  });
                }}
              >
                <Radio value="YES">是</Radio>
                <Radio value="NO">否</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="jobInternalRecommId"
              label="内部推荐"
              decorator={{
                initialValue: formData.jobInternalRecommId || undefined,
                rules: [
                  { required: formData.isJobInternalRecomm === 'YES', message: '请选择内部推荐' },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={findJobIsUsedList}
                columns={jobInternalColumns}
                transfer={{
                  key: 'jobInternalRecommId',
                  code: 'jobInternalRecommId',
                  name: 'jobDesc',
                }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                placeholder="请选择内部推荐"
                disabled={formData.isJobInternalRecomm !== 'YES'}
              />
            </Field>
            <Field
              name="jobGrade"
              label="职级"
              decorator={{
                initialValue: formData.jobGrade,
              }}
            >
              <Input placeholder="请输入职级" />
            </Field>
            <Field
              name="eqvaRatio"
              label="当量系数"
              decorator={{
                initialValue: formData.eqvaRatio,
              }}
            >
              <InputNumber
                className="x-fill-100"
                placeholder="请输入当量系数"
                precision={1}
                min={0}
                max={999999999999}
              />
            </Field>
            <Field
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: formData.coopType,
              }}
            >
              <UdcSelect code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />
            </Field>
            <Field
              name="presId"
              label="直属领导"
              decorator={{
                initialValue: formData.presId || '',
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
              />
            </Field>
            <Field name="artThumb" label="简历附件">
              <FileManagerEnhance
                api="/api/person/v1/res/personResume/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
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
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请时间"
              decorator={{
                initialValue: formData.applyDate || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList> */}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default offerAndResCreate;
