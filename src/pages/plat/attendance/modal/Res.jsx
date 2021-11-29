import { connect } from 'dva';
import React from 'react';
import { Modal, Transfer, Table } from 'antd';
import { selectUsersWithBu } from '@/services/gen/list';

const DOMAIN = 'platAttendanceRuleEdit';

@connect(({ loading, platAttendanceRuleEdit, dispatch }) => ({
  loading,
  platAttendanceRuleEdit,
  dispatch,
}))
class Res extends React.Component {
  state = {
    targetKeys: [],
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
    const { toggle, toggleReset, dispatch, form } = this.props;
    const { targetKeys } = this.state;
    form.setFieldsValue({
      attendanceResIds: targetKeys,
    });
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        attendanceResIds: targetKeys,
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

  render() {
    const {
      visible,
      platAttendanceRuleEdit: { userList },
    } = this.props;
    const { targetKeys } = this.state;

    return (
      <Modal
        title="打卡人员"
        width={920}
        visible={visible}
        destroyOnClose
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <Transfer
          dataSource={userList}
          showSearch
          filterOption={(inputValue, option) =>
            option.title.indexOf(inputValue) > -1 ||
            option.receiverBuName.indexOf(inputValue) > -1 ||
            option.baseCityName.indexOf(inputValue) > -1
          }
          targetKeys={targetKeys}
          onChange={val => this.setState({ targetKeys: val })}
          render={item => `${item.receiverBuName}-${item.code}-${item.title}-${item.baseCityName}`}
          listStyle={{ width: 410, height: 450 }}
        />
      </Modal>
    );
  }
}

export default Res;
