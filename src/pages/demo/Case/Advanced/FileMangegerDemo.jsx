import React from 'react';
import { Row, Col, Divider } from 'antd';
import { FileManagerEnhance } from '@/pages/gen/field';

const FileManagerDemo = () => {
  /**
   *
   * @param {object} fileList 当前文件列表
   * 该文件列表中文件，你可能会看到的状态有
   * status -> 'done' | 'doneError' | 'uploading' | 'error'
   *  // 'removed‘ 已经被过滤掉了
   * 'done' -> 上传完成 -> 文件服务列表已经有的
   * 'doneError' -> 删除失败，所以文件列表还是you 的
   *  'uploading' -> 上传中 -> 上传时的中间状态，最终你接收到的fileList里面并不会有这个状态
   *  'error' -> 上传失败，文件服务列表没有
   *
   * 你最终需要的只有 'done' | 'doneError'
   */
  const onChange = fileList => {
    console.log('do u need it ? -> ', fileList);
    console.log(
      'maybe this will be the true list -> ',
      fileList.filter(file => file.status.indexOf('done') > -1)
    );
  };
  return (
    <>
      <Row>
        <Col span={7}>
          <FileManagerEnhance
            api="/dev/sfs-client/sfs/token"
            dataKey="rex"
            listType="text"
            disabled={false}
            onChange={onChange}
          />
        </Col>
      </Row>
      <Divider dashed />
      <div className="tw-card-title" style={{ marginBottom: 16 }}>
        预览
      </div>
      <Row>
        <Col span={7}>
          <FileManagerEnhance
            api="/dev/sfs-client/sfs/token"
            dataKey="rex"
            listType="text"
            disabled={false}
            onChange={onChange}
            preview
          />
        </Col>
      </Row>
    </>
  );
};

export default FileManagerDemo;
