import React, { PureComponent } from 'react';
import router from 'umi/router';
import classnames from 'classnames';
import { Button, Card, Divider } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import createMessage from '@/components/core/AlertMessage';
import Title from '@/components/layout/Title';
import { getParam, editParam, addParam } from '@/utils/urlUtils';
import { fromQs } from '@/utils/stringUtils';
import { closeThenGoto } from '@/layouts/routerControl';
import { FileManagerEnhance } from '@/pages/gen/field';

const { Description } = DescriptionList;
const DOMAIN = 'finishProjectFlow';

@connect(({ loading, finishProjectFlow, dispatch }) => ({
  loading,
  finishProjectFlow,
  dispatch,
}))
class ProjectDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    if (param) {
      param.id &&
        dispatch({
          type: `${DOMAIN}/query`,
          payload: param,
        });
      param.taskId &&
        dispatch({
          type: `${DOMAIN}/fetchConfig`,
          payload: param.taskId,
        });
      dispatch({ type: `${DOMAIN}/selectUsers` });
    } else {
      dispatch({
        type: `${DOMAIN}/clean`,
      });
    }
  }

  render() {
    const {
      loading,
      dispatch,
      finishProjectFlow: { formData, fieldsConfig, flowForm },
    } = this.props;
    // loading完成之前将按钮设为禁用

    const param = fromQs();
    return (
      <Card className="tw-card-adjust" bordered={false}>
        <DescriptionList size="large" title="项目结转详情" col={2}>
          <Description term="项目账号">{formData.ledgerNo || ''}</Description>
          <Description term="交付BU账号">{formData.buLedgerNo || ''}</Description>
          <Description term="项目账户名称">{formData.projName || ''}</Description>
          <Description term="交付BU账户名称">{formData.buLedgerName || ''}</Description>
          <Description term="项目账户当量余额">{formData.avalQty || ''}</Description>
        </DescriptionList>
        <DescriptionList size="large" col={1}>
          <Description term="项目账户现金余额">{formData.avalAmt || ''}</Description>
          <span style={{ color: 'red', marginLeft: '45px' }}>
            备注：项目关账后项目账户当量余额及项目账户现金余额自动转入交付BU账户，并项目账户当量余额及项目账户金额清0。
          </span>
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" title="相关信息" col={2}>
          <Description term="交付BU">{formData.deliBuName || ''}</Description>
          <Description term="交付负责人">{formData.deliResName || ''}</Description>
          <Description term="项目经理">{formData.pmResName || ''}</Description>
          <Description term="项目经理当量系数">{formData.pmEqvaRatio || ''}</Description>
          <Description term="销售人员">{formData.salesmanResName || ''}</Description>
          <Description term="相关项目">
            <Link className="tw-link" to={`/user/project/projectDetail?id=${formData.projId}`}>
              {formData.projName || ''}
            </Link>
          </Description>
        </DescriptionList>
        <Divider dashed />
        <DescriptionList size="large" title="总预算信息" col={2}>
          <Description term="预计总人天">{formData.totalDays || ''}</Description>
          <Description term="预计总当量">{formData.totalEqva || ''}</Description>
          <Description term="当量预估单价/总价">
            {formData.eqvaPrice || ''}/{formData.eqvaPriceTotal || ''}
          </Description>
          <Description term="费用总预算">{formData.totalReimbursement || ''}</Description>
          <Description term="预算附件">
            <FileManagerEnhance
              api="/api/op/v1/project/budget/sfs/token"
              dataKey={param.id}
              listType="text"
              disabled附件
              preview
            />
          </Description>
          <Description term="项目预算总成本">{formData.totalCost || ''}</Description>
        </DescriptionList>
      </Card>
    );
  }
}

export default ProjectDetail;
