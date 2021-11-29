import React, { Component } from 'react';
import { Popconfirm } from 'antd';
import { equals, type } from 'ramda';
import classNames from 'classnames';
import { createConfirm } from '@/components/core/Confirm';
import { fittingString } from '@/utils/stringUtils';
import styles from './index.less';

class ListItem extends Component {
  constructor(props) {
    super(props);
    const { dataSource } = this.props;
    this.state = {
      dataSource,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ dataSource: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { dataSource } = this.props;
    if (!equals(prevState.dataSource, dataSource)) {
      return dataSource;
    }
    return null;
  }

  deleteChange = item => {
    createConfirm({
      content: '确定要删除该培训课程吗？',
      onOk: () => {
        const { onDel } = this.props;
        type(onDel) === 'Function' && onDel(item);
      },
    });
  };

  selectedChange = item => {
    const { itemSelected } = this.props;
    type(itemSelected) === 'Function' && itemSelected(item);
  };

  render() {
    const { dataSource } = this.props;

    return (
      <div className={styles.listBox}>
        {dataSource.map(item => (
          <div
            key={item.id}
            className={classNames(styles.listItem, item.checked ? styles.listItemChecked : null)}
            onClick={e => {
              this.selectedChange(item);
            }}
          >
            <div className={styles.trainContent}>{item.capaTypeName || ''}</div>
          </div>
        ))}
      </div>
    );
  }
}

export default ListItem;
