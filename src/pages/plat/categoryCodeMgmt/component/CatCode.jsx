import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { equals, type } from 'ramda';
import { Form, Input, Modal, Radio } from 'antd';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
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
class CatCodeModal extends PureComponent {
  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      visible,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
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
      categoryCodeMgmt: { searchForm, formData, catCodeList },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const tt = catCodeList.filter(v => !v.showName);
        if (tt.length) {
          createMessage({ type: 'warn', description: '请补全类别码明细必填项！' });
          return;
        }

        dispatch({
          type: `${DOMAIN}/save`,
          payload: formData,
        }).then(response => {
          if (response.ok) {
            dispatch({
              type: `${DOMAIN}/catCodeDetailSave`,
              payload: {
                ...values,
                catId: fromQs().id,
              },
            }).then(res => {
              if (res && res.ok) {
                this.onChange();
              }
            });
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
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

  // 配置所需要的内容
  renderPage = () => {
    const {
      categoryCodeMgmt: {
        formData,
        pageConfig: { pageBlockViews = [] },
        catCodeList,
        TabField,
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '类别码明细修改');
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const {
        tabField = {},
        showName = {},
        supCatDId = {},
        blankFlag = {},
        multFlag = {},
        catStatus = {},
      } = pageFieldJson;

      const fields = [
        <Field
          name="tabField"
          key="tabField"
          label={tabField.displayName}
          decorator={{
            initialValue: formData.tabField || undefined,
            rules: [{ required: tabField.requiredFlag, message: '必填' }],
          }}
        >
          <Selection
            key="tabField"
            className="x-fill-100"
            source={TabField}
            transfer={{ key: 'key', code: 'key', name: 'key' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${tabField.displayName}`}
          />
        </Field>,
        <Field
          name="showName"
          key="showName"
          label={showName.displayName}
          decorator={{
            initialValue: formData.showName || undefined,
            rules: [{ required: showName.requiredFlag, message: '必填' }],
          }}
        >
          <Input placeholder={`请输入${showName.displayName}`} />
        </Field>,
        <Field
          name="supCatDId"
          key="supCatDId"
          label={supCatDId.displayName}
          decorator={{
            initialValue: formData.supCatDId || undefined,
            rules: [{ required: supCatDId.requiredFlag, message: '必填' }],
          }}
        >
          <Selection
            key="supCatDId"
            className="x-fill-100"
            source={catCodeList}
            transfer={{ key: 'id', code: 'id', name: 'showName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${supCatDId.displayName}`}
          />
        </Field>,
        <Field
          name="blankFlag"
          key="blankFlag"
          label={blankFlag.displayName}
          decorator={{
            initialValue: formData.blankFlag || undefined,
            rules: [{ required: blankFlag.requiredFlag, message: '必填' }],
          }}
        >
          <RadioGroup>
            <Radio value="YES">是</Radio>
            <Radio value="NO">否</Radio>
          </RadioGroup>
        </Field>,
        <Field
          name="multFlag"
          key="multFlag"
          label={multFlag.displayName}
          decorator={{
            initialValue: formData.multFlag || undefined,
            rules: [{ required: multFlag.requiredFlag, message: '必填' }],
          }}
        >
          <RadioGroup>
            <Radio value="YES">是</Radio>
            <Radio value="NO">否</Radio>
          </RadioGroup>
        </Field>,
        <Field
          name="catStatus"
          key="catStatus"
          label={catStatus.displayName}
          decorator={{
            initialValue: formData.catStatus || undefined,
            rules: [{ required: catStatus.requiredFlag, message: '必填' }],
          }}
        >
          <RadioGroup>
            <Radio value="IN_USE">启用</Radio>
            <Radio value="NOT_USED">停用</Radio>
          </RadioGroup>
        </Field>,
      ];

      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          {filterList}
        </FieldList>
      );
    }

    return '';
  };

  render() {
    const {
      categoryCodeMgmt: { formData, catCodeList, TabField },
      form: { getFieldDecorator },
    } = this.props;
    const { visible, submitConfirmStatus } = this.state;

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
        width={1250}
      >
        {this.renderPage()}
      </Modal>
    );
  }
}

export default CatCodeModal;
