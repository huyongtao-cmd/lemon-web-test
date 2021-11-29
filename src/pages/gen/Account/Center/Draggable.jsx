import React, { Component } from 'react';
import Link from 'umi/link';
import VDraggable from '@/components/common/VDraggable';
import styles from './Draggable.less';

class Draggable extends Component {
  state = {};

  static getDerivedStateFromProps(nextProps) {
    const { data } = nextProps;
    data.forEach((v, i) => {
      data[i].id += '';
    });
    return {
      value: data,
    };
  }

  render() {
    const { change, modal, found } = this.props;
    const { value } = this.state;

    const changeShortCut = data => {
      this.setState({
        value: data,
      });
      // 整理传参数据
      const parm = [];
      data.forEach(v => {
        const obj = {
          id: v.id,
          sortNo: v.sortNo,
        };
        parm.push(obj);
      });
      change(JSON.stringify(parm));
    };

    return (
      <VDraggable
        value={value}
        sortKey="sortNo"
        codeKey="id"
        modal={modal}
        found={found}
        onChange={data => changeShortCut(data)}
        render={item => (
          <Link to={item.shortcutUrl}>
            <div className={styles.item}>
              <div>
                <span>{item.shortcutName.substring(0, 4)}</span>
              </div>
              <p>{item.shortcutName}</p>
            </div>
          </Link>
        )}
      />
    );
  }
}

export default Draggable;
