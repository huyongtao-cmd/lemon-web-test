import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Select, InputNumber } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import FormItem from '@/components/production/business/FormItem.tsx';

const { Field } = FieldList;
const DOMAIN = 'HomeConfigEdit';
const { Option } = Select;

@connect(({ loading, dispatch, HomeConfigEdit }) => ({
  loading,
  dispatch,
  HomeConfigEdit,
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
class MenuEdit extends PureComponent {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({ type: `${DOMAIN}/queryNav` });
    id &&
      dispatch({
        type: `${DOMAIN}/getDetails`,
        payload: { id },
      });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const { id } = fromQs();
      if (!error) {
        const params = {
          ...values,
        };
        if (id) {
          params.id = id;
          params.type = 'edit';
        }
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { ...params },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sys/system/homeConfig/menu');
  };

  render() {
    const {
      loading,
      form,
      HomeConfigEdit: { formData, HomeConfigListNav, attachments },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
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
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="菜单信息">
            <Field
              name="menuName"
              label={formatMessage({ id: 'sys.system.menuConfig.name', desc: '菜单名称' })}
              decorator={{
                initialValue: formData.menuName || '',
                rules: [{ required: true, message: '请输入菜单名称' }],
              }}
            >
              <Input placeholder="请输入菜单名称" />
            </Field>

            <Field
              name="menuLink"
              label={formatMessage({ id: 'sys.market.banner.link', desc: '链接' })}
              decorator={{
                initialValue: formData.menuLink || '',
                rules: [{ required: true, message: '请输入跳转链接' }],
              }}
            >
              <Input placeholder="请选择跳转页面,链接自动带出可修改" />
            </Field>
            <Field
              name="menuType"
              label="所属工作台"
              decorator={{
                initialValue: formData.menuType || '',
                rules: [{ required: true, message: '请选择分类' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={HomeConfigListNav}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
                placeholder="请选择所属工作台"
              />
            </Field>
            <Field presentational />
            <Field name="icon" label="图标">
              {/* <FileManagerEnhance
                api="/api/common/v1/userHomeLogo/icon/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
                accept=".jpg,.gif,.png"
                multiple={false}
              /> */}
              <FormItem
                fieldType="FileUpload"
                fieldKey="icon"
                fileList={attachments}
                accept=".jpg,.gif,.png"
              />
            </Field>
            <Field presentational style={{ color: 'red', fontSize: '12px', whiteSpace: 'nowrap' }}>
              附件要求: 支持*.jpg, *.gif, *.png,文件最大10KB,最多一张。
            </Field>

            <Field
              name="menuStatus"
              label="状态"
              decorator={{
                initialValue: formData.menuStatus || 'YES',
                rules: [{ required: true, message: '请选择是否启用' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="请选择是否启用" />
            </Field>

            <Field
              name="menuSort"
              label={formatMessage({ id: 'sys.market.elSound.artSort', desc: '排序' })}
              decorator={{
                initialValue: formData.menuSort || '',
                rules: [{ required: true, message: '请输入排序' }],
              }}
            >
              <InputNumber placeholder="请输入排序" style={{ width: '100%' }} />
            </Field>

            <Field
              name="menuRemark"
              label="备注"
              decorator={{
                initialValue: formData.menuRemark || '',
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MenuEdit;
