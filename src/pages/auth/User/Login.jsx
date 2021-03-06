import React, { Component } from 'react';
import { connect } from 'dva';
// import Link from 'umi/link';
import { Checkbox, Alert } from 'antd';
import { JSEncrypt } from 'jsencrypt';
import { FormattedMessage } from 'umi/locale';
import Login from '@/components/layout/Login';
import { getEncryptPsw } from '@/services/gen/app';
import styles from './Login.less';

const { Tab, UserName, Password, Captcha, Submit } = Login; // Mobile

@connect(({ login, loading, global }) => ({
  login,
  submitting: loading.effects['login/login'],
  global,
}))
class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/updateState',
      payload: {
        tabData: [],
      },
    });
    this.onGetCaptcha();
    this.getHomepageConfig();
    // this.getLogoAndExtensionConfig();
  }

  onTabChange = type => {
    this.setState({ type });
  };

  onGetCaptcha = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/getCaptcha',
    });
  };

  getHomepageConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/querySysHomeConfig',
    });
  };

  getLogoAndExtensionConfig = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/querySysLogoAndExtension',
    });
  };

  // new Promise((resolve, reject) => {
  //   this.loginForm.validateFields(['mobile'], {}, (err, values) => {
  //     if (err) {
  //       reject(err);
  //     } else {
  //       const { dispatch } = this.props;
  //       dispatch({
  //         type: 'login/getCaptcha',
  //         payload: values.mobile,
  //       })
  //         .then(resolve)
  //         .catch(reject);
  //     }
  //   });
  // });

  encryptData = (PublicKey, data) => {
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(PublicKey);
    const encryptPsw = encrypt.encrypt(data);
    return encryptPsw;
  };

  handleSubmit = async (err, values) => {
    const { response } = await getEncryptPsw();
    let { password } = values;
    password = this.encryptData(response, password);
    const { dispatch } = this.props;
    const { type, autoLogin } = this.state;
    if (!err) {
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
          autoLogin,
          type,
          href: window.location.href,
          password,
        },
      });
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    return (
      <div className={styles.main} data-scope="login">
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          <Tab key="account" tab="????????????">
            {login.status === 'error' &&
              login.type === 'account' &&
              !submitting &&
              this.renderMessage('????????????????????????admin???')}
            <UserName name="login_no" placeholder="???????????????" />
            <Password
              name="password"
              placeholder="???????????????"
              onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
            />
            <Captcha
              name="captcha"
              placeholder="??????????????????"
              src={login.captcha}
              alt="?????????"
              onGetCaptcha={this.onGetCaptcha}
              onPressEnter={() => this.loginForm.validateFields(this.handleSubmit)}
            />
            {/* <Captcha name="captcha" countDown={60} onGetCaptcha={this.onGetCaptcha}/> */}
          </Tab>
          {/* <Tab key="mobile" tab="???????????????">
            {login.status === 'error' &&
              login.type === 'mobile' &&
              !submitting &&
              this.renderMessage('???????????????')}
            <Mobile name="mobile" />
            <Captcha name="captcha" countDown={120} onGetCaptcha={this.onGetCaptcha} />
          </Tab> */}
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              <FormattedMessage id="login.automatic" defaultMessage="????????????" />
            </Checkbox>
            {/* <a
              style={{ float: 'right' }}
              href="mailto:it-admin@elitesland.com?subject=TELEWORK-????????????"
            >
              <FormattedMessage id="login.pwd.forget" defaultMessage="????????????" />
            </a> */}
          </div>
          <Submit loading={submitting}>??????</Submit>
          <div className={styles.other}>
            {/* <Link className={styles.register} to="/User/Register">????????????</Link> */}
          </div>
        </Login>
      </div>
    );
  }
}

export default LoginPage;
