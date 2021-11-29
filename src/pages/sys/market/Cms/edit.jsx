import React, { PureComponent } from 'react';
import { connect } from 'dva';
import TextArea from 'antd/lib/input/TextArea';
import { Button, Form, Card, Input, Switch, DatePicker } from 'antd';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import classnames from 'classnames';
import moment from 'moment';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';
import RichText from '@/components/common/RichText';

const DOMAIN = 'sysCmsEdit';
const { Field } = FieldList;
const FieldListLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

@connect(({ loading, sysCmsEdit, dispatch }) => ({
  loading,
  sysCmsEdit,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      let val = null;
      if (name === 'enableFlag') {
        val = value ? 1 : 0;
      } else if (name === 'pdefId') {
        val = value.code;
      } else if (name === 'releaseTime') {
        val = moment(value).format('YYYY-MM-DD');
      } else if (name === 'contents' && value === undefined) {
        val = '<p></p>';
      } else {
        val = value;
      }
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: val },
      });
    }
  },
})
@mountToTab()
class CmsEdit extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { defId } = fromQs();

    dispatch({
      type: `${DOMAIN}/clearForm`,
    });

    dispatch({
      type: `${DOMAIN}/query`,
      payload: defId,
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    const { defId } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (defId) {
          dispatch({
            type: `${DOMAIN}/edit`,
            payload: { defId },
          });
        } else {
          dispatch({
            type: `${DOMAIN}/create`,
          });
        }
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/plat/contentMgmt/cms');
  };

  render() {
    const {
      sysCmsEdit: { formData },
      form: { getFieldDecorator },
    } = this.props;
    const True = true;

    return (
      <PageHeaderWrapper title="创建信息">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="title"
              label="标题"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.title,
                rules: [
                  {
                    required: true,
                    message: '请输入文章标题',
                  },
                ],
              }}
            >
              <Input placeholder="请输入文章标题" />
            </Field>

            <Field
              name="cmsNo"
              label="编码"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.cmsNo,
                rules: [
                  {
                    required: true,
                    message: '请输入唯一编码',
                  },
                ],
              }}
            >
              <Input placeholder="请输入唯一编码" />
            </Field>
            <Field
              name="categoryCode"
              label="分类"
              {...FieldListLayout}
              decorator={{
                initialValue: formData.categoryCode,
                rules: [
                  {
                    required: true,
                    message: '请选择',
                  },
                ],
              }}
            >
              <UdcSelect code="OPE:CMS_APP" placeholder="请选择" />
            </Field>

            <Field
              name="enableFlag"
              label="是否显示"
              decorator={{
                initialValue: formData.enableFlag ? True : false,
                valuePropName: 'checked',
                rules: [
                  {
                    required: false,
                    message: '请选择是否可修改',
                  },
                ],
              }}
              {...FieldListLayout}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Field>

            <Field
              name="releaseTime"
              label="发布时间"
              {...FieldListLayout}
              decorator={{
                required: true,
                initialValue: formData.releaseTime && moment(formData.releaseTime),
              }}
            >
              <DatePicker placeholder="发布时间" format="YYYY-MM-DD" />
            </Field>

            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 3, xxl: 3 }}
              wrapperCol={{ span: 21, xxl: 21 }}
              decorator={{
                initialValue: formData.remark,
                rules: [
                  {
                    required: false,
                    message: '',
                  },
                ],
              }}
            >
              <TextArea placeholder="" />
            </Field>

            {formData.contents && (
              <Field
                name="contents"
                label="文章内容"
                fieldCol={1}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                decorator={{
                  initialValue: formData.contents,
                }}
              >
                <RichText />
              </Field>
            )}
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CmsEdit;
