import React, { Component } from 'react';
import { Row, Upload, Tooltip, Popover, List, Button, Icon, Progress } from 'antd';
import styles from './styles.less';

const { Item } = List;

/**
 * @author Mouth.Guo
 */
class FileManager extends Component {
  state = {
    visible: false,
  };

  /**
   * 开始上传文件的时候，要把文件列表打开
   */
  beforeUpload = (file, fileList) => {
    const { beforeUpload } = this.props;
    if (beforeUpload) {
      const result = beforeUpload(file, fileList);
      if (result) this.handleVisibleChange(true);
    } else {
      this.handleVisibleChange(true);
    }
  };

  handleOnChange = (file, status) => {
    const { onChange, fileList } = this.props;
    if (onChange) {
      const info = {
        file: { ...file, status },
        fileList: fileList.filter(v => v.uid !== file.uid),
        event: false,
      };
      onChange(info);
    } else {
      throw new Error('必须实现onChange方法');
    }
  };

  /**
   * file status : 'error' | 'done' | 'doneError'
   * 'error' - 上传失败
   * 'done' - 删除文件列表的文件， success -> remove, fail -> doneError
   * 'doneError' - 删除文件列表的文件，但是删除失败了
   */
  onRemove = file => {
    const { onRemove } = this.props;
    const { status } = file;
    if (onRemove) {
      onRemove(file, success => {
        if (success) {
          this.handleOnChange(file, 'removed');
        } else {
          const newStatus = status.indexOf('done') > -1 ? 'doneError' : 'error';
          this.handleOnChange(file, newStatus);
        }
      });
    } else {
      this.handleOnChange(file, 'removed');
    }
  };

  /**
   * 取消只会发生在上传中，
   * cancel :
   *   - success -> removed
   *   - fail -> uploading
   */
  onCancel = file => {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel(file, success => {
        if (success) {
          this.handleOnChange(file, 'removed');
        } else {
          this.handleOnChange(file, 'uploading');
        }
      });
    } else {
      this.handleOnChange(file, 'removed');
    }
  };

  onDownload = file => {
    const { link, name } = file;
    // 有link就是文件服务列表的，没有link，是本地刚上传的，可以取originFileObj
    if (link) {
      const a = document.createElement('a');
      // a.style = 'display: none';
      a.style.display = 'none';
      a.download = name;
      a.href = link;
      a.target = '_blank';

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const { originFileObj } = file;
      const blob = new Blob([originFileObj]);
      if ('msSaveOrOpenBlob' in window.navigator) {
        window.navigator.msSaveOrOpenBlob(blob, name);
      } else {
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = name;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }
  };

  handleVisibleChange = visible => this.setState({ visible });

  renderUploadFile = (file, index) => {
    const { status, percent = 30, name } = file;
    const error = status === 'error';
    const uploading = status === 'uploading';
    const fileStyle = error ? { color: '#f50' } : {};
    // const iconType = error ? 'close' : 'undo';
    // const clickMethod = error ? () => this.onRemove(file) : () => this.onCancel(file);
    const progressStatusUploading = uploading ? 'active' : 'success';
    const progressStatus = error ? 'exception' : progressStatusUploading;
    // const progressShowInfo = error ? false : true;
    const progressShowInfo = !error;
    return (
      <Item key={index} className={styles.uploadList}>
        <div className={styles.line}>
          {name.length > 15 ? (
            <Tooltip placement="top" title={name}>
              <div style={{ flex: 1, ...fileStyle }}>{`${name.substr(0, 15)}...`}</div>
            </Tooltip>
          ) : (
            <div style={{ flex: 1, ...fileStyle }}>{name}</div>
          )}
          <Icon
            className={styles.icon}
            style={{ visibility: uploading ? 'hidden' : 'visible' }}
            type="close"
            onClick={() => this.onRemove(file)}
          />
        </div>
        <Progress percent={percent} status={progressStatus} showInfo={progressShowInfo} />
      </Item>
    );
  };

  // status is 'done ' | 'doneError'
  renderItem = (file, index) => {
    const { preview } = this.props;
    const { name, status, link } = file;
    const fileStyle = status === 'doneError' ? { color: '#f50' } : {};
    return (
      <Item className={styles.uploadedList} key={index}>
        <Icon
          className={styles.icon}
          style={{ marginRight: 8 }}
          type="cloud-download"
          onClick={() => this.onDownload(file)}
        />
        {name.length > 15 ? (
          <Tooltip placement="top" title={name}>
            <div style={{ flex: 1, ...fileStyle }}>{`${name.substr(0, 15)}...`}</div>
          </Tooltip>
        ) : (
          <div style={{ flex: 1, ...fileStyle }}>{name}</div>
        )}
        {!preview && (
          <Icon
            className={`delete-style ${styles.icon}`}
            type="close"
            onClick={() => this.onRemove(file)}
          />
        )}
      </Item>
    );
  };

  renderMenu = () => {
    const { fileList } = this.props;
    return (
      <List className={styles.list}>
        {fileList.length > 0 ? (
          fileList
            // 核心组件再过滤一层removed，本组件不展示已删除文件，filter防止外部传入数据忘记过滤
            .filter(file => file.status !== 'removed')
            // 区分上传完成（'done' | 'doneError'）和上传中('uploading' | 'error')文件渲染
            .map((file, index) => {
              const { status } = file;
              const notUpload = status.indexOf('done') > -1;
              return notUpload ? this.renderItem(file, index) : this.renderUploadFile(file, index);
            })
        ) : (
          <Item>暂无附件</Item>
        )}
      </List>
    );
  };

  render() {
    const {
      trigger = 'click',
      placement = 'bottomLeft',
      listType = 'text',
      accept,
      disabled = false,
      preview = false,
      multiple,
      onChange,
      fileList,
      headers,
      action,
      data,
      withCredentials,
      ele = false,
    } = this.props;
    const { visible } = this.state;

    const props = {
      accept,
      listType,
      multiple,
      headers,
      action,
      data,
      withCredentials,
      beforeUpload: this.beforeUpload,
      fileList,
      disabled: preview ? true : disabled,
      showUploadList: false,
      onChange,
    };
    return (
      <Row type="flex" justify="start" align="middle" style={{ flexWrap: 'nowrap' }}>
        {!preview && (
          <Upload {...props}>
            {ele !== false ? (
              ele
            ) : (
              <Button size="large" type="default" icon="upload" style={{ boxShadow: 'none' }}>
                上传文件
              </Button>
            )}
          </Upload>
        )}
        {!ele && (
          <Popover
            content={this.renderMenu()}
            trigger={trigger}
            onVisibleChange={this.handleVisibleChange}
            visible={visible}
            placement={placement}
          >
            <a href="#" className={styles.rightBtn} style={preview ? { marginLeft: 0 } : {}}>
              <span style={{ fontSize: '1.2em' }}>{fileList.length}</span>
              个文件 <Icon type="down" />
            </a>
          </Popover>
        )}
      </Row>
    );
  }
}

export default FileManager;
