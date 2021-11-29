// 最常用的引入,基本每个页面都需要的组件
import React, { PureComponent } from 'react';
import { Button, Card, Input, Select, Form, InputNumber, Tooltip, Checkbox } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty, isNil } from 'ramda';

// 比较常用的本框架的组件
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { Selection, DatePicker } from '@/pages/gen/field';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import Link from 'umi/link';
import router from 'umi/router';

const { Option } = Select;
const { Field, FieldLine } = FieldList;

const DOMAIN = 'tenantEdit';

@connect(({ loading, tenantEdit, dispatch, user }) => ({
  loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/save`],
  ...tenantEdit,
  dispatch,
  user,
}))
@Form.create({
  mapPropsToFields(props) {
    const { formData } = props;
    const fields = {};
    Object.keys(formData).forEach(key => {
      fields[key] = Form.createFormField({ value: formData[key] });
    });
    return fields;
  },
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    const name = Object.keys(changedValues)[0];
    const value = changedValues[name];
    const newFieldData = { [name]: value };
    switch (name) {
      default:
        break;
    }
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: newFieldData,
    });
  },
})
@mountToTab()
class TenantEdit extends PureComponent {
  componentDidMount() {
    const { dispatch, formData } = this.props;
    const param = fromQs();
    if (param.id) {
      // 编辑模式
      this.fetchData(param);
    } else {
      // 新增模式
      dispatch({
        type: `${DOMAIN}/clearForm`,
      });
    }
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: { id: params.id },
    });
  };

  handleSave = () => {
    const { form, dispatch, formData } = this.props;
    const copyObj = {};
    const param = fromQs();
    if (param.copy) {
      copyObj.id = undefined;
    }
    form.validateFields((error, values) => {
      if (error) {
        return;
      }

      const { subDomain } = formData;
      const aa = subDomain.split(',');
      var aa1 = aa.sort();
      for (var i = 0; i < aa1.length - 1; i++) {
        if (aa1[i] == aa1[i + 1]) {
          createMessage({
            type: 'warn',
            description: '【' + aa1[i] + '】重复输入，请删除重复域名后再保存!',
          });
          return;
        }
      }
      dispatch({
        type: `${DOMAIN}/save`,
        payload: {
          ...formData,
          ...values,
          ...copyObj,
        },
      });
    });
  };

  render() {
    const {
      loading,
      formData,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            loading={loading}
            onClick={this.handleSave}
          >
            保存
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="tenantName"
              label="名称"
              decorator={{
                initialValue: formData.tenantName,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="tenantCode"
              label="编号"
              decorator={{
                initialValue: formData.tenantCode,
                rules: [{ required: true, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="userMax"
              label="用户上限"
              decorator={{
                initialValue: formData.userMax,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <InputNumber className="x-fill-100" />
            </Field>

            <Field
              name="subDomain"
              label="域名"
              decorator={{
                initialValue: formData.subDomain,
                rules: [{ required: false, message: '多域名中间用逗号分隔' }],
              }}
            >
              <Input
                style={{ width: '100%' }}
                placeholder="多域名中间用英文逗号分隔，切勿使用中文逗号"
              />
            </Field>

            <Field
              name="expiredDate"
              label="失效日期"
              decorator={{
                initialValue: formData.expiredDate,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Field>

            <Field
              name="contactPhone"
              label="联系电话"
              decorator={{
                initialValue: formData.contactPhone,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="contactEmail"
              label="联系邮箱"
              decorator={{
                initialValue: formData.contactEmail,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="contactAddress"
              label="联系地址"
              decorator={{
                initialValue: formData.contactAddress,
                rules: [{ required: false, message: '请输入' }],
              }}
            >
              <Input style={{ width: '100%' }} />
            </Field>

            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 21 }}
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false, message: '请输入备注' }],
              }}
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TenantEdit;
