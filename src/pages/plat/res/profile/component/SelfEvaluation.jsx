import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Input, Button, Icon } from 'antd';
import RichText from '@/components/common/RichText';
import createMessage from '@/components/core/AlertMessage';
import styles from './selfEvaluation.less';
import { FileManagerEnhance } from '@/pages/gen/field';
import { queryfileToOutDate } from '@/services/plat/res/externalResume';

const DOMAIN = 'platResDetail';

@connect(({ loading, platResDetail }) => ({
  platResDetail,
  loading,
}))
class SelfEvaluation extends PureComponent {
  evaluationChange = val => {
    const {
      platResDetail: { selfEvaluationData = {} },
      dispatch,
    } = this.props;
    dispatch({
      type: 'platResDetail/updateState',
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
      platResDetail: { tagBox = [], tagNum = 1 },
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
      type: 'platResDetail/updateState',
      payload: {
        tagBox,
        tagNum: id,
      },
    });
  };

  tagChange = (id, name) => {
    const {
      platResDetail: { tagBox = [] },
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
      type: 'platResDetail/updateState',
      payload: {
        tagBox: newTagBox,
      },
    });
  };

  inputDelete = inputId => {
    const {
      dispatch,
      platResDetail: { tagBox = [] },
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
      type: 'platResDetail/updateState',
      payload: {
        tagBox,
      },
    });
  };

  render() {
    const {
      platResDetail: { formData, selfEvaluationData = {}, tagBox = [] },
    } = this.props;
    const { selfEvaluation = '' } = selfEvaluationData;
    // console.log('formDataformData', formData);
    return (
      <div>
        <Row className={styles['my-evaluation']}>
          <Col span={3} className={styles['evaluation-label']}>
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
          <Col span={3} className={styles['evaluation-label']}>
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
        <Row className={styles['my-video']}>
          <Col span={3} className={styles['evaluation-label']}>
            自我介绍视频:
          </Col>
          <Col span={12}>
            <FileManagerEnhance
              api="/api/person/v1/res/selfVideo/sfs/token"
              dataKey={formData.id}
              listType="text"
              disabled={false}
            />
          </Col>
          <Col span={8} style={{ color: 'red', marginLeft: '10px' }}>
            {' '}
            视频要求： 大小&lt;20M, 格式MP4（H.264）{' '}
          </Col>
        </Row>
        <Row className={styles['my-resume']}>
          <Col span={3} className={styles['evaluation-label']}>
            个人简历附件:
          </Col>
          <Col span={12}>
            <FileManagerEnhance
              api="/api/person/v1/res/personResume/sfs/token"
              dataKey={formData.id}
              listType="text"
              disabled={false}
            />
          </Col>
        </Row>
        <Row className={styles['my-resume']}>
          <Col span={3} className={styles['evaluation-label']}>
            对外简历附件:
          </Col>
          <Col span={12}>
            <FileManagerEnhance
              api="/api/person/v1/res/pathToOut/sfs/token"
              dataKey={formData.id}
              listType="text"
              disabled={false}
              onChange={e => {
                queryfileToOutDate(formData.id);
              }}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default SelfEvaluation;
