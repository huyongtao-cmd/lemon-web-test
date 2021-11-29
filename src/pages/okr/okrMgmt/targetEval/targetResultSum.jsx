/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Input, Form, Button, Progress, Card, Icon, Divider, Slider, Row, Col } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty } from 'ramda';
import { mul, div, add, genFakeId } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

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
@Form.create({})
@mountToTab()
class TargetEval extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      });
    });
  }

  cancel = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveComment`,
        }).then(res => {
          if (res.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            const { from } = fromQs();
            closeThenGoto(markAsTab(from));
          } else {
            createMessage({ type: 'error', description: '操作失败' });
          }
        });
      }
    });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/targetResultSave`,
          payload: {
            submit: 'true',
          },
        });
      }
    });
  };

  // 行编辑触发事件
  onCellChanged = (index, value, name) => {
    const {
      targetEval: { twOkrKeyresultView },
      dispatch,
    } = this.props;

    const newDataSource = twOkrKeyresultView;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { twOkrKeyresultView: newDataSource },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      form: { getFieldDecorator, setFieldsValue },
      targetEval: { formData, twOkrKeyresultView },
    } = this.props;

    const submitBtn =
      loading.effects[`${DOMAIN}/targetResultSave`] || loading.effects[`${DOMAIN}/queryDetail`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
              // this.cancel()
            }}
            disabled={submitBtn}
          >
            上一步
          </Button>
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={e => this.handleSubmit()}
            disabled={submitBtn}
          >
            提交
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="目标结果总结" />}
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
                目标类型：
                {formData.objectiveTypeName}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                截止日期：
                {formData.endDate}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                更新日期：
                {formData.objectiveUpdatedate}
              </span>
            </div>
            <div>
              <span>整体进度：</span>
              <span style={{ display: 'inline-block', width: '400px' }}>
                <Progress
                  strokeColor="#22d7bb"
                  percent={Number(formData.objectiveCurProg) || 0}
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
              {(formData.objectiveGrade && formData.objectiveGrade.toFixed(2)) || '00.00'}
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
                    percent={Number(
                      mul(div(Number(item.curProg), Number(item.objValue)), 100).toFixed(1)
                    )}
                    // format={percent => percent.toFixed(2) + '%'}
                  />
                </span>
                <div>
                  {item.keyresultName}
                  &nbsp; &nbsp;
                  {`[权重${item.keyresultWeight}%]`}
                </div>
                <div style={{ color: '#999' }}>
                  <span>
                    起始：
                    {item.iniValue}
                    {item.keyresultType === 'PERCENT' ? '%' : ''}
                  </span>
                  &nbsp; &nbsp; &nbsp; &nbsp;
                  <span>
                    目标：
                    {item.objValue}
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
                      <Row gutter={20}>
                        <Col span={22}>
                          <Slider
                            marks={{
                              0: '0',
                              10: '10',
                              20: '20',
                              30: '30',
                              40: '40',
                              50: '50',
                              60: '60',
                              70: '70',
                              80: '80',
                              90: '90',
                              100: '100',
                            }}
                            value={item.keyresultGrade || 0}
                            disabled
                            tooltipVisible
                          />
                        </Col>
                        <Col span={2}>
                          <span>{item.keyresultGrade || 0}分</span>
                        </Col>
                      </Row>
                    </Field>
                  </FieldList>
                </div>
                <FieldList getFieldDecorator={getFieldDecorator} col={2}>
                  <Field
                    label="结果总结"
                    fieldCol={1}
                    labelCol={{ span: 4, xxl: 3 }}
                    wrapperCol={{ span: 19, xxl: 20 }}
                    presentational
                  >
                    <Input.TextArea
                      value={item.evalComment2}
                      onChange={e => {
                        this.onCellChanged(index, e.target.value, 'evalComment2');
                      }}
                      rows={3}
                      placeholder="请输入结果总结"
                    />
                  </Field>
                </FieldList>
              </Card>
            </React.Fragment>
          ))}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TargetEval;
