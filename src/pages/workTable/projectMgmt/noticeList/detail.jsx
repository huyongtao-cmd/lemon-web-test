import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty } from 'ramda';
import { Form, Table, Tabs } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import PageWrapper from '@/components/production/layout/PageWrapper';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';

import styles from './style.less';

const { TabPane } = Tabs;

const DOMAIN = 'noticeListDetail';

@connect(({ loading, noticeListDetail, dispatch }) => ({
  loading,
  ...noticeListDetail,
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
class indexCom extends Component {
  state = {
    memberType: 'MANAGEMENT',
  };

  componentDidMount() {
    const { dispatch } = this.props;

    const { id, scene, planType, projectId } = fromQs();
    // 相关成员
    dispatch({
      type: `${DOMAIN}/getMemberGroup`,
      payload: { key: 'CUS:MEMBER_GROUP' },
    });

    if (id) {
      this.pageConfig(scene);

      dispatch({
        type: `${DOMAIN}/dailyPlanDetail`,
        payload: { id },
      }).then(res => {
        if (res) {
          //一切只是为了相关成员的回显，捯饬来捯饬去，都要跟projectAllMemberList靠齐
          const { memberViews = [] } = res;
          // 拉取项目成员列表
          projectId && this.getProjectMember({ limit: 0, projectId, flag: true, memberViews });
        }
      });
    } else {
      this.pageConfig(scene);

      planType &&
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { planType },
        });

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
          payload: { pageNo: `DAILY_PLAN_EDIT:${scene}` },
        })
      : dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `DAILY_PLAN_EDIT` },
        });
  };

  getProjectMember = parmas => {
    const { dispatch } = this.props;
    const { flag, memberViews = [], ...restParmas } = parmas;
    dispatch({
      type: `${DOMAIN}/projectMemberPage`,
      payload: { ...restParmas },
    }).then(res => {
      if (flag) {
        this.dealProjectMemberList(memberViews);
      }
    });
  };

  renderColumns = () => {
    const { pageConfig, form } = this.props;

    const fields = [
      {
        title: '序号',
        // key: 'sortNo',
        dataIndex: 'sortNo',
        align: 'center',
      },
      {
        title: '场次',
        key: 'planName',
        dataIndex: 'planName',
        align: 'center',
      },
      {
        title: '集数',
        key: 'configurableField1',
        dataIndex: 'configurableField1',
        align: 'center',
      },
      {
        title: '气氛',
        key: 'configurableField2',
        dataIndex: 'configurableField2',
        align: 'center',
      },
      {
        title: '页数',
        key: 'configurableField3',
        dataIndex: 'configurableField3',
        align: 'center',
      },
      {
        title: '主场景',
        key: 'configurableField4',
        dataIndex: 'configurableField4',
        align: 'center',
      },
      {
        title: '次场景',
        key: 'configurableField5',
        dataIndex: 'configurableField5',
        align: 'center',
      },
      {
        title: '主要内容',
        key: 'configurableField6',
        dataIndex: 'configurableField6',
        align: 'center',
      },
      {
        title: '姓名',
        key: 'projectRole',
        dataIndex: 'projectRole',
        align: 'center',
      },
      {
        title: '服化道提示',
        key: 'configurableField7',
        dataIndex: 'configurableField7',
        align: 'center',
      },
      {
        title: '备注',
        key: 'remark',
        dataIndex: 'remark',
        align: 'letf',
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'RELATE_PLAN',
      fields
    );

    return fieldsConfig;
  };

  renderColumns1 = () => {
    const { pageConfig, projectMemberList, dataListSelected, formMode } = this.props;
    const fields = [
      {
        title: '角色',
        key: 'role',
        dataIndex: 'projectRole',
        align: 'center',
      },
      {
        title: '名称',
        key: 'name',
        dataIndex: 'memberName',
        align: 'center',
      },
      {
        title: '出发时间',
        key: 'scheduleConfigurableField1',
        dataIndex: 'scheduleConfigurableField1',
        align: 'center',
      },
      {
        title: '化妆时长',
        key: 'scheduleConfigurableField2',
        dataIndex: 'scheduleConfigurableField2',
        align: 'center',
      },
      {
        title: '交妆时间',
        key: 'scheduleConfigurableField3',
        dataIndex: 'scheduleConfigurableField3',
        align: 'center',
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_MEMBER',
      fields
    );

    return fieldsConfig;
  };

  // 配置所需要的内容
  renderPage = () => {
    const { formData, formMode, pageConfig, form } = this.props;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="名称"
        key="dailyName"
        fieldKey="dailyName"
        fieldType="BaseInput"
        initialValue={formData.dailyName}
        required
      />,
      <FormItem
        label="日期"
        fieldKey="dailyDate"
        key="dailyDate"
        fieldType="BaseDatePicker"
        initialValue={formData.dailyDate}
      />,
      <FormItem
        label="可配置字段1"
        fieldKey="scheduleConfigurableField1"
        key="scheduleConfigurableField1"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField1}
      />,
      <FormItem
        label="可配置字段2"
        fieldKey="scheduleConfigurableField2"
        key="scheduleConfigurableField2"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField2}
      />,
      <FormItem
        label="可配置字段3"
        fieldKey="scheduleConfigurableField3"
        key="scheduleConfigurableField3"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField3}
      />,
      <FormItem
        label="可配置字段4"
        fieldKey="scheduleConfigurableField4"
        key="scheduleConfigurableField4"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField4}
      />,
      <FormItem
        label="可配置字段5"
        fieldKey="scheduleConfigurableField5"
        key="scheduleConfigurableField5"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField5}
      />,
      <FormItem
        label="可配置字段6"
        fieldKey="scheduleConfigurableField6"
        key="scheduleConfigurableField6"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField6}
      />,
      <FormItem
        label="可配置字段7"
        fieldKey="scheduleConfigurableField7"
        key="scheduleConfigurableField7"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField7}
      />,
      <FormItem
        label="可配置字段8"
        fieldKey="scheduleConfigurableField8"
        key="scheduleConfigurableField8"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField8}
      />,
      <FormItem
        label="可配置字段9"
        fieldKey="scheduleConfigurableField9"
        key="scheduleConfigurableField9"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField9}
      />,
      <FormItem
        label="可配置字段10"
        fieldKey="scheduleConfigurableField10"
        key="scheduleConfigurableField10"
        fieldType="BaseInput"
        initialValue={formData.scheduleConfigurableField10}
      />,
      <FormItem
        label="备注"
        key="remarkPlan"
        fieldKey="remarkPlan"
        fieldType="BaseInputTextArea"
        initialValue={formData.remarkPlan}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_EDIT_DEFLAUT',
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

  dealProjectMemberList = memberViews => {
    const { dispatch, projectMemberList, projectAllMemberList } = this.props;
    const tt = memberViews.map(v => ({
      ...v,
      ...projectAllMemberList.filter(item => item.id === v.projectMemberId)[0],
    }));

    // 取并集，不会覆盖已经添加的相关成员
    // const tt1 = projectMemberList.concat(
    //   tt.filter(v => !(projectMemberList.map(v1 => v1.id).indexOf(v.id) > -1))
    // );

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        projectMemberList: tt,
      },
    });
  };

  render() {
    const {
      loading,
      form,
      formData,
      formMode,
      memberGroupList,
      projectMemberList = [],
      relatedPlanList = [],
    } = this.props;

    const { memberType } = this.state;

    return (
      <PageWrapper>
        {this.renderPage()}
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={24}>
            <BusinessFormTitle title="关联计划" />
            <Table
              rowSelection={null}
              rowKey="id"
              bordered
              columns={this.renderColumns()}
              dataSource={relatedPlanList}
            />
          </BusinessForm>
        </div>
        <div className={styles.boxWarp}>
          <BusinessForm formData={formData} form={null} formMode={formMode} defaultColumnStyle={24}>
            <BusinessFormTitle title="相关成员" />
            <Tabs
              onChange={e => {
                const tt = memberGroupList.filter(v => v.selectionValue === e);
                this.setState({
                  memberType: e,
                });
              }}
              type="card"
              activeKey={memberType}
            >
              {memberGroupList.map(v => (
                <TabPane tab={v.title} key={v.value}>
                  <Table
                    bordered
                    rowKey="id"
                    rowSelection={null}
                    columns={this.renderColumns1()}
                    dataSource={projectMemberList
                      .filter(item => item.memberGroup === v.value)
                      .map(item => ({
                        ...item,
                        projectMemberId: item.id,
                        role: v.projectRole,
                        name: v.memberName,
                      }))}
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

export default indexCom;
