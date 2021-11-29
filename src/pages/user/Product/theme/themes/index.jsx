import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Button, Card, Form, Input, Select, TimePicker, Row, Col } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import classnames from 'classnames';

import energize from '@/assets/img/productTheme/energize.svg';
import styles from '../index.less';

import PanelOne from './panelOne';
import PanelTwo from './panelTwo';
import PanelThree from './panelThree';

const DOMAIN = 'themeDetail';
@connect(({ loading, themeDetail }) => ({
  themeDetail,
  loading,
}))
class PanelDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id, panelType } = fromQs();
    dispatch({ type: `${DOMAIN}/getThemeById`, payload: { id } });
    dispatch({ type: `${DOMAIN}/abilityQuery`, payload: { id } });
    dispatch({ type: `${DOMAIN}/processQuery`, payload: { id } });
    dispatch({ type: `${DOMAIN}/queryByReportById`, payload: { id } });
    dispatch({ type: `${DOMAIN}/queryReportDataById`, payload: { id } });
  }

  renderPanel = props => {
    const { panelType, id } = fromQs();
    const Panel = {
      '1': <PanelOne options={props} />,
      '2': <PanelTwo options={props} />,
      '3': <PanelThree options={props} />,
    };
    return Panel[panelType];
  };

  render() {
    const { themeDetail, dispatch, loading } = this.props;
    const { panelType, id } = fromQs();
    return (
      <div>
        <PageHeaderWrapper title="个体赋能">
          <>{this.renderPanel({ themeDetail, dispatch, loading, DOMAIN, id, panelType })}</>
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default PanelDetail;
