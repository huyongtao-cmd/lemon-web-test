import React from 'react';
import { parse, unparse } from 'papaparse';
import { detect } from 'jschardet';
import { saveAs } from 'file-saver';
import { Upload, Button, Modal, Icon } from 'antd';
import { type, equals } from 'ramda';
import ExportJsonExcel from 'js-export-excel';

const { Dragger } = Upload;

class ExcelImportExport extends React.Component {
  constructor(props) {
    super(props);
    const { controlModal } = this.props;
    this.state = {
      controlModal,
      fileList: [],
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ controlModal: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { controlModal } = this.props;
    if (!equals(prevState.controlModal, controlModal)) {
      return controlModal;
    }
    return null;
  }

  toggleVisible = () => {
    this.setState(
      {
        fileList: [],
      },
      () => {
        const { closeModal } = this.props;
        const { visible: visibles } = this.props;
        type(closeModal) === 'Function' && closeModal(visibles);
      }
    );
  };

  handleUpload = (v, index) => {
    const { fileList } = this.state;
    const { handleUpload } = this.props;
    type(handleUpload) === 'Function' && handleUpload(fileList);
    this.setState({
      //上传成功之后清空文件
      fileList: [],
    });
  };

  handleCancel = () => {
    this.toggleVisible();
  };

  /**
   * 导出excel
   */

  downLoadFaileExcel = () => {
    const {
      controlModal: { failedList },
      option,
    } = this.props;
    option.datas[0].sheetData = failedList;
    const toExcel = new ExportJsonExcel(option); // new
    toExcel.saveExcel();
  };

  downloadTemplate = () => {
    const { templateUrl, templateName } = this.props;
    // saveAs(templateUrl, templateName);
    window.location.href = templateUrl;
  };

  render() {
    const { fieldsMap = {}, templateUrl } = this.props;
    const {
      controlModal: { failedList, uploading, visible },
      fileList,
    } = this.state;

    const uploadProps = {
      accept:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel ,.xlsx,.xls',
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
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <Modal
        title="选择Excel文件"
        visible={visible}
        // onOk={this.handleOk}
        onCancel={this.handleCancel}
        destroyOnClose
        footer={
          templateUrl
            ? [
                failedList.length > 0 ? (
                  <Button key="failedButton" onClick={this.downLoadFaileExcel}>
                    下载失败结果
                  </Button>
                ) : null,
                // eslint-disable-next-line
                <Button icon="download" key="downloadTemplate" onClick={this.downloadTemplate}>
                  下载模板
                </Button>,
                // eslint-disable-next-line
                <Button
                  type="primary"
                  key="upload"
                  className="tw-btn-warning"
                  onClick={this.handleUpload}
                  disabled={fileList.length === 0}
                  loading={uploading}
                  style={{ marginTop: 16 }}
                >
                  {uploading ? '上传中...' : '确认上传'}
                </Button>,
              ]
            : null
        }
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-hint">点击或拖曳上传</p>
        </Dragger>
      </Modal>
    );
  }
}

export default ExcelImportExport;
