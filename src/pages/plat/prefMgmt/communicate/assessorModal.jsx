import React from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { Button, Card, Rate, Input, Modal } from 'antd';
import classnames from 'classnames';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';

const DOMAIN = 'communicatePlanFlow';
const { Description } = DescriptionList;
@connect(({ loading, dispatch, communicatePlanFlow }) => ({
  loading,
  dispatch,
  communicatePlanFlow,
}))
class AssessorModal extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getAssessedPageConfig`,
      payload: { pageNo: 'PERFORMANCE_PLAN_COMMUNICATION_FLOW_ASSESSED' },
    });
  }

  render() {
    const {
      visible,
      closeModal,
      communicatePlanFlow: { checkAssessedData, assessedPageConfig },
    } = this.props;
    let element = null;
    if (assessedPageConfig) {
      if (!assessedPageConfig.pageBlockViews || assessedPageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = assessedPageConfig.pageBlockViews[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      let fields = [];
      fields = [
        <Description term={pageFieldJson.extNumber1.displayName} key="extNumber1">
          <Rate defaultValue={Number(checkAssessedData.extNumber1) || undefined} disabled />
        </Description>,
        <Description term={pageFieldJson.extBigVarchar1.displayName} key="extBigVarchar1">
          <Input.TextArea
            placeholder={`请填写${pageFieldJson.extBigVarchar1.displayName}`}
            rows={3}
            disabled
            defaultValue={checkAssessedData.extBigVarchar1 || ''}
          />
        </Description>,
        <Description term={pageFieldJson.extBigVarchar2.displayName} key="extBigVarchar2">
          <Input.TextArea
            placeholder={`请填写${pageFieldJson.extBigVarchar2.displayName}`}
            rows={3}
            disabled
            defaultValue={checkAssessedData.extBigVarchar2 || ''}
          />
        </Description>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      element = (
        <DescriptionList size="large" col={1}>
          {filterList}
        </DescriptionList>
      );
    }

    return (
      <Modal
        centered
        width="60%"
        destroyOnClose
        visible={visible}
        onCancel={closeModal}
        footer={[
          <Button type="primary" onClick={closeModal}>
            返回
          </Button>,
        ]}
      >
        <PageHeaderWrapper>
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title={<Title icon="profile" text="被考核人填写内容" />}
            bordered={false}
          >
            {element}
          </Card>
        </PageHeaderWrapper>
      </Modal>
    );
  }
}
export default AssessorModal;
