/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Input, Form, Button, Progress, Card, Icon, InputNumber, Divider, Radio } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty, isNil } from 'ramda';
import { mul, div, add } from '@/utils/mathUtils';
import createMessage from '@/components/core/AlertMessage';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

import targetSvg from './img/target.svg';
import keySvg from './img/key.svg';

import styles from './style.less';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

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
class TargetEval extends PureComponent {
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

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/targetResultUpdate`,
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '????????????' });
            const urls = getUrl();
            const from = stringify({ from: urls });
            closeThenGoto(`/okr/okrMgmt/targetEval/targetResultSum?id=${fromQs().id}&${from}`);
          } else {
            createMessage({ type: 'error', description: response.reason || '????????????' });
          }
        });
      }
    });
  };

  // ?????????????????????
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

    const supobjectiveCurProgNew = twOkrKeyresultView
      .map(v =>
        mul(
          mul(
            Number(
              v.keyresultType === 'tag'
                ? div(Number(v.curProg), 100).toFixed(2)
                : v.objValue
                  ? div(Number(v.curProg), Number(v.objValue)).toFixed(2)
                  : 0
            ),
            div(v.keyresultWeight, 100)
          ),
          100
        )
      )
      .reduce((prev, curr) => add(prev || 0, curr || 0), 0);
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { objectiveCurProg: supobjectiveCurProgNew },
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
      loading.effects[`${DOMAIN}/queryDetail`] || loading.effects[`${DOMAIN}/targetResultUpdate`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            size="large"
            onClick={e => this.handleSubmit()}
            disabled={submitBtn}
          >
            ?????????
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
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="??????????????????" />}
          bordered={false}
        >
          <Card
            title={
              <span style={{ color: '#000' }}>
                <img width="20px" style={{ marginBottom: '9px' }} src={targetSvg} alt="??????" />
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
              &nbsp; ????????????
              {formData.supObjectveName || '???'}
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
                ???????????????
                {formData.objectiveTypeName}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                ???????????????
                {formData.endDate}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                ???????????????
                {formData.objectiveUpdatedate}
              </span>
            </div>
            <div>
              <span>???????????????</span>
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
          {twOkrKeyresultView.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={index}>
              <Card
                title={
                  !index && (
                    <span>
                      <img
                        width="20px"
                        style={{ marginBottom: '9px', transform: 'rotateY(180deg)' }}
                        src={keySvg}
                        alt="????????????"
                      />
                      &nbsp; ????????????
                    </span>
                  )
                }
                headStyle={{ border: 'none' }}
                bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '120px' }}
                bordered={false}
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
                  {item.keyresultName || ''}
                  &nbsp; &nbsp;
                  {`[??????${item.keyresultWeight || ''}%]`}
                </div>
                <div style={{ color: '#999' }}>
                  <span>
                    ?????????
                    {item.iniValue || ''}
                    {item.keyresultType === 'PERCENT' && '%'}
                  </span>
                  &nbsp; &nbsp; &nbsp; &nbsp;
                  <span>
                    ?????????
                    {item.objValue || ''}
                    {item.keyresultType === 'PERCENT' && '%'}
                  </span>
                </div>
                {item.keyresultType === 'tag' && (
                  <>
                    <div>
                      <FieldList layout="horizontal" getFieldDecorator={() => void 0} col={3}>
                        <Field name="acheiveTag" label="????????????" presentational>
                          <RadioGroup
                            value={item.acheiveTag}
                            onChange={e => {
                              this.onCellChanged(index, e.target.value, 'acheiveTag');
                              this.onCellChanged(
                                index,
                                e.target.value === 'true' ? 100 : 0,
                                'objValue'
                              );
                              this.onCellChanged(
                                index,
                                e.target.value === 'true' ? 100 : 0,
                                'curProg'
                              );
                            }}
                          >
                            <Radio value="true">???</Radio>
                            <Radio value="false">???</Radio>
                          </RadioGroup>
                        </Field>
                      </FieldList>
                    </div>
                  </>
                )}
                {item.keyresultType === 'NUMBER' && (
                  <>
                    <div>
                      <FieldList layout="horizontal" getFieldDecorator={() => void 0} col={3}>
                        <Field
                          name="curProg"
                          // label={<span className="ant-form-item-required">??????????????????</span>}
                          label="????????????"
                          presentational
                        >
                          <InputNumber
                            value={item.curProg}
                            className="x-fill-100"
                            precision={0}
                            min={0}
                            max={Number(item.objValue)}
                            onChange={e => {
                              this.onCellChanged(index, e || 0, 'curProg');
                            }}
                            placeholder="?????????????????????"
                          />
                        </Field>
                      </FieldList>
                    </div>
                  </>
                )}
                {item.keyresultType === 'PERCENT' && (
                  <>
                    <div>
                      <FieldList layout="horizontal" getFieldDecorator={() => void 0} col={3}>
                        <Field name="curProg" label="????????????" presentational>
                          <>
                            <InputNumber
                              value={item.curProg}
                              style={{ width: '90%' }}
                              precision={0}
                              min={0}
                              max={100}
                              onChange={e => {
                                this.onCellChanged(index, e || 0, 'curProg');
                              }}
                              placeholder="?????????????????????"
                            />
                            <span>%</span>
                          </>
                        </Field>
                      </FieldList>
                    </div>
                  </>
                )}
              </Card>
              <Divider dashed />
            </React.Fragment>
          ))}
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="updDesc"
              label="????????????"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.updDesc || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="?????????????????????" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TargetEval;
