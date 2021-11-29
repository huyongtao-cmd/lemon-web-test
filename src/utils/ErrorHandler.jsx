import React from 'react';
import moment from 'moment';
import { Modal, Button, Row } from 'antd';
import styles from './errorHandler.less';

class ErrorHandler extends React.PureComponent {
  state = {
    visible: false,
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.main) {
      this.main.scrollTop = 0;
    }
  }

  renderType = type => {
    const { msg, stackTrace } = this.props;
    const { visible } = this.state;
    if (type === 'error') {
      return (
        <>
          <div style={{ width: '1000px' }}>
            <p>
              <span style={{ fontWeight: 'bold' }}>时间</span>:
              {moment().format('YYYY-MM-DD HH:mm:ss')}
            </p>
            <p>
              <span style={{ fontWeight: 'bold' }}>帮助</span>:
            </p>
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            <p>1. 请点击"详细信息"后截图</p>
            <p>2. 将截图使用右上角问题反馈功能提交</p>
            <a
              onClick={() => {
                //   Modal.error({
                //     title: '详细信息',
                //     content: (
                //       <p>{stackTrace}</p>
                //     ),
                //     onOk() {},
                //     width:'1000px',
                //     className:styles.errorHandler,
                //     // bodyStyle:{height:"80%",overflow:'scroll'},
                //     maskClosable:true,
                //   })
                // }
                this.setState({ visible: true });
              }}
              href={void 0}
            >
              详细信息
            </a>
          </div>
          <Modal
            title="详细信息"
            visible={visible}
            onOk={() => this.setState({ visible: false })}
            onCancel={() => this.setState({ visible: false })}
            okText="确认"
            width="1000px"
            className={styles.errorHandler}
            maskClosable
          >
            <p>{stackTrace}</p>
          </Modal>
        </>
      );
    }
    return (
      <>
        <div style={{ width: '1000px' }}>
          <p>{msg}</p>
        </div>
      </>
    );
  };

  render() {
    const { type } = this.props;
    return this.renderType(type);
  }
}

export default ErrorHandler;
