/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Card, Input, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SelectWithCols from '@/components/common/SelectWithCols';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import { UdcCheck, UdcSelect, Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import Loading from '@/components/core/DataLoading';
import { selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const { Field } = FieldList;

const columns = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'userLeadsCreate';

@connect(({ loading, userLeadsCreate, user, dispatch }) => ({
  loading,
  userLeadsCreate,
  user,
  dispatch,
}))
@Form.create({
  // form只能取值一次，新增保存之后需要刷新页面，否则changedFields为{}, 会报错
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value instanceof Object) {
      const key = name.split('Id')[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [key + 'Id']: value.id, [key + 'Name']: value.name },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
    if (name === 'sourceType') {
      if (value === 'INTERNAL') {
        const {
          user: {
            user: { extInfo = {} },
          },
        } = props;
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            externalIden: null,
            externalName: null,
            externalPhone: null,
            internalResId: extInfo.resId,
            internalBuId: extInfo.baseBuId,
          },
        });
      } else {
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            internalBuName: null,
            internalBuId: null,
            internalResName: null,
            internalResId: null,
          },
        });
      }
    }
  },
})
@mountToTab()
class LeadsDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    // 页面可配置化数据请求
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'LEADS_MANAGEMENT_SAVE' },
    });
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/selectUsers` });
    dispatch({ type: `${DOMAIN}/selectBus` });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      userLeadsCreate: { formData },
      dispatch,
    } = this.props;
    if (formData.sourceType === 'INTERNAL' && !formData.internalBuId && !formData.internalResId) {
      createMessage({ type: 'error', description: '请选择来源BU或者来源人' });
      return;
    }

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        });
      }
    });
  };

  handleSubmit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userLeadsCreate: { formData, page },
    } = this.props;

    if (formData.sourceType === 'INTERNAL' && !formData.internalBuId && !formData.internalResId) {
      createMessage({ type: 'error', description: '请选择来源BU或者来源人' });
      return;
    }

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          // 先保存相关数据
          type: `${DOMAIN}/saveLead`,
          payload: { formData, page },
        }).then(res => {
          if (res.ok) {
            const { id } = res.datum;
            dispatch({
              // 提交流程
              type: `${DOMAIN}/submitFlow`,
              payload: {
                defkey: 'TSK_S01',
                value: {
                  id,
                  // data: [],
                },
              },
            }).then(() => {
              if (res.ok) {
                router.push(`/user/center/myleads`);
              }
            });
          } else {
            createMessage({ type: 'error', description: '保存失败' });
          }
        });
      }
    });
  };

  renderPage = () => {
    const {
      loading,
      dispatch,
      userLeadsCreate,
      user: {
        user: {
          info,
          extInfo: { resId, baseBuId },
        },
      }, // 新增时取得报备人(当前登录人)的id和姓名
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const {
      formData,
      mode,
      page,
      salemanList,
      salemanSource,
      userList,
      buList,
      userSource,
      buSource,
      pageConfig,
    } = userLeadsCreate;

    const isCreate = mode === 'create';
    formData.createUserId = isCreate && info ? info.id : formData.createUserId;
    const isInternal = formData.sourceType === 'INTERNAL';

    const salemanKey = { name: formData.salesmanName, code: formData.salesmanResId };
    const internalResKey = {
      name: formData.internalResName,
      code: formData.internalResId,
    };
    const internalBuKey = { name: formData.internalBuName, code: formData.internalBuId };
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentBlockConfig = {};
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'LEADS_MANAGEMENT_SAVE') {
        // 线索报备
        currentBlockConfig = view;
      }
    });
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const {
      leadsName = {},
      leadsNo = {},
      remark = {},
      custName = {},
      custContact = {},
      contactPhone = {},
      contactDept = {},
      contactPosition = {},
      custIdst = {},
      salesmanResId = {},
      leadsStatus = {},
      closeReason = {},
      createUserId = {},
      createTime = {},
      sourceType = {},
      internalBuId = {},
      internalResId = {},
      externalIden = {},
      externalName = {},
      externalPhone = {},
      rewardType = {},
      rewardObj = {},
    } = pageFieldJson;
    const basicFields = [
      <Field
        name="leadsName"
        key="leadsName"
        label={leadsName.displayName}
        sortNo={leadsName.sortNo}
        decorator={{
          initialValue: formData.leadsName,
          rules: [
            {
              required: !!leadsName.requiredFlag,
              message: `请输入${leadsName.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${leadsName.displayName}`} />
      </Field>,
      <Field
        name="leadsNo"
        key="leadsNo"
        label={leadsNo.displayName}
        sortNo={leadsNo.sortNo}
        decorator={{
          initialValue: formData.leadsNo,
        }}
      >
        <Input
          disabled
          placeholder={formatMessage({ id: `app.hint.systemcreate`, desc: '系统生成' })}
        />
      </Field>,
      <Field
        name="remark"
        key="remark"
        label={remark.displayName}
        sortNo={remark.sortNo}
        decorator={{
          initialValue: formData.remark,
          rules: [
            {
              required: !!remark.requiredFlag,
              message: `请输入${remark.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${remark.displayName}`} maxLength={400} />
      </Field>,
      <Field
        name="custName"
        key="custName"
        label={custName.displayName}
        sortNo={custName.sortNo}
        decorator={{
          initialValue: formData.custName,
          rules: [
            {
              required: !!custName.requiredFlag,
              message: `请输入${custName.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${custName.displayName}`} />
      </Field>,
      <Field
        name="custContact"
        key="custContact"
        label={custContact.displayName}
        sortNo={custContact.sortNo}
        decorator={{
          initialValue: formData.custContact,
          rules: [
            {
              required: !!custContact.requiredFlag,
              message: `请输入${custContact.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${custContact.displayName}`} />
      </Field>,
      <Field
        name="contactPhone"
        key="contactPhone"
        label={contactPhone.displayName}
        sortNo={contactPhone.sortNo}
        decorator={{
          initialValue: formData.contactPhone,
          rules: [
            {
              required: !!contactPhone.requiredFlag,
              message: `请输入${contactPhone.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${contactPhone.displayName}`} />
      </Field>,
      <Field
        name="contactDept"
        key="contactDept"
        label={contactDept.displayName}
        sortNo={contactDept.sortNo}
        decorator={{
          initialValue: formData.contactDept,
          rules: [
            {
              required: !!contactDept.requiredFlag,
              message: `请输入${contactDept.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${contactDept.displayName}`} />
      </Field>,
      <Field
        name="contactPosition"
        key="contactPosition"
        label={contactPosition.displayName}
        sortNo={contactPosition.sortNo}
        decorator={{
          initialValue: formData.contactPosition,
          rules: [
            {
              required: !!contactPosition.requiredFlag,
              message: `请输入${contactPosition.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${contactPosition.displayName}`} />
      </Field>,
      <Field
        name="custIdst"
        key="custIdst"
        sortNo={custIdst.sortNo}
        label={custIdst.displayName}
        decorator={{
          initialValue: formData.custIdst,
          rules: [
            {
              required: !!custIdst.requiredFlag,
              message: `请选择${custIdst.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK.OU_IDST" placeholder={`请选择${custIdst.displayName}`} />
      </Field>,
      <Field
        name="salesmanResId"
        key="salesmanResId"
        sortNo={salesmanResId.sortNo}
        label={salesmanResId.displayName}
        decorator={{
          initialValue: formData.salesmanResId ? salemanKey : undefined,
          rules: [
            {
              required: !!salesmanResId.requiredFlag,
              message: `请输入${salesmanResId.displayName}`,
            },
          ],
        }}
      >
        <SelectWithCols
          labelKey="name"
          valueKey="code"
          columns={columns}
          dataSource={salemanSource}
          onChange={() => {}}
          selectProps={{
            showSearch: true,
            onSearch: value => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  salemanSource: salemanList.filter(
                    d =>
                      d.code.indexOf(value) > -1 ||
                      d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                  ),
                },
              });
            },
            allowClear: true,
            style: { width: '100%' },
          }}
        />
      </Field>,
      <Field
        name="rewardType"
        key="rewardType"
        sortNo={rewardType.sortNo}
        label={rewardType.displayName}
        decorator={{
          initialValue: formData.rewardType,
          rules: [
            {
              required: !!rewardType.requiredFlag,
              message: '必填',
            },
          ],
        }}
      >
        <Selection.UDC
          code="TSK:OPPO_REWARD_TYPE"
          placeholder={`请输入${rewardType.displayName}`}
          onChange={e => {
            if (e === 'BU') {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  rewardObj: baseBuId,
                },
              });
              setFieldsValue({
                rewardObj: baseBuId,
              });
            } else if (e === 'PERSON') {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  rewardObj: resId,
                },
              });
              setFieldsValue({
                rewardObj: resId,
              });
            } else {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  rewardObj: null,
                },
              });
              setFieldsValue({
                rewardObj: null,
              });
            }
          }}
        />
      </Field>,
      <Field
        name="rewardObj"
        key="rewardObj"
        sortNo={rewardObj.sortNo}
        label={rewardObj.displayName}
        decorator={{
          initialValue: formData.rewardObj,
          rules: [
            {
              required: !!rewardObj.requiredFlag,
              message: '必填',
            },
          ],
        }}
      >
        {formData.rewardType === 'PERSON' ? (
          <Selection.Columns
            key={formData.rewardType}
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            showSearch
            placeholder={`请输入${rewardObj.displayName}`}
          />
        ) : formData.rewardType === 'BU' ? (
          <Selection.ColumnsForBu
            key={formData.rewardType}
            placeholder={`请输入${rewardObj.displayName}`}
          />
        ) : (
          <Input disabled placeholder="请先选择奖金分配类型" />
        )}
      </Field>,
      <Field
        name="leadsStatus"
        key="leadsStatus"
        sortNo={leadsStatus.sortNo}
        label={leadsStatus.displayName}
        decorator={{
          initialValue: formData.leadsStatusDesc ? formData.leadsStatusDesc : '创建',
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="closeReasonDesc"
        key="closeReason"
        sortNo={closeReason.sortNo}
        label={closeReason.displayName}
        decorator={{
          initialValue: formData.closeReasonDesc,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="createUserName"
        key="createUserId"
        sortNo={createUserId.sortNo}
        label={createUserId.displayName}
        decorator={{
          initialValue: isCreate && info ? info.name : formData.createUserName,
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="createTime"
        key="createTime"
        sortNo={createTime.sortNo}
        label={createTime.displayName}
        decorator={{
          initialValue: isCreate
            ? moment().format('YYYY-MM-DD')
            : moment(formData.createTime).format('YYYY-MM-DD'),
        }}
      >
        <Input disabled />
      </Field>,
    ];
    const filterList = basicFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const sourceFields = [
      <Field
        name="sourceType"
        key="sourceType"
        sortNo={sourceType.sortNo}
        label={sourceType.displayName}
        decorator={{
          initialValue: formData.sourceType,
          rules: [
            {
              required: !!sourceType.requiredFlag,
              message: '请选择勾选至少1条记录',
            },
          ],
        }}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
      >
        <UdcCheck
          multiple={false}
          code="TSK.SOURCE_TYPE"
          placeholder={`${sourceType.displayName}`}
        />
      </Field>,
      !isInternal ? (
        <Field
          // key={1}
          name="externalIden"
          key="externalIden"
          sortNo={externalIden.sortNo}
          label={externalIden.displayName}
          decorator={{
            initialValue: formData.externalIden,
            rules: [
              {
                required: !!externalIden.requiredFlag,
                message: `${externalIden.displayName}`,
              },
            ],
          }}
        >
          <Input maxLength={35} placeholder={`${externalIden.displayName}`} />
        </Field>
      ) : (
        <Field
          // key={1}
          name="internalBuId"
          key="internalBuId"
          sortNo={internalBuId.sortNo}
          label={internalBuId.displayName}
          decorator={{
            initialValue: formData.internalBuId || undefined,
            rules: [
              {
                required: !!internalBuId.requiredFlag,
                message: `${internalBuId.displayName}`,
              },
            ],
          }}
        >
          <Selection.ColumnsForBu />
        </Field>
      ),
      !isInternal ? (
        <Field
          // key={2}
          name="externalName"
          key="externalName"
          sortNo={externalName.sortNo}
          label={externalName.displayName}
          decorator={{
            initialValue: formData.externalName,
            rules: [
              {
                required: !!externalName.requiredFlag,
                message: `${externalName.displayName}`,
              },
            ],
          }}
        >
          <Input maxLength={35} placeholder={`请输入${externalName.displayName}`} />
        </Field>
      ) : (
        <Field
          name="internalResId"
          key="internalResId"
          sortNo={internalResId.sortNo}
          label={internalResId.displayName}
          decorator={{
            initialValue: formData.internalResId || undefined,
            rules: [
              {
                required: !!internalResId.requiredFlag,
                message: `${internalResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            showSearch
            placeholder={`请输入${internalResId.displayName}`}
          />
        </Field>
      ),
      !isInternal ? (
        <Field
          name="externalPhone"
          key="externalPhone"
          sortNo={externalPhone.sortNo}
          label={externalPhone.displayName}
          decorator={{
            initialValue: formData.externalPhone,
            rules: [
              {
                required: !!externalPhone.requiredFlag,
                message: `${externalPhone.displayName}`,
              },
            ],
          }}
        >
          <Input maxLength={35} placeholder={`请输入${externalPhone.displayName}`} />
        </Field>
      ) : (
        <div />
      ),
      // isInternal ? (
      //   <Field
      //     name="rewardType"
      //     key="rewardType"
      //     sortNo={rewardType.sortNo}
      //     label={rewardType.displayName}
      //     decorator={{
      //       initialValue: formData.rewardType,
      //       rules: [
      //         {
      //           required: !!rewardType.requiredFlag,
      //           message: '必填',
      //         },
      //       ],
      //     }}
      //   >
      //     <Selection.UDC
      //       code="TSK:OPPO_REWARD_TYPE"
      //       placeholder={`请输入${rewardType.displayName}`}
      //       onChange={e => {
      //         if (e === 'BU') {
      //           dispatch({
      //             type: `${DOMAIN}/updateForm`,
      //             payload: {
      //               rewardObj: baseBuId,
      //             },
      //           });
      //           setFieldsValue({
      //             rewardObj: baseBuId,
      //           });
      //         } else if (e === 'PERSON') {
      //           dispatch({
      //             type: `${DOMAIN}/updateForm`,
      //             payload: {
      //               rewardObj: resId,
      //             },
      //           });
      //           setFieldsValue({
      //             rewardObj: resId,
      //           });
      //         } else {
      //           dispatch({
      //             type: `${DOMAIN}/updateForm`,
      //             payload: {
      //               rewardObj: null,
      //             },
      //           });
      //           setFieldsValue({
      //             rewardObj: null,
      //           });
      //         }
      //       }}
      //     />
      //   </Field>
      // ) : (
      //   <div />
      // ),
      // isInternal ? (
      //   <Field
      //     name="rewardObj"
      //     key="rewardObj"
      //     sortNo={rewardObj.sortNo}
      //     label={rewardObj.displayName}
      //     decorator={{
      //       initialValue: formData.rewardObj,
      //       rules: [
      //         {
      //           required: !!rewardObj.requiredFlag,
      //           message: '必填',
      //         },
      //       ],
      //     }}
      //   >
      //     {formData.rewardType === 'PERSON' ? (
      //       <Selection.Columns
      //         key={formData.rewardType}
      //         className="x-fill-100"
      //         source={() => selectUsersWithBu()}
      //         columns={particularColumns}
      //         transfer={{ key: 'id', code: 'id', name: 'name' }}
      //         showSearch
      //         placeholder={`请输入${rewardObj.displayName}`}
      //       />
      //     ) : formData.rewardType === 'BU' ? (
      //       <Selection.Columns
      //         key={formData.rewardType}
      //         className="x-fill-100"
      //         source={() => selectBuMultiCol()}
      //         columns={particularColumns}
      //         transfer={{ key: 'id', code: 'id', name: 'name' }}
      //         showSearch
      //         placeholder={`请输入${rewardObj.displayName}`}
      //       />
      //     ) : (
      //       <Input disabled placeholder="请先选择奖金分配类型" />
      //     )}
      //   </Field>
      // ) : (
      //   <div />
      // ),
    ];
    const filterList1 = sourceFields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);

    return (
      <>
        <FieldList
          layout="horizontal"
          legend={formatMessage({ id: `app.settings.menuMap.basicMessage`, desc: '基本信息' })}
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList}
        </FieldList>
        <Divider dashed />
        <FieldList
          layout="horizontal"
          legend={formatMessage({ id: `app.settings.menuMap.source`, desc: '来源信息' })}
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList1}
        </FieldList>
      </>
    );
  };

  render() {
    const {
      loading,
      dispatch,
      userLeadsCreate,
      user: {
        user: { info },
      }, // 新增时取得报备人(当前登录人)的id和姓名
      form: { getFieldDecorator },
    } = this.props;
    const {
      formData,
      mode,
      page,
      salemanList,
      salemanSource,
      userList,
      buList,
      userSource,
      buSource,
      pageConfig,
    } = userLeadsCreate;

    const disabledBtn =
      !!loading.effects[`${DOMAIN}/save`] ||
      !!loading.effects[`${DOMAIN}/submit`] ||
      !!loading.effects[`${DOMAIN}/saveLead`];
    const isCreate = mode === 'create';
    formData.createUserId = isCreate && info ? info.id : formData.createUserId;
    const isInternal = formData.sourceType === 'INTERNAL';

    const salemanKey = { name: formData.salesmanName, code: formData.salesmanResId };
    const internalResKey = {
      name: formData.internalResName,
      code: formData.internalResId,
    };
    const internalBuKey = { name: formData.internalBuName, code: formData.internalBuId };

    return (
      <PageHeaderWrapper title="线索报备">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSubmit}
          >
            提交
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          title={
            <Title
              icon="profile"
              id="app.settings.menuMap.basicMessage"
              defaultMessage="基本信息"
            />
          }
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default LeadsDetail;
