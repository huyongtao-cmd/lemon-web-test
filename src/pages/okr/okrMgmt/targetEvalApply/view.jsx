import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Form, Card, Button, Icon, Progress, Divider, Row, Col, Tooltip } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import BpmConnection from '@/pages/gen/BpmMgmt/BpmConnection';
import { mul, div, add } from '@/utils/mathUtils';
import { isEmpty } from 'ramda';

import styles from './style.less';

import targetSvg from './img/target.svg';
import keySvg from './img/key.svg';

const { Field } = FieldList;

const DOMAIN = 'targetEvalApply';

@connect(({ loading, targetEvalApply, dispatch }) => ({
  loading,
  targetEvalApply,
  dispatch,
}))
@Form.create({})
@mountToTab()
class TargetEvalApplyView extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => {
      dispatch({
        type: `${DOMAIN}/targetResultFlowDetail`,
        payload: {
          id,
        },
      });
    });
  }

  render() {
    const {
      form: { getFieldDecorator, setFieldsValue },
      targetEvalApply: { formData, twOkrKeyresultView },
    } = this.props;
    const { id } = fromQs();
    const allBpm = [{ docId: id, procDefKey: 'ACC_A49', title: '目标打分流程' }];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
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
          title={<Title icon="profile" text="目标结果打分" />}
          bordered={false}
        >
          <Card
            title={
              <span>
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
            <br />
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
            <br />
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
                    percent={Number(
                      item.objValue
                        ? mul(div(Number(item.curProg), Number(item.objValue)), 100).toFixed(1)
                        : '0.00'
                    )}
                    // format={percent => percent.toFixed(2) + '%'}
                  />
                </span>
                <div>
                  {item.keyresultName || ''}
                  &nbsp; &nbsp;
                  {`[权重${item.keyresultWeight || ''}%]`}
                </div>
                <br />
                <div>
                  <span>
                    起始：
                    {item.iniValue || ''}
                    {item.keyresultType !== 'NUMBER' && '%'}
                  </span>
                  &nbsp; &nbsp; &nbsp; &nbsp;
                  <span>
                    目标：
                    {item.objValue || ''}
                    {item.keyresultType !== 'NUMBER' && '%'}
                  </span>
                </div>
                <br />
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
                            {!isEmpty(
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
                          <a>
                            <Tooltip placement="left" title="我是打分规则">
                              打分规则
                            </Tooltip>
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
        <BpmConnection source={allBpm} />
      </PageHeaderWrapper>
    );
  }
}

export default TargetEvalApplyView;
