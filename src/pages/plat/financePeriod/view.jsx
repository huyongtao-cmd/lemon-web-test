import React, { Component } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Card, Button } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import { fromQs } from '@/utils/stringUtils';
import { formatMessage } from 'umi/locale';

const { Description } = DescriptionList;

const DOMAIN = 'financialPeriod';

@connect(({ loading, financialPeriod, dispatch }) => ({
  dispatch,
  loading,
  financialPeriod,
}))
@mountToTab()
class View extends Component {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      const { id } = fromQs();
      id &&
        dispatch({
          type: `${DOMAIN}/queryDetail`,
          payload: { id },
        });
    });
  }

  render() {
    const {
      loading,
      dispatch,
      financialPeriod: { formData, resultChkList },
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
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="财务期间详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="财务年度">{formData.finYear || ''}</Description>
            <Description term="财务期间">{formData.finPeriod || ''}</Description>
            <Description term="期间名称">{formData.periodName || ''}</Description>
            <Description term="期间状态">{formData.periodStatusName || ''}</Description>
            <Description term="开始/结束日期">
              {`${formData.beginDate} ~ ${formData.endDate}` || ''}
            </Description>
            <Description term="备注">{<pre>{formData.remark}</pre> || ''}</Description>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default View;
