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
            {formatMessage({ id: `misc.save`, desc: '??????' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="????????????">
            <Field
              name="menuName"
              label={formatMessage({ id: 'sys.system.menuConfig.name', desc: '????????????' })}
              decorator={{
                initialValue: formData.menuName || '',
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Input placeholder="?????????????????????" />
            </Field>

            <Field
              name="menuLink"
              label={formatMessage({ id: 'sys.market.banner.link', desc: '??????' })}
              decorator={{
                initialValue: formData.menuLink || '',
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Input placeholder="?????????????????????,???????????????????????????" />
            </Field>
            <Field
              name="menuType"
              label="???????????????"
              decorator={{
                initialValue: formData.menuType || '',
                rules: [{ required: true, message: '???????????????' }],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={HomeConfigListNav}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                showSearch
                placeholder="????????????????????????"
              />
            </Field>
            <Field presentational />
            <Field name="icon" label="??????">
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
              ????????????: ??????*.jpg, *.gif, *.png,????????????10KB,???????????????
            </Field>

            <Field
              name="menuStatus"
              label="??????"
              decorator={{
                initialValue: formData.menuStatus || 'YES',
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="?????????????????????" />
            </Field>

            <Field
              name="menuSort"
              label={formatMessage({ id: 'sys.market.elSound.artSort', desc: '??????' })}
              decorator={{
                initialValue: formData.menuSort || '',
                rules: [{ required: true, message: '???????????????' }],
              }}
            >
              <InputNumber placeholder="???????????????" style={{ width: '100%' }} />
            </Field>

            <Field
              name="menuRemark"
              label="??????"
              decorator={{
                initialValue: formData.menuRemark || '',
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="???????????????" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MenuEdit;
