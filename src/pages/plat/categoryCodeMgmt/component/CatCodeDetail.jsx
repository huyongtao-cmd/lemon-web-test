import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { equals, type } from 'ramda';
import { Form, Input, Modal, Radio } from 'antd';
import { Selection } from '@/pages/gen/field';
import { mountToTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { selectInternalOus } from '@/services/gen/list';

const { Field } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'categoryCodeMgmt';

@connect(({ loading, dispatch, categoryCodeMgmt }) => ({
  loading,
  dispatch,
  categoryCodeMgmt,
}))
@Form.create({})
@mountToTab()
class CatCodeDetailModal extends PureComponent {
  constructor(props) {
    super(props);
    const { parmars } = props;
    this.state = {
      parmars,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ parmars: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { parmars } = this.props;
    if (!equals(prevState.parmars, parmars)) {
      return parmars;
    }
    return null;
  }

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  // 自己托管modal确定按钮的loading状态，避免多次快速点击确定会重复发送请求
  toggleSubmitConfirmStatus = () => {
    const { submitConfirmStatus } = this.state;
    this.setState({ submitConfirmStatus: !submitConfirmStatus });
  };

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/catCodeDValNodeSave`,
          payload: {
            values,
            id: fromQs().id,
          },
        }).then(response => {
          if (response && response.ok) {
            this.onChange();
          }
        });
      }
    });
  };

  onChange = v => {
    const { visible } = this.state;
    this.setState({ visible }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(visible);
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const {
      parmars: { visible, catCodeDetailFormData },
      submitConfirmStatus,
    } = this.state;

    return (
      <Modal
        title="类别码"
        visible={visible}
        onOk={() => {
          this.handleSubmit();
        }}
        onCancel={() => {
          this.onChange();
        }}
        confirmLoading={submitConfirmStatus}
        maskClosable={false}
        destroyOnClose
        width="60%"
      >
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          <Field
            name="catVal"
            label="值"
            decorator={{
              initialValue: catCodeDetailFormData.catVal || undefined,
              rules: [
                {
                  required: true,
                  message: '请输入值',
                },
              ],
            }}
          >
            <Input placeholder="请输入值" />
          </Field>
          <Field
            name="catDesc"
            label="名称"
            decorator={{
              initialValue: catCodeDetailFormData.catDesc || undefined,
              rules: [
                {
                  required: true,
                  message: '请输入名称',
                },
              ],
            }}
          >
            <Input placeholder="请输入名称" />
          </Field>
          <Field
            name="supCatDValId"
            label="上级类别码值"
            decorator={{
              initialValue: catCodeDetailFormData.supCatDValId || undefined,
            }}
          >
            <Selection
              key="supCatDValId"
              className="x-fill-100"
              source={() => selectInternalOus()}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
              placeholder="请选择上级类别码"
            />
          </Field>
          <Field
            name="sortNo"
            label="顺序"
            decorator={{
              initialValue: catCodeDetailFormData.sortNo || undefined,
            }}
          >
            <Input placeholder="请输入顺序" />
          </Field>
        </FieldList>
      </Modal>
    );
  }
}

export default CatCodeDetailModal;
