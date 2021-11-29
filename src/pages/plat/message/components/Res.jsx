import { connect } from 'dva';
import React from 'react';
import { Modal, Transfer, Table, Radio } from 'antd';
import { selectUsersWithBu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'messageInfo';

@connect(({ loading, messageInfo, dispatch }) => ({
  loading,
  messageInfo,
  dispatch,
}))
class Res extends React.Component {
  state = {
    targetKeys: [],
    scopeType: 0,
  };

  static getDerivedStateFromProps(props, state) {
    const { targetKeys, reset, toggleReset } = props;
    if (reset) {
      toggleReset();
      return { targetKeys };
    }
    return '';
  }

  // 保存按钮
  handleSubmit = () => {
    const {
      toggle,
      toggleReset,
      dispatch,
      form,
      messageInfo: { formData },
    } = this.props;
    const { targetKeys, scopeType } = this.state;
    // setTimeout(() => {
    //   form.setFieldsValue({
    //     noticeScope: targetKeys,
    //     noticeScopeFlag: scopeType,
    //   });
    // }, 0);

    // dispatch({
    //   type: `${DOMAIN}/updateForm`,
    //   payload: {
    //     noticeScope: targetKeys,
    //     noticeScopeFlag: scopeType,
    //   },
    // });
    if (targetKeys.length === 0) {
      createMessage({ type: 'error', description: '请选择通知人员' });
      return;
    }

    dispatch({
      type: `${DOMAIN}/save`,
      payload: {
        ...formData,
        noticeScope: targetKeys,
        noticeScopeFlag: scopeType,
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        btnCanUse: false,
      },
    });

    toggle();
    toggleReset();
  };

  handleCancel = () => {
    const { toggle, toggleReset } = this.props;
    toggle();
    toggleReset();
  };

  scopeChange = val => {
    const { scopeType } = this.state;
    if (scopeType !== val) {
      this.setState({
        scopeType: val,
        targetKeys: [],
      });
    }
  };

  render() {
    const {
      visible,
      messageInfo: { userList = [], busList = [], roleList = [] },
    } = this.props;
    const { targetKeys, scopeType } = this.state;

    return (
      <Modal
        title="通知人员"
        width={920}
        visible={visible}
        destroyOnClose
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <div
          style={{
            textAlign: 'center',
            margin: '10px 0',
          }}
        >
          <Radio.Group onChange={e => this.scopeChange(e.target.value)} value={scopeType}>
            <Radio
              value={0}
              key="0"
              style={{
                marginRight: '20px',
              }}
            >
              人员
            </Radio>
            <Radio
              value={1}
              key="1"
              style={{
                marginRight: '20px',
              }}
            >
              BU
            </Radio>
            <Radio
              value={2}
              key="2"
              style={{
                marginRight: '20px',
              }}
            >
              角色
            </Radio>
          </Radio.Group>
        </div>

        {scopeType === 0 && (
          <Transfer
            dataSource={userList}
            showSearch
            filterOption={(inputValue, option) => option.name.indexOf(inputValue) > -1}
            targetKeys={targetKeys}
            onChange={val => this.setState({ targetKeys: val })}
            render={item => `${item.code}-${item.name}`}
            listStyle={{ width: 410, height: 450 }}
          />
        )}
        {scopeType === 1 && (
          <Transfer
            dataSource={busList}
            showSearch
            filterOption={(inputValue, option) => option.name.indexOf(inputValue) > -1}
            targetKeys={targetKeys}
            onChange={val => this.setState({ targetKeys: val })}
            render={item => `${item.name}`}
            listStyle={{ width: 410, height: 450 }}
          />
        )}
        {scopeType === 2 && (
          <Transfer
            dataSource={roleList}
            showSearch
            filterOption={(inputValue, option) => option.name.indexOf(inputValue) > -1}
            targetKeys={targetKeys}
            onChange={val => this.setState({ targetKeys: val })}
            render={item => `${item.name}`}
            listStyle={{ width: 410, height: 450 }}
          />
        )}
      </Modal>
    );
  }
}

export default Res;
