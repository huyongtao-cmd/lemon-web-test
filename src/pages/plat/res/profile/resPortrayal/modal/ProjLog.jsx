import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Collapse } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { equals, type } from 'ramda';
import DescriptionList from '@/components/layout/DescriptionList';
import moment from 'moment';
import styles from '../index.less';

const { Description } = DescriptionList;

const { Panel } = Collapse;

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class ProjLogModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      visible,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
    }
    return null;
  }

  onChange = (v, index) => {
    const { visible } = this.state;
    this.setState({ visible }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(visible, index);
    });
  };

  render() {
    const {
      resPortrayal: { twResProjLogView },
    } = this.props;
    const { visible } = this.state;

    return (
      <Modal
        title="平台外项目"
        visible={visible}
        onCancel={() => this.onChange()}
        footer={[
          <Button
            className="tw-btn-primary"
            style={{ backgroundColor: '#284488' }}
            key="makeSure"
            onClick={() => this.onChange()}
          >
            确定
          </Button>,
        ]}
        destroyOnClose
        width="60%"
      >
        <Collapse defaultActiveKey={['1']} onChange={() => {}} bordered={false}>
          {twResProjLogView.map((item, index) => {
            const {
              projName,
              industry,
              product,
              projRole,
              company,
              projIntro,
              dutyAchv,
              dateFrom,
              dateTo,
            } = item;
            const monthsDiff = moment(dateTo).diff(moment(dateFrom), 'months');
            const years = Math.floor(monthsDiff / 12); // 计算年限
            const months = monthsDiff % 12; // 计算月限
            return (
              <Panel
                header={
                  <>
                    <span style={{ fontSize: '12px' }}>
                      {`${projName} (相关行业/产品:${industry}/${product}  项目角色:${projRole}  所在公司:${company}) `}
                    </span>
                    {/* <span style={{ display: 'inline-block', width: '80px' }} />
                    <span style={{ fontSize: '12px', position: 'absolute', right: '20px' }}>
                      {`${dateFrom} ~ ${dateTo} (${years ? years + '年' : ''}${
                        months ? months + '个月' : ''
                      })`}
                    </span> */}
                  </>
                }
                // eslint-disable-next-line react/no-array-index-key
                key={index + 1}
                style={{ border: 0 }}
              >
                <DescriptionList className={styles.projLog} size="large" col={1}>
                  <Description term="项目简介">
                    <pre>{projIntro}</pre>
                  </Description>
                  <Description term="职责&业绩">
                    <pre>{dutyAchv}</pre>
                  </Description>
                </DescriptionList>
              </Panel>
            );
          })}
        </Collapse>
      </Modal>
    );
  }
}

export default ProjLogModal;
