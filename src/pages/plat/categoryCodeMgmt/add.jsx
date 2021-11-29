import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input } from 'antd';
import Title from '@/components/layout/Title';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import createMessage from '@/components/core/AlertMessage';

const { Field } = FieldList;
const DOMAIN = 'categoryCodeMgmt';

@connect(({ loading, dispatch, categoryCodeMgmt }) => ({
  loading,
  dispatch,
  categoryCodeMgmt,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateAddForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class CategoryCodeMgmtAdd extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        addFormData: {},
        twCategoryDEntity: [],
      },
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'CATEGORY_SAVE' },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: values,
        }).then(res => {
          if (res.ok && res.datum.id) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/plat/market/categoryCodeMgmt/edit?id=${res.datum.id}`);
          } else {
            createMessage({ type: 'error', description: res.reason || '操作失败' });
          }
        });
      }
    });
  };

  // 配置所需要的内容
  renderPage = () => {
    const {
      categoryCodeMgmt: {
        addFormData,
        pageConfig: { pageBlockViews = [] },
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '类别码定义新增');
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { catNo = {}, catName = {}, tabName = {}, remark = {} } = pageFieldJson;
      const fields = [
        <Field
          name="catNo"
          label={catNo.displayName}
          key="catNo"
          decorator={{
            initialValue: addFormData.catNo || '',
            rules: [{ required: catNo.requiredFlag, message: '必填' }],
          }}
          sortNo={catNo.sortNo}
        >
          <Input placeholder={`请输入${catNo.displayName}`} />
        </Field>,
        <Field
          name="catName"
          key="catName"
          label={catName.displayName}
          decorator={{
            initialValue: addFormData.catName || '',
            rules: [{ required: catName.requiredFlag, message: '必填' }],
          }}
        >
          <Input placeholder={`请输入${catName.displayName}`} />
        </Field>,
        <Field
          name="tabName"
          key="tabName"
          label={tabName.displayName}
          decorator={{
            initialValue: addFormData.tabName || '',
            rules: [{ required: tabName.requiredFlag, message: '必填' }],
          }}
        >
          <Input placeholder={`请输入${tabName.displayName}`} />
        </Field>,
        <Field
          name="remark"
          key="remark"
          label={remark.displayName}
          decorator={{
            initialValue: addFormData.remark || '',
            rules: [{ required: remark.requiredFlag, message: '必填' }],
          }}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
        >
          <Input.TextArea rows={3} placeholder={`请输入${remark.displayName}`} />
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
      categoryCodeMgmt: { addFormData },
      form: { getFieldDecorator },
    } = this.props;
    const submitting = loading.effects[`${DOMAIN}/save`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={submitting}
            onClick={() => this.handleSave()}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
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
          bordered={false}
          title={<Title icon="profile" text="类别码定义" />}
        >
          {this.renderPage()}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CategoryCodeMgmtAdd;
