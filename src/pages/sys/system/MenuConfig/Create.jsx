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
import FormItem from '@/components/production/business/FormItem.tsx';

const { Field } = FieldList;
const { Option } = Select;
const DOMAIN = 'MenuConfigCreate';

@connect(({ loading, dispatch, MenuConfigCreate }) => ({
  loading,
  dispatch,
  MenuConfigCreate,
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
class MenuCreate extends PureComponent {
  componentDidMount() {
    // 初始得到主合同id给formData赋值
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const { adjunct, ...params } = values;
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { ...params },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/sys/system/menuConfig');
  };

  render() {
    const {
      form,
      MenuConfigCreate: { formData, attachments, attachmentsSelected },
      loading,
    } = this.props;
    const { getFieldDecorator } = form;
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
              name="funName"
              label={formatMessage({ id: 'sys.system.menuConfig.name', desc: '菜单名称' })}
              decorator={{
                initialValue: formData.funName || '',
                rules: [{ required: true, message: '请输入菜单名称' }],
              }}
            >
              <Input placeholder="请输入菜单名称" />
            </Field>
            <Field
              name="funCode"
              label={formatMessage({ id: 'sys.system.menuConfig.code', desc: '特殊编码' })}
              decorator={{
                initialValue: formData.funCode || '',
              }}
            >
              <Input placeholder="请输入特殊编码" />
            </Field>

            <Field
              name="selecteFunUrl"
              label={formatMessage({ id: 'sys.system.menuConfig.jumpPage', desc: '跳转页面' })}
              decorator={{
                initialValue: formData.selecteFunUrl || '',
                rules: [{ required: true, message: '请选择跳转页面' }],
              }}
            >
              <Selection.UDC
                code="OPE:MOB_FUNCTION_URL"
                placeholder="请选择跳转页面"
                transfer={{ name: 'name', code: 'sphd1' }}
              />
            </Field>
            <Field
              name="funUrl"
              label={formatMessage({ id: 'sys.market.banner.link', desc: '链接' })}
              decorator={{
                initialValue: formData.selecteFunUrl || '',
                rules: [{ required: true, message: '请选择跳转页面,链接自动带出可修改' }],
              }}
            >
              <Input placeholder="请选择跳转页面,链接自动带出可修改" />
            </Field>
            <Field
              name="funType"
              label={formatMessage({ id: 'sys.market.banner.category', desc: '分类' })}
              decorator={{
                initialValue: formData.funType || '',
                rules: [{ required: true, message: '请选择分类' }],
              }}
            >
              <Selection.UDC code="OPE:MOB_FUNCTION_TYPE" placeholder="请选择分类" />
            </Field>
            <Field
              name="funType2"
              label={formatMessage({
                id: 'sys.system.menuConfig.moreFeatureBtn',
                desc: '是否更多功能按钮',
              })}
              decorator={{
                initialValue: formData.funType2 || 'NO',
                rules: [{ required: true, message: '请选择是否是更多按钮' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="请选择是否是更多按钮" />
            </Field>

            <Field
              name="enabledFlag"
              label={formatMessage({ id: 'sys.system.menuConfig.enable', desc: '是否启用' })}
              decorator={{
                initialValue: formData.enabledFlag || 'YES',
                rules: [{ required: true, message: '请选择是否启用' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="请选择是否启用" />
            </Field>
            <Field
              name="authFlag"
              label="是否需要登录"
              decorator={{
                initialValue: formData.authFlag || 'YES',
                rules: [{ required: true, message: '请选择是否启用' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="请选择是否需要登陆" />
            </Field>
            <Field
              name="funSort"
              label={formatMessage({ id: 'sys.market.elSound.artSort', desc: '排序' })}
              decorator={{
                initialValue: formData.funSort || '',
                rules: [{ required: true, message: '请输入排序' }],
              }}
            >
              <InputNumber placeholder="请输入排序" style={{ width: '100%' }} />
            </Field>
            <Field presentational />
            <Field name="icon" label="图标">
              {/* <FileManagerEnhance
                api="/api/sys/v1/mob/function/icon/sfs/token"
                dataKey=""
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
            {formData.funType === 'BOTTOM_NAV' ? (
              <Field name="iconSelected" label="选中图标">
                {/* <FileManagerEnhance
                  api="/api/sys/v1/mob/function/selectIcon/sfs/token"
                  dataKey=""
                  listType="text"
                  disabled={false}
                  accept=".jpg,.gif,.png"
                  multiple={false}
                /> */}
                <FormItem
                  fieldType="FileUpload"
                  fieldKey="iconSelected"
                  fileList={attachmentsSelected}
                  accept=".jpg,.gif,.png"
                />
              </Field>
            ) : (
              ''
            )}
            {formData.funType === 'BOTTOM_NAV' ? (
              <Field
                presentational
                style={{ color: 'red', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                附件要求: 支持*.jpg, *.gif, *.png,文件最大10KB,最多一张。
              </Field>
            ) : (
              ''
            )}

            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
              decorator={{
                initialValue: formData.remark || '',
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

export default MenuCreate;
