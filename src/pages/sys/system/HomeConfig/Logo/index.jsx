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
const DOMAIN = 'HomeConfigLogo';
const { Option } = Select;

@connect(({ loading, dispatch, HomeConfigLogo }) => ({
  loading,
  dispatch,
  HomeConfigLogo,
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
class LogoEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({
      type: `${DOMAIN}/getDetails`,
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      HomeConfigLogo: { formData = {} },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const params = {
          ...values,
          ...formData,
        };
        if (params.id) {
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
    closeThenGoto('/sys/system/homeConfig');
  };

  render() {
    const {
      loading,
      form,
      HomeConfigLogo: { formData, attachments },
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
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="首页Logo区配置">
            <Field name="icon" label="logo 图标" required>
              {/* <FileManagerEnhance
                api="/api/common/v1/logoWork/icon/sfs/token"
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
                multiple={false}
              />
            </Field>
            <Field presentational style={{ color: 'red', fontSize: '12px', whiteSpace: 'nowrap' }}>
              附件要求: 宽为180像素，长为36像素的透明背景.png或.gif格式的图片,文件最大10KB。
            </Field>
            <Field
              name="logoLink"
              label="链接"
              decorator={{
                initialValue: formData.logoLink || '',
                rules: [{ required: true, message: '请输入排序' }],
              }}
            >
              <Input placeholder="请输入点击 logo 区域时的跳转地址" />
            </Field>

            <Field
              name="logoSlogan"
              label="slogan"
              decorator={{
                initialValue: formData.logoSlogan || '',
              }}
            >
              <Input placeholder="请输入 slogan, 不输入时不显示 slogan" />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default LogoEdit;
