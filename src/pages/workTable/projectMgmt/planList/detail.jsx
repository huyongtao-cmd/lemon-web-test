import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Table, Radio, Tabs } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import { outputHandle } from '@/utils/production/outputUtil';
import PageWrapper from '@/components/production/layout/PageWrapper';
import ButtonCard from '@/components/production/layout/ButtonCard';
import Button from '@/components/production/basic/Button';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { projectPlanListRq } from '@/services/workbench/project';
import styles from './style.less';

const { TabPane } = Tabs;

const DOMAIN = 'planListDetail';

@connect(({ loading, planListDetail, dispatch }) => ({
  loading,
  ...planListDetail,
  dispatch,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
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
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class index extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    const { id, scene, planType } = fromQs();

    // 相关成员
    dispatch({
      type: `${DOMAIN}/getMemberGroup`,
      payload: { key: 'CUS:MEMBER_GROUP' },
    });

    // // 阶段列表 - 根据项目ID拉取阶段
    // dispatch({
    //   type: `${DOMAIN}/projectPhaseList`,
    //   payload: { limit: 0, projectId },
    // });

    if (id) {
      dispatch({
        type: `${DOMAIN}/projectPlanDetail`,
        payload: { id },
      }).then(res => {
        if (res) {
          const { planTypeVal1, projectId } = res;
          projectId && this.getProjectMember({ limit: 0, projectId });
          this.pageConfig(planTypeVal1);
        }
      });
    } else {
      planType &&
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { planType },
        });
      this.pageConfig(scene);

      const { projectId } = fromQs();
      projectId && this.getProjectMember({ limit: 0, projectId });
    }
  }

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  pageConfig = scene => {
    const { dispatch } = this.props;

    scene
      ? dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `PROJECT_PLAN_EDIT:${scene}` },
        })
      : dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `PROJECT_PLAN_EDIT` },
        });
  };

  getProjectMember = parmas => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/projectMemberPage`,
      payload: { ...parmas },
    });
  };

  // handleSave = () => {
  //   const {
  //     form: { validateFieldsAndScroll },
  //     dispatch,
  //     dataListSelected,
  //   } = this.props;
  //   const {
  //     formData: { ...newFormData },
  //   } = this.props;

  //   const { projectId } = this.state;

  //   validateFieldsAndScroll((error, values) => {
  //     if (!error) {
  //       dispatch({
  //         type: `${DOMAIN}/projectPlanEdit`,
  //         payload: {
  //           ...newFormData,
  //           ...values,
  //           projectId,
  //           projectPlanMemberEntityList: dataListSelected,
  //         },
  //       });
  //     }
  //   });
  // };

  renderColumns = () => {
    const { pageConfig } = this.props;
    const fields = [
      {
        title: '角色',
        key: 'projectRole',
        dataIndex: 'projectRole',
        align: 'center',
        width: '20%',
      },
      {
        title: '名称',
        key: 'memberName',
        dataIndex: 'memberName',
        align: 'center',
        width: '20%',
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'center',
        width: '60%',
      },
    ];
    // const fieldsConfig = ProductTableColumnsBlockConfig(
    //   pageConfig,
    //   'blockKey',
    //   'EXPENSE_QUOTA_D_TABLT',
    //   fields
    // );

    return fields;
  };

  // fetchTree = async () => {
  //   const { data } = await outputHandle(projectPlanListRq, { limit: 0 });
  //   return data.rows.map(item => ({ ...item, title: item.planName }));
  // };

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form, phaseList } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="编号"
        key="planNo"
        fieldKey="planNo"
        fieldType="BaseInput"
        initialValue={formData.planNo}
        required
      />,
      <FormItem
        label="计划类型"
        fieldKey="planType"
        key="planType"
        fieldType="BaseCustomSelect"
        parentKey="CUS:PLAN_TYPE"
        initialValue={formData.planType}
      />,
      <FormItem
        label="集数"
        fieldKey="configurableField1"
        key="configurableField1"
        fieldType="BaseInput"
        initialValue={formData.configurableField1}
      />,
      <FormItem
        label="气氛"
        fieldKey="configurableField2"
        key="configurableField2"
        fieldType="BaseInput"
        initialValue={formData.configurableField2}
      />,
      <FormItem
        label="页数"
        fieldKey="configurableField3"
        key="configurableField3"
        fieldType="BaseInput"
        initialValue={formData.configurableField3}
      />,
      <FormItem
        label="主场景"
        fieldKey="configurableField4"
        key="configurableField4"
        fieldType="BaseInput"
        initialValue={formData.configurableField4}
      />,
      <FormItem
        label="次场景"
        fieldKey="configurableField5"
        key="configurableField5"
        fieldType="BaseInput"
        initialValue={formData.configurableField5}
      />,
      <FormItem
        label="所属阶段"
        fieldKey="phaseNo"
        key="phaseNo"
        fieldType="BaseSelect"
        initialValue={formData.phaseNo}
        descList={phaseList}
        descriptionField="phaseIdDesc"
      />,
      <FormItem
        label="状态"
        fieldKey="executeStatus"
        key="executeStatus"
        fieldType="BaseSelect"
        parentKey="PRO:EXECUTE_STATUS"
        initialValue={formData.executeStatus}
        required
      />,
      <FormItem
        label="日期起"
        fieldKey="planStartDate"
        key="planStartDate"
        fieldType="BaseDatePicker"
        initialValue={formData.planStartDate}
      />,
      <FormItem
        label="日期止"
        fieldKey="planEndDate"
        key="planEndDate"
        fieldType="BaseDatePicker"
        initialValue={formData.planEndDate}
      />,
      <FormItem
        label="名称"
        fieldKey="planName"
        key="planName"
        fieldType="BaseInput"
        initialValue={formData.planName}
        required
      />,
      <FormItem
        label="负责人"
        fieldKey="inchargeResId"
        key="inchargeResId"
        fieldType="ResSimpleSelect"
        initialValue={formData.inchargeResId}
      />,
      <FormItem
        label="父级计划"
        key="parentId"
        fieldKey="parentId"
        fieldType="BaseTreeSelect"
        initialValue={formData.parentId}
        // fetchData={this.fetchTree}
        required
      />,

      <FormItem
        label="主要内容"
        key="configurableField6"
        fieldKey="configurableField6"
        fieldType="BaseInputTextArea"
        initialValue={formData.configurableField6}
      />,
      <FormItem
        label="服化道提示"
        key="configurableField7"
        fieldKey="configurableField7"
        fieldType="BaseInputTextArea"
        initialValue={formData.configurableField7}
      />,
      <FormItem
        label="备注"
        key="remark"
        fieldKey="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.remark}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'PROJECT_PLAN_EDIT_FORM',
      fields
    );

    return (
      <>
        <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
          {fieldsConfig}
        </BusinessForm>
      </>
    );
  };

  render() {
    const {
      dispatch,
      loading,
      form,
      formData,
      formMode,
      memberGroupList,
      projectMemberList,
      dataListSelected = [],
    } = this.props;

    const disabledBtn =
      loading.effects[`${DOMAIN}/projectPlanDetail`] ||
      loading.effects[`${DOMAIN}/projectPlanEdit`];

    const rowSelection = {
      getCheckboxProps: record => ({
        disabled: formMode === 'DESCRIPTION',
      }),
      selectedRowKeys: dataListSelected.map(v => v.id),
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.concat([record]),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.filter(v => v.id !== record.id),
            },
          });
        }
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        if (selected) {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.concat(changeRows),
            },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              dataListSelected: dataListSelected.filter(
                v => !changeRows.map(item => item.id).includes(v.id)
              ),
            },
          });
        }
      },
    };

    return (
      <PageWrapper>
        {this.renderPage()}
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={24}>
            <BusinessFormTitle title="相关成员" />
            <Tabs onChange={() => {}} type="card">
              {memberGroupList.map(v => (
                <TabPane tab={v.title} key={v.value}>
                  <Table
                    bordered
                    rowKey="id"
                    rowSelection={rowSelection}
                    columns={this.renderColumns()}
                    dataSource={projectMemberList
                      .filter(item => item.memberGroup === v.value)
                      .map(item => ({ ...item, projectMemberId: item.id }))}
                    loading={loading.effects[`${DOMAIN}/projectMemberPage`]}
                  />
                </TabPane>
              ))}
            </Tabs>
          </BusinessForm>
        </div>
      </PageWrapper>
    );
  }
}

export default index;
