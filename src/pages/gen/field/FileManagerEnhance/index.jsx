import React, { Component } from 'react';
import { isNil, isEmpty } from 'ramda';
import { request, serverUrl, getCsrfToken } from '@/utils/networkUtils';
import { toQs } from '@/utils/stringUtils';
import apis from '@/api';
import FileManager from '@/components/common/FileManager';
import createMessage from '@/components/core/AlertMessage';
import { div } from '@/utils/mathUtils';

const { sfs } = apis;

/**
 * srm项目里stringUtil里面的方法，这里没有看到，为避免产生不必要的影响，该方法写在这里
 * 是否移如Util请使用者问询前端把关人员。。。
 */
const JSON2QueryString = obj => {
  const str = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const p in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(p) && obj[p]) {
      // eslint-disable-next-line prefer-template
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
};

class FileManagerEnhance extends Component {
  list = [];

  flag = undefined;

  runFlag = false;

  constructor(props) {
    super(props);
    this.state = {
      listType: props.listType || 'text',
      fileList: [],
      repoInfo: {},
      tokenInfo: {},
      copyFlag: true, // 控制只执行一次copy动作的flag值
    };
  }

  componentDidMount() {
    const { api, dataKey } = this.props;
    this.run(() => this.fetchChain(api, dataKey));
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props !== null && this.props !== undefined) {
      const { api, dataKey } = this.props;
      const { api: prevApi, dataKey: prevDataKey } = prevProps;
      if (api !== prevApi || dataKey !== prevDataKey) {
        this.run(() => this.fetchChain(api, dataKey));
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.flag);
  }

  run = fun => {
    this.list.push(fun);
    const that = this;
    if (!this.flag) {
      this.flag = window.setInterval(() => {
        if (that.list.length > 0) {
          if (that.runFlag === false) {
            that.runFlag = true;
            that.list[0]().then(data => {
              that.runFlag = false;
              that.list.splice(0, 1);
            });
          }
        } else {
          clearInterval(that.flag);
          that.flag = undefined;
        }
      }, 100);
    }
  };

  // getSnapshotBeforeUpdate(nextProps, prevState) {
  //   const { dataKey, api, copy, copyData } = this.props;
  //   if (nextProps.dataKey !== dataKey) {
  //     return {
  //       api,
  //       dataKey,
  //       copy,
  //       copyData,
  //     };
  //   }
  //   return null;
  // }

  fetchChain = async (api, dataKey) =>
    this.fetchTokenInfo(api, dataKey).then(({ response }) => {
      if (response) {
        this.fetchRepoInfo().then(info => {
          if (!isNil(dataKey) && !isEmpty(dataKey)) {
            this.fetchList();
          }
        });
      }
    });

  fetchTokenInfo = (api, dataKey) =>
    new Promise(resolve => {
      api !== undefined &&
        request.get(toQs(api, { dataKey })).then(data => {
          if (data.response) {
            this.setState(
              {
                tokenInfo: data.response,
              },
              () => {
                resolve(data);
              }
            );
          }
        });
    });

  fetchRepoInfo = () => {
    const { tokenInfo } = this.state;
    return new Promise(resolve => {
      tokenInfo !== null &&
        request.get(toQs(sfs.repo, { ...tokenInfo })).then(data => {
          if (data.response) {
            this.setState(
              {
                repoInfo: data.response,
              },
              () => {
                resolve(data);
              }
            );
          }
        });
    });
  };

  fetchList = () => {
    const { api, dataKey, fetchListCallback } = this.props;
    const { tokenInfo, copyFlag } = this.state;
    api !== undefined &&
      request.get(toQs(sfs.list, { dataKey, ...tokenInfo })).then(data => {
        if (Array.isArray(data.response)) {
          if (fetchListCallback) {
            fetchListCallback(data.response.length);
          }
          this.setState({
            fileList: data.response.map(f => {
              const url = `${serverUrl}${sfs.download}?${JSON2QueryString({
                hash: f.itemHash,
                dataKey,
                ...tokenInfo,
                'el-xsrf': localStorage.getItem('csrfToken'),
                _t: new Date().getTime() / 1000,
              })}`;

              return {
                uid: f.itemName,
                name: f.itemName,
                link: url,
                status: 'done',
                ...f,
              };
            }),
          });
        }

        // 整个文件目录拷贝，所以若已存在附件，则不执行copy操作
        if (Array.isArray(data.response) && data.response.length === 0 && copyFlag) {
          const { copy } = this.props;
          if (!isNil(copy)) {
            this.autoCopy();
          }
        }
      });
  };

  // 自动拷贝功能，拷贝一个目录到另一个目录（功能未完成）
  autoCopy = () => {
    const {
      dataKey: dataKeyNew,
      copy,
      copyData: { from, to },
    } = this.props;
    request
      .post(sfs.copy, {
        body: {
          ...from,
          ...to,
          dataKey: copy,
          dataKeyNew,
          api: undefined,
        },
      })
      .then(res => {
        if (res.status === 200) {
          const { api, dataKey } = this.props;
          this.fetchChain(api, dataKey);
          this.setState({
            copyFlag: false,
          });
        }
      });
  };

  // 废弃，上传完之后删除即可
  onCancel = (file, cb) => {
    // eslint-disable-next-line
    console.log('onCancel -> ', file);
    // 看README的TODO。。。
    cb(true);
  };

