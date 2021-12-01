import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Button, Card, Form, Checkbox, Row, Col } from 'antd';
import FormItem from '@/components/production/business/FormItem';
import { isEmpty, isNil, omit } from 'ramda';
import FieldList from '@/components/layout/FieldList';

const { Field } = FieldList;
const DOMAIN = 'performanceReporting';

@connect(({ loading, dispatch, performanceReporting }) => ({
  treeLoading: loading.effects[`${DOMAIN}/init`],
  dispatch,
  ...performanceReporting,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      const tempValue = formData[key];
      fields[key] = Form.createFormField({ value: tempValue });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };

    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
class AssessmentResultModal extends PureComponent {
  state = {
    options: [],
  };

  componentDidMount() {}

  componentWillUnmount() {
    // 页面卸载时清理model层state,防止再次进入时错误显示
    this.callModelEffects('cleanState');
  }

  callModelEffects = (method, params) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: params,
    });
  };

  /**
   * 修改model层state
   * 这个方法是仅是封装一个小方法,后续修改model的state时不需要每次都解构dispatch
   * @param params state参数
   */
  updateModelState = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: params,
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      formData,
      handleCancel,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/gradeBatchPublish`,
          payload: {
            id: formData.id,
            periodName: formData.periodName,
            beginDate: formData.beginDate,
            endDate: formData.endDate,
            periodDesc: formData.periodDesc,
            ouId: formData.ouId,
            publishToRes: formData.publishToRes,
            publishToDirectLeader: formData.publishToDirectLeader,
            publishToBuLeader: formData.publishToBuLeader,
          },
        });
        handleCancel();
      }
    });
  };

  onChange = checkedValues => {
    this.setState({ options: checkedValues });
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        publishToBuLeader: checkedValues.includes('publishToBuLeader'),
        publishToDirectLeader: checkedValues.includes('publishToDirectLeader'),
        publishToRes: checkedValues.includes('publishToRes'),
      },
    });
  };

  render() {
    const { dispatch, formData, form, visible, handleCancel, targetPeriodList } = this.props;
    const { options } = this.state;
    return (
      <Modal
        title="开放考核结果"
        visible={visible}
        onCancel={handleCancel}
        width="40%"
        footer={
          <div>
            <Button
              className="tw-btn-default"
              type="primary"
              size="large"
              style={{ marginBottom: '5px' }}
              onClick={handleCancel}
            >
              取消
            </Button>
            <Button
              className="tw-btn-primary"
              type="primary"
              size="large"
              style={{ marginBottom: '5px' }}
              onClick={() => {
                this.handleSave();
              }}
            >
              确定
            </Button>
          </div>
        }
      >
        <Card bordered={false} className="tw-card-adjust">
          <div>
            <FormItem
              form={form}
              label="开放目标周期"
              fieldType="BaseSelect"
              fieldKey="periodId"
              placeholder="请选择目标周期"
              descList={targetPeriodList}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 8 }}
              onChange={(value, option) => {
                dispatch({
                  type: `${DOMAIN}/updateForm`,
                  payload: {
                    ...option[0],
                  },
                });
                let tt = [];
                if (option[0].publishToBuLeader) {
                  tt.push('publishToBuLeader');
                } else {
                  tt = tt.filter(v => v !== 'publishToBuLeader');
                }
                if (option[0].publishToDirectLeader) {
                  tt.push('publishToDirectLeader');
                } else {
                  tt = tt.filter(v => v !== 'publishToDirectLeader');
                }
                if (option[0].publishToRes) {
                  tt.push('publishToRes');
                } else {
                  tt = tt.filter(v => v !== 'publishToRes');
                }
                this.setState({
                  options: Array.from(new Set(tt)),
                });
              }}
            />
          </div>
          <div>
            <span
              style={{
                display: 'inline-block',
                marginTop: '20px',
                fontWeight: '500',
                fontSize: '17px',
                color: '#000',
              }}
            >
              选择开放对象：
            </span>
            <Checkbox.Group
              style={{ width: '100%', marginTop: '25px' }}
              onChange={e => this.onChange(e)}
              value={options}
            >
              <Row>
                <Col span={8}>
                  <Checkbox value="publishToBuLeader">开放给对应部门负责人</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="publishToDirectLeader">开放给对应直属负责人</Checkbox>
                </Col>
                <Col span={8}>
                  <Checkbox value="publishToRes">开放给员工</Checkbox>
                </Col>
              </Row>
            </Checkbox.Group>
          </div>
        </Card>
      </Modal>
    );
  }
}

export default AssessmentResultModal;
