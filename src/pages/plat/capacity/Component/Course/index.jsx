import { connect } from 'dva';
import React from 'react';
import { Modal, Transfer, Table, Radio } from 'antd';
import { selectUsersWithBu } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';

const DOMAIN = 'platTrainEdit';

@connect(({ loading, platTrainEdit, dispatch }) => ({
  loading,
  platTrainEdit,
  dispatch,
}))
class Res extends React.Component {
  state = {
    targetKeys: [],
    courseList: [],
  };

  static getDerivedStateFromProps(props, state) {
    const { courseList } = props;
    return { courseList };
  }

  choseCourse = () => {
    const {
      dispatch,
      platTrainEdit: { courseList = [], courseListData = [] },
      onCancel,
    } = this.props;
    const { targetKeys } = this.state;
    const choseArray = courseListData;
    if (!targetKeys || (targetKeys && targetKeys.length === 0)) {
      createMessage({ type: 'warn', description: '请选择课程' });
      return;
    }
    for (let i = 0; i < courseList.length; i += 1) {
      const { id } = courseList[i];
      if (targetKeys.includes(id)) {
        choseArray.push(courseList[i]);
        courseList[i].trnRequirement = 'REQUIRED';
      }
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        courseListData: choseArray,
      },
    });
    this.setState({
      targetKeys: [],
    });

    onCancel();
  };

  render() {
    const { visible, onOk, onCancel } = this.props;
    const { targetKeys, courseList } = this.state;
    return (
      <Modal
        title="课程选择"
        width={920}
        visible={visible}
        destroyOnClose
        onOk={() => {
          this.choseCourse();
        }}
        onCancel={onCancel}
      >
        <Transfer
          titles={['可选课程', '已选课程']}
          dataSource={courseList || []}
          showSearch
          filterOption={(inputValue, option) => option.courseName.indexOf(inputValue) > -1}
          targetKeys={targetKeys}
          onChange={val => this.setState({ targetKeys: val })}
          render={item => `${item.courseName}`}
          listStyle={{ width: 410, height: 450 }}
        />
      </Modal>
    );
  }
}

export default Res;
