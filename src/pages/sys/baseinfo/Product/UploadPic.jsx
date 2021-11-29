import React from 'react';
import { Upload, Icon, message } from 'antd';
import { serverUrl, getCsrfToken, request } from '@/utils/networkUtils';
import createMessage from '@/components/core/AlertMessage';
import styles from './uploadPic.less';

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJPG = file.type === 'image/jpeg';
  if (!isJPG) {
    message.error('You can only upload JPG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJPG && isLt2M;
}

class UploadPic extends React.Component {
  state = {
    loading: false,
    imageUrl: null,
  };

  componentDidMount() {
    const { dataKey } = this.props;
    if (dataKey > 0) {
      this.setState({ loading: true });

      request.get(`/api/base/v1/buProd/download/${dataKey}`).then(({ response }) => {
        if (response.datum) {
          const image = `data:image/jpeg;base64,${response.datum}`;
          this.setState({
            imageUrl: image,
          });
        }
        this.setState({ loading: false });
      });
    }
  }

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      const {
        file: { response },
      } = info;
      if (!response.ok) {
        createMessage({ type: 'error', description: response.reason });
      } else {
        // Get this url from response in real world.
        getBase64(info.file.originFileObj, imageUrl =>
          this.setState({
            imageUrl,
            // loading: false,
          })
        );
      }
      this.setState({ loading: false });
    }
  };

  beforeUpload = file => {
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      createMessage({ type: 'error', description: '图片大小不能超过1M' });
    }
    return isLt2M;
  };

  render() {
    const { disabled, dataKey } = this.props;
    const { loading, imageUrl } = this.state;

    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">请先保存案例再上传图片</div>
      </div>
    );

    const injectProps = {
      action: `${serverUrl}/api/base/v1/buProd/upload`,
      headers: {
        'el-xsrf': getCsrfToken(),
      },
      withCredentials: true,
      data: { dataKey },
    };

    return (
      <Upload
        name="file"
        listType="picture-card"
        accept="image/*"
        // style={{ width: 144, height: 144 }}
        data={dataKey}
        className={styles['avatar-uploader']}
        showUploadList={false}
        disabled={disabled}
        // action="//jsonplaceholder.typicode.com/posts/"
        beforeUpload={this.beforeUpload}
        onChange={this.handleChange}
        // customRequest={this.handleCustomRequest}
        {...injectProps}
      >
        {dataKey && dataKey > 0 && !!imageUrl ? (
          <img src={imageUrl} alt="案例图片" />
        ) : (
          uploadButton
        )}
      </Upload>
    );
  }
}

export default UploadPic;
