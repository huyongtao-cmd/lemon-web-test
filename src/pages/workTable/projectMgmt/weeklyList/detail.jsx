import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil } from 'ramda';
import { Form, Card } from 'antd';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import EditTable from '@/components/production/business/EditTable';
import PageWrapper from '@/components/production/layout/PageWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import {
  ProductFormItemBlockConfig,
  ProductTableColumnsBlockConfig,
} from '@/utils/pageConfigUtils';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import { fromQs } from '@/utils/production/stringUtil';
import { genFakeId } from '@/utils/production/mathUtils';
import moment from 'moment';
import { div, mul } from '@/utils/mathUtils';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import styles from './style.less';

const DOMAIN = 'weeklyListDetails';

// eslint-disable-next-line no-useless-escape
const pat = /^(\d{4})\-(\d{2})\-(\d{2})$/; // 日期格式正则
const reg = /^-?[0-9]*(\.[0-9]*)?$/;

@connect(({ loading, weeklyListDetails, dispatch, user }) => ({
  loading,
  ...weeklyListDetails,
  dispatch,
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
    let newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }

    if (name === 'progressReferenceField1') {
      if (!((!isNil(value) && reg.test(value)) || value === '' || value === '-')) {
        const { formData } = props;
        const { progressReferenceField1 } = formData;
        newFieldData = {
          [name]: progressReferenceField1,
        };
      }
    }

    if (name === 'progressReferenceField2') {
      if (!((!isNil(value) && reg.test(value)) || value === '' || value === '-')) {
        const { formData } = props;
        const { progressReferenceField2 } = formData;
        newFieldData = {
          [name]: progressReferenceField2,
        };
      }
    }

    if (name === 'actorsFinishWorkList') {
      const { weeklyDetailViews } = props;

      // 创建一个比value长度短1的空数组 (因为value是[empty*n,{}]结构的)
      const arr1 = new Array(value.length - 1);
      // 取出来数组最后一项，也就是我们再操作的，要更新的项。其他项全为empty
      const lastValue = value[value.length - 1];

      // 筛选出目标数组匹配的数据
      const tt = weeklyDetailViews.filter(
        v => v.projectMemberId === Number(Object.values(lastValue)[0])
      );

      if (!isEmpty(tt)) {
        // 目标数组不为空时赋值，更新，往空数组塞值
        arr1.push({ ...tt[0], ...lastValue[0], id: genFakeId(-1) });
        newFieldData = {
          [name]: arr1,
        };
      }
    }

    props.dispatch({
      type: `${DOMAIN}/updateFormForEditTable`,
      payload: newFieldData,
    });
  },
})
class indexCom extends Component {
  state = {};

