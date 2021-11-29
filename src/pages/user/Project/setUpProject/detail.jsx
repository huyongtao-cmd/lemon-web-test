import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance } from '@/pages/gen/field';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';

const { Description } = DescriptionList;

const DOMAIN = 'applyProjectDetail';

@Form.create({})
@connect(({ loading, applyProjectDetail, dispatch }) => ({
  dispatch,
  loading,
  applyProjectDetail,
}))
@mountToTab()
class ApplyProjectDetail extends Component {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        id,
      },
    });
  }

  render() {
    const {
      applyProjectDetail: { formData },
    } = this.props;
    const { id, mode } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A65', title: '项目立项申请' }];

    return (
      <PageHeaderWrapper>
        {!mode ? (
          <Card className="tw-card-rightLine">
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
        ) : null}
        <Card className="tw-card-adjust" style={{ marginTop: '6px' }} bordered={false}>
          <DescriptionList title="项目立项申请" size="large" col={2}>
            <Description term="项目名称">{formData.projName || ''}</Description>
            <Description term="编号">{formData.projNo || ''}</Description>
            <Description term="计划开始日期">{formData.planStartDate || undefined}</Description>
            <Description term="计划结束日期">{formData.planEndDate || undefined}</Description>
            <Description term="项目模板">{formData.projTempName || undefined}</Description>
            <Description term="SOW节选">
              <FileManagerEnhance
                api="/api/op/v1/projectRequest/project/projectRequestSow/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="备注">{<pre>{formData.remark}</pre> || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="申请人">{formData.resIdName || ''}</Description>
            <Description term="申请日期">{formData.applyDate || ''}</Description>
          </DescriptionList>
          <DescriptionList title="相关人员" size="large" col={2}>
            <Description term="交付BU">{formData.deliBuName || ''}</Description>
            <Description term="交付负责人">{formData.deliResName || ''}</Description>
            <Description term="销售负责人">{formData.salesmanResName || ''}</Description>
          </DescriptionList>
        </Card>
        {!mode ? <BpmConnection source={allBpm} /> : null}
      </PageHeaderWrapper>
    );
  }
}

export default ApplyProjectDetail;
