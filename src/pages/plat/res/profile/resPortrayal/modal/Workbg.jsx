import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Collapse, Icon, Tooltip, Divider } from 'antd';
import { mountToTab } from '@/layouts/routerControl';
import { equals, type } from 'ramda';
import DescriptionList from '@/components/layout/DescriptionList';
import moment from 'moment';

const { Description } = DescriptionList;

const { Panel } = Collapse;

@connect(({ loading, resPortrayal, dispatch }) => ({
  resPortrayal,
  dispatch,
  loading,
}))
@mountToTab()
class WorkbgModal extends PureComponent {
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
      resPortrayal: { resWorkbgList },
    } = this.props;
    const { visible } = this.state;

    return (
      <Modal
        title="工作经历"
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
        <Collapse
          defaultActiveKey={['1']}
          onChange={() => {}}
          bordered={false}
          expandIcon={({ isActive }) => <Icon type="caret-right" rotate={isActive ? 90 : 0} />}
        >
          {resWorkbgList.map((item, index) => (
            <Panel
              header={
                <div style={{ color: '#1890ff' }}>
                  <span>{item.indName}</span>
                  <span style={{ display: 'inline-block', width: '10px' }} />
                  <span>
                    {`${item.workYear ? item.workYear + '年' : ''}${
                      item.workMoth ? item.workMoth + '个月' : ''
                    }`}
                  </span>
                </div>
              }
              // eslint-disable-next-line react/no-array-index-key
              key={index + 1}
              style={{ border: 0 }}
            >
              {item.workbg.map((v, i) => {
                const monthsDiff = moment(v.dateTo).diff(moment(v.dateFrom), 'months');
                const years = Math.floor(monthsDiff / 12); // 计算年限
                const months = monthsDiff % 12; // 计算月限
                return (
                  <div key={v.companyName}>
                    <b>
                      {/* {`${v.companyName} (职位:${v.jobtitle} 部门:${v.deptName})`} */}
                      <span>{`${v.companyName} (职位:${v.jobtitle} `}</span>
                      &nbsp;
                      <span>{` 部门:${v.deptName})`}</span>
                      <span style={{ fontSize: '12px', position: 'absolute', right: '20px' }}>
                        {`${moment(v.dateFrom).format('YYYY-MM-DD')} ~ ${moment(v.dateTo).format(
                          'YYYY-MM-DD'
                        )}`}
                        {/* (${years ? years + '年' : ''}${months ? months + '个月' : ''}) */}
                      </span>
                    </b>
                    <br />
                    <span>
                      {v.dutyDesc && v.dutyDesc.length > 15 ? (
                        <Tooltip placement="left" title={v.dutyDesc}>
                          <pre>{`职责描述:${v.dutyDesc.substr(0, 15)}...`}</pre>
                        </Tooltip>
                      ) : (
                        <pre>
                          职责描述:
                          {v.dutyDesc}
                        </pre>
                      )}
                    </span>
                    <br />
                    {i < item.workbg.length - 1 ? <Divider dashed /> : ''}
                  </div>
                );
              })}
            </Panel>
          ))}
        </Collapse>
      </Modal>
    );
  }
}

export default WorkbgModal;
