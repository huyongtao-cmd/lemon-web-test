import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Button, Card, Modal, Form, Input, Select, TimePicker } from 'antd';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance } from '@/pages/gen/field';
import TagInput from './TagInput';

const { Option } = Select;

const PANELTYPE = [
  {
    label: '版式1',
    value: '1',
  },
  {
    label: '版式2',
    value: '2',
  },
  {
    label: '版式3',
    value: '3',
  },
];

const { Field } = FieldList;
@Form.create()
class CreateThemeModel extends PureComponent {
  componentDidMount() {}

  render() {
    const {
      onCancel,
      onOk,
      dispatch,
      DOMAIN,
      themeItem,
      mode,
      form: { getFieldDecorator, setFieldsValue, getFieldValue, validateFieldsAndScroll },
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
            const panelTitle = values.panelTitle.join(',');
            if (mode === 'edit') {
              dispatch({
                type: `${DOMAIN}/updateTheme`,
                payload: { ...values, panelTitle, id: themeItem.id },
              });
            } else {
              dispatch({
                type: `${DOMAIN}/create`,
                payload: { ...values, panelTitle },
              });
            }
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
            label="主题图片"
            decorator={{
              initialValue: themeItem.id,
              rules: [{ required: true, message: '必填' }],
            }}
          >
            <FileManagerEnhance
              api="/api/base/v1/themeLogo/sfs/token"
              listType="text"
              multiple={false}
              dataKey={mode === 'edit' ? themeItem.id : null}
            />
          </Field>
          {/* <Field
            presentational
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 22, xxl: 22 }}
            style={{ color: 'red' }}
          >
            <span style={{ fontSize: '12px', paddingLeft: '20px' }}>
              Logo要求：支持*.jpg, *.gif, *.png，像素最大500*500，文件最大1MB。
            </span>
          </Field> */}
          {/* <Field
            name="themeEnName"
            label="主题名称"
            decorator={{
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请输入主题名称',
                },
              ],
            }}
          >
            <Input placeholder="请输入主题名称" />
          </Field>
          <Field
            name="themeName"
            label="主题namespace"
            decorator={{
              initialValue: '',
              rules: [
                {
                  required: true,
                  message: '请输入主题名称',
                },
              ],
            }}
          >
            <Input placeholder="请输入主题名称" />
          </Field> */}

          <Field name="panelType1" label="版式备注" style={{ color: 'red' }}>
            <span style={{ fontSize: '12px' }}>
              1. 第一层：1:1:1（图:图:图）；第二层：2:1（流程:报表）；第三层：1:1（能力:报表）
              <br />
              2. 第一层：2:1（图:图）；第二层：1（流程）；第三层：2:1（能力:报表）
              <br />
              3. 第一层：1:1（图:图）；第二层：1（流程）；第三层：2:1（能力:报表）
            </span>
          </Field>
          <Field
            name="panelType"
            label="版式类型"
            decorator={{
              initialValue: themeItem.panelType || '1',
              rules: [
                {
                  required: true,
                  message: '请输入版式类型',
                },
              ],
            }}
          >
            <Select style={{ width: '100%' }} disabled={mode === 'edit'}>
              {PANELTYPE.map(item => (
                <Option value={item.value}>{item.label}</Option>
              ))}
            </Select>
          </Field>
          <Field
            name="panelTitle"
            label="版式标题"
            decorator={{
              initialValue: themeItem.newPanelTitle || undefined,
              rules: [
                {
                  required: true,
                  message: '请输入版式标题',
                },
              ],
            }}
          >
            <TagInput placeholder="输入后回车确定" />
          </Field>
          <Field name="remark" label="备注">
            <Input placeholder="请输入备注" />
          </Field>
        </FieldList>
      </Modal>
    );
  }
}

export default CreateThemeModel;
