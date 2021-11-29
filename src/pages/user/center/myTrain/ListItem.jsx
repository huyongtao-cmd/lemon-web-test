import React, { Component } from 'react';
import { Popconfirm } from 'antd';
import { equals, type } from 'ramda';
import classNames from 'classnames';
import { createConfirm } from '@/components/core/Confirm';
import { fittingString } from '@/utils/stringUtils';
import styles from './index.less';

class MyTrain extends Component {
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
    const { dataSource, delFlag } = this.props;

    return (
      <div className={styles.listBox}>
        {dataSource.map(item => (
          <div
            key={item.id}
            className={classNames(styles.listItem, item.checked ? styles.listItemChecked : null)}
            onClick={e => {
              this.selectedChange(item);
              e.stopPropagation();
            }}
          >
            <div
              className={styles.MustOrNot}
              style={{ color: item.requiredFlag === 'REQUIRED' ? 'orange' : 'blue' }}
            >
              {item.requiredFlagName || ''}
            </div>
            <div className={styles.trainContent}>
              <div className={styles.title}>
                <span title={item.progName}>{fittingString(item.progName, 26)}</span>
                {delFlag && item.requiredFlag !== 'REQUIRED' ? (
                  <span
                    className={styles.del}
                    onClick={e => {
                      this.deleteChange(item);
                      e.stopPropagation();
                    }}
                  >
                    删除
                  </span>
                ) : null}
              </div>
              <div className={styles.context}>
                <span style={{ width: '27%' }}>{item.entryTypeName || ''}</span>
                <span style={{ width: '40%' }}>
                  {item.endDate || ''}
                  {item.endDate ? '截止' : ''}
                </span>
                <span style={{ width: '33%' }}>{`已完成${item.trnCurProg || 0}%`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default MyTrain;
