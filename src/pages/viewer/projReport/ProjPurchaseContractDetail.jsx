/* eslint-disable */
import React from 'react';
import router from 'umi/router';
import { fromQs } from '@/utils/stringUtils';
import classnames from 'classnames';
import DocumentTitle from 'react-document-title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

// 动态设置iframe高度
const h = document.documentElement.clientHeight || document.body.clientHeight;
const height = h - 50 - 35 - 36;

class ReportViewer extends React.PureComponent {
  state = {
    url: '',
  };

  componentDidMount() {
    // 取出localStorage的数据并立即删除localStorage
    const reportParms = window.sessionStorage.getItem('projPurchaseContractDetail');
    const reportParmObj = JSON.parse(reportParms);
    const { reportUrl = '' } = reportParmObj;
    this.setState({
      url: reportUrl,
    });
  }

  render() {
    const { url } = this.state;

    return (
      <div
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <iframe src={url} style={{ width: '100%', height }} frameBorder="0" />
      </div>
    );
  }
}

export default ReportViewer;
