import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Card, Modal, Form, Input, Select, TimePicker } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance } from '@/pages/gen/field';

const { Field } = FieldList;
@Form.create()
class UpLoadModel extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      onCancel,
      onOk,
      dispatch,
      DOMAIN,
      form: { getFieldDecorator, setFieldsValue, getFieldValue, validateFieldsAndScroll },
      id,
      ...rest
    } = this.props;
    const modalOpts = {
      ...rest,
      maskClosable: true,
      centered: false,
      onCancel,
      onOk: () => {
        validateFieldsAndScroll((error, values) => {
          if (!error) {
            // dispatch({
            //   type: `${DOMAIN}/create`,
            //   payload: { ...values, panelTitle },
            // });
            onOk();
          }
        });
      },
    };

    return (
      <Modal {...modalOpts}>
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={1}>
          <Field
            name="themeImg"
            label="上传图片"
            decorator={{
              rules: [{ required: true, message: '必填' }],
            }}
          >
            <FileManagerEnhance
              api="/api/base/v1/themeImg/sfs/token"
              listType="text"
              disabled={false}
              multiple={false}
              dataKey={id}
            />
          </Field>
        </FieldList>
      </Modal>
    );
  }
}

export default UpLoadModel;
