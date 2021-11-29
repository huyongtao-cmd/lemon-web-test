import React, { PureComponent } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input } from 'antd';
import Title from '@/components/layout/Title';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';

const { Field } = FieldList;
const DOMAIN = 'searchDimensionMgmt';

@connect(({ loading, dispatch, searchDimensionMgmt }) => ({
  loading,
  dispatch,
  searchDimensionMgmt,
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
        searchDimList: [],
      },
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'SEARCH_SAVE' },
    });
    // 类别码列表
    dispatch({
      type: `${DOMAIN}/searchDimensionCatCodeList`,
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
          type: `${DOMAIN}/searchDimensionEdit`,
          payload: values,
        }).then(res => {
          if (res.ok && res.datum.id) {
            const urls = getUrl();
            const fromUrl = stringify({ from: urls });
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto(`/plat/market/searchDimensionMgmt/edit?id=${res.datum.id}&${fromUrl}`);
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
      searchDimensionMgmt: {
        addFormData,
        pageConfig: { pageBlockViews = [] },
        catCodeList,
      },
      form: { getFieldDecorator },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '查询维度定义');
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { searchNo = {}, searchName = {}, catId = {}, remark = {} } = pageFieldJson;
      const fields = [
        <Field
          name="searchNo"
          label={searchNo.displayName}
          key="searchNo"
          decorator={{
            initialValue: addFormData.searchNo || '',
            rules: [{ required: searchNo.requiredFlag, message: '必填' }],
          }}
          sortNo={searchNo.sortNo}
        >
          <Input placeholder={`请输入${searchNo.displayName}`} />
        </Field>,
        <Field
          name="searchName"
          key="searchName"
          label={searchName.displayName}
          decorator={{
            initialValue: addFormData.searchName || '',
            rules: [{ required: searchName.requiredFlag, message: '必填' }],
          }}
        >
          <Input placeholder={`请输入${searchName.displayName}`} />
        </Field>,
        <Field
          name="catId"
          key="catId"
          label={catId.displayName}
          decorator={{
            initialValue: addFormData.catId || undefined,
            rules: [{ required: catId.requiredFlag, message: '必填' }],
          }}
        >
          <Selection
            key="catId"
            className="x-fill-100"
            source={catCodeList}
            transfer={{ key: 'id', code: 'id', name: 'catName' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${catId.displayName}`}
          />
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
    const { loading } = this.props;
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
          title={<Title icon="profile" text="查询维度定义" />}
        >
          {this.renderPage()}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CategoryCodeMgmtAdd;
