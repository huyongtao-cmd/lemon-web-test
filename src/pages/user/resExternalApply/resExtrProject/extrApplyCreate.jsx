import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, InputNumber, Radio } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, UdcSelect, FileManagerEnhance } from '@/pages/gen/field';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import { selectUsersWithBu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import Loading from '@/components/core/DataLoading';

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

const DOMAIN = 'extrApplyCreate';

@connect(({ loading, extrApplyCreate, dispatch, user, userProject }) => ({
  loading,
  extrApplyCreate,
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
class ExtrApplyCreate extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { resId: id } }).then(res => {
      const {
        extrApplyCreate: { formData },
      } = this.props;
      formData.jobClass1 &&
        dispatch({
          type: `${DOMAIN}/updateListType2`,
          payload: formData.jobClass1,
        });

      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'RES_ARCHIVES_MANAGEMENT_EXTERNAL_APPLY' },
      });
      dispatch({
        type: `${DOMAIN}/typeChange`,
      });
      // 获取复合能力
      dispatch({
        type: `${DOMAIN}/getCapaSetList`,
      });
    });
  }

  handleSubmit = submit => {
    const {
      form: { validateFieldsAndScroll },
      userProject: { searchForm },
      extrApplyCreate: { selfChkList },
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

  // 工种分类一 -> 工种分类二
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

  renderPage = () => {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      extrApplyCreate: { formData, pageConfig, type2, jobClass2, capaSetList },
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
    let fields = [];
    fields = [
      <Field
        name="resId"
        key="resId"
        label={pageFieldJson.resId.displayName}
        decorator={{
          initialValue: formData.resName || '',
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'capaSetName' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${pageFieldJson.resId.displayName}`}
          disabled
        />
      </Field>,
      <Field
        name="gender"
        key="gender"
        label={pageFieldJson.gender.displayName}
        decorator={{
          initialValue: formData.gender || '',
          rules: [
            {
              message: `请选择${pageFieldJson.gender.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="COM.GENDER"
          placeholder={`请选择${pageFieldJson.gender.displayName}`}
        />
      </Field>,
      <Field
        name="mobile"
        key="mobile"
        label={pageFieldJson.mobile.displayName}
        decorator={{
          initialValue: formData.mobile || undefined,
        }}
      >
        <Input placeholder="系统自动生成" disabled />
      </Field>,
      <FieldLine label={pageFieldJson.resType.displayName} required key="resType">
        <Field
          name="resType1"
          key="resType1"
          decorator={{
            initialValue: formData.resType1 || undefined,
            rules: [{ message: '外部资源', required: !!pageFieldJson.resType1.requiredFlag }],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Selection.UDC
            code="RES:RES_TYPE1"
            placeholder={`${pageFieldJson.resType1.displayName}`}
            disabled
          />
        </Field>
        <Field
          name="resType2"
          key="resType2"
          decorator={{
            initialValue: formData.resType2 || undefined,
            rules: [
              {
                message: `请选择${pageFieldJson.resType2.displayName}`,
                required: !!pageFieldJson.resType2.requiredFlag,
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Selection source={type2} placeholder={`请选择${pageFieldJson.resType2.displayName}`} />
        </Field>
      </FieldLine>,
      <Field
        name="baseBuId"
        key="baseBuId"
        label={pageFieldJson.baseBuId.displayName}
        decorator={{
          initialValue: formData.baseBuId || '',
          rules: [
            {
              required: !!pageFieldJson.baseBuId.requiredFlag,
              message: `请选择${pageFieldJson.baseBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          columns={SEL_COL}
          source={() => selectBuMultiCol()}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: 440 }}
          showSearch
        />
      </Field>,
      <Field
        name="presId"
        key="pResId"
        label={pageFieldJson.pResId.displayName}
        decorator={{
          initialValue: formData.presId || undefined,
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
          placeholder={`请选择${pageFieldJson.pResId.displayName}`}
        />
      </Field>,
      <Field
        name="coopType"
        key="coopType"
        label={pageFieldJson.coopType.displayName}
        decorator={{
          initialValue: formData.coopType,
        }}
      >
        <Selection.UDC
          code="COM.COOPERATION_MODE"
          placeholder={`请选择${pageFieldJson.coopType.displayName}`}
        />
      </Field>,
      <Field
        name="eqvaRatio"
        key="eqvaRatio"
        label={pageFieldJson.eqvaRatio.displayName}
        decorator={{
          initialValue: formData.eqvaRatio,
        }}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          placeholder={`请选择${pageFieldJson.eqvaRatio.displayName}`}
        />
      </Field>,
      <Field
        name="emailFlag"
        key="emailFlag"
        label={pageFieldJson.emailFlag.displayName}
        decorator={{
          initialValue: formData.emailFlag,
          rules: [
            {
              required: !!pageFieldJson.emailFlag.requiredFlag,
              message: `请选择是否${pageFieldJson.emailFlag.displayName}`,
            },
          ],
        }}
      >
        <Radio.Group>
          <Radio value="1">是</Radio>
          <Radio value="0">否</Radio>
        </Radio.Group>
      </Field>,
      <Field
        name="elpFlag"
        key="elpFlag"
        label={pageFieldJson.elpFlag.displayName}
        style={{ letterSpacing: '-1px' }}
        decorator={{
          initialValue: formData.elpFlag,
          rules: [
            {
              required: !!pageFieldJson.elpFlag.requiredFlag,
              message: `请选择是否${pageFieldJson.elpFlag.displayName}`,
            },
          ],
        }}
      >
        <Radio.Group>
          <Radio value="1">是</Radio>
          <Radio value="0">否</Radio>
        </Radio.Group>
      </Field>,
      <Field
        name="entryType"
        key="entryType"
        label={pageFieldJson.entryType.displayName}
        sortNo={pageFieldJson.entryType.sortNo}
        decorator={{
          initialValue: formData.entryType,
          rules: [
            {
              required: !!pageFieldJson.entryType.requiredFlag,
              message: `请选择${pageFieldJson.entryType.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="RES:ENTRY_LEAVE_TYPE"
          placeholder={`请选择${pageFieldJson.entryType.displayName}`}
          disabled={formData.resStatus === 1}
          filters={[{ sphd2: 'ENTRY_EXTERNAL' }]}
        />
      </Field>,
      <Field
        name="periodFlag"
        label={pageFieldJson.periodFlag.displayName}
        decorator={{
          initialValue: formData.periodFlag || undefined,
          rules: [
            {
              required: !!pageFieldJson.periodFlag.requiredFlag,
              message: `请选择是否${pageFieldJson.periodFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup initialValue={formData.periodFlag || ''}>
          <Radio value="LONG">长期资源</Radio>
          <Radio value="SHORT">短期资源</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="jobClass1"
        label={pageFieldJson.jobClass1.displayName}
        decorator={{
          initialValue: formData.jobClass1 || undefined,
          rules: [
            {
              required: !!pageFieldJson.jobClass1.requiredFlag,
              message: `请选择是否${pageFieldJson.jobClass1.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          code="RES:JOB_TYPE1"
          placeholder={`请选择${pageFieldJson.jobClass1.displayName}`}
          onChange={e => {
            this.handleChangeType1(e);
          }}
        />
      </Field>,
      <Field
        name="jobClass2"
        key="jobClass2"
        label={pageFieldJson.jobClass2.displayName}
        decorator={{
          initialValue: formData.jobClass2 || undefined,
          rules: [
            {
              required: jobClass2.length > 0,
              message: `请选择是否${pageFieldJson.jobClass2.displayName}`,
            },
          ],
        }}
      >
        <Selection
          source={jobClass2}
          placeholder={`请选择${pageFieldJson.jobClass2.displayName}`}
        />
      </Field>,
      <Field
        name="jobCapaSetLevelDId"
        key="jobCapasetId"
        label={pageFieldJson.jobCapasetId.displayName}
        decorator={{
          initialValue: formData.jobCapaSetLevelDId || undefined,
          rules: [
            {
              required: formData.periodFlag === 'LONG',
              message: `请选择${pageFieldJson.jobCapasetId.displayName}`,
            },
          ],
        }}
      >
        <Selection
          source={capaSetList}
          placeholder={`请选择${pageFieldJson.jobCapasetId.displayName}`}
        />
      </Field>,
      <Field
        name="remark"
        key="remark"
        label={pageFieldJson.remark.displayName}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
        decorator={{
          initialValue: formData.remark || '',
        }}
      >
        <Input.TextArea rows={3} placeholder={`请输入${pageFieldJson.elpFlag.displayName}`} />
      </Field>,
      <Field
        name="applyResId"
        key="applyResId"
        label={pageFieldJson.applyResId.displayName}
        decorator={{
          initialValue: formData.applyResName || '',
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="applyDate"
        key="applyDate"
        label={pageFieldJson.applyDate.displayName}
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
      form: { getFieldDecorator },
      extrApplyCreate: {
        formData,
        resDataSource,
        notSubmitList,
        type2Data,
        resData,
        baseBuDataSource,
        projList,
        selfChkList,
      },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const queryBtn = loading.effects[`${DOMAIN}/findProjectDetailsById`];
    const checkBtn = loading.effects[`${DOMAIN}/checkresultUpdate`];

    const tableBtn =
      loading.effects[`${DOMAIN}/getResultsByProj`] || loading.effects[`${DOMAIN}/checkresult`];

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
            onClick={() => closeThenGoto('/plat/res/profile/list')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="外部资源引入申请" />}
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
          {/* <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="resId"
              label="姓名"
              decorator={{
                initialValue: formData.resName || '',
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
                placeholder="请选择姓名"
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
                    message: '请选择性别',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM.GENDER" placeholder="请选择性别" />
            </Field>
            <Field
              name="mobile"
              label="手机号"
              decorator={{
                initialValue: formData.mobile || undefined,
              }}
            >
              <Input placeholder="系统自动生成" disabled />
            </Field>
            <FieldLine label="资源类型" required>
              <Field
                name="resType1"
                decorator={{
                  initialValue: formData.resType1 || undefined,
                  rules: [{ message: '外部资源', required: true }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Selection.UDC code="RES:RES_TYPE1" placeholder="资源类型一" disabled />
              </Field>
              <Field
                name="resType2"
                decorator={{
                  initialValue: formData.resType2 || undefined,
                  rules: [{ message: '请选择资源类型二', required: true }],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Selection.UDC code="RES:RES_TYPE2" placeholder="资源类型二" />
              </Field>
            </FieldLine>
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
                columns={SEL_COL}
                source={() => selectBuMultiCol()}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 440 }}
                showSearch
              />
            </Field>
            <Field
              name="presId"
              label="上级"
              decorator={{
                initialValue: formData.presId || undefined,
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
              />
            </Field>
            <Field
              name="coopType"
              label="合作方式"
              decorator={{
                initialValue: formData.coopType,
              }}
            >
              <Selection.UDC code="COM.COOPERATION_MODE" placeholder="请选择合作方式" />
            </Field>
            <Field
              name="eqvaRatio"
              label="当量系数"
              decorator={{
                initialValue: formData.eqvaRatio,
              }}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="请输入当量系数" />
            </Field>
            <Field
              name="emailFlag"
              label="开通邮箱"
              decorator={{
                initialValue: formData.emailFlag,
                rules: [{ required: true, message: '请选择是否开通邮箱' }],
              }}
            >
              <Radio.Group>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
            </Field>
            <Field
              name="elpFlag"
              label="开通E-Learning账号"
              style={{ letterSpacing: '-1px' }}
              decorator={{
                initialValue: formData.elpFlag,
                rules: [{ required: true, message: '请选择是否开通E-Learning账号' }],
              }}
            >
              <Radio.Group>
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
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

export default ExtrApplyCreate;
