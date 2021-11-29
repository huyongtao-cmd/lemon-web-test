/* eslint-disable */
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';
import { closeThenGoto } from '@/layouts/routerControl';
import { isNil } from 'min-dash';

const DOMAIN = 'reportAuth';

@connect(({ dispatch, loading, reportAuth }) => ({
  dispatch,
  loading,
  reportAuth,
}))
class ReportAuth extends React.PureComponent {
  state = {
    tip: '登录授权中,请等待...',
  };

  componentDidMount() {
    const {
      reportAuth: { reportUrl },
      dispatch,
    } = this.props;
    dispatch({ type: `${DOMAIN}/query` }).then(reportUrl => {
      !isNil(reportUrl) && this.loadJs(reportUrl, this.auth);
    });
  }

  loadJs = (path, callback) => {
    var header = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.setAttribute('src', path);
    header.appendChild(script);

    script.onload = () => {
      callback();
    };
  };

  auth = () => {
    const {
      reportAuth: { login, secretKey, ajaxUrl },
    } = this.props;
    const { type, id, code } = fromQs();

    /*----------TODO: 后期使用缓存自动登录
    const BIuser = false;
    // const BIuser = window.sessionStorage.getItem('BIuser');
    if (BIuser) {
      if (type === 'REPORT_PLAT') {
        // 菜单导航入口
        const href = window.sessionStorage.getItem('REPORT_PLAT');
        window.location.href = href;
      } else {
        window.location.href = `/BI/report?id=${id}`;
      }
    }
    -------- TODO end */

    // 使用插件中的方法 编码用户名&密码
    const username = FR.cjkEncode(login);
    const password = FR.cjkEncode(secretKey);

    // 使用插件中的ajax 发起登录请求
    jQuery.ajax({
      url: ajaxUrl,
      // headers: {"X-CSRFToken": ''}, // CSRF MAYBE TODO
      dataType: 'jsonp',
      data: { fr_username: username, fr_password: password },
      jsonp: 'callback',
      timeout: 5000,
      success: data => {
        if (data.status === 'success') {
          window.sessionStorage.setItem('BIuser', '1');
          switch (type) {
            case 'REPORT_PLAT':
              // 菜单导航入口
              window.location.href = window.sessionStorage.getItem('REPORT_PLAT');
              break;
            case 'PROJ':
              // 项目报表
              closeThenGoto(`/user/project/projectBI?id=${id}`);
              break;
            case 'projDaysEqvaMonthly':
              // 人天当量统计表
              closeThenGoto(`/user/project/projDaysEqvaMonthly?id=${id}`);
              break;
            case 'projReim':
              // 费用统计表
              closeThenGoto(`/user/project/projReim?id=${id}`);
              break;
            case 'projDaysEqvaDaily':
              // 费用人天分析表
              closeThenGoto(`/user/project/projDaysEqvaDaily?id=${id}`);
              break;
            case 'projReimDetail':
              // 费用明细表
              closeThenGoto(`/user/project/projReimDetail?id=${id}`);
              break;
            case 'projTimeSheetDetail':
              // 工时明细表
              closeThenGoto(`/user/project/projTimeSheetDetail?id=${id}`);
              break;
            case 'projPurchaseContractDetail':
              // 采购合同明细表
              closeThenGoto(`/user/project/projPurchaseContractDetail?id=${id}`);
              break;
            case 'NAV':
              closeThenGoto('/plat/reportMgmt/navDetail');
              break;
            default:
              break;
          }
        } else if (data.status === 'fail') {
          this.setState({
            tip: '对不起,您没有权限访问',
          });
          createMessage({ type: 'error', description: '对不起,您没有权限访问' });
          window.sessionStorage.removeItem('BIuser');
        }
      },
    });
  };

  render() {
    const { tip } = this.state;

    return <div style={{ fontSize: 18 }}>{tip}</div>;
  }
}

export default ReportAuth;
