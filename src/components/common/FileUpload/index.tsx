import React, { PureComponent } from 'react';

import { Row, Upload, Tooltip, Popover, List, Button, Icon, Progress } from 'antd';
import styles from './index.less';
import createMessage from '@/components/core/AlertMessage';
import { div } from '@/utils/mathUtils';
import apis from '@/api';
import { request, serverUrl,clientUrl } from '@/utils/networkUtils';
import {toUrl} from "@/utils/stringUtils";
import {equals} from 'ramda'
const { sfs } = apis;
const { Item } = List;
interface Props{
  value?: number[], // 值
  onChange?(value:any):void, // change 事件
  preview?: boolean, // 预览（详情模式）
  ele?:any,
  fileList?:any[], // 已有fileList
  placement?:"top"| "left"| "right"| "bottom"| "topLeft"| "topRight"| "bottomLeft"| "bottomRight"| "leftTop"| "leftBottom"| "rightTop"| "rightBottom",
  trigger?: "click" | "contextMenu" | "hover" | "focus" | undefined,// popover trigger方式
  listType?: "text"| "picture"| "picture-card",
  accept?:any,
  maxFileSize?:any, // 单个文件的最大
  disabled?: boolean, // 是否可用
  multiple?: boolean, //是否可以多选上传
  onFileChange?(info:any):void, //上传文件发生改变
  handleRemove?(info:any):void, // 删除附件
  beforeUpload?:(file:any, fileList:any[]) => boolean | Promise<File>,//上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传。支持返回一个 Promise 对象，Promise 对象 reject 时则停止上传，resolve 时开始上传（ resolve 传入 File 或 Blob 对象则上传 resolve 传入对象）。注意：IE9 不支持该方法
}

