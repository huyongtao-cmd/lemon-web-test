import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Card, Button, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { FileManagerEnhance } from '@/pages/gen/field';

const { Description } = DescriptionList;

const DOMAIN = 'noContractProj';

@connect(({ loading, noContractProj, dispatch }) => ({
  loading,
  noContractProj,
  dispatch,
}))
@mountToTab()
class NoContractProjView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/flowDetail`,
        payload: {
          id,
        },
      });
    });
  }

  render() {
    const {
      noContractProj: { formData },
    } = this.props;
    const { id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A47', title: '无合同项目申请' }];

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
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="无合同项目申请" />}
          bordered={false}
        >
          <DescriptionList title="项目简况" size="large" col={2}>
            <Description term="项目名称">{formData.projName || ''}</Description>
            <Description term="工作类型">{formData.workTypeName || ''}</Description>
            <Description term="项目模板">{formData.tmplName || ''}</Description>
            <Description term="币种">{formData.currCodeName || ''}</Description>
            <Description term="预计开始/结束日期">
              {`${formData.startDate || ''}${formData.startDate ? ' ~ ' : ''}${formData.endDate ||
                ''}`}
            </Description>
            <Description term="SOW节选">
              <FileManagerEnhance
                api="/api/op/v1/noContract/project/sow/sfs/token"
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
            <Description term="申请单号">{formData.applyNo || ''}</Description>
            <Description term="申请状态">{formData.apprStatusName || ''}</Description>
            <Description term="申请人">{formData.applyResName || ''}</Description>
            <Description term="申请日期">{formData.applyDate || ''}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="相关人员" size="large" col={2}>
            <Description term="费用承担BU">{formData.expenseBuName || ''}</Description>
            <Description term="交付BU">{formData.deliBuName || ''}</Description>
            <Description term="交付负责人">{formData.deliResName || ''}</Description>
            <Description term="项目经理">{formData.pmResName || ''}</Description>
          </DescriptionList>
          <Divider dashed />
          <DescriptionList title="总预算信息" size="large" col={2}>
            <Description term="预计总人天">{formData.totalDays || ''}</Description>
            <Description term="预计总当量">{formData.totalEqva || ''}</Description>
            <Description term="当量预估单价/总价">
              {`${formData.eqvaPrice || ''}/${formData.eqvaPriceTotal}`}
            </Description>
            <Description term="费用总预算">{formData.totalReimbursement || ''}</Description>
            <Description term="预算总成本">{formData.totalCost || ''}</Description>
            <Description term="预算附件">
              <FileManagerEnhance
                api="/api/op/v1/noContract/project/budget/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled
                preview
              />
            </Description>
          </DescriptionList>
        </Card>
        <BpmConnection source={allBpm} />
      </PageHeaderWrapper>
    );
  }
}

export default NoContractProjView;
