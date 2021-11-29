import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';

const { Description } = DescriptionList;

const DOMAIN = 'prefCheckFlow';

@connect(({ loading, prefCheckFlow, dispatch }) => ({
  loading,
  prefCheckFlow,
  dispatch,
}))
@mountToTab()
class PrefCheckFlowView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();

    dispatch({
      type: `${DOMAIN}/cleanFormData`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/queryFolwDetail`,
        payload: {
          id,
        },
      });
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_DETAIL' },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        pageConfig: {},
      },
    });
  }

  renderPage = () => {
    const {
      prefCheckFlow: { formData, pageConfig },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentListConfig1 = [];
    let currentListConfig2 = [];
    let currentListConfig3 = [];
    pageBlockViews.forEach(view => {
      if (
        view.tableName === 'T_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_SUB1'
      ) {
        // 绩效考核结果
        currentListConfig1 = view;
      } else if (
        view.tableName === 'T_RES_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_MAIN'
      ) {
        currentListConfig2 = view;
      } else if (
        view.tableName === 'T_PERFORMANCE_EXAM_RANGE' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_SUB2'
      ) {
        currentListConfig3 = view;
      }
    });
    const { pageFieldViews: pageFieldViewsList1 } = currentListConfig1;
    const { pageFieldViews: pageFieldViewsList2 } = currentListConfig2;
    const { pageFieldViews: pageFieldViewsList3 } = currentListConfig3;

    const pageFieldJsonList = {};
    if (pageFieldViewsList1) {
      pageFieldViewsList1.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList2) {
      pageFieldViewsList2.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList3) {
      pageFieldViewsList3.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldJsonList) {
      let fields = [];
      fields = [
        <Description term={pageFieldJsonList.examName.displayName} key="examName">
          {formData.examName || ''}
        </Description>,
        <Description term="考核期间">
          {`${formData.examPeriodStart || ''}${
            formData.examPeriodStart ? '-' : ''
          }${formData.examPeriodEnd || ''}`}
        </Description>,
        <Description term={pageFieldJsonList.relatedRes.displayName} key="relatedRes">
          {formData.resName || ''}
        </Description>,
        <Description term={pageFieldJsonList.resType.displayName}>
          {formData.typeName || ''}
        </Description>,
        <Description term={pageFieldJsonList.buId.displayName} key="buId">
          {formData.buName || ''}
        </Description>,
        <Description term={pageFieldJsonList.coopType.displayName} key="coopType">
          {formData.coopType || ''}
        </Description>,
        <Description term={pageFieldJsonList.examDesc.displayName} key="examDesc">
          {<pre>{formData.examDesc}</pre> || ''}
        </Description>,
        <Description term={pageFieldJsonList.applyResId.displayName} key="applyResId">
          {formData.applyResIdName || ''}
        </Description>,
        <Description term={pageFieldJsonList.applyDate.displayName} key="applyDate">
          {formData.applyDate || ''}
        </Description>,
        <Description
          term={`${pageFieldJsonList.finalScore.displayName}/${
            pageFieldJsonList.examGrade.displayName
          }`}
          key="finalScore"
        >
          {formData.gradeExamScore || ''}
        </Description>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJsonList[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <DescriptionList size="large" col={2}>
          {filterList}
        </DescriptionList>
      );
    }
    return null;
  };

  render() {
    const {
      prefCheckFlow: { formData },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="绩效考核详情" />}
          bordered={false}
        >
          {this.renderPage()}
          {/* <DescriptionList size="large" col={2}>
            <Description term="考核名称">{formData.examName || ''}</Description>
            <Description term="考核期间">
              {`${formData.examPeriodStart || ''}${
                formData.examPeriodStart ? '-' : ''
              }${formData.examPeriodEnd || ''}`}
            </Description>
            <Description term="考核资源">{formData.resName || ''}</Description>
            <Description term="资源类型">{formData.typeName || ''}</Description>
            <Description term="BU">{formData.buName || ''}</Description>
            <Description term="合作方式">{formData.coopType || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="考核说明">{<pre>{formData.examDesc}</pre> || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="考核发起人">{formData.applyResIdName || ''}</Description>
            <Description term="考核发起时间">{formData.applyDate || ''}</Description>
            <Description term="综合得分/等级">{formData.gradeExamScore || ''}</Description>
          </DescriptionList> */}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckFlowView;
