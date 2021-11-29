import React from 'react';
import { connect } from 'dva';
import { Modal, Select, Button, Upload, Icon, Form } from 'antd';
import { saveAs } from 'file-saver';
import createMessage from '@/components/core/AlertMessage';

const { Option } = Select;
const { Dragger } = Upload;
const { Item } = Form;
const DOMAIN = 'systemLocaleModal';
const emptyState = {
  fileList: [],
  uploading: false,
  language: '',
};

@connect(({ loading, systemLocaleModal }) => ({
  // :loading.effects['namespace/submodule'], // 页面加载loading停止的条件, 此处代表这个请求结束
  ...systemLocaleModal,
}))
class LocaleModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...emptyState,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/getLanguage`,
    });
  }

  onChange = language => {
    this.setState({
      language,
    });
  };

  handleCencel = () => {
    this.setState({
      ...emptyState,
    });
    const { handleCencel } = this.props;
    handleCencel();
  };

  downloadTemplate = () => {
    const { language } = this.state;
    if (!language) {
      createMessage({ type: 'warn', description: '请选择语言！' });
    } else {
      const templateUrl = `${SERVER_URL}/api/production/systemLocale/export/${language}`;
      saveAs(templateUrl);
    }
  };

  handleUpload = fileList => {
    this.setState({
      uploading: true,
    });
    const fileData = new FormData();
    fileList.forEach(file => {
      fileData.append('file', file);
    });
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/upload`,
      payload: fileData,
    }).then(res => {
      this.setState({
        uploading: false,
      });
      if (res.ok) {
        createMessage({ type: 'success', description: '上传成功' });
      } else {
        createMessage({ type: 'error', description: res.data || '上传失败' });
      }
      return null;
    });
  };

  render() {
    const { visible, languageData } = this.props;
    const { fileList, uploading } = this.state;

    const draggerProps = {
      accept: '.xls',
      onRemove: file => {
        this.setState(state => {
          const index = state.fileList.indexOf(file);
          const newFileList = state.fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(state => ({
          fileList: [file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <Modal
        title="按语言完善"
        visible={visible}
        onCancel={this.handleCencel}
        destroyOnClose
        footer={[
          <Button icon="download" key="downloadTemplate" onClick={this.downloadTemplate}>
            下载模板
          </Button>,
          <Button
            type="primary"
            key="upload"
            className="tw-btn-warning"
            onClick={() => this.handleUpload(fileList)}
            disabled={fileList.length === 0}
            loading={uploading}
            style={{ marginTop: 16 }}
          >
            {uploading ? '上传中...' : '确认上传'}
          </Button>,
        ]}
      >
        <Form layout="inline">
          <Item label="选择语言" name="language">
            <Select placeholder="选择语言" onChange={this.onChange} style={{ width: 200 }}>
              {languageData &&
                languageData.map(value => (
                  <Option value={value.selectionValue} key={value}>
                    {value.selectionName}
                  </Option>
                ))}
            </Select>
          </Item>
        </Form>
        <br />
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-hint">点击或拖曳上传.xls表格文件</p>
        </Dragger>
      </Modal>
    );
  }
}

export default LocaleModal;
