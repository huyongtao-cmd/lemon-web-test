import { connect } from 'dva';
import React from 'react';
import { Modal, Transfer, Table, Radio } from 'antd';
import { selectUsersWithBu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'timingMessageInfo';

@connect(({ loading, timingMessageInfo, dispatch }) => ({
  loading,
  timingMessageInfo,
  dispatch,
}))
class ResChose extends React.Component {
  state = {};

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
      timingMessageInfo: {
        formData,
        userList = [],
        busList = [],
        roleList = [],
        targetKeys,
        scopeType,
      },
    } = this.props;

    // if (targetKeys.length === 0) {
    //   createMessage({ type: 'error', description: '请选择通知人员' });
    //   return;
    // }
    const noticeScopeList = [];
    if (scopeType === 0) {
      userList.forEach(item => {
        if (targetKeys.includes(item.code)) {
          noticeScopeList.push(item.name);
        }
      });
    }
    if (scopeType === 1) {
      busList.forEach(item => {
        if (targetKeys.includes(item.code)) {
          noticeScopeList.push(item.name);
        }
      });
    }
    if (scopeType === 2) {
      roleList.forEach(item => {
        if (targetKeys.includes(item.code)) {
          noticeScopeList.push(item.name);
        }
      });
    }

    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        ...formData,
        noticeScope: targetKeys,
        noticeScopeFlag: scopeType,
        noticeScopeList,
      },
    });
    dispatch({
      type: 'timingMessageInfo/updateState',
      payload: {
        targetKeys,
        scopeType,
      },
    });

    toggle();
    toggleReset();
  };

  handleCancel = () => {
    const {
      toggle,
      toggleReset,
      dispatch,
      timingMessageInfo: { formData },
    } = this.props;
    const { noticeScope, noticeScopeFlag } = formData;
    dispatch({
      type: 'timingMessageInfo/updateState',
      payload: {
        targetKeys: noticeScope || [],
        scopeType: noticeScopeFlag || 0,
      },
    });
    toggle();
    toggleReset();
  };

  scopeChange = val => {
    const {
      dispatch,
      timingMessageInfo: { scopeType = 0 },
    } = this.props;
    if (scopeType !== val) {
      dispatch({
        type: 'timingMessageInfo/updateState',
        payload: {
          targetKeys: [],
          scopeType: val,
        },
      });
    }
  };

  targetKeysChange = val => {
    const { dispatch } = this.props;
    dispatch({
      type: 'timingMessageInfo/updateState',
      payload: {
        targetKeys: val,
      },
    });
  };

  render() {
    const {
      visible,
      timingMessageInfo: {
        userList = [],
        busList = [],
        roleList = [],
        formData = {},
        targetKeys = [],
        scopeType = 0,
      },
    } = this.props;

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
            onChange={val => {
              this.targetKeysChange(val);
            }}
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
            onChange={val => {
              this.targetKeysChange(val);
            }}
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
            onChange={val => {
              this.targetKeysChange(val);
            }}
            render={item => `${item.name}`}
            listStyle={{ width: 410, height: 450 }}
          />
        )}
      </Modal>
    );
  }
}

export default ResChose;
