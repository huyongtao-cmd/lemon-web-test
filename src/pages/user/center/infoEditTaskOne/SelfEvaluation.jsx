import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Button, Icon } from 'antd';
import RichText from '@/components/common/RichText';
import createMessage from '@/components/core/AlertMessage';
import styles from './selfEvaluation.less';

const DOMAIN = 'userCenterInfoDetail';

@connect(({ loading, userCenterInfoDetail }) => ({
  userCenterInfoDetail,
  loading,
}))
class SelfEvaluation extends PureComponent {
  evaluationChange = val => {
    const {
      userCenterInfoDetail: { selfEvaluationData = {} },
      dispatch,
    } = this.props;
    dispatch({
      type: 'userCenterInfoDetail/updateState',
      payload: {
        selfEvaluationData: {
          ...selfEvaluationData,
          selfEvaluation: val,
        },
      },
    });
  };

  addTag = () => {
    const {
      userCenterInfoDetail: { tagBox = [], tagNum = 1 },
      dispatch,
    } = this.props;
    if (tagBox.length === 10) {
      createMessage({ type: 'warn', description: '最多不能超过10个标签' });
      return;
    }
    const id = tagNum + 1;
    const tagInfo = {
      id,
      value: '',
    };
    tagBox.push(tagInfo);

    dispatch({
      type: 'userCenterInfoDetail/updateState',
      payload: {
        tagBox,
        tagNum: id,
      },
    });
  };

  tagChange = (id, name) => {
    const {
      userCenterInfoDetail: { tagBox = [] },
      dispatch,
    } = this.props;
    const newTagBox = tagBox.map(item => {
      if (item.id === id) {
        // eslint-disable-next-line no-param-reassign
        item.value = name;
      }
      return item;
    });
    dispatch({
      type: 'userCenterInfoDetail/updateState',
      payload: {
        tagBox: newTagBox,
      },
    });
  };

  inputDelete = inputId => {
    const {
      dispatch,
      userCenterInfoDetail: { tagBox = [] },
    } = this.props;
    function removeByValue(arr, val) {
      for (let i = 0; i < arr.length; i += 1) {
        if (arr[i].id === val) {
          arr.splice(i, 1);
          break;
        }
      }
    }
    removeByValue(tagBox, inputId);
    dispatch({
      type: 'userCenterInfoDetail/updateState',
      payload: {
        tagBox,
      },
    });
  };

  render() {
    const {
      userCenterInfoDetail: { selfEvaluationData = {}, tagBox = [] },
    } = this.props;
    const { selfEvaluation = '' } = selfEvaluationData;
    return (
      <div>
        <Row className={styles['my-evaluation']}>
          <Col span={2} className={styles['evaluation-label']}>
            自我评价:
          </Col>
          <Col span={12}>
            <Input.TextArea
              placeholder="请输入自我评价"
              value={selfEvaluation}
              onChange={e => this.evaluationChange(e.target.value)}
            />
          </Col>
        </Row>
        <Row className={styles['my-tag']}>
          <Col span={2} className={styles['evaluation-label']}>
            标签:
          </Col>

          <Col span={12}>
            <Button type="primary" className={styles['tag-add-btn']} onClick={this.addTag}>
              添加
            </Button>
            {tagBox.map(item => (
              <div className={styles['tag-input-wrap']} key={item.id}>
                <Input
                  value={item.value}
                  className={styles['tag-input']}
                  placeholder="输入标签"
                  onChange={e => {
                    this.tagChange(item.id, e.target.value);
                  }}
                />
                <Icon
                  type="close"
                  className={styles['tag-icon']}
                  onClick={() => this.inputDelete(item.id)}
                />
              </div>
            ))}
          </Col>
        </Row>
      </div>
    );
  }
}

export default SelfEvaluation;
