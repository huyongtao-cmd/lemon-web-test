import React from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, omit } from 'ramda';
import { Form } from 'antd';
import moment from 'moment';
// 产品化组件
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import EditTable from '@/components/production/business/EditTable';

import { fromQs } from '@/utils/production/stringUtil';
import { pushFlowTask } from '@/services/gen/flow';
import createMessage from '@/components/core/AlertMessage';
import { createConfirm } from '@/components/core/Confirm';
import { getUrl } from '@/utils/flowToRouter';
import { closeThenGoto } from '@/layouts/routerControl';
import update from 'immutability-helper';
import BpmWrapper from '../../../gen/BpmMgmt/BpmWrapper';
import BpmConnection from '../../../gen/BpmMgmt/BpmConnection';
import { genFakeId } from '@/utils/production/mathUtils.ts';
import DataTable from '@/components/production/business/DataTable.tsx';
import { tripManagementModify } from '../../../../services/production/adm/trip/tripApply';
// namespace声明
const DOMAIN = 'bookingByAdminDisplayPage';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, bookingByAdminDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  updateLoading: loading.effects[`${DOMAIN}/update`],
  dispatch,
  ...bookingByAdminDisplayPage,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
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
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class BookingByAdminDisplay extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { tripApplyId, tripNo, id, copy, mode, taskId, chargeCompany } = fromQs();
    const formMode = mode === 'edit' || mode === 'ADD' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    this.updateModelState({
      formMode,
      tripApplyId,
      taskId,
      id,
      copy,
      chargeCompany: chargeCompany !== 'null' ? chargeCompany : '',
    });
    // 页面初始化加载预算列表，如果要严格控制到项目可以在这里进行屏蔽
    this.callModelEffects('updateForm', { id, tripNo });
    this.callModelEffects('init');
    tripApplyId && this.callModelEffects('fetchTripExpenseData', { tripApplyId });
    tripApplyId &&
      this.callModelEffects('fetchOthersTripExpenseData', { tripApplyId: Number(tripApplyId) });
    taskId && this.callModelEffects('fetchConfig', taskId);
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

  /**
   * 保存
   */
  handleSave = () => {
    this.commitFormData({ submit: false, bookStatus: 'CREATE' });
  };

  /**
   * 指定更新
   */
  handleUpdate = (param, cb) => {
    this.callModelEffects('update', { formData: { ...param, submit: true } }).then(data => {
      cb && cb();
    });
  };

  /**
   * 提交
   */
  handleSubmitProcess = (param, cb) => {
    const { form, formData, tripApplyId } = this.props;
    const { tripExpenseDataList } = formData;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { tripExpenseDataList: tempList } = values;
        for (let i = 0; i < tripExpenseDataList.length; i += 1) {
          tripExpenseDataList[i] = Object.assign(tripExpenseDataList[i], tempList[i]);
        }
        this.callModelEffects('save', {
          formData: {
            ...omit(['tripExpenseDataList', 'bookStatus'], formData),
            submit: true,
            bookStatus: 'SUBMIT',
            tripExpenseDataList,
            ...omit(['tripExpenseDataList', 'bookStatus'], values),
            tripApplyId,
            result: 'APPLIED',
          },
        }).then(data => {
          cb && cb();
        });
      }
    });
  };

  /**
   * 提交表单数据
   */
  commitFormData = params => {
    const { form, formData, tripApplyId } = this.props;
    const { tripExpenseDataList } = formData;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { tripExpenseDataList: tempList } = values;
        for (let i = 0; i < tripExpenseDataList.length; i += 1) {
          tripExpenseDataList[i] = Object.assign(tripExpenseDataList[i], tempList[i]);
        }
        this.callModelEffects('save', {
          formData: {
            ...omit(['tripExpenseDataList', 'bookStatus'], formData),
            ...params,
            tripExpenseDataList,
            ...omit(['tripExpenseDataList', 'bookStatus'], values),
            tripApplyId,
          },
        });
      }
    });
  };

  render() {
    // 定义渲染使用的变量
    const {
      form,
      formData,
      dispatch,
      formMode,
      taskId,
      tripApplyId,
      tripNo,
      chargeCompany,
      flowForm,
      fieldsConfig,
      loading,
      saveLoading,
      updateLoading,
      deleteKeys,
      tripExpenseNoList,
      bookStatus,
      otherTripExpenseList,
      otherTicketNoList,
      tripExpensePersonList,
      detailList,
      user: {
        extInfo: { resId, userId, baseBuId, ouId, jobGrade },
      }, // 取当前登陆人的resId
      attachments,
    } = this.props;
    const { tripExpenseDataList } = formData;

    const bookStatusDisable = fieldsConfig.taskKey === 'ADM_M06_03_ENTRY_TICKET_INFOR';

    const detailOperation =
      formMode === 'DESCRIPTION'
        ? {}
        : {
            onAddClick: () => {
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  tripExpenseDataList: update(tripExpenseDataList, {
                    $push: [
                      {
                        id: genFakeId(-1),
                        tripResId: resId,
                      },
                    ],
                  }),
                },
              });
            },
            onDeleteConfirm: keys => {
              const newDataSource = tripExpenseDataList.filter(row => keys.indexOf(row.id) < 0);
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  tripExpenseDataList: newDataSource,
                },
              });
              this.updateModelState({ deleteKeys: [...deleteKeys, ...keys] });
            },
          };

    const editColumns = [
      {
        title: '费用编号',
        width: '100px',
        required: true,
        dataIndex: 'tripExpenseId',
        render: (val, row, i) => (
          <FormItem
            form={form}
            fieldType="BaseSelect"
            fieldKey={`tripExpenseDataList[${i}].tripExpenseId`}
            required
            disabled={formMode === 'DESCRIPTION'}
            options={tripExpenseNoList}
          />
        ),
      },
      {
        title: '订票号',
        dataIndex: 'ticketNo',
        width: '150px',
        render: (val, row, i) => (
          <FormItem
            form={form}
            fieldKey={`tripExpenseDataList[${i}].ticketNo`}
            disabled
            fieldType="BaseInput"
          />
        ),
      },

      {
        title: '订票类型',
        width: '150px',
        colSpan: 2,
        dataIndex: 'bookClass1',
        render: (val, row, i) => (
          <FormItem
            form={form}
            fieldKey={`tripExpenseDataList[${i}].bookClass1`}
            disabled={formMode === 'DESCRIPTION'}
            fieldType="BaseCustomSelect"
            parentKey="CUS:BOOK_CLASS1"
          />
        ),
      },
      {
        title: '订票类型2',
        width: '100px',
        colSpan: 0,
        dataIndex: 'bookClass2',
        render: (val, row, i) => (
          <FormItem
            form={form}
            disabled={formMode === 'DESCRIPTION'}
            fieldType="BaseCustomSelect"
            fieldKey={`tripExpenseDataList[${i}].bookClass2`}
            parentKey="CUS:BOOK_CLASS2"
          />
        ),
      },
      {
        title: '原订票号',
        width: '150px',
        dataIndex: 'originalTicketNo',
        render: (val, row, i) => (
          <FormItem
            form={form}
            disabled={formMode === 'DESCRIPTION'}
            fieldType="BaseSelect"
            fieldKey={`tripExpenseDataList[${i}].originalTicketNo`}
            options={otherTicketNoList}
          />
        ),
      },
      {
        title: '出差人',
        width: '150px',
        dataIndex: 'tripResId',
        // render: (val, row, i) => '张三',
        render: (text, record, index) => (
          <FormItem
            form={form}
            fieldType="ResSimpleSelect"
            fieldKey={`tripExpenseDataList[${index}].tripResId`}
            disabled={formMode === 'DESCRIPTION'}
          />
        ),
      },
      {
        title: '同行/同住人',
        width: '150px',
        dataIndex: 'accompanierArr',
        render: (text, record, i) => (
          <FormItem
            form={form}
            mode="multiple"
            fieldType="ResSimpleSelect"
            fieldKey={`tripExpenseDataList[${i}].accompanierArr`}
            disabled={formMode === 'DESCRIPTION'}
          />
        ),
      },
      {
        title: '订票要求',
        dataIndex: 'ticketRequirements',
        width: '200px',
        render: (val, row, i) => (
          <FormItem
            form={form}
            disabled={formMode === 'DESCRIPTION'}
            fieldType="BaseInputTextArea"
            fieldKey={`tripExpenseDataList[${i}].ticketRequirements`}
          />
        ),
      },
      {
        title: '订票结果',
        dataIndex: 'bookResult',
        width: '200px',
        required: bookStatusDisable,
        render: (val, row, i) => (
          <FormItem
            form={form}
            disabled={!bookStatusDisable}
            fieldType="BaseSelect"
            fieldKey={`tripExpenseDataList[${i}].bookResult`}
            parentKey="ADM:BOOK_RESULT"
            // required
          />
        ),
      },
      {
        title: '订票说明',
        dataIndex: 'bookDescription',
        width: '200px',
        required: bookStatusDisable,
        render: (val, row, i) => (
          <FormItem
            form={form}
            disabled={!bookStatusDisable}
            fieldType="BaseInputTextArea"
            fieldKey={`tripExpenseDataList[${i}].bookDescription`}
          />
        ),
      },
      {
        title: '订票金额',
        dataIndex: 'baseCurrencyBookAmt',
        width: '100px',
        required: bookStatusDisable,
        render: (val, row, i) => (
          <FormItem
            required={bookStatusDisable}
            form={form}
            disabled={!bookStatusDisable}
            fieldType="BaseInputAmt"
            fieldKey={`tripExpenseDataList[${i}].baseCurrencyBookAmt`}
            onChange={value => {
              let rowBaseCurrencyBookAmt = parseFloat(row.baseCurrencyBookAmt);
              if (Number.isNaN(rowBaseCurrencyBookAmt)) {
                rowBaseCurrencyBookAmt = 0;
              }
              const changeAmt = value - rowBaseCurrencyBookAmt;
              // const changeAmt =
              //   value - (Number.isFinite(row.baseCurrencyBookAmt) ? row.baseCurrencyBookAmt : 0);
              if (!Number.isNaN(changeAmt)) {
                const baseCurrencyBookAmt = (formData.baseCurrencyBookAmt || 0) + changeAmt;
                this.callModelEffects('updateForm', {
                  baseCurrencyBookAmt,
                });
              }
            }}
          />
        ),
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: '200px',
        render: (val, row, i) => (
          <FormItem
            form={form}
            disabled={!bookStatusDisable}
            fieldType="BaseInputTextArea"
            fieldKey={`tripExpenseDataList[${i}].remark`}
          />
        ),
      },
    ];

    const otherColumns = [
      {
        title: '费用编号',
        width: '100px',
        dataIndex: 'tripExpenseNo',
      },
      {
        title: '订票号',
        dataIndex: 'ticketNo',
        width: '200px',
      },

      {
        title: '订票类型',
        width: '100px',
        colSpan: 2,
        dataIndex: 'bookClass1Name',
      },
      {
        title: '订票类型2',
        width: '100px',
        colSpan: 0,
        dataIndex: 'bookClass2Name',
      },
      {
        title: '原订票号',
        width: '150px',
        dataIndex: 'originalTicketNoDesc',
      },
      {
        title: '出差人',
        width: '150px',
        dataIndex: 'tripResDesc',
      },
      {
        title: '同行/同住人',
        width: '150px',
        dataIndex: 'accompanierDesc',
      },
      {
        title: '订票要求',
        dataIndex: 'ticketRequirements',
        width: '200px',
      },
      {
        title: '订票结果',
        dataIndex: 'bookResultDesc',
        width: '100px',
      },
      {
        title: '订票说明',
        dataIndex: 'bookDescription',
        width: '100px',
      },
      {
        title: '订票金额(本位币)',
        dataIndex: 'baseCurrencyBookAmt',
        width: '100px',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: '200px',
      },
      {
        title: '行政订票单号',
        dataIndex: 'ticketBookNo',
        width: '200px',
      },
      {
        title: '订票人',
        dataIndex: 'bookResDesc',
        width: '100px',
      },
      {
        title: '订票日期',
        dataIndex: 'bookDateDesc',
        width: '100px',
      },
      {
        title: '订票状态',
        dataIndex: 'bookStatusDesc',
        width: '100px',
      },
    ];

    // 表格展示列
    const descColumns = [
      {
        title: '费用编号',
        width: '100px',
        dataIndex: 'tripExpenseNo',
      },
      {
        title: '费用状态',
        dataIndex: 'tripExpenseStatusDesc',
        width: '150px',
      },
      {
        title: '出差人',
        width: '100px',
        dataIndex: 'tripResName',
      },
      {
        title: '职级',
        width: '100px',
        dataIndex: 'jobGrade',
      },
      {
        title: '出差地',
        width: '100px',
        dataIndex: 'tripCityDesc',
      },
      {
        title: '城市级别',
        width: '150px',
        dataIndex: 'cityLevelDesc',
      },
      {
        title: '核算项目',
        width: '200px',
        dataIndex: 'busAccItemName',
      },
      {
        title: '数量/单位',
        width: '50px',
        colSpan: 2,
        dataIndex: 'qty',
      },
      {
        title: '单位',
        width: '50px',
        colSpan: 0,
        dataIndex: 'unitDesc',
      },
      {
        title: '费用标准',
        width: '170px',
        dataIndex: 'quota',
      },
      {
        title: '预算金额（本位币）',
        width: '100px',
        dataIndex: 'baseCurrencyBudgetAmt',
      },
      {
        title: '费用超标说明',
        width: '150px',
        dataIndex: 'overrunQuotaDescription',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
      {
        title: '费用结算方',
        width: '250px',
        dataIndex: 'expenseClaimSiteDesc',
      },
    ];

    const personColumns = [
      {
        title: '出差人',
        width: '100px',
        dataIndex: 'personName',
      },
      {
        title: '英文名',
        width: '100px',
        dataIndex: 'foreignName',
      },
      {
        title: '性别',
        width: '100px',
        dataIndex: 'genderDesc',
      },
      {
        title: '移动电话',
        width: '100px',
        dataIndex: 'mobile',
      },
      {
        title: '平台邮箱',
        width: '100px',
        dataIndex: 'email',
      },
      {
        title: '社交号码',
        width: '100px',
        dataIndex: 'snsNo',
      },
      {
        title: '国籍',
        width: '100px',
        dataIndex: 'nationalityDesc',
      },
      {
        title: '证件类型',
        width: '100px',
        dataIndex: 'idTypeDesc',
      },
      {
        title: '证件号码',
        width: '200px',
        dataIndex: 'idNo',
      },
      {
        title: '护照号码',
        width: '200px',
        dataIndex: 'passportNo',
      },
      {
        title: '护照有效期',
        width: '100px',
        dataIndex: 'passportValidFromTo',
      },
      {
        title: '护照发放地',
        width: '150px',
        dataIndex: 'passportIssueplace',
      },
    ];

    return (
      <PageWrapper loading={loading}>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          buttonLoading={loading || saveLoading || updateLoading}
          onBpmChanges={value => {
            this.callModelEffects('updateFlowForm', { value });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { branch, remark } = bpmForm;
            const { key } = operation;
            const { taskKey } = fieldsConfig;
            if (taskKey === 'ADM_M06_01_SUBMIT_i') {
              if (key === 'FLOW_COMMIT') {
                this.handleSubmitProcess(
                  {
                    result: 'APPROVED',
                    taskId,
                    procRemark: remark,
                    branch,
                  },
                  () => {
                    const url = getUrl().replace('edit', 'view');
                    closeThenGoto(url);
                  }
                );
                return Promise.resolve(false);
              }
            } else {
              if (key === 'FLOW_RETURN') {
                if (taskKey === 'ADM_M06_04_APPLICANT_CONFIRM') {
                  createConfirm({
                    content: '确定要拒绝该流程吗？',
                    onOk: () =>
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
                      }),
                  });
                } else {
                  createConfirm({
                    content: '确定要拒绝该流程吗？',
                    onOk: () => {
                      tripManagementModify({
                        id: formData.id,
                        taskId,
                        remark,
                        result: 'REJECTED',
                        branch,
                        submit: true,
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
              }
              if (key === 'FLOW_PASS') {
                //调用【行政订票-订票单指定更新接口】更新订票状态为“订票中”（BOOKING），并将自己更新为“订票人
                if (taskKey === 'ADM_M06_02_ADMIN_ACCEPT') {
                  this.handleUpdate(
                    {
                      id: formData.id,
                      bookResId: resId,
                      bookStatus: 'BOOKING',
                      bookDate: moment().format('YYYY-MM-DD'),
                      remark,
                    },
                    () => {
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    }
                  );
                }
                //订票人录入票据 更新订票明细的订票结果、订票说明、订票金额、备注
                // bookResult bookDescription baseCurrencyBookAmt remark
                else if (taskKey === 'ADM_M06_03_ENTRY_TICKET_INFOR') {
                  const params = [];
                  let bookResultExist = true;
                  tripExpenseDataList.forEach(item => {
                    if (
                      !item.bookResult ||
                      !item.bookDescription ||
                      (!item.baseCurrencyBookAmt && item.baseCurrencyBookAmt !== 0)
                    ) {
                      bookResultExist = false;
                      createMessage({
                        type: 'error',
                        description: '请填写订票结果、订票说明、订票金额！',
                      });
                      return;
                    }
                    const param = {};
                    param.id = item.id;
                    param.bookResult = item.bookResult;
                    param.bookDescription = item.bookDescription;
                    param.baseCurrencyBookAmt = item.baseCurrencyBookAmt;
                    param.remark = item.remark;
                    param.tripExpenseId = item.tripExpenseId;
                    params.push(param);
                  });
                  const formDataParam = {};
                  formDataParam.tripExpenseDataList = params;
                  formDataParam.baseCurrencyBookAmt = formData.baseCurrencyBookAmt;
                  formDataParam.id = formData.id;
                  formDataParam.tripNo = formData.tripNo;
                  formDataParam.bookStatus = 'FINISHED';
                  formDataParam.remark = remark;
                  //行政订票流程的第二个节点被删了 只能放到第三步更新订票人和日期了
                  formDataParam.bookResId = resId;
                  formDataParam.bookDate = moment().format('YYYY-MM-DD');

                  bookResultExist &&
                    this.handleUpdate(formDataParam, () => {
                      const url = getUrl().replace('edit', 'view');
                      closeThenGoto(url);
                    });
                } else {
                  return Promise.resolve(true);
                }
              }
            }
            return Promise.resolve(false);
          }}
        >
          <ButtonCard>
            {(formMode === 'EDIT' || formMode === 'ADD') && [
              <Button
                key="save"
                size="large"
                type="primary"
                onClick={this.handleSave}
                loading={saveLoading}
              >
                保存
              </Button>,
              <Button
                key="submit"
                size="large"
                type="primary"
                onClick={() =>
                  this.handleSubmitProcess({}, () => {
                    closeThenGoto(`/user/flow/process?type=procs`);
                  })
                }
                loading={saveLoading}
              >
                提交
              </Button>,
            ]}
          </ButtonCard>
          <BusinessForm
            title="行政订票申请"
            form={form}
            formData={formData}
            formMode={formMode}
            defaultColumnStyle={8}
          >
            <FormItem fieldType="BaseInput" label="行政订票单号" disabled fieldKey="ticketBookNo" />
            <FormItem
              fieldType="BaseCustomSelect"
              label="订票方"
              disabled={false}
              required
              fieldKey="ticketBookSite"
              parentKey="CUS:TICKET_BOOK_SITE"
              onChange={(value, option, allOptions) => {
                // 如果是合作方订票，供应商
                if (option.length > 0) {
                  this.callModelEffects('updateForm', { supplierId: option[0].extVarchar2 });
                }
              }}
            />
            <FormItem
              fieldType="SupplierSimpleSelect"
              label="供应商"
              disabled
              fieldKey="supplierId"
              descriptionField="supplierDesc"
            />
            <FormItem
              fieldType="BaseInput"
              label="相关出差申请单"
              disabled
              fieldKey="tripNo"
              initialvalue={tripNo}
            />
            <FormItem
              label="申请人"
              fieldKey="applyResId"
              fieldType="ResSimpleSelect"
              initialValue={resId}
              required
              descriptionField="applyResDesc"
            />
            <FormItem
              label="申请日期"
              fieldKey="applyDate"
              initialValue={moment().format('YYYY-MM-DD')}
              fieldType="BaseDatePicker"
              disabled
            />
            <FormItem
              fieldType="BaseSelect"
              label="订票状态"
              disabled
              descriptionField="bookStatusDesc"
              parentKey="ADM:BOOK_STATUS"
              fieldKey="bookStatus"
              initialValue={bookStatus}
            />
            <FormItem
              fieldType="ResSimpleSelect"
              label="订票人"
              disabled
              descriptionField="bookResDesc"
              fieldKey="bookResId"
            />
            <FormItem
              label="订票日期"
              fieldKey="bookDate"
              // initialValue={moment().format('YYYY-MM-DD')}
              fieldType="BaseDatePicker"
              disabled
            />
            <FormItem
              fieldType="BaseInputAmt"
              label="订票金额(本位币)"
              disabled
              descriptionField="baseCurrencyBookAmt"
              fieldKey="baseCurrencyBookAmt"
            />
            {/* <FormItem
              fieldType="BaseFileManagerEnhance"
              label="附件"
              fieldKey="attachment"
              // api="/api/production/tripTicketBook/sfs/token"
              api="/api/production/adm/tripTicketBook/sfs/token"
              dataKey={formData.id}
            /> */}
            <FormItem
              fieldType="FileUpload"
              fieldKey="attachment"
              label="附件"
              fileList={attachments}
              multiple
            />
            <FormItem
              fieldType="BaseCustomSelect"
              label="费用承担公司"
              fieldKey="chargeCompany"
              initialValue={chargeCompany}
              parentKey="CUS:INTERNAL_COMPANY"
            />
            <FormItem fieldType="BaseInputTextArea" label="备注" fieldKey="remark" />
          </BusinessForm>

          <EditTable
            form={form}
            formMode={formMode}
            title="本次订票明细"
            dataSource={tripExpenseDataList} // 获取数据的方法,请注意获取数据的格式
            columns={editColumns} //{columns} // 要展示的列
            scroll={{ x: 2000 }}
            {...detailOperation}
          />

          <DataTable
            title="同一出差下其他订票明细"
            columns={otherColumns}
            dataSource={otherTripExpenseList}
            prodSelection={false}
            scroll={{ x: 1800 }}
          />

          <DataTable
            title="相关费用明细"
            columns={descColumns}
            dataSource={detailList}
            prodSelection={false}
            scroll={{ x: 1800 }}
          />

          <DataTable
            title="出差人信息"
            columns={personColumns}
            dataSource={tripExpensePersonList}
            prodSelection={false}
            scroll={{ x: 1800 }}
          />
        </BpmWrapper>
      </PageWrapper>
    );
  }
}

export default BookingByAdminDisplay;
