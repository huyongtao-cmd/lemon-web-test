// 框架类
import React from 'react';
import { Button, Modal } from 'antd';
import { isNil } from 'ramda';
// 产品化组件
import createMessage from '@/components/core/AlertMessage';
// css样式
import './ExportEmpInfo.less';
// 图标
import deleteIcon from '../../../../assets/img/delete_icon.png';
import { templateList } from '../../../../services/production/user';

/***
 * 员工信息导出弹窗
 */
class ExportModal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      template: {},
      templates: [],
      activeKey: '',
      isChoose: true, // 导出摸板选择和取消选择
    };
  }

  componentDidMount() {
    this.getTemplateList();
  }

  // 勾选或取消勾选所有
  setOrCancelAll = () => {
    const allFile = document.getElementsByName('field'); // 获取每个勾选框节点
    const allFiles = document.getElementsByName('fields'); // 获取勾选所有的节点
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < allFile.length; i++) {
      allFile[i].checked = allFiles[0].checked === true;
    }
  };

  // 获取选中的字段
  handleOk = async btnType => {
    const { handleOk, handleExport } = this.props;
    const { template } = this.state;
    const chooseField = document.getElementsByName('field'); // 获取所有的字段
    const value = [];
    for (let i = 0; i < chooseField.length; i += 1) {
      if (chooseField[i].checked) value.push(chooseField[i].value); // 获取选中的字段
    }
    if (!value.length && !Object.keys(template).length) {
      createMessage({
        type: 'error',
        description: '请选择要导出的属性',
      });
      return;
    }
    const newValue = value.map(item => JSON.parse(item));
    let titleArr = [];
    let valueArr = [];
    newValue.forEach(item => {
      titleArr.push(item.title);
      valueArr.push(item.dataIndex);
    });
    titleArr = titleArr.join(',');
    valueArr = valueArr.join(',');
    const newList = {
      titleArr: !Object.keys(template).length ? titleArr : [],
      valueArr: !Object.keys(template).length ? valueArr : [],
    };
    await handleExport(newList, btnType, template);
    handleOk();
  };

  // 选择要导出的模板
  chooseTemplate = (item, index) => {
    const { isChoose } = this.state;
    const { template, activeKey } = this.state;
    this.setState({
      template: isChoose ? item : {},
      activeKey: isChoose ? index : '',
      isChoose: !isChoose,
    });
  };

  // 获取模板
  getTemplateList = async () => {
    const { templates } = this.state;
    const res = await templateList();
    if (res.response.ok) {
      this.setState({
        templates: res.response.data,
      });
    }
  };

  // 删除模板
  deleteTemplate = async i => {
    const { templates } = this.state;
    const newTemplates = await templates.splice(i, 1);
    const arr = [];
    for (let j = 0; j < templates.length; j += 1) {
      if (templates[j] !== newTemplates) {
        arr.push(templates[j]);
      }
    }
    this.setState({
      templates: arr,
    });
  };

  onOk = () => {
    const { handleOk } = this.props;
    this.setState({
      template: {},
    });
    handleOk();
  };

  onCancel = async () => {
    const { handleCancel } = this.props;
    this.setState({
      template: {},
    });
    await this.getTemplateList();
    handleCancel();
  };

  render() {
    const { visible, handleOk, handleCancel, columns, destroyOnClose } = this.props;
    const { template, templates, activeKey, isChoose } = this.state;
    return (
      <Modal
        title="导出员工信息"
        visible={visible}
        onCancel={this.onCancel}
        onOk={this.onOk}
        width={1000}
        height={1000}
        footer={[
          <Button onClick={handleCancel}>取消</Button>,
          <Button type="primary" onClick={() => this.handleOk('saveAndExport')}>
            保存模板并导出
          </Button>,
          <Button type="primary" onClick={() => this.handleOk('export')}>
            导出
          </Button>,
        ]}
        destroyOnClose
        className="modal-page"
      >
        <div className="basic">
          <div className="basic-title">基本信息</div>
          <input id="options" type="checkbox" name="fields" onClick={() => this.setOrCancelAll()} />
          &nbsp;勾选所有
        </div>
        <div className="allColumns">
          {columns.map(column => (
            <span className="column">
              <input id="option" value={JSON.stringify(column)} type="checkbox" name="field" />
              &nbsp;
              {/* eslint-disable-next-line jsx-a11y/label-has-for */}
              <label htmlFor="cbox">{column.title}</label>
            </span>
          ))}
        </div>
        <div className="template-title">导出模板</div>
        <div className="templates" id="templates">
          {templates.map((item, index) => (
            <div className="inner">
              <img alt="删除" src={deleteIcon} onClick={() => this.deleteTemplate(index)} />
              <li
                className={activeKey !== index ? 'template' : 'active-template'}
                onClick={() => this.chooseTemplate(item, index, isChoose)}
              >
                {item.tempName}
              </li>
            </div>
          ))}
        </div>
      </Modal>
    );
  }
}

export default ExportModal;
