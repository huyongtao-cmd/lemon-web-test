import { connect } from 'dva';
import React from 'react';
import { Card, Form, Input, Modal } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { isEmpty, isNil } from 'ramda';
import { Selection, UdcSelect } from '@/pages/gen/field';
import AsyncSelectDisable from '@/components/common/AsyncSelectDisable';
import { selectEvalPoint } from '@/services/sys/baseinfo/eval';
import { queryCascaderUdc } from '@/services/gen/app';
import LogEditor from '@/components/common/LogEditor';
import Title from '@/components/layout/Title';
import createMessage from '@/components/core/AlertMessage';
import styles from '../style.less';

const DOMAIN = 'projectLogDetails';
const { Field } = FieldList;

@connect(({ loading, projectLogDetails, dispatch }) => ({
  loading,
  projectLogDetails,
  dispatch,
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
class AddRecord extends React.Component {
  state = {
    evalTypeData: [],
  };

  // 保存按钮
  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      toggle,
      projectLogDetails,
      mode,
      logId,
    } = this.props;
    const issueEditorRecord = this.editorRecord.getContent();
    const getConTextLength = this.editorRecord.getConTextLength();
    const { formData } = projectLogDetails;
    validateFieldsAndScroll((error, values) => {
      if (getConTextLength < 5) {
        createMessage({ type: 'error', description: '请最少输入5个字' });
        return;
      }
      const ids = formData.id;
      const form = {
        ...values,
        projectLogId: ids,
        traceContent: issueEditorRecord,
      };
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveRecord`,
          payload: {
            values: {
              ...form,
            },
          },
        }).then(res => {
          createMessage({ type: 'success', description: '添加成功' });
          dispatch({
            type: `${DOMAIN}/findProjectRecordList`,
            payload: { mode, changeId: isNil(logId) ? '' : logId },
          });
          toggle();
        });
      }
    });
  };

  handleCancel = () => {
    const { dispatch, toggle } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    toggle();
  };

  render() {
    const {
      loading,
      visible,
      title,
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      projectLogDetails: { formData },
    } = this.props;
    const { evalTypeData } = this.state;
    return (
      <Modal
        width="60%"
        destroyOnClose
        title="添加日志"
        okText="保存"
        visible={visible}
        onOk={this.handleSubmit}
        onCancel={this.handleCancel}
      >
        <div
          bodyStyle={{
            border: '1px',
            boxShadow: '0px 0px 15px #e8e8e8',
            position: 'relative',
          }}
          className={styles.cardRight}
        >
          <div
            style={{
              margin: '20px auto 0',
              width: '100%',
            }}
          >
            <LogEditor
              id="issueEditorRecord"
              height="200"
              width="100%"
              initialContent=""
              ref={editorRecord => {
                this.editorRecord = editorRecord;
              }}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

export default AddRecord;