class Index extends PureComponent<Props, any>{
 state={
   visible:false, // 附件列表是否可见
   // 后台获取的列表没有status和name字段
   fileList:this.props.fileList?this.props.fileList.map(item => ({ ...item, status: 'done', name: item.fileName })):[]
 };
 componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<any>, snapshot?: any){
  if(!equals(prevProps.fileList,this.props.fileList)){
    // 后台获取的列表没有status和name字段
     const result = this.props.fileList?this.props.fileList.map(item => ({ ...item, status: 'done', name: item.fileName })):[]
     this.setState({
       fileList:result
     })
   }
 }

 /**
   * 开始上传文件的时候，要把文件列表打开
   */
  beforeUpload = (file:any, fileList:any[]) => {
    const { beforeUpload } = this.props;
    // 增加max参数，增加文件大小限制
    const { maxFileSize } = this.props; // maxFileSize单位为M

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

    const tt = fileList.filter(
      // 接口返回的fileList内无size字段，只有itemSize字段
      (v:any) => parseFloat(div(div(v.size || v.itemSize, 1024), 1024)) > parseFloat(maxFileSize)
    );

    if (maxFileSize && tt.length) {
      createMessage({
        type: 'error',
        description: maxFileSize > 1 ? `文件大小不能超过${maxFileSize}M` : '文件超过规定大小',
      });
      return false;
    }else{
      if (beforeUpload) {
        const result = beforeUpload(file, fileList);
        if (result) this.handleVisibleChange(true);
      } else {
        this.handleVisibleChange(true);
      }
      return true
    }
  };
  // 处理附件列表可见
  handleVisibleChange=(visible:any) => this.setState({ visible })
  // 正在上传的文件
  renderUploadFile = (file: any, index:number) => {
    const { status, percent = 30, name } = file;
    const error = status === 'error';
    const uploading = status === 'uploading';
    const fileStyle = error ? { color: '#f50' } : {};
    const progressStatusUploading = uploading ? 'active' : 'success';
    const progressStatus = error ? 'exception' : progressStatusUploading;
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
        <Progress percent={percent} status={progressStatus} showInfo={progressShowInfo} format={(percent)=>`上传中...`} className={styles.progress}/>
      </Item>
    );
  };
  // 渲染status is 'done '的已上传文件列表
  renderItem = (file: any, index: number) => {
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
        {name&&name.length > 15 ? (
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
  // 渲染文件列表(包含已上传和正在上传)
  renderMenu = () => {
    const { fileList} = this.state;
    return (
      <List className={styles.list} renderItem>
        {fileList&&fileList.length > 0 ? (
          fileList
            // 核心组件再过滤一层removed，本组件不展示已删除文件，filter防止外部传入数据忘记过滤
            .filter(file => file.status !== 'removed')
            // 区分上传完成（'done'）和上传中('uploading' | 'error')文件渲染
            .map((file, index) => {
              const { status } = file;
              const uploaded = status.indexOf('done') > -1;
              return uploaded ? this.renderItem(file, index) : this.renderUploadFile(file, index);
            })
        ) : (
          <Item>暂无附件</Item>
        )}
      </List>
    );
  };
   /**
   * id||uid
   * 上传成功之后添加id 后端返回的已上传列表没有uid，以id为唯一标识
   * 文件没有id，以uid为唯一标识
   * 没有id:(上传中status:uploading,上传失败status：error，被beforeUpload阻止的status：undefined)
   * 此处根据判别原有fileList来确定是在操作刚选择的文件还是在操作已有的文件列表
   */
  updateFileList = (file:any) => {
    const { uid, status,id } = file;
    const { fileList } = this.state;
    // beforeUpload 返回false阻止上传，file的status为undefined，不更新fileList
    if (!status) return;
    // fileList 是否存在file
    const exist = fileList.some((f:any) =>{
      if(f.id){
        return f.id === file.id
      }else if(f.uid){
        return f.uid === file.uid
      }else{
        return false
      }
    } );
    if (exist) {
      // 存在更新fileList的file对应项
      const newList = fileList.map((f:any) => {
        if(f.id&&f.id===id) return file;
        else if (f.uid&&f.uid === uid) return file;
        return f;
      });
      this.kickOnChange(newList);
    } else {
      // 不存在 将file添加到fileList
      this.kickOnChange([file, ...fileList]);
    }
  };

  // 执行props中的onFileChange,将fileList 回传给父组件
  kickOnChange = (fileList:any[]) => {
    const { onFileChange,onChange } = this.props;
    const result = fileList.filter((f:any) => f.status !== 'removed'&& f.status !== 'error') // 暂时不筛选上传失败的&& f.status !== 'error'
    // 更新fileList
    this.setState({
      fileList: result
    })
    onFileChange&&onFileChange(result);
    // 上传中的没有id因此需要过滤一下
    const attachmentIds = result.filter(item=>(item.id)).map(item=> item.id)
    onChange && onChange(attachmentIds);
  };
  // 自定义上传
  customUpload=(options: any)=>{
    const {file} = options
    const params = new FormData();
    params.append('file',file)
    request(sfs.fileUpload,{method: 'POST',body:params}).then((res:any)=>{
      // fetch没有progress，暂时先实现假进度
      options.onProgress({percent:95},file)
      if(res.status===200){
        // 获取文件的名称和地址
        const {serverPath,id,fileType,fileName} = res.response.data
        options.onSuccess({serverPath,id,fileType,fileName},file);
      }else{
        createMessage({ type: 'warn', description: '文件上传失败，请重试！' });
        options.onError(res.response)
      }

    }).catch((err:any)=>{
       // fetch没有progress，暂时先实现假进度
      options.onProgress({percent:95},file)
      options.onError(err)
    })

  };

  //上传中、完成、失败都会调用这个函数。
  onChange = ( info:any) => {
    const {file, event} = info
    // 上传成功拿到response
    if(file.response){
      const newFile = {
        ...file,
        ...file.response,
      };
      this.updateFileList(newFile);
    }else{
      if (event === false || event === undefined) {
        this.updateFileList(file);
      }else {
        //上传中取进度
        const { percent } = event;
        const newFile = {
          ...file,
          percent,
        };
        this.updateFileList(newFile);
      }
    }


  };
  // 下载
  onDownload = (file:any) => {
    const { name,id } = file;
    if(id){
      this.fileDownloading(id).then((res:any) => {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.download = name;
        a.href =  serverUrl+toUrl(sfs.fileDownload,{key:id});
        // a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

      })
    }else {
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
  // 下载附件
  fileDownloading=(id:any)=>{
    return new Promise((resolve,reject)=>{
      request.get(toUrl(sfs.fileDownload,{key:id})).then((res:any)=>{
        if(res.status === 200){
          resolve(res)
        }else{
          createMessage({ type: 'warn', description: '下载失败' });
          reject(res)
        }
      }).catch((err:any)=>{
        reject(err)
      })
    })

  };
  // 删除附件
   onRemove=(file:any) => {
     const {fileList} = this.state;
     this.onChange({file:{...file,status:'removed'},fileList,event:false})
     return true
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
      ele = false,

    } = this.props;

    const { visible, fileList } = this.state;
    const props = {
      accept,
      listType,
      multiple,
      beforeUpload: this.beforeUpload,
      fileList,
      disabled: preview ? true : disabled,// 详情展示模式下不可上传
      showUploadList: false,
      onChange:this.onChange,
      customRequest:this.customUpload,// 覆盖默认上传的自定义上传
      onRemove:this.onRemove
    };
    return (
      <Row type="flex" justify="start" align="middle" style={{ flexWrap: 'nowrap' }}>
        {(!preview)&& (
          <Upload {...props}>
            {ele !== false ? (
              ele
            ) : (
              <Button size="large" type="default" disabled={disabled} icon="upload" style={{ boxShadow: 'none' }}>
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

export default Index;