  removing = (tokenInfo, dataKey, hash, cb) => {
    request
      .post(
        toQs(sfs.delete, {
          ...tokenInfo,
          dataKey,
          hash,
        })
      )
      .then(data => {
        if (data.code === 'OK') {
          createMessage({ type: 'success', description: '删除成功' });
          // 这里没用重新调用fetchList是因为，删除的时候，也会有上传操作：上传中，上传失败
          // 调用fetchList就刷掉了
          cb(true);
        } else {
          cb(false);
        }
      });

    // request(sfs.delete, {
    //   method: 'post',
    //   data: {
    //     ...tokenInfo,
    //     dataKey,
    //     hash,
    //   },
    // }).then(data => {
    //   if (data.response) {
    //     message.success('删除成功!');
    //     // 这里没用重新调用fetchList是因为，删除的时候，也会有上传操作：上传中，上传失败
    //     // 调用fetchList就刷掉了
    //     cb(true);
    //   } else {
    //     cb(false);
    //   }
    // });
  };

  onRemove = (file, cb) => {
    // eslint-disable-next-line
    const { status, name } = file;
    const { dataKey } = this.props;
    const { tokenInfo } = this.state;
    if (file.itemHash) {
      // 表明是文件服务列表里面已有的文件,有itemHash，要通过request请求来删除
      // 然后在删除成功的回调里面调用cb
      this.removing(tokenInfo, dataKey, file.itemHash, cb);
      // 如果cancel走同，那么没有link参数的：
    } else if (status === 'error') {
      // 1. 有上传失败的文件，因此不需要做API请求，直接修改状态即可
      cb(true);
    } else {
      // 2. 上传成功的文件，因为sfs.upload成功只有头部返回OK，所以onChange的file.reponse是空的，
      // 所以自己动手丰衣足食……虽然额外多了一次请求
      request.get(toQs(sfs.list, { dataKey, ...tokenInfo })).then(data => {
        if (data.response && data.response.length > 0) {
          const hash = data.response.find(d => d.itemName === name).itemHash;
          this.removing(tokenInfo, dataKey, hash, cb);
        } else {
          cb(false);
        }
      });
    }
  };

  beforeUpload = (file, fileList) => {
    // eslint-disable-next-line
    console.warn('handle beforeUpload');
    return true;
  };

  // eslint-disable-next-line consistent-return
  onChange = info => {
    const { file, fileList, event } = info;
    const { fetchListCallback } = this.props;
    if (fetchListCallback) {
      fetchListCallback(fileList.length);
    }
    // 先判断不能有为空的文件
    const emptyError = fileList.filter(
      // 接口返回的fileList内无size字段，只有itemSize字段
      v => v.size <= 0 || v.itemSize <= 0
    );
    if (emptyError.length) {
      createMessage({
        type: 'error',
        description: '上传的文件不能有空文件',
      });
      return false;
    }
    // 增加max参数，增加文件大小限制，放在beforeUpload不生效，不能阻止自动上传
    const { max } = this.props; // max单位为M
    const tt = fileList.filter(
      // 接口返回的fileList内无size字段，只有itemSize字段
      v => parseFloat(div(div(v.size || v.itemSize, 1024), 1024)) > parseFloat(max)
    );
    if (max && tt.length) {
      createMessage({
        type: 'error',
        description: max > 1 ? `文件大小不能超过${max}M` : '文件超过规定大小',
      });
      return false;
    }

    // console.warn(file, fileList, event);
    if (event === false || event === undefined) {
      // 上传成功之后，把相关信息赛到file里面，参考fetchList把相关信息拼进去
      // 因为是本地上传的，本地有源文件，因此不需要拼接link参数，也就不显示下载按钮了
      // if (file.status === 'done') {
      //   console.log(file.response);
      //   const newFile = {
      //     ...file,
      //     itemHash: response.itemHash
      //   }
      //   this.updateFileList(newFile)
      // } else
      this.updateFileList(file);
    } else {
      const { percent } = event;
      const newFile = {
        ...file,
        percent,
      };
      this.updateFileList(newFile);
    }
  };

  /**
   * uid作为唯一识别，作用很重要，
   * 此处根据判别原有fileList来确定是在操作刚选择的文件还是在操作已有的文件列表
   */
  updateFileList = file => {
    const { uid, status } = file;
    const { fileList } = this.state;
    const exist = fileList.some(f => f.uid === file.uid);
    if (exist) {
      const newList = fileList.map(f => {
        if (f.uid === uid) return file;
        return f;
      });
      this.setState({ fileList: newList });
      this.kickOnChange(status, newList);
    } else {
      this.setState({
        fileList: [file, ...fileList],
      });
      this.kickOnChange(status, [file, ...fileList]);
    }
  };

  /**
   * 当 status === 'uploading' 的时候，不触发 onChange，
   * 因为 uploading 时会持续更新进度条，属于高频操作，
   * 如果放在表单中，性能会受到考验的 XD
   */
  kickOnChange = (status, fileList) => {
    if (status === 'uploading') return;
    const { onChange } = this.props;
    if (onChange) onChange(fileList.filter(f => f.status !== 'removed' && f.status !== 'error'));
  };

  render() {
    const { disabled = false, dataKey, preview = false, multiple = true, ele = false } = this.props;
    const { fileList, repoInfo = {}, listType, tokenInfo = {} } = this.state;
    // eslint-disable-next-line
    // console.warn(fileList);
    const injectProps = {
      action: `${serverUrl}${sfs.upload}`,
      headers: {
        'el-xsrf': getCsrfToken(),
      },
      withCredentials: true,
      data: { ...tokenInfo, dataKey },
    };
    return (
      <FileManager
        fileList={fileList.filter(file => file.status !== 'removed')}
        trigger="click"
        placement="bottomLeft"
        multiple={multiple}
        accept={repoInfo.accept}
        listType={listType}
        disabled={disabled}
        preview={preview}
        // onCancel={this.onCancel}
        onChange={this.onChange}
        onRemove={this.onRemove}
        beforeUpload={this.beforeUpload}
        {...injectProps}
        ele={ele}
      />
    );
  }
}

export default FileManagerEnhance;
