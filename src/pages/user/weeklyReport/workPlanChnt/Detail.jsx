import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import { mountToTab, closeThenGoto, markAsTab, closeTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import Loading from '@/components/core/DataLoading';

const DOMAIN = 'workPlanChntEdit';
const { Description } = DescriptionList;

@connect(({ loading, dispatch, workPlanChntEdit }) => ({
  loading,
  dispatch,
  workPlanChntEdit,
}))
@mountToTab()
class WorkPlanChntDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {},
      },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'WORK_PLAN_EDIT' },
    });
  }

  // 配置所需要的内容
  renderPage = () => {
    const {
      workPlanChntEdit: { formData, pageConfig },
    } = this.props;
    let planTypeName = '';
    if (formData.planType === 'WORK') {
      planTypeName = '工作计划';
    }
    if (formData.planType === 'VACATION') {
      planTypeName = '休假计划';
    }

    if (pageConfig) {
      if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = pageConfig.pageBlockViews[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        taskName = {},
        planNo = {},
        priority = {},
        dateFrom = {},
        dateTo = {},
        planStatus = {},
        taskId = {},
        activityId = {},
        planResId = {},
        reportedResId = {},
        relevantResId = {},
        planType = {},
        remark1 = {},
        remark2 = {},
        objectiveId = {},
        projectNature = {},
        majorWorkItems = {},
        completionCriteria = {},
        completionTime = {},
        responsibilityBuId = {},
        responsibilityResId = {},
        cooperateResId = {},
        checkResId = {},
        developmentSituation = {},
        developmentStatus = {},
        existingProblem = {},
        resultsEvaluation = {},
        emphasisAttention = {},
      } = pageFieldJson;
      let fields = [];
      fields = [
        <Description term={planNo.displayName} key="planNo" sortNo={planNo.sortNo}>
          {`${formData.planNo || '空'} / ${formData.priority || '空'}`}
        </Description>,
        <Description term={taskName.displayName} key="taskName" sortNo={taskName.sortNo}>
          {formData.taskName || ''}
        </Description>,
        <Description term={dateFrom.displayName} key="dateFrom" sortNo={dateFrom.sortNo}>
          {formData.dateRange || undefined}
        </Description>,
        <Description term={planStatus.displayName} key="planStatus" sortNo={planStatus.sortNo}>
          {formData.planStatusName || ''}
        </Description>,
        <Description term={taskId.displayName} key="taskId" sortNo={taskId.sortNo}>
          {formData.taskIdName || ''}
        </Description>,
        <Description term={activityId.displayName} key="activityId" sortNo={activityId.sortNo}>
          {formData.activityName || ''}
        </Description>,
        <Description term={planResId.displayName} key="planResId" sortNo={planResId.sortNo}>
          {formData.planResName || ''}
        </Description>,
        <Description
          term={reportedResId.displayName}
          key="reportedResId"
          sortNo={reportedResId.sortNo}
        >
          {formData.reportedResName || ''}
        </Description>,
        <Description
          term={relevantResId.displayName}
          key="relevantResId"
          sortNo={relevantResId.sortNo}
        >
          {formData.relevantResName || ''}
        </Description>,
        <Description term={planType.displayName} key="planType" sortNo={planType.sortNo}>
          {planTypeName}
        </Description>,
        <Description term={remark1.displayName} key="remark1" sortNo={remark1.sortNo}>
          {formData.remark1 || ''}
        </Description>,
        <Description term={remark2.displayName} key="remark2" sortNo={remark2.sortNo}>
          {formData.remark2 || ''}
        </Description>,
        <Description term={objectiveId.displayName} key="objectiveId" sortNo={objectiveId.sortNo}>
          {formData.objectiveName || ''}
        </Description>,
        <Description
          term={projectNature.displayName}
          key="projectNature"
          sortNo={projectNature.sortNo}
        >
          {formData.projectNature || ''}
        </Description>,
        <Description
          term={majorWorkItems.displayName}
          key="majorWorkItems"
          sortNo={majorWorkItems.sortNo}
        >
          {formData.majorWorkItems || ''}
        </Description>,
        <Description
          term={completionCriteria.displayName}
          key="completionCriteria"
          sortNo={completionCriteria.sortNo}
        >
          {formData.completionCriteria || ''}
        </Description>,
        <Description
          term={completionTime.displayName}
          key="completionTime"
          sortNo={completionTime.sortNo}
        >
          {formData.completionTime || ''}
        </Description>,
        <Description
          term={responsibilityBuId.displayName}
          key="responsibilityBuId"
          sortNo={responsibilityBuId.sortNo}
        >
          {formData.responsibilityBuName || ''}
        </Description>,
        <Description
          term={responsibilityResId.displayName}
          key="responsibilityResId"
          sortNo={responsibilityResId.sortNo}
        >
          {formData.responsibilityResName || ''}
        </Description>,
        <Description
          term={cooperateResId.displayName}
          key="cooperateResId"
          sortNo={cooperateResId.sortNo}
        >
          {formData.cooperateResName || ''}
        </Description>,
        <Description term={checkResId.displayName} key="checkResId" sortNo={checkResId.sortNo}>
          {formData.checkResName || ''}
        </Description>,
        <Description
          term={developmentSituation.displayName}
          key="developmentSituation"
          sortNo={developmentSituation.sortNo}
        >
          {formData.developmentSituation || ''}
        </Description>,
        <Description
          term={developmentStatus.displayName}
          key="developmentStatus"
          sortNo={developmentStatus.sortNo}
        >
          {formData.developmentStatusName || ''}
        </Description>,
        <Description
          term={existingProblem.displayName}
          key="existingProblem"
          sortNo={existingProblem.sortNo}
        >
          {formData.existingProblem || ''}
        </Description>,
        <Description
          term={resultsEvaluation.displayName}
          key="resultsEvaluation"
          sortNo={resultsEvaluation.sortNo}
        >
          {formData.resultsEvaluationName || ''}
        </Description>,
        <Description
          term={emphasisAttention.displayName}
          key="emphasisAttention"
          sortNo={emphasisAttention.sortNo}
        >
          {formData.emphasisAttention ? '是' : '否'}
        </Description>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort(
          (field1, field2) => pageFieldJson[field1.key].sortNo - pageFieldJson[field2.key].sortNo
        );
      return (
        <DescriptionList size="large" col={2}>
          {filterList}
        </DescriptionList>
      );
    }
    return true;
  };

  render() {
    const {
      loading,
      workPlanChntEdit: { formData },
    } = this.props;
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
              // const record = window.location.pathname + window.location.search;
              // router.push(markAsTab(from));
              // closeTab(record);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="关键行动详情" />}
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default WorkPlanChntDetail;
