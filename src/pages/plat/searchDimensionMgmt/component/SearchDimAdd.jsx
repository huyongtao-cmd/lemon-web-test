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

const DOMAIN = 'searchDimensionMgmt';

@connect(({ loading, dispatch, searchDimensionMgmt }) => ({
  loading,
  dispatch,
  searchDimensionMgmt,
}))
@Form.create({})
@mountToTab()
class searchDimAddModal extends PureComponent {
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

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveSearchDimEntity`,
          payload: {
            ...values,
            searchId: fromQs().id,
          },
        }).then(response => {
          if (response && response.ok) {
            this.onChange();
          }
        });
      }
    });
  };

  onChange = values => {
    const { visible } = this.state;
    this.setState({ visible }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(values);
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      searchDimensionMgmt: {
        formDataModalAdd,
        pageConfig: { pageBlockViews },
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '查询维度新增');
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { searchDimName = {}, dfltFlag = {}, searchDimStatus = {} } = pageFieldJson;

      const fields = [
        <Field
          name="searchDimName"
          key="searchDimName"
          label={searchDimName.displayName}
          decorator={{
            initialValue: formDataModalAdd.searchDimName || undefined,
            rules: [{ required: searchDimName.requiredFlag, message: '必填' }],
          }}
        >
          <Input placeholder={`请输入${searchDimName.displayName}`} />
        </Field>,

        <Field
          name="dfltFlag"
          key="dfltFlag"
          label={dfltFlag.displayName}
          decorator={{
            initialValue: formDataModalAdd.dfltFlag || undefined,
            rules: [{ required: dfltFlag.requiredFlag, message: '必填' }],
          }}
        >
          <RadioGroup>
            <Radio value="YES">是</Radio>
            <Radio value="NO">否</Radio>
          </RadioGroup>
        </Field>,

        <Field
          name="searchDimStatus"
          key="searchDimStatus"
          label={searchDimStatus.displayName}
          decorator={{
            initialValue: formDataModalAdd.searchDimStatus || undefined,
            rules: [{ required: searchDimStatus.requiredFlag, message: '必填' }],
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
      loading,
      searchDimensionMgmt: { formDataModalAdd, catCodeList, TabField },
      form: { getFieldDecorator },
    } = this.props;
    const { visible } = this.state;

    return (
      <Modal
        title="查询维度"
        visible={visible}
        onOk={() => {
          this.handleSubmit();
        }}
        onCancel={() => {
          this.onChange();
        }}
        confirmLoading={loading.effects[`${DOMAIN}/saveSearchDimEntity`]}
        maskClosable={false}
        destroyOnClose
        width={1250}
      >
        {this.renderPage()}
      </Modal>
    );
  }
}

export default searchDimAddModal;