  componentDidMount() {
    const { dispatch } = this.props;

    const { id } = fromQs();
    this.setState({
      id,
    });

    // 可配置化信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'WEEKLY_REPORT_EDIT' },
    });

    if (id) {
      dispatch({
        type: `${DOMAIN}/weeklyDetail`,
        payload: { id },
      }).then(res => {
        if (res) {
          const { projectId } = res;
          if (projectId) {
            dispatch({
              type: `${DOMAIN}/projectMemberPage`,
              payload: { projectId },
            });
          }
        }
      });
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

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData: { shootingDate, actorsFinishWorkList, ...newFormData },
      thisWeekWorkList,
      allDoneWorkList,
    } = this.props;

    if (Array.isArray(shootingDate) && (shootingDate[0] || shootingDate[1])) {
      [newFormData.reportDateFrom, newFormData.reportDateTo] = shootingDate;
    }

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/weeklyEdit`,
          payload: {
            ...newFormData,
            ...values,
            detailEntities: actorsFinishWorkList,
            dailyView: {
              ...thisWeekWorkList[0],
              ...allDoneWorkList[0],
            },
          },
        });
      }
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const { dispatch, formData, formMode, pageConfig, form } = this.props;

    const { projectId, shootingDate } = formData;

    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="汇报开始日"
        key="weekStartDate"
        fieldKey="weekStartDate"
        fieldType="BaseDatePicker"
        initialValue={formData.weekStartDate}
        required
        // 只能选周一
        disabledDate={current =>
          moment(current).format('YYYY-MM-DD') !==
          moment(current)
            .startOf('week')
            .format('YYYY-MM-DD')
        }
        onChange={e => {
          if (!e) {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                shootingDate: null,
                daysInProgress: null,
              },
            });
            return;
          }
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              shootingDate: [
                moment(e)
                  .startOf('week')
                  .format('YYYY-MM-DD'),
                moment(e)
                  .endOf('week')
                  .format('YYYY-MM-DD'),
              ],
              daysInProgress:
                Math.abs(
                  moment(e)
                    .endOf('week')
                    .diff(moment(e).startOf('week'), 'days')
                ) + 1,
            },
          });
        }}
      />,
      <FormItem
        label="项目名称"
        key="projectId"
        fieldKey="projectId"
        fieldType="ProjectSimpleSelect"
        initialValue={formData.projectId}
        required
        onChange={e => {
          dispatch({
            type: `${DOMAIN}/projectMemberPage`,
            payload: {
              projectId: e,
              limit: 0,
            },
          });
        }}
      />,
      <FormItem
        label="拍摄日期"
        key="shootingDate"
        fieldKey="shootingDate"
        fieldType="BaseDateRangePicker"
        initialValue={formData.shootingDate}
        disabledDate={current =>
          formData.weekStartDate
            ? moment(current).isBefore(moment(formData.weekStartDate).startOf('week')) ||
              moment(current).isAfter(moment(formData.weekStartDate).endOf('week'))
            : null
        }
        descriptionRender={`${formData.reportDateFrom} ~ ${formData.reportDateTo}`}
        onChange={e => {
          const flag = !!e.filter(v => v).length;
          if (flag) {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                daysInProgress: Math.abs(moment(e[1]).diff(moment(e[0]), 'days')) + 1,
              },
            });
          } else {
            dispatch({
              type: `${DOMAIN}/updateForm`,
              payload: {
                daysInProgress: null,
              },
            });
          }
        }}
      />,
      <FormItem fieldType="Group" label="拍摄周期" key="shootingPeriod" required>
        <FormItem
          fieldKey="daysInProgress"
          fieldType="BaseInput"
          initialValue={formData.daysInProgress}
          addonAfter="天"
          descriptionRender={`${formData.daysInProgress}天`}
        />
        <FormItem
          fieldKey="weeksInProgress"
          fieldType="BaseInput"
          initialValue={formData.weeksInProgress || undefined}
          onChange={value => {}}
          addonBefore="第"
          addonAfter="周"
          descriptionRender={`第${formData.daysInProgress}周`}
        />
      </FormItem>,
      <FormItem
        label="本周完成素材时长"
        key="progressReferenceField1"
        fieldKey="progressReferenceField1"
        fieldType="BaseInput"
        initialValue={formData.progressReferenceField1}
        addonAfter="min"
      />,
      <FormItem
        label="已完成素材总时长"
        key="progressReferenceField2"
        fieldKey="progressReferenceField2"
        fieldType="BaseInput"
        initialValue={formData.progressReferenceField2}
        addonAfter="min"
      />,
      <FormItem
        label="状态"
        fieldKey="weeklyStatus"
        key="weeklyStatus"
        fieldType="BaseSelect"
        parentKey="PRO:WEEKLY_STATUS"
        initialValue={formData.weeklyStatus}
        disabled
      />,
      <FormItem
        label="创建人"
        fieldKey="createUserId"
        key="createUserId"
        fieldType="ResSimpleSelect"
        initialValue={formData.createUserId}
        disabled
      />,
      <FormItem
        label="创建时间"
        fieldKey="createTime"
        key="createTime"
        fieldType="BaseInput"
        initialValue={formData.createTime}
        disabled
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'WEEKLY_REPORT_EDIT_FORM',
      fields
    );

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fieldsConfig}
      </BusinessForm>
    );
  };

  // 配置所需要的内容
  renderPage1 = () => {
    const { formData, formMode, pageConfig, form } = this.props;

    const fields = [
      <BusinessFormTitle title="情况说明" />,
      <FormItem
        label="本周末完成说明"
        key="configurableField1"
        fieldKey="configurableField1"
        fieldType="BaseInputTextArea"
        initialValue={formData.configurableField1}
      />,
      <FormItem
        label="打景情况"
        key="configurableField2"
        fieldKey="configurableField2"
        fieldType="BaseInputTextArea"
        initialValue={formData.configurableField2}
      />,
      <FormItem
        label="特效进展"
        key="configurableField3"
        fieldKey="configurableField3"
        fieldType="BaseInputTextArea"
        initialValue={formData.configurableField3}
      />,
      <FormItem
        label="造型情况"
        key="configurableField4"
        fieldKey="configurableField4"
        fieldType="BaseInputTextArea"
        initialValue={formData.configurableField4}
      />,
    ];

    const fieldsConfig = ProductFormItemBlockConfig(
      pageConfig,
      'blockKey',
      'WEEKLY_REPORT_EDIT_FORM',
      fields
    );

    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fieldsConfig}
      </BusinessForm>
    );
  };

  renderColumns = () => {
    const { pageConfig } = this.props;

    const fields = [
      {
        title: '演员姓名',
        dataIndex: 'detailContent',
        align: 'center',
        // render: (text, record, index) => record.detailContent,
      },
      {
        title: '总场数',
        align: 'center',
        dataIndex: 'detailScheduleStatisticsField1',
        render: val => (val ? val.toFixed(2) : '0.00'),
      },
      {
        title: '完成场数',
        align: 'center',
        dataIndex: 'detailReportStatisticsField1',
        render: val => (val ? val.toFixed(2) : '0.00'),
      },
      {
        title: '完成场数占比',
        align: 'center',
        dataIndex: 'completeAccounted1',
        render: (val, row) =>
          row.detailScheduleStatisticsField1 && row.detailReportStatisticsField1
            ? `${mul(
                div(row.detailReportStatisticsField1, row.detailScheduleStatisticsField1),
                100
              ).toFixed(2)}%`
            : '0%',
      },
      {
        title: '总页数',
        align: 'center',
        dataIndex: 'detailScheduleStatisticsField2',
        render: val => (val ? val.toFixed(2) : '0.00'),
      },
      {
        title: '完成页数',
        align: 'center',
        dataIndex: 'detailReportStatisticsField2',
        render: val => (val ? val.toFixed(2) : '0.00'),
      },
      {
        title: '完成页数占比',
        align: 'center',
        dataIndex: 'completeAccounted2',
        render: (val, row) =>
          row.detailScheduleStatisticsField2 && row.detailReportStatisticsField2
            ? `${mul(
                div(row.detailReportStatisticsField2, row.detailScheduleStatisticsField2),
                100
              ).toFixed(2)}%`
            : '0%',
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

  thisWeekWork = () => {
    const { form, pageConfig, thisWeekWorkList } = this.props;
    const fields = [
      {
        title: '计划场数',
        align: 'center',
        dataIndex: 'weeklyScheduleStatisticsField1',
      },
      {
        title: '完成场数',
        align: 'center',
        dataIndex: 'weeklyReportStatisticsField1',
      },
      {
        title: '计划页数',
        align: 'center',
        dataIndex: 'weeklyScheduleStatisticsField2',
      },
      {
        title: '完成页数',
        align: 'center',
        dataIndex: 'weeklyReportStatisticsField2',
      },
      {
        title: '剩余工作量',
        dataIndex: 'weeklyRemainingWork',
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

  allDoneWork = () => {
    const { form, pageConfig } = this.props;
    const fields = [
      {
        title: '计划场数',
        align: 'center',
        dataIndex: 'totalScheduleStatisticsField1',
      },
      {
        title: '完成场数',
        align: 'center',
        dataIndex: 'totalReportStatisticsField1',
      },
      {
        title: '完成场数占比',
        align: 'center',
        dataIndex: 'planCompleteAccounted1',
        render: (val, row) =>
          row.totalScheduleStatisticsField1 && row.totalReportStatisticsField1
            ? `${mul(
                div(row.totalReportStatisticsField1, row.totalScheduleStatisticsField1),
                100
              ).toFixed(2)}%`
            : '0%',
      },
      {
        title: '总页数',
        align: 'center',
        dataIndex: 'totalScheduleStatisticsField2',
      },
      {
        title: '完成页数',
        align: 'center',
        dataIndex: 'totalReportStatisticsField2',
      },
      {
        title: '完成页数占比',
        align: 'center',
        dataIndex: 'planCompleteAccounted2',
        render: (val, row) =>
          row.totalScheduleStatisticsField2 && row.totalReportStatisticsField2
            ? `${mul(
                div(row.totalReportStatisticsField2, row.totalScheduleStatisticsField2),
                100
              ).toFixed(2)}%`
            : '0%',
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

  render() {
    const {
      dispatch,
      loading,
      form,
      formData,
      formMode,
      thisWeekWorkList,
      allDoneWorkList,
    } = this.props;
    const { actorsFinishWorkList = [] } = formData;

    const { id } = this.state;

    const allBpm = [{ docId: id, procDefKey: 'PRO_P06', title: '周报汇报审批流程' }];

    const disabledBtn =
      loading.effects[`${DOMAIN}/weeklyDetail`] || loading.effects[`${DOMAIN}/weeklyEdit`];

    return (
      <PageWrapper>
        {this.renderPage()}
        <Card className="tw-card-adjust" bordered={false}>
          <DescriptionList size="large" col={1} title="数据统计" />
          <EditTable
            title="本周工作量"
            rowSelection={null}
            form={form}
            columns={this.thisWeekWork()}
            dataSource={thisWeekWorkList}
            footer={null}
          />
          <br />
          <EditTable
            title="总完成量"
            rowSelection={null}
            form={form}
            columns={this.allDoneWork()}
            dataSource={allDoneWorkList}
            footer={null}
          />
          <br />
          <EditTable
            rowSelection={null}
            title="演员完成度"
            form={form}
            columns={this.renderColumns()}
            dataSource={actorsFinishWorkList}
            footer={null}
          />

          <br />
          <div className={styles.boxWarp}>{this.renderPage1()}</div>

          <br />
          <DescriptionList size="large" col={1} title="情况小结" />
          <div className={styles.boxWarp}>
            <BusinessForm
              formData={formData}
              form={form}
              formMode={formMode}
              defaultColumnStyle={12}
            >
              <FormItem
                fieldKey="weeklySummury"
                fieldType="BaseInputTextArea"
                initialValue={formData.weeklySummury}
                rows={10}
              />
            </BusinessForm>
          </div>
        </Card>
        <BpmConnection source={allBpm} />
      </PageWrapper>
    );
  }
}

export default indexCom;
