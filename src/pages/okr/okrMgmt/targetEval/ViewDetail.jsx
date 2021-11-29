/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Progress, Card, Icon, Divider, Row, Col, Tooltip } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty } from 'ramda';
import { mul, div, add } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import GradeTypeView from '../targetMgmt/component/GradeTypeView';

import targetSvg from './img/target.svg';
import keySvg from './img/key.svg';

import styles from './style.less';

const { Field } = FieldList;

const DOMAIN = 'targetEval';

@connect(({ loading, targetEval, dispatch }) => ({
  targetEval,
  dispatch,
  loading,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class ViewDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      dispatch({
        type: `${DOMAIN}/targetResultFlowDetail`,
        payload: {
          id,
        },
      });
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '保存成功' });
            const urls = getUrl();
            const from = stringify({ from: urls });
            router.push(`/hr/prefMgmt/prefCheck/temp/edit?${from}`);
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      targetEval: { formData, twOkrKeyresultView },
    } = this.props;
    const { visible } = this.state;

    return (
      <PageHeaderWrapper>
        <GradeTypeView
          onChange={v => {
            this.toggleVisible();
          }}
          visible={visible}
        />
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="目标结果打分" />}
          bordered={false}
        >
          <Card
            title={
              <span style={{ color: '#000' }}>
                <img width="20px" style={{ marginBottom: '9px' }} src={targetSvg} alt="目标" />
                &nbsp; {formData.objectiveName}
              </span>
            }
            headStyle={{ border: 'none', height: 'auto' }}
            bodyStyle={{ paddingTop: 6, paddingLeft: '55px' }}
            bordered={false}
            className={styles.supObjective}
          >
            <div>
              <Icon type="home" />
              &nbsp; 父目标：
              {formData.supObjectveName || '无'}
              &nbsp; &nbsp;
              {formData.supObjectveName && (
                <span className="supobjectiveCurProg">
                  {formData.supobjectiveCurProg
                    ? Number(formData.supobjectiveCurProg).toFixed(2)
                    : '00.00'}
                  %
                </span>
              )}
            </div>
            <div>
              <span>
                <Icon type="user" />
                {formData.objectiveResName || ''}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                目标类型：
                {formData.objectiveTypeName || ''}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                截止日期：
                {formData.endDate || ''}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                更新日期：
                {formData.objectiveUpdatedate || ''}
              </span>
            </div>
            <div>
              <span>整体进度：</span>
              <span style={{ display: 'inline-block', width: '400px' }}>
                <Progress
                  strokeColor="#22d7bb"
                  percent={Number(formData.objectiveCurProg || 0) || 0}
                  status="active"
                  format={percent => percent.toFixed(2) + '%'}
                />
              </span>
            </div>
          </Card>
          <Card
            title={
              <span>
                <img
                  width="20px"
                  style={{ marginBottom: '9px', transform: 'rotateY(180deg)' }}
                  src={keySvg}
                  alt="关键结果"
                />
                &nbsp; 关键结果
              </span>
            }
            headStyle={{ border: 'none' }}
            bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '70px' }}
            bordered={false}
          >
            <span style={{ display: 'inline-block' }}>得分</span>
            &nbsp;
            <span style={{ fontSize: '26px', color: '#3B5493', fontFamily: 'Sans-serif' }}>
              {(formData.finalScore && Number(formData.finalScore).toFixed(2)) || '100.00'}
            </span>
          </Card>
          {twOkrKeyresultView.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={index}>
              <Divider dashed />
              <Card
                bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '120px' }}
                bordered={false}
                className={styles.keyResult}
              >
                <span style={{ position: 'absolute', left: '40px' }}>
                  <Progress
                    width={60}
                    strokeColor="#22d7bb"
                    type="circle"
                    percent={
                      item.keyresultType === 'tag'
                        ? Number(item.curProg || 0)
                        : Number(
                            item.objValue
                              ? mul(div(Number(item.curProg), Number(item.objValue)), 100).toFixed(
                                  1
                                )
                              : '0.00'
                          )
                    }
                    // format={percent => percent.toFixed(2) + '%'}
                  />
                </span>
                <div>
                  {item.keyresultName || ''}
                  &nbsp; &nbsp;
                  {`[权重${item.keyresultWeight || ''}%]`}
                </div>
                <div style={{ color: '#999' }}>
                  <span>
                    起始：
                    {item.iniValue || ''}
                    {item.keyresultType === 'PERCENT' ? '%' : ''}
                  </span>
                  &nbsp; &nbsp; &nbsp; &nbsp;
                  <span>
                    目标：
                    {item.objValue || ''}
                    {item.keyresultType === 'PERCENT' ? '%' : ''}
                  </span>
                </div>
                <div>
                  <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                    <Field
                      label="结果打分"
                      fieldCol={1}
                      labelCol={{ span: 4, xxl: 3 }}
                      wrapperCol={{ span: 19, xxl: 20 }}
                      presentational
                    >
                      <Row gutter={22}>
                        <Col span={4}>
                          <span>
                            {item.twOkrKeyresultScoreView &&
                            !isEmpty(
                              item.twOkrKeyresultScoreView.filter(v => v.evalRole === 'FINAL_EVAL')
                            )
                              ? item.twOkrKeyresultScoreView.filter(
                                  v => v.evalRole === 'FINAL_EVAL'
                                )[0].evalScore
                              : ''}
                          </span>
                        </Col>
                        <Col span={1} />
                        <Col span={19}>
                          <a
                            onClick={() => {
                              dispatch({
                                type: `gradeType/updateGradeTypeForm`,
                                payload: {
                                  ...item,
                                  keyresultTypeName: item.keyresultTypeName,
                                  index,
                                  gradeType:
                                    item.krGrade && !isEmpty(item.krGrade)
                                      ? item.krGrade[0].gradeType
                                      : '',
                                  gradeTypeName:
                                    item.krGrade && !isEmpty(item.krGrade)
                                      ? item.krGrade[0].gradeTypeName
                                      : '',
                                },
                              });
                              dispatch({
                                type: `gradeType/updateState`,
                                payload: {
                                  gradeTypeList: item.krGrade || [],
                                },
                              });
                              this.toggleVisible();
                            }}
                          >
                            打分规则
                          </a>
                        </Col>
                      </Row>
                    </Field>
                  </FieldList>
                </div>
              </Card>
            </React.Fragment>
          ))}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ViewDetail;
