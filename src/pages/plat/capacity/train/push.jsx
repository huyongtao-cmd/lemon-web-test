import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table, Row, Col, Radio, DatePicker, Transfer } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { ascend, prop, sort, isEmpty } from 'ramda';

import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { TagOpt } from '@/utils/tempUtils';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import styles from './index.less';

const DOMAIN = 'platTrainPush';
const { Description } = DescriptionList;
const RadioGroup = Radio.Group;
@connect(({ loading, platTrainPush }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  platTrainPush,
}))
@mountToTab()
class CapaTrainPush extends PureComponent {
  state = {
    targetKeys: [],
    type: 'RES',
    requiredFlag: 'REQUIRED',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
      dispatch({
        type: `${DOMAIN}/getCapaSetList`,
      });
      dispatch({
        type: `${DOMAIN}/getResList`,
      });
      dispatch({
        type: `${DOMAIN}/getResTypeList`,
      });
      dispatch({
        type: `${DOMAIN}/queryCommonData`,
      });
    }
  }

  handleCancel = () => {
    closeThenGoto('/hr/capacity/train');
  };

  dateOnChange = (date, dateString) => {
    this.setState({
      endDate: dateString,
    });
  };

  handleSave = () => {
    const { dispatch } = this.props;
    const { endDate, requiredFlag, targetKeys, type } = this.state;
    const { id } = fromQs();
    if (!targetKeys || (targetKeys && targetKeys.length === 0)) {
      createMessage({ type: 'warn', description: '请选择推送资源' });
      return;
    }
    // if (!endDate) {
    //   createMessage({ type: 'warn', description: '请选择截止日期' });
    //   return;
    // }
    const params = {
      trainingProgId: parseInt(id, 10),
      requiredFlag,
      endDate,
      type,
    };
    if (type === 'RES') {
      params.resIds = targetKeys;
    }
    if (type === 'RES_TYPE') {
      params.resType = targetKeys;
    }
    if (type === 'BU') {
      params.buIds = targetKeys;
    }
    if (type === 'CAPASET') {
      params.capcaSetIds = targetKeys;
    }

    dispatch({
      type: `${DOMAIN}/push`,
      payload: params,
    });
  };

  handleChange = (targetKeys, direction, moveKeys) => {
    this.setState({ targetKeys });
  };

  render() {
    const { dispatch, platTrainPush = {} } = this.props;
    const {
      courseDetail = {},
      capaSetList = [],
      buList = [],
      resList = [],
      resTypeList = [],
    } = platTrainPush;
    const { progName } = courseDetail;
    const { targetKeys, type, requiredFlag } = this.state;
    let pushData = [];
    if (type === 'RES') {
      pushData = resList;
    }
    if (type === 'RES_TYPE') {
      pushData = resTypeList;
    }
    if (type === 'BU') {
      pushData = buList;
    }
    if (type === 'CAPASET') {
      pushData = capaSetList;
    }
    return (
      <PageHeaderWrapper title="培训项目推送" wrapperClassName={styles.pushWrap}>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={() => this.handleSave()}
          >
            确定
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <Row gutter={5} className={styles.topInfo}>
            <Col span={7}>
              培训项目:
              <span>{progName}</span>
            </Col>
            <Col span={8}>
              必修/选修:
              <span>
                <RadioGroup
                  value={requiredFlag}
                  onChange={e => {
                    this.setState({
                      requiredFlag: e.target.value,
                    });
                  }}
                >
                  <Radio value="REQUIRED">必修</Radio>
                  <Radio value="OPTIONAL">选修</Radio>
                </RadioGroup>
              </span>
            </Col>
            <Col span={8}>
              截止日期:
              <span>
                <DatePicker onChange={this.dateOnChange} />
              </span>
            </Col>
          </Row>
          <Divider dashed />
          <div>
            <FieldList legend="推送资源" noReactive />
            <div className={styles.radioWrap}>
              <RadioGroup
                value={type}
                onChange={e => {
                  this.setState({
                    type: e.target.value,
                    targetKeys: [],
                  });
                }}
              >
                <Radio value="RES" style={{ marginRight: '50px' }}>
                  资源
                </Radio>
                <Radio value="RES_TYPE" style={{ marginRight: '50px' }}>
                  资源类型
                </Radio>
                <Radio value="BU" style={{ marginRight: '50px' }}>
                  BaseBU
                </Radio>
                <Radio value="CAPASET" style={{ marginRight: '50px' }}>
                  复合能力
                </Radio>
              </RadioGroup>
            </div>
            <div>
              <Transfer
                className={styles.transferWrap}
                dataSource={pushData}
                targetKeys={targetKeys}
                showSearch
                filterOption={(inputValue, option) =>
                  option.title.indexOf(inputValue) > -1 ||
                  option.title.indexOf(inputValue.toUpperCase()) > -1 ||
                  option.title.indexOf(inputValue.toLowerCase()) > -1
                }
                onChange={this.handleChange}
                // onSelectChange={this.handleSelectChange}
                // onScroll={this.handleScroll}
                render={item => item.title}
              />
            </div>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CapaTrainPush;
