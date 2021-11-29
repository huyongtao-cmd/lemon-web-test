import React from 'react';
import styles from './index.less';

import appQrCodeImg from '@/assets/img/appQrCode.png';
import appQrCodeIOS from '@/assets/img/qrcode-ios.png';

document.title = 'APP下载 - TELEWORK 快乐工作';

class Download extends React.Component {
  state = {
    visible: false,
  };

  toggle = () => {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
    });
  };

  render() {
    const { visible } = this.state;

    return (
      <>
        <div className={styles.download}>
          <div className="download-container">
            <h1>泰列渥克 APP下载</h1>
            <h2>快乐工作者必备神器，我们追逐 “快乐的工作” ...</h2>
            <div className="download-qrCode">
              <div className="qrCodeBox">
                <span>下载 Android App应用</span>
                <img
                  src={appQrCodeImg}
                  alt="下载 Android App应用"
                  style={{ width: '150px', height: '150px' }}
                />
              </div>
              <div className="qrCodeBox">
                <span>下载 IOS App应用</span>
                <img
                  src={appQrCodeIOS}
                  alt="下载 IOS App应用"
                  style={{ width: '150px', height: '150px' }}
                />
              </div>
            </div>

            {/* <a
              href="itms-services://?action=download-manifest&amp;url=https%3A%2F%2Fapp.elitesland.com%2Faction%2Fiosplist%2FgetIOSAppPlist%3Fcode%3Dtw"
              className="ios"
              onClick={this.toggle}
            >
              下载 iOS App应用
              <span onClick={this.toggle}>安装教程(IOS版必看!!!)</span>
            </a> */}
            {/* <div className="qrcode">
              <div>
                <img src="/static/images/download_qrcode.png" alt="download" />
              </div>
              <p>扫描二维码下载</p>
            </div> */}
          </div>
        </div>
        <div
          className={styles.mask}
          onClick={this.toggle}
          style={{ display: visible ? 'block' : 'none' }}
        >
          <div className="mask-container">
            <img src="/static/images/download_step1.jpg" alt="step1" />
            <img src="/static/images/download_step2.jpg" alt="step2" />
            <p>IOS版本下载安装后，需手工点击配置为信任</p>
            <p>步骤：设置 → 通用 → 设备管理 → Shanghai Elitesland Software...</p>
            <p>点击后确认“信任应用”即可</p>
          </div>
        </div>
      </>
    );
  }
}

export default Download;
