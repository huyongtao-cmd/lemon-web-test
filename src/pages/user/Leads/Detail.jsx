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
import Loading from '@/components/core/DataLoading';
import { UdcCheck, UdcSelect, Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { pushFlowTask } from '@/services/gen/flow';
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

const DOMAIN = 'userLeadsEdit';

@connect(({ loading, userLeadsEdit, user, dispatch }) => ({
  loading,
  userLeadsEdit,
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
        props.dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { externalIden: null, externalName: null, externalPhone: null },
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
  state = {};

  componentDidMount() {
    const {
      dispatch,
      user: {
        user: { roles, extInfo = {} },
      },
    } = this.props;
    const { resId } = extInfo;

    const param = fromQs();
    const { advanced, mode } = fromQs();
    this.setState({
      advanced,
    });

    if (mode && mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      }).then(res => {
        const { salesmanResId } = res;
        // 页面可配置化数据请求
        if (param.advanced && !isEmpty(res)) {
          // 平台线索管理员和系统管理员
          if (roles.includes('PLAT_LEADS_ADMIN') || roles.includes('SYS_ADMIN')) {
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'LEADS_MANAGEMENT_EDIT:ADMIN' },
            });
            // 销售负责人
          } else if (salesmanResId === resId) {
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'LEADS_MANAGEMENT_EDIT:SALE' },
            });
          } else {
            dispatch({
              type: `${DOMAIN}/getPageConfig`,
              payload: { pageNo: 'LEADS_MANAGEMENT_EDIT' },
            });
          }
        } else {
          dispatch({
            type: `${DOMAIN}/getPageConfig`,
            payload: { pageNo: 'LEADS_MANAGEMENT_EDIT' },
          });
        }
      });
    }

    dispatch({ type: `${DOMAIN}/selectUsers` });
    dispatch({ type: `${DOMAIN}/selectBus` });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      userLeadsEdit: { formData, page },
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
        }).then(({ status, rst }) => {
          if (status === 100) {
            // 主动取消请求
            return;
          }
          if (rst === true) {
            createMessage({ type: 'success', description: '保存成功' });
            page === 'myleads'
              ? closeThenGoto(`/user/center/${page}`)
              : closeThenGoto(`/sale/management/${page}`);
          } else createMessage({ type: 'success', description: rst });
        });
      }
    });
  };

  handleSubmit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userLeadsEdit: { formData, page },
    } = this.props;

    if (formData.sourceType === 'INTERNAL' && !formData.internalBuId && !formData.internalResId) {
      createMessage({ type: 'error', description: '请选择来源BU或者来源人' });
      return;
    }

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // 由于新增了撤回状态，所以撤回的时候，调用保存，再调用流程节点推进即可
        if (formData.apprStatus === 'WITHDRAW') {
          const { taskId, remark } = fromQs();
          dispatch({
            type: `${DOMAIN}/save`,
          }).then(({ status: sts, rst }) => {
            if (sts === 100) {
              // 主动取消请求
              return;
            }
            if (rst === true) {
              pushFlowTask(taskId, { result: 'APPLIED', remark }).then(({ status }) => {
                if (status === 200) {
                  createMessage({ type: 'success', description: '提交成功' });
                  page === 'myleads'
                    ? closeThenGoto(`/user/center/${page}`)
                    : closeThenGoto(`/sale/management/${page}`);
                }
              });
            } else {
              createMessage({ type: 'error', description: '提交失败' });
            }
          });
        } else {
          dispatch({
            type: `${DOMAIN}/submit`,
            payload: { formData, page },
          });
        }
      }
    });
  };

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userLeadsEdit: { formData, page },
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

  renderPage = () => {
    const {
      loading,
      dispatch,
      userLeadsEdit,
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
    } = userLeadsEdit;

    const isCreate = mode === 'create';
    formData.createUserId = isCreate && info ? info.id : formData.createUserId;
    const isInternal = formData.sourceType === 'INTERNAL';

    const salemanKey = { name: formData.salesmanName, code: formData.salesmanResId };
    const internalResKey = {
      name: formData.internalResName,
      code: formData.internalResId,
    };
    const internalBuKey = { name: formData.internalBuName, code: formData.internalBuId };
    // 页面配置数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentBlockConfig = {};
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'LEADS_MANAGEMENT_EDIT') {
        // 线索编辑
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
      isReward = {},
      rewardBuId = {},
      isRewardReason = {},
      rewardPrice = {},
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
        <Input
          maxLength={35}
          placeholder={`请输入${leadsName.displayName}`}
          disabled={leadsName.fieldMode === 'UNEDITABLE'}
        />
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
          placeholder={formatMessage({ id: `app.hint.systemcreate`, desc: '系统生成' })}
          disabled={leadsNo.fieldMode === 'UNEDITABLE'}
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
        <Input
          placeholder={`请输入${remark.displayName}`}
          maxLength={400}
          disabled={remark.fieldMode === 'UNEDITABLE'}
        />
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
        <Input
          maxLength={35}
          placeholder={`请输入${custName.displayName}`}
          disabled={custName.fieldMode === 'UNEDITABLE'}
        />
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
        <Input
          maxLength={35}
          placeholder={`请输入${custContact.displayName}`}
          disabled={custContact.fieldMode === 'UNEDITABLE'}
        />
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
        <Input
          maxLength={35}
          placeholder={`请输入${contactPhone.displayName}`}
          disabled={contactPhone.fieldMode === 'UNEDITABLE'}
        />
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
        <Input
          maxLength={35}
          placeholder={`请输入${contactDept.displayName}`}
          disabled={contactDept.fieldMode === 'UNEDITABLE'}
        />
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
        <Input
          maxLength={35}
          placeholder={`请输入${contactPosition.displayName}`}
          disabled={contactPosition.fieldMode === 'UNEDITABLE'}
        />
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
        <UdcSelect
          code="TSK.OU_IDST"
          placeholder={`请选择${custIdst.displayName}`}
          disabled={custIdst.fieldMode === 'UNEDITABLE'}
        />
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
          disabled={salesmanResId.fieldMode === 'UNEDITABLE'}
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
          disabled={rewardType.fieldMode === 'UNEDITABLE'}
        />
      </Field>,
      <Field
        name="rewardObj"
        key="rewardObj"
        sortNo={rewardObj.sortNo}
        label={rewardObj.displayName}
        decorator={{
          initialValue: Number(formData.rewardObj),
          rules: [
            {
              required: !!rewardObj.requiredFlag,
              message: '必填',
            },
          ],
        }}
      >
        {// eslint-disable-next-line no-nested-ternary
        formData.rewardType === 'PERSON' ? (
          <Selection.Columns
            key={formData.rewardType}
            className="x-fill-100"
            source={() => selectUsersWithBu()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            showSearch
            placeholder={`请输入${rewardObj.displayName}`}
            disabled={rewardObj.fieldMode === 'UNEDITABLE'}
          />
        ) : formData.rewardType === 'BU' ? (
          <Selection.Columns
            key={formData.rewardType}
            className="x-fill-100"
            source={() => selectBuMultiCol()}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            showSearch
            placeholder={`请输入${rewardObj.displayName}`}
            disabled={rewardObj.fieldMode === 'UNEDITABLE'}
          />
        ) : (
          <Input
            disabled={rewardObj.fieldMode === 'UNEDITABLE'}
            placeholder="请先选择奖金分配类型"
          />
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
        <UdcSelect
          code="TSK:LEADS_STATUS"
          placeholder={`请选择${leadsStatus.displayName}`}
          disabled={leadsStatus.fieldMode === 'UNEDITABLE'}
        />
      </Field>,
      <Field
        name="closeReason"
        key="closeReason"
        sortNo={closeReason.sortNo}
        label={closeReason.displayName}
        decorator={{
          initialValue: formData.closeReason,
        }}
      >
        <UdcSelect
          code="TSK:LEADS_CLOSE_REASON"
          placeholder={`请选择${closeReason.displayName}`}
          disabled={closeReason.fieldMode === 'UNEDITABLE'}
        />
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
        <Selection.Columns
          key={formData.rewardType}
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          showSearch
          placeholder={`请输入${createUserId.displayName}`}
          disabled={createUserId.fieldMode === 'UNEDITABLE'}
        />
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
        <DatePicker
          key={formData.date}
          format="YYYY-MM-DD"
          disabled={createTime.fieldMode === 'UNEDITABLE'}
        />
      </Field>,
      <Field
        name="isReward"
        key="isReward"
        label={isReward.displayName}
        sortno={isReward.sortNo}
        decorator={{
          initialValue: formData.isReward || undefined,
          rules: [
            {
              required: !!isReward.requiredFlag,
              message: `请选择${isReward.displayName}`,
            },
          ],
        }}
      >
        <Selection.UDC
          onChange={e => {
            if (!e || e === 'NO') {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: { rewardBuId: undefined },
              });
              setFieldsValue({
                rewardBuId: undefined,
                rewardPrice: undefined,
              });
            }
          }}
          code="COM:YESNO"
          placeholder={`请选择${isReward.displayName}`}
          disabled={isReward.fieldMode === 'UNEDITABLE'}
        />
      </Field>,
      <Field
        name="rewardBuId"
        key="rewardBuId"
        label={rewardBuId.displayName}
        sortno={rewardBuId.sortNo}
        decorator={{
          initialValue: formData.rewardBuId || undefined,
          rules: [
            {
              required: formData.isReward === 'YES',
              message: `请选择${rewardBuId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          placeholder={`请选择${rewardBuId.displayName}`}
          columns={columns}
          disabled={
            formData.isReward === 'NO' ||
            !formData.isReward ||
            rewardBuId.fieldMode === 'UNEDITABLE'
          }
          source={() => selectBuMultiCol()}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          dropdownStyle={{ width: 440 }}
          showSearch
        />
      </Field>,
      <Field
        name="isRewardReason"
        key="isRewardReason"
        label={isRewardReason.displayName}
        sortno={isRewardReason.sortNo}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
        decorator={{
          initialValue: formData.isRewardReason || undefined,
          rules: [
            {
              required: !!isRewardReason.requiredFlag,
              message: `请输入${isRewardReason.displayName}`,
            },
          ],
        }}
      >
        <Input.TextArea
          disabled={
            formData.isReward === 'YES' ||
            !formData.isReward ||
            isRewardReason.fieldMode === 'UNEDITABLE'
          }
          rows={3}
          placeholder={`请输入${isRewardReason.displayName}`}
        />
      </Field>,
      <Field
        name="rewardPrice"
        key="rewardPrice"
        label={rewardPrice.displayName}
        sortno={rewardPrice.sortNo}
        decorator={{
          initialValue: formData.rewardPrice || undefined,
          rules: [
            {
              required: formData.isReward === 'YES',
              message: `请输入${rewardPrice.displayName}`,
            },
          ],
        }}
      >
        <Input
          disabled={
            formData.isReward === 'NO' ||
            !formData.isReward ||
            rewardPrice.fieldMode === 'UNEDITABLE'
          }
          placeholder={`请输入${rewardPrice.displayName}`}
        />
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
            initialValue: formData.internalBuId ? internalBuKey : undefined,
            rules: [
              {
                required: !!internalBuId.requiredFlag,
                message: `${internalBuId.displayName}`,
              },
            ],
          }}
        >
          <SelectWithCols
            labelKey="name"
            columns={columns}
            dataSource={buSource}
            onChange={() => {}}
            selectProps={{
              showSearch: true,
              onSearch: value => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    buSource: buList.filter(
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
          // key={2}
          name="internalResId"
          key="internalResId"
          sortNo={internalResId.sortNo}
          label={internalResId.displayName}
          decorator={{
            initialValue: formData.internalResId ? internalResKey : undefined,
            rules: [
              {
                required: !!internalResId.requiredFlag,
                message: `${internalResId.displayName}`,
              },
            ],
          }}
        >
          <SelectWithCols
            labelKey="name"
            valueKey="code"
            columns={columns}
            dataSource={userSource}
            onChange={() => {}}
            selectProps={{
              showSearch: true,
              onSearch: value => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    userSource: userList.filter(
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
        </Field>
      ),
      !isInternal ? (
        <Field
          // key={3}
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
      userLeadsEdit,
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
    } = userLeadsEdit;
    const { advanced } = this.state;

    const disabledBtn =
      !!loading.effects[`${DOMAIN}/query`] ||
      !!loading.effects[`${DOMAIN}/submit`] ||
      !!loading.effects[`${DOMAIN}/save`];

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
          {advanced ? (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSave}
            >
              保存
            </Button>
          ) : (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={this.handleSubmit}
            >
              提交
            </Button>
          )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              page === 'myleads'
                ? router.push(`/user/center/${page}`)
                : router.push(`/sale/management/${page}`);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
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
          {!loading.effects[`${DOMAIN}/getPageConfig`] && formData.id ? (
            this.renderPage()
          ) : (
            <Loading />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default LeadsDetail;
