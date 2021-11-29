import React from 'react';
import { parse, unparse } from 'papaparse';
import { detect } from 'jschardet';
import { saveAs } from 'file-saver';
import { Upload, Button, Modal, Icon } from 'antd';
import message from '@/components/production/layout/Message.tsx';

const { Dragger } = Upload;

class CsvImportFront extends React.Component {
  defaultState = {
    showImportModalFlag: false,
    totalRow: 0,
    validRow: 0,
    validResults: [],
    completeFlag: false,
  };

  state = this.defaultState;

  /**
   * 解析csv文件
   * config为json对象,属性属下:
   * fieldsMap: json对象,csv表格标题名跟数据属性映射.如{"姓名":"name","年龄":"age"}
   * valid: function,参数为每一行的数据,方法应该返回一个对象,包含result和msg属性.如{"result":false,"msg":"该行数据校验失败的原因"}
   * complete: function,第一个参数为解析成功的数据的集合,第二个参数为是否包含校验失败的数据,第三个参数为校验数据的结果集合
   * handlerImportFalse:Boolean,为true,强行手动失败，返回数据为[].
   * @param file
   * @param config
   */
  parseCsv = (file, config) => {
    const that = this;
    if (!file.name.endsWith('csv')) {
      // eslint-disable-next-line no-console
      console.error('Error:parseCsv 只能上传csv文件');
      message({
        type: 'error',
        content: '只能上传csv文件！',
      });
      return;
    }
    if (!file) {
      // eslint-disable-next-line no-console
      console.error('Error:parseCsv file文件不能为空');
      return;
    }
    if (!config) {
      // eslint-disable-next-line no-console
      console.error('Error:parseCsv 方法第二个config参数不能为空');
      return;
    }
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    // eslint-disable-next-line func-names
    reader.onload = function(evt) {
      const content = evt.target.result; // 读取文件内容
      const charset = detect(content);
      parse(file, {
        encoding: charset.encoding,
        header: true,
        skipEmptyLines: 'greedy',
        complete(results) {
          const { fieldsMap = {}, valid, complete, handlerImportFalse } = config;
          const dataList = [];
          results.data.forEach(row => {
            const transferData = {};
            Object.keys(fieldsMap).forEach(field => {
              transferData[fieldsMap[field]] = row[field];
            });
            dataList.push(transferData);
          });
          if (valid && typeof valid === 'function') {
            valid(dataList);
          }
          if (complete && typeof complete === 'function') {
            const validDataList = dataList.filter(tempdata => tempdata.validFlag !== false);
            that.setState({
              validRow: validDataList.length,
              validResults: dataList,
              totalRow: dataList.length,
              completeFlag: true,
            });
            complete(validDataList);
          }
        },
        error(error, errFile) {
          // eslint-disable-next-line no-console
          console.error(errFile.name + '解析失败' + error);
        },
      });
    };
  };

  /**
   * 导出csv
   */
  exportCsv = () => {
    const { fieldsMap, fileName = '导入结果' } = this.props;
    const { validResults } = this.state;
    if (!fieldsMap) {
      // eslint-disable-next-line no-console
      console.error('Error:exportCsv 方法 fieldsMap参数不能为空');
      return;
    }
    let columnString = '';
    Object.keys(fieldsMap).forEach(key => {
      columnString = columnString + key + ',';
    });
    columnString += '\n';
    const csvString = unparse(validResults, { header: false });
    const blob = new Blob(['\ufeff' + columnString + csvString], {
      type: 'text/csv;charset=utf-8',
    });
    saveAs(blob, fileName + '.csv');
  };

  showImportModal = () => {
    this.setState({ showImportModalFlag: true });
  };

  importModaCancel = () => {
    this.setState(this.defaultState);
  };

  downloadTemplate = () => {
    const { templateUrl } = this.props;
    saveAs(templateUrl, '导入模板.csv');
  };

  render() {
    const {
      children = '上传csv',
      className,
      size,
      loading,
      fieldsMap = {},
      validKeyField = '',
      validKeyDesc = '',
      valid,
      templateUrl,
      customBtn,
      complete,
      handlerImportFalse,
    } = this.props;
    const { totalRow, validRow, validResults, completeFlag, showImportModalFlag } = this.state;
    const errorResults = validResults.filter(result => result.validFlag === false);
    const errorTotal = errorResults.length;
    const that = this;
    const draggerProps = {
      accept: '.csv',
      beforeUpload(file) {
        that.parseCsv(file, {
          fieldsMap,
          valid,
          complete,
          handlerImportFalse,
        });
        return false;
      },
    };

    return (
      <>
        <Button
          type="primary"
          className={className}
          size={size}
          loading={loading}
          icon="upload"
          onClick={this.showImportModal}
        >
          {children}
        </Button>

        <Modal
          title="选择CSV文件"
          visible={showImportModalFlag}
          // onOk={this.handleOk}
          onCancel={this.importModaCancel}
          okText="确认"
          cancelText="取消"
          destroyOnClose
          footer={[
            templateUrl ? (
              <Button icon="download" key="downloadTemplate" onClick={this.downloadTemplate}>
                下载模板
              </Button>
            ) : null,
            customBtn || null,
          ]}
        >
          <Dragger {...draggerProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-hint">点击或拖曳上传</p>
          </Dragger>
          {completeFlag ? (
            <div>
              {handlerImportFalse ? (
                <p style={{ color: 'red' }}>上传失败，父项不等于子项之和！</p>
              ) : (
                <p>
                  共识别出
                  <span style={{ color: 'red' }}> {totalRow} </span>
                  条数据,导入成功
                  <span style={{ color: 'red' }}> {validRow} </span>
                  条数据.
                </p>
              )}

              {errorResults.length > 0 ? (
                <>
                  <p>
                    共<span style={{ color: 'red' }}> {totalRow - validRow} </span>
                    条校验失败数据:
                  </p>
                  {errorResults.map((errResult, index) => (
                    // eslint-disable-next-line
                    <li key={index}>
                      {index + 1}. {validKeyDesc}
                      为: <span style={{ color: 'red' }}>{errResult[validKeyField]} </span>
                      校验失败,失败原因:
                      {errResult.validMsg}
                    </li>
                  ))}
                  {errorTotal > 5 ? <p>检验失败超过5条,查看全部结果请下载导入结果.</p> : undefined}
                  <Button onClick={this.exportCsv}>下载结果</Button>
                </>
              ) : (
                undefined
              )}
            </div>
          ) : (
            undefined
          )}
        </Modal>
      </>
    );
  }
}

export default CsvImportFront;
