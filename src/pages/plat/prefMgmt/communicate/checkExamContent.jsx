import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Rate } from 'antd';
import Title from '@/components/layout/Title';
import DescriptionList from '@/components/layout/DescriptionList';
import { FileManagerEnhance } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import router from 'umi/router';
import classnames from 'classnames';

const { Description } = DescriptionList;
const DOMAIN = 'checkExamContent';

@connect(({ loading, checkExamContent, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/queryDetail`],
  checkExamContent,
  dispatch,
}))
@mountToTab()
class CheckExamContent extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, communicateType } = fromQs();
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        assPersonList: [],
        assessorList: [],
        hrList: [],
      },
    });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        performanceCommunicateResId: id,
      },
    });
    // 在hr填写页面请求被考核人和考核人填写内容
    let point = [];
    if (communicateType) {
      point = [
        `PERFORMANCE_${communicateType}_COMMUNICATION_FLOW_ASSESSED`,
        `PERFORMANCE_${communicateType}_COMMUNICATION_FLOW_ASSESSOR`,
        `PERFORMANCE_${communicateType}_COMMUNICATION_FLOW_HR`,
      ];
    }
    dispatch({
      type: `${DOMAIN}/getPageConfigs`,
      payload: {
        pageNos: `${point.join(',')}`,
      },
    });
  }

  render() {
    const { id, communicateType } = fromQs();
    const {
      checkExamContent: { assPersonList, assessorList, hrList, pageConfigs },
    } = this.props;
    let assessedPageConfig = [];
    let assesPageConfig = [];
    let hrPageConfig = [];
    if (communicateType) {
      assessedPageConfig =
        pageConfigs[`PERFORMANCE_${communicateType}_COMMUNICATION_FLOW_ASSESSED`];
      assesPageConfig = pageConfigs[`PERFORMANCE_${communicateType}_COMMUNICATION_FLOW_ASSESSOR`];
      hrPageConfig = pageConfigs[`PERFORMANCE_${communicateType}_COMMUNICATION_FLOW_HR`];
    }
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={() => {
              router.push(
                `/hr/prefMgmt/communicate/communicatePlanFlowDetail?id=${id}&performanceExamContentType=OTHER`
              );
            }}
          >
            查看考核计划
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        {assPersonList
          ? assPersonList.map((item, key) => {
              if (assessedPageConfig) {
                if (
                  !assessedPageConfig.pageBlockViews ||
                  assessedPageConfig.pageBlockViews.length < 1
                ) {
                  return <div />;
                }
                const currentBlockConfig = assessedPageConfig.pageBlockViews[0];
                const { pageFieldViews } = currentBlockConfig;
                const pageFieldJson = {};
                pageFieldViews.forEach(field => {
                  pageFieldJson[field.fieldKey] = field;
                });
                let fields = [];
                if (communicateType === 'MIDDLE') {
                  fields = [
                    <Description
                      term={pageFieldJson.extBigVarchar1.displayName}
                      key="extBigVarchar1"
                    >
                      {item.extBigVarchar1 || null}
                    </Description>,
                    <Description
                      term={pageFieldJson.extBigVarchar2.displayName}
                      key="extBigVarchar2"
                    >
                      {item.extBigVarchar2 || null}
                    </Description>,
                  ];
                } else {
                  fields = [
                    <Description term={pageFieldJson.extNumber1.displayName} key="extNumber1">
                      <Rate
                        allowHalf
                        defaultValue={Number(item.extNumber1) || undefined}
                        disabled
                      />
                    </Description>,
                    <Description
                      term={pageFieldJson.extBigVarchar1.displayName}
                      key="extBigVarchar1"
                    >
                      {item.extBigVarchar1 || null}
                    </Description>,
                    <Description
                      term={pageFieldJson.extBigVarchar2.displayName}
                      key="extBigVarchar2"
                    >
                      {item.extBigVarchar2 || null}
                    </Description>,
                  ];
                }

                const filterList = fields
                  .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
                  .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
                return (
                  <Card
                    className="tw-card-adjust"
                    style={{ marginTop: '6px' }}
                    title={<Title icon="profile" text="被考核人填写内容" />}
                    bordered={false}
                  >
                    <DescriptionList size="large" col={1}>
                      {filterList}
                    </DescriptionList>
                  </Card>
                );
              }
              return '';
            })
          : ''}
        {assessorList
          ? assessorList.map((item, key) => {
              if (assesPageConfig) {
                if (!assesPageConfig.pageBlockViews || assesPageConfig.pageBlockViews.length < 1) {
                  return <div />;
                }
                const currentBlockConfig = assesPageConfig.pageBlockViews[0];
                const { pageFieldViews } = currentBlockConfig;
                const pageFieldJson = {};
                pageFieldViews.forEach(field => {
                  pageFieldJson[field.fieldKey] = field;
                });
                let fields = [];
                if (communicateType === 'RESULT') {
                  fields = [
                    <Description term={pageFieldJson.extNumber1.displayName} key="extNumber1">
                      <Rate
                        allowHalf
                        defaultValue={Number(item.extNumber1) || undefined}
                        disabled
                      />
                    </Description>,
                    <Description term="附件">
                      <FileManagerEnhance
                        api="/api/worth/v1/performance/communicate/assessor/performanceCommunicateContent/sfs/token"
                        dataKey={item.id}
                        listType="text"
                        disabled
                        preview
                      />
                    </Description>,
                    <Description
                      term={pageFieldJson.extBigVarchar1.displayName}
                      key="extBigVarchar1"
                    >
                      {item.extBigVarchar1 || null}
                    </Description>,
                  ];
                } else {
                  fields = [
                    <Description
                      term={pageFieldJson.extBigVarchar1.displayName}
                      key="extBigVarchar1"
                    >
                      {item.extBigVarchar1 || null}
                    </Description>,
                    <Description term="附件">
                      <FileManagerEnhance
                        api="/api/worth/v1/performance/communicate/assessor/performanceCommunicateContent/sfs/token"
                        dataKey={item.id}
                        listType="text"
                        disabled
                        preview
                      />
                    </Description>,
                    <Description
                      term={pageFieldJson.extBigVarchar2.displayName}
                      key="extBigVarchar2"
                    >
                      {item.extBigVarchar2 || null}
                    </Description>,
                  ];
                }

                const filterList = fields
                  .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
                  .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
                return (
                  <Card
                    className="tw-card-adjust"
                    style={{ marginTop: '6px' }}
                    title={<Title icon="profile" text={`考核人填写内容-${item.resName || null}`} />}
                    bordered={false}
                  >
                    <DescriptionList size="large" col={1}>
                      {filterList}
                    </DescriptionList>
                  </Card>
                );
              }
              return '';
            })
          : ''}
        {hrList
          ? hrList.map((item, key) => {
              if (hrPageConfig) {
                if (!hrPageConfig.pageBlockViews || hrPageConfig.pageBlockViews.length < 1) {
                  return <div />;
                }
                const currentBlockConfig = hrPageConfig.pageBlockViews[0];
                const { pageFieldViews } = currentBlockConfig;
                const pageFieldJson = {};
                pageFieldViews.forEach(field => {
                  pageFieldJson[field.fieldKey] = field;
                });
                let fields = [];
                fields = [
                  <Description term={pageFieldJson.extBigVarchar1.displayName} key="extBigVarchar1">
                    {item.extBigVarchar1 || null}
                  </Description>,
                ];
                const filterList = fields
                  .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
                  .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
                return (
                  <Card
                    className="tw-card-adjust"
                    style={{ marginTop: '6px' }}
                    title={<Title icon="profile" text={`HR填写内容-${item.resName || null}`} />}
                    bordered={false}
                  >
                    <DescriptionList size="large" col={1}>
                      {filterList}
                    </DescriptionList>
                  </Card>
                );
              }
              return '';
            })
          : ''}
      </PageHeaderWrapper>
    );
  }
}

export default CheckExamContent;
