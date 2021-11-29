import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Button, Card, DatePicker, Form } from 'antd';
import classnames from 'classnames';
import { isEmpty } from 'ramda';

import { fromQs } from '@/utils/stringUtils';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';

import { editOperationTabList } from './config/index';
import component from './component';
// tab的页面
const {
  BasicInfo,
  PlatInfo,
  Edubg,
  Workbg,
  ProExp,
  Cert,
  Finance,
  Getrp,
  Personnel,
  SelfEvaluation,
} = component;

const DOMAIN = 'platResDetail';
@connect(({ loading, platResDetail }) => ({
  loading,
  platResDetail,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (key === 'emailAddr' || key === 'mobile') {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value.replace(/\s*/g, '') },
      });
    } else {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
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
    const { id, tab, mode } = param;
    if (mode && mode !== 'create') {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    } else {
      dispatch({ type: `${DOMAIN}/clean` });
    }
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'RES_ARCHIVES_MANAGEMENT_INFORMATION_PLATFORM' },
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

  onOperationTabChange = key => {
    const {
      platResDetail: { mode },
    } = this.props;
    if (mode !== 'create') {
      this.setState({ operationkey: key });
    }
  };

  handleSave = () => {
    const {
      dispatch,
      form: { validateFieldsAndScroll },
      platResDetail: { formData },
    } = this.props;
    // 保存请求
    console.error('i am run', formData.id);
    if (formData.id > 0) {
      validateFieldsAndScroll((error, values) => {
        if (!error) {
          dispatch({
            type: `${DOMAIN}/tabSave`,
            payload: { id: formData.id },
          });
        } else {
          createMessage({ type: 'error', description: error });
        }
      });
    }
  };

  render() {
    const {
      form,
      form: { getFieldDecorator },
      platResDetail: { formData, platFormData, personnelData, c2Data, c3Data, pageConfig },
    } = this.props;
    const { operationkey } = this.state;
    const contentList = {
      basic: <BasicInfo form={form} domain={DOMAIN} />,
      platInfo: (
        <PlatInfo form={form} platFormData={platFormData} domain={DOMAIN} pageConfig={pageConfig} />
      ),
      edubg: <Edubg />,
      workbg: <Workbg />,
      proExp: <ProExp />,
      cert: <Cert />,
      financeInfo: <Finance />,
      getrp: <Getrp />,
      personnel: <Personnel form={form} personnelData={personnelData} domain={DOMAIN} />,
      selfEvaluation: <SelfEvaluation />,
    };

    return (
      <PageHeaderWrapper title="资源编辑">
        <Card className="tw-card-rightLine">
          <Button className="tw-btn-primary" icon="save" size="large" onClick={this.handleSave}>
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/res/profile/list')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-multiTab"
          bordered={false}
          activeTabKey={operationkey}
          tabList={editOperationTabList}
          onTabChange={this.onOperationTabChange}
        >
          {contentList[operationkey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ResEditDetail;
