import React from 'react';
import { connect } from 'dva';
import { isEmpty, omit } from 'ramda';
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
import update from 'immutability-helper';

// namespace声明
const DOMAIN = 'copyrightDisplayPage';

/**
 * 单表案例 综合展示页面
 */
@connect(({ loading, dispatch, copyrightDisplayPage, user: { user } }) => ({
  loading: loading.effects[`${DOMAIN}/init`] || loading.effects[`${DOMAIN}/fetchConfig`],
  saveLoading: loading.effects[`${DOMAIN}/save`],
  dispatch,
  ...copyrightDisplayPage,
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
  onValuesChange(props, changedValues) {
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
class CopyrightDisplay extends React.PureComponent {
  componentDidMount() {
    // 调用页面载入初始化方法,一般是请求页面数据
    // fromQs 方法从url获取路径参数，仅能在组件加载时调用一次，且只能在一级组件调用，后续在组件内部维护自己的url参数。否则多TAB体系可能会出BUG
    const { id, copy, mode } = fromQs();
    const formMode = mode === 'edit' || mode === 'ADD' || mode === 'EDIT' ? 'EDIT' : 'DESCRIPTION';
    this.updateModelState({ formMode, id, copy, copyrightPartnersList: [] });
    // 页面初始化加载预算列表，如果要严格控制到项目可以在这里进行屏蔽
    this.callModelEffects('updateForm', { id });
    this.callModelEffects('init');
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
  callModelEffects = (method, params) => {
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
    const { form, formData } = this.props;
    const { copyrightPartnersList } = formData;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { authorizedDate } = formData;
        const authorizedStartDate = authorizedDate[0];
        const authorizedEndDate = authorizedDate[1];
        const { copyrightPartnersList: tempList } = values;
        for (let i = 0; i < copyrightPartnersList.length; i += 1) {
          copyrightPartnersList[i] = Object.assign(copyrightPartnersList[i], tempList[i]);
        }
        let relatedResIds = '';
        const { relatedResId } = values;
        if (relatedResId !== undefined && relatedResId.length > 0) {
          relatedResIds = relatedResId.join(',');
        }
        this.callModelEffects('save', {
          formData: {
            ...omit(['copyrightPartnersList'], formData),
            authorizedStartDate,
            authorizedEndDate,
            relatedResIds,
            copyrightPartnersList,
            ...omit(['copyrightPartnersList'], values),
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
      loading,
      saveLoading,
      user: {
        extInfo: { userId },
      }, // 取当前登陆人的resId
    } = this.props;
    const { copyrightPartnersList, currentSerNo } = formData;
    return (
      <PageWrapper loading={loading}>
        <ButtonCard>
          {(formMode === 'EDIT' || formMode === 'ADD') && [
            <Button
              size="large"
              key="save"
              type="primary"
              onClick={() => this.handleSave()}
              loading={saveLoading}
            >
              保存
            </Button>,
          ]}
        </ButtonCard>
        <BusinessForm
          title="版权信息"
          form={form}
          formData={formData}
          formMode={formMode}
          defaultColumnStyle={12}
        >
          <FormItem
            label="名称"
            fieldKey="copyrightName"
            fieldType="BaseInput"
            placeholder="版权名称"
            fieldMode={formMode}
            required
          />
          <FormItem
            label="版权类型"
            fieldKey="copyrightType"
            fieldType="BaseCustomSelect"
            placeholder="请选择"
            fieldMode={formMode}
            parentKey="CUS:COPYRIGHT_TYPE"
            required
          />
          <FormItem
            label="授权范围"
            fieldKey="authorizedScope"
            fieldType="BaseCustomSelect"
            placeholder="请选择"
            parentKey="CUS:AUTHORIZED_SCOPE"
            fieldMode={formMode}
            required
          />
          <FormItem
            label="相关合同"
            fieldKey="contractId"
            fieldType="ContractSimpleSelect"
            descriptionField="contractDesc"
            placeholder="请选择"
            fieldMode={formMode}
          />
          <FormItem
            label="签约日期"
            fieldKey="signDate"
            fieldType="BaseDatePicker"
            placeholder="请选择"
            fieldMode={formMode}
          />
          <FormItem
            label="版权金额"
            fieldKey="CopyrightAmtGroup"
            fieldType="Group"
            placeholder="请选择"
            fieldMode={formMode}
          >
            <FormItem
              fieldKey="currCode"
              fieldType="BaseSelect"
              placeholder="币种"
              parentKey="COMMON_CURRENCY"
              width="100"
              fieldMode={formMode}
            />
            <FormItem
              fieldKey="copyrightAmt"
              fieldType="BaseInputAmt"
              placeholder="请输入金额"
              fieldMode={formMode}
            />
          </FormItem>
          <FormItem
            label="版权周期"
            fieldKey="authorizedDate"
            fieldType="BaseDateRangePicker"
            placeholder="日期"
            descriptionRender={`${formData.authorizedStartDate ||
              ''} ~ ${formData.authorizedEndDate || ''}`}
            fieldMode={formMode}
            required
          />
          <FormItem
            label="版权周期说明"
            fieldKey="authorizedPeriodDesc"
            fieldType="BaseInput"
            placeholder="请选择"
            fieldMode={formMode}
          />
          <FormItem
            label="作者"
            fieldKey="author"
            fieldType="BaseInput"
            placeholder="请输入"
            fieldMode={formMode}
          />
          <FormItem
            label="版权负责人"
            fieldKey="copyrightPicResId"
            fieldType="ResSimpleSelect"
            placeholder="请选择"
            descriptionField="copyrightPicResDesc"
            fieldMode={formMode}
            required
          />
          <FormItem
            fieldType="ResSimpleSelect"
            label="相关人员"
            fieldKey="relatedResId"
            descriptionField="relatedResDesc"
            mode="multiple"
          />
          <FormItem
            label="状态"
            fieldKey="copyrightStatus"
            fieldType="BaseCustomSelect"
            placeholder="请选择"
            parentKey="CUS:COPYRIGHT_STATUS"
            fieldMode={formMode}
            required
          />
          <FormItem
            label="备注"
            fieldKey="remark"
            fieldType="BaseInputTextArea"
            placeholder="请输入"
            fieldMode={formMode}
          />

          <FormItem
            label="创建人"
            fieldKey="createUserId"
            fieldType="UserSimpleSelect"
            descriptionField="createUserDesc"
            initialValue={userId}
            disabled
          />
          <FormItem
            label="创建日期"
            fieldKey="createTime"
            fieldType="BaseDatePicker"
            descriptionRender={moment(formData.createTime).format('YYYY-MM-DD')}
            initialValue={new Date()}
            disabled
          />
        </BusinessForm>
        <EditTable
          title="合作公司"
          form={form}
          formMode={formMode}
          dataSource={copyrightPartnersList} // 获取数据的方法,请注意获取数据的格式
          columns={[
            {
              title: '合作公司',
              required: true,
              dataIndex: 'partnerName',
              sorter: true,
              width: '200',
              render: (val, row, i) => (
                <FormItem
                  form={form}
                  fieldType="BaseInput"
                  disabled={formMode === 'DESCRIPTION'}
                  fieldKey={`copyrightPartnersList[${i}].partnerName`}
                  required
                />
              ),
            },
            {
              title: '联系人-姓名',
              dataIndex: 'contactName',
              render: (val, row, i) => (
                <FormItem
                  form={form}
                  fieldType="BaseInput"
                  disabled={formMode === 'DESCRIPTION'}
                  fieldKey={`copyrightPartnersList[${i}].contactName`}
                />
              ),
            },
            {
              title: '联系人-电话',
              dataIndex: 'contactTel',
              render: (val, row, i) => (
                <FormItem
                  form={form}
                  disabled={formMode === 'DESCRIPTION'}
                  fieldType="BaseInput"
                  fieldKey={`copyrightPartnersList[${i}].contactTel`}
                />
              ),
            },
            {
              title: '联系人-邮箱',
              dataIndex: 'contactEmail',
              render: (val, row, i) => (
                <FormItem
                  form={form}
                  disabled={formMode === 'DESCRIPTION'}
                  fieldType="BaseInput"
                  fieldKey={`copyrightPartnersList[${i}].contactEmail`}
                />
              ),
            },
            {
              title: '备注',
              dataIndex: 'remark',
              render: (val, row, i) => (
                <FormItem
                  form={form}
                  disabled={formMode === 'DESCRIPTION'}
                  fieldType="BaseInput"
                  fieldKey={`copyrightPartnersList[${i}].remark`}
                />
              ),
            },
          ]} //{columns} // 要展示的列
          style={{ overflow: 'hidden' }}
          onAddClick={
            formMode === 'DESCRIPTION'
              ? undefined
              : () => {
                  const localCurrentSerNo = (currentSerNo === undefined ? 0 : currentSerNo) + 1;
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      copyrightPartnersList: update(copyrightPartnersList, {
                        $push: [
                          {
                            id: localCurrentSerNo,
                          },
                        ],
                      }),
                      currentSerNo: localCurrentSerNo,
                    },
                  });
                }
          } // 新增按钮逻辑,不写不展示
          onDeleteConfirm={
            formMode === 'DESCRIPTION'
              ? undefined
              : keys => {
                  const newDataSource = copyrightPartnersList.filter(
                    row => keys.indexOf(row.id) < 0
                  );
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: { copyrightPartnersList: newDataSource },
                  });
                }
          }
        />
      </PageWrapper>
    );
  }
}

export default CopyrightDisplay;
