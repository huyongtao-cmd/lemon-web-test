import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Button, Card, DatePicker, Form } from 'antd';
import classnames from 'classnames';
import { isEmpty } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import { infoEditTabList } from '@/pages/plat/res/profile/config';
import component from './component';
import component1 from '@/pages/plat/res/profile/component';

const { offerFrom } = fromQs();
// tab的页面
// 从offer入职流程跳转过来，不提交个人信息审批流程，渲染可以直接修改各种信息的组件
const { CenterBasicInfo, Edubg, Workbg, ProExp, Finance, SelfEvaluation } = offerFrom
  ? component1
  : component;

const DOMAIN = 'userCenterInfoEdit';
@connect(({ loading, userCenterInfoEdit }) => ({
  loading,
  userCenterInfoEdit,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { key, value: value.value },
    });
  },
})
@mountToTab()
class ResEditDetail extends PureComponent {
  state = {
    operationkey: 'basic',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    const { mode, tab } = param;
    if (tab === 'selfEvaluation') {
      this.setState({
        operationkey: 'selfEvaluation',
      });
    }
    if (mode && mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/queryUserPrincipal`,
      });
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
      dispatch({ type: `userCenterInfoEdit/queryEdubg`, payload: { resId: param.id } });
      dispatch({ type: `userCenterInfoEdit/queryWorkbg`, payload: { resId: param.id } });
      dispatch({ type: `userCenterInfoEdit/queryProExp`, payload: { resId: param.id } });
      dispatch({ type: `userCenterInfoEdit/queryFinance`, payload: { resId: param.id } });
    } else {
      dispatch({ type: `${DOMAIN}/clean` });
    }
  }

  onOperationTabChange = key => {
    this.setState({ operationkey: key });
  };

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userCenterInfoEdit: { formData },
    } = this.props;
    // 保存请求
    if (formData.id > 0) {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: { id: formData.id },
          });
        }
      });
    }
  };

  handleSelfSave = () => {
    // 保存自我介绍模块
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userCenterInfoEdit: { formData },
    } = this.props;
    // 保存请求
    if (formData.id > 0) {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/saveSelfEvaluation`,
            payload: { id: formData.id },
          });
        }
      });
    }
  };

  handleSubmit = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      userCenterInfoEdit: { formData },
    } = this.props;
    // 保存请求
    if (formData.id > 0) {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/submit`,
          });
        }
      });
    }
  };

  render() {
    const {
      form,
      form: { getFieldDecorator },
      loading,
    } = this.props;

    const { operationkey } = this.state;
    const { mode, tab } = fromQs();
    const isDisabled = tab === 'selfEvaluation';
    const contentList = {
      basic: <CenterBasicInfo form={form} domain={DOMAIN} />,
      edubg: <Edubg />,
      workbg: <Workbg />,
      proExp: <ProExp />,
      financeInfo: <Finance />,
      selfEvaluation: <SelfEvaluation />,
    };
    let tempInfoEditTabList = infoEditTabList;
    if (isDisabled) {
      tempInfoEditTabList = infoEditTabList.map(item => {
        if (item.key === 'selfEvaluation') {
          return item;
        }
        return {
          ...item,
          disabled: true,
          tab: <span className="tw-card-multiTab-disabled">{item.tab}</span>,
        };
      });
    } else if (tab === 'basic') {
      tempInfoEditTabList = infoEditTabList.map(item => {
        if (item.key === 'selfEvaluation') {
          return {
            ...item,
            disabled: true,
            tab: <span className="tw-card-multiTab-disabled">{item.tab}</span>,
          };
        }
        return item;
      });
    }
    // console.log('tempInfoEditTabList', tempInfoEditTabList);
    // loading完成之前将按钮设为禁用
    const disabledBtn = loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/submit`];

    return (
      <PageHeaderWrapper title="资源编辑">
        <Card className="tw-card-rightLine">
          {/* 入职流程的完善个人信息时不发起流程 */}
          {offerFrom || isDisabled ? (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={isDisabled ? this.handleSelfSave : this.handleSave}
              disabled={disabledBtn}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
          ) : (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              onClick={this.handleSubmit}
              disabled={disabledBtn}
            >
              {formatMessage({ id: `misc.submit`, desc: '提交' })}
            </Button>
          )}

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              if (offerFrom && offerFrom.includes('OfferAndResDetails')) {
                closeThenGoto(`${offerFrom}`);
              } else {
                closeThenGoto('/user/center/info');
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={operationkey}
          tabList={tempInfoEditTabList}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResEditDetail;
