import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Form, Select } from 'antd';
import { formatMessage } from 'umi/locale';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty } from 'ramda';

import BuBasicInfo from './Component/BasicInfo';
import BuResInfo from './Component/BuResInfo';

const DOMAIN = 'orgbuLinmon';

const operationTabList = [
  {
    key: 'BasicInfo',
    tab: '基本信息',
  },
  {
    key: 'ResInfo',
    tab: '资源信息',
  },
];

@connect(({ loading, orgbuLinmon }) => ({
  loading,
  orgbuLinmon,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
class buDetail extends PureComponent {
  state = {
    operationkey: 'BasicInfo',
  };

  componentDidMount() {
    const urlParm = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `orgbuLinmon/edit`,
      payload: {
        buId: urlParm.buId,
      },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { operationkey } = this.state;

    const method = 'save' + operationkey;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/${method}`,
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto(`/plat/buManage/master`);
  };

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  render() {
    const { dispatch, loading, form } = this.props;
    const { operationkey } = this.state;
    const { buId } = fromQs();

    const contentList = {
      BasicInfo: <BuBasicInfo buId={buId} dispatch={dispatch} form={form} />,
      ResInfo: <BuResInfo buId={buId} dispatch={dispatch} form={form} />,
    };
    const partnerBtnDisbaled = loading.effects[`${DOMAIN}/savePartner`];

    return (
      <PageHeaderWrapper>
        {operationkey !== 'ResInfo' && (
          <Card className="tw-card-rightLine">
            <Button
              className="tw-btn-primary"
              type="primary"
              icon="save"
              size="large"
              disabled={
                operationkey === 'Eqva' || operationkey === 'FinanceInfo' || partnerBtnDisbaled
              }
              onClick={this.handleSave}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
            <Button
              className={classnames('separate', 'tw-btn-default')}
              icon="undo"
              size="large"
              disabled={false}
              onClick={this.handleCancel}
            >
              {formatMessage({ id: `misc.rtn`, desc: '返回' })}
            </Button>
          </Card>
        )}

        <Card
          className="tw-card-multiTab"
          bordered={false}
          tabList={operationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default buDetail;
