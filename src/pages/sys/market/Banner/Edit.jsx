import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Select } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;
const DOMAIN = 'sysMarketBannerEdit';
const { Option } = Select;

@connect(({ loading, dispatch, sysMarketBannerEdit }) => ({
  loading,
  dispatch,
  sysMarketBannerEdit,
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
class BannerEdit extends PureComponent {
  componentDidMount() {
    const param = fromQs().id;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({
      type: `${DOMAIN}/getDetails`,
      payload: param,
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const param = fromQs().id;
      const { adjunct, ...params } = values;
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { id: param, ...params },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/plat/market/banner');
  };

  render() {
    const {
      loading,
      form,
      sysMarketBannerEdit: { formData },
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
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="BANNER信息">
            <Field
              name="title"
              label={formatMessage({ id: 'sys.market.banner.bannerTitle', desc: '横幅标题' })}
              decorator={{
                initialValue: formData.title,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入横幅标题" />
            </Field>
            <Field
              name="url"
              label={formatMessage({ id: 'sys.market.banner.bannerLink', desc: '连接' })}
              decorator={{
                initialValue: formData.url,
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input placeholder="请输入连接" />
            </Field>
            <Field
              name="category"
              label={formatMessage({ id: 'sys.market.banner.category', desc: '分类' })}
              decorator={{
                initialValue: formData.category,
              }}
            >
              <UdcSelect code="OPE:BANNER_CATEGORY" placeholder="请选择分类" />
            </Field>
            <Field
              name="docStatus"
              label={formatMessage({ id: 'sys.market.banner.status', desc: '状态' })}
              decorator={{
                initialValue: formData.docStatus,
              }}
            >
              <Select>
                <Option value="yes">显示</Option>
                <Option value="no">不显示</Option>
              </Select>
            </Field>
            <Field name="adjunct" label="横幅">
              <FileManagerEnhance
                api="/api/sys/v1/banner/logo/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>
            <Field
              presentational
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 22, xxl: 22 }}
              style={{ color: 'red' }}
            >
              附件要求：支持*.jpg, *.gif, *.png, 尺寸为960*276, 文件最大1MB。
            </Field>
            <Field
              name="mark"
              label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
              decorator={{
                initialValue: formData.mark,
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

export default BannerEdit;
