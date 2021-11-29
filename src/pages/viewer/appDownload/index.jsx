import React from 'react';
import $ from 'jquery';
// eslint-disable-next-line import/no-unresolved
import styles from './index.less';

document.title = '泰列渥克App云发布平台';

const appVersionUrl = 'http://download.elitesland.net/appVersion.json';
class AppDownload extends React.Component {
  state = {
    downloadUrl: '#',
    appTitleTip: false,
    pcShowTip: false,
    openBrowserTip: false,
    noGetVersionFlag: false,
  };

  componentDidMount() {
    $.ajax({
      type: 'GET',
      dataType: 'html',
      url: appVersionUrl,
      success: data => {
        if (data !== '') {
          const { currentVersion, historyVersion = [] } = JSON.parse(data);
          const version = currentVersion || historyVersion[historyVersion.length - 1];
          this.getModal(version);
        } else {
          this.setState({
            noGetVersionFlag: true,
          });
        }
      },
      error: err => {
        console.warn(err);
        this.setState({
          noGetVersionFlag: true,
        });
      },
    });

    // axios
    //   .get(appVersionUrl)
    //   .then(response => {
    //     console('axiosSuccess', response);
    //     const { data, status } = response;
    //     if (status === 200) {
    //       const { currentVersion, historyVersion = [] } = data;
    //       const version = currentVersion || historyVersion[historyVersion.length - 1];
    //       alert(version);
    //       this.getModal(version);
    //     } else {
    //       this.setState({
    //         noGetVersionFlag: true,
    //       });
    //     }
    //   })
    //   .catch(error => {
    //     alert('axiosError', error);
    //     this.setState({
    //       noGetVersionFlag: true,
    //     });
    //   });
  }

  getModal = version => {
    const agent = navigator.userAgent;
    if (agent.toUpperCase().indexOf('ANDROID') >= 0) {
      // ANDROID系统
      // const tt = `http://download.elitesland.net/app/TW_${version}.apk`;
      this.setState({
        downloadUrl: version,
        appTitleTip: true,
        openBrowserTip: true,
      });
    } else if (
      agent.toUpperCase().indexOf('IPHONE') >= 0 ||
      agent.toUpperCase().indexOf('IPAD') >= 0
    ) {
      // IOS系统
      const plistUrl = encodeURIComponent(
        'https://app.elitesland.com/action/iosplist/getIOSAppPlist?code=tw'
      );
      this.setState({
        downloadUrl: 'itms-services://?action=download-manifest&url=' + plistUrl,
        appTitleTip: true,
        openBrowserTip: true,
      });
    } else {
      this.setState({
        downloadUrl: '#',
        pcShowTip: true,
        openBrowserTip: false,
      });
    }
  };

  render() {
    const { appTitleTip, downloadUrl, openBrowserTip, pcShowTip, noGetVersionFlag } = this.state;
    return (
      <div className={styles.appDownload}>
        <div className={styles.center}>
          {noGetVersionFlag ? (
            <h1 style={{ color: '#fff', textAlign: 'center' }}>
              获取APP版本错误
              <br />
              请联系管理员！
            </h1>
          ) : (
            <div className={styles.downLoad}>
              <div className={styles.div1}>
                {appTitleTip && <h1 style={{ color: '#fff' }}>点击下方图标开始安装应用</h1>}

                <h1 style={{ color: '#fff' }}>泰列渥克</h1>
              </div>
              <div className={styles.div2}>
                <a href={downloadUrl}>
                  <img
                    width="100px"
                    height="100px"
                    src="https://app.elitesland.com/images/telework.png"
                    alt="download"
                  />
                </a>
              </div>

              {openBrowserTip && (
                <div className={styles.div3}>
                  若点击图标无法安装
                  <br />
                  请使用浏览器
                  <br />
                  打开该页面
                  <br />
                </div>
              )}

              {pcShowTip && (
                <div className={styles.div4}>
                  <a href="http://download.elitesland.net/app/TW_V1.0.1.ipa">
                    <font color="white">直接下载 iOS App安装程序</font>
                  </a>
                  <br />
                  <a href="http://download.elitesland.net/app/TW_V1.0.1.apk">
                    <font color="white">直接下载 Android App安装程序</font>
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default AppDownload;
