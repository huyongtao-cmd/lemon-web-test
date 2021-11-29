import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Table, Tabs, Input, Modal } from 'antd';
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

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'reportDetail';

@connect(({ loading, reportDetail, dispatch, global }) => ({
  loading,
  ...reportDetail,
  dispatch,
  global,
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
  state = {};

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
        type: `${DOMAIN}/dailyDetail`,
        payload: { id },
      }).then(res => {
        if (res) {
          const {
            reportConfigurableField1,
            reportConfigurableField2,
            reportConfigurableField3,
            reportConfigurableField4,
            reportConfigurableField5,
            reportConfigurableField6,
            reportConfigurableField7,
          } = res;
          const { planViews = [] } = res;

          // 不为空说明生成过报告
          const firstFlag =
            Array.isArray(planViews) && !isEmpty(planViews.filter(v => v.sourceType === 'REPORT'));
          if (
            reportConfigurableField1 ||
            reportConfigurableField2 ||
            reportConfigurableField3 ||
            reportConfigurableField4 ||
            reportConfigurableField5 ||
            reportConfigurableField6 ||
            reportConfigurableField7 ||
            firstFlag
          ) {
            // 报告相关的但凡有一个字段有值，都不是第一次进入
            dispatch({
              type: `${DOMAIN}/dailyReportDetail`,
              payload: { id },
            }).then(r => {
              if (r) {
                //一切只是为了相关成员的回显，捯饬来捯饬去，都要跟projectAllMemberList靠齐
                const { memberViews = [] } = res;
                const tt = Array.isArray(memberViews)
                  ? memberViews.map(v => ({
                      ...v,
                      id: v.projectMemberId,
                      reportConfigurableField1: v.reportConfigurableField1
                        ? v.reportConfigurableField1
                        : v.scheduleConfigurableField1,
                      reportConfigurableField2: v.reportConfigurableField2
                        ? v.reportConfigurableField2
                        : v.scheduleConfigurableField2,
                      reportConfigurableField3: v.reportConfigurableField3
                        ? v.reportConfigurableField3
                        : v.scheduleConfigurableField3,
                    }))
                  : [];
                // 拉取项目成员列表
                projectId &&
                  this.getProjectMember({ limit: 0, projectId, flag: true, memberViews: tt });
              }
            });
          } else {
            dispatch({
              type: `${DOMAIN}/dailyPlanDetail`,
              payload: { id },
            }).then(r => {
              if (r) {
                //一切只是为了相关成员的回显，捯饬来捯饬去，都要跟projectAllMemberList靠齐
                const { memberViews = [] } = res;

                const tt = Array.isArray(memberViews)
                  ? memberViews.map(v => ({
                      ...v,
                      id: v.projectMemberId,
                      reportConfigurableField1: v.reportConfigurableField1
                        ? v.reportConfigurableField1
                        : v.scheduleConfigurableField1,
                      reportConfigurableField2: v.reportConfigurableField2
                        ? v.reportConfigurableField2
                        : v.scheduleConfigurableField2,
                      reportConfigurableField3: v.reportConfigurableField3
                        ? v.reportConfigurableField3
                        : v.scheduleConfigurableField3,
                    }))
                  : [];

                // 拉取项目成员列表
                projectId &&
                  this.getProjectMember({ limit: 0, projectId, flag: true, memberViews: tt });
              }
            });
          }
        }
      });
    } else {
      // 暂时不会出现没有id的情况}
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
          payload: { pageNo: `DAILY_REPORT_EDIT:${scene}` },
        })
      : dispatch({
          type: `${DOMAIN}/getPageConfig`,
          payload: { pageNo: `DAILY_REPORT_EDIT` },
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
    const { pageConfig } = this.props;

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
        title: '执行状态',
        key: 'executeStatus',
        dataIndex: 'executeStatusDesc',
        align: 'center',
      },
      {
        title: '完成百分比',
        key: 'progress',
        dataIndex: 'progress',
        align: 'center',
        render: val => `${val}%`,
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
      'DAILY_REPORT_PLAN',
      fields
    );

    return fieldsConfig;
  };

  renderColumns1 = () => {
    const { pageConfig } = this.props;
    const fields = [
      {
        title: '角色',
        key: 'role',
        dataIndex: 'role',
        align: 'center',
      },
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        align: 'center',
      },
      {
        title: '出发时间',
        key: 'reportConfigurableField1',
        dataIndex: 'reportConfigurableField1',
        align: 'center',
      },
      {
        title: '化妆时长',
        key: 'reportConfigurableField2',
        dataIndex: 'reportConfigurableField2',
        align: 'center',
      },
      {
        title: '交妆时间',
        key: 'reportConfigurableField3',
        dataIndex: 'reportConfigurableField3',
        align: 'center',
      },
    ];
    const fieldsConfig = ProductTableColumnsBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_REPORT_MEMBER',
      fields
    );

    return fieldsConfig;
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
        fieldKey="reportConfigurableField1"
        key="reportConfigurableField1"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField1}
      />,
      <FormItem
        label="可配置字段2"
        fieldKey="reportConfigurableField2"
        key="reportConfigurableField2"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField2}
      />,
      <FormItem
        label="可配置字段3"
        fieldKey="reportConfigurableField3"
        key="reportConfigurableField3"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField3}
      />,
      <FormItem
        label="可配置字段4"
        fieldKey="reportConfigurableField4"
        key="reportConfigurableField4"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField4}
      />,
      <FormItem
        label="可配置字段5"
        fieldKey="reportConfigurableField5"
        key="reportConfigurableField5"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField5}
      />,
      <FormItem
        label="可配置字段6"
        fieldKey="reportConfigurableField6"
        key="reportConfigurableField6"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField6}
      />,
      <FormItem
        label="可配置字段7"
        fieldKey="reportConfigurableField7"
        key="reportConfigurableField7"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField7}
      />,
      <FormItem
        label="可配置字段8"
        fieldKey="reportConfigurableField8"
        key="reportConfigurableField8"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField8}
      />,
      <FormItem
        label="可配置字段9"
        fieldKey="reportConfigurableField9"
        key="reportConfigurableField9"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField9}
      />,
      <FormItem
        label="可配置字段10"
        fieldKey="reportConfigurableField10"
        key="reportConfigurableField10"
        fieldType="BaseInput"
        initialValue={formData.reportConfigurableField10}
      />,
      <FormItem
        label="备注"
        key="remarkReport"
        fieldKey="remarkReport"
        fieldType="BaseInputTextArea"
        initialValue={formData.remarkReport}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'DAILY_REPORT_MAIN',
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
      projectMemberList = [],
      relatedPlanList = [],
    } = this.props;

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
            <Tabs onChange={() => {}} type="card">
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
                        role: item.projectRole,
                        name: item.memberName,
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
