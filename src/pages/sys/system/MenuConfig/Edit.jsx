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
const DOMAIN = 'MenuConfigEdit';
const { Option } = Select;

@connect(({ loading, dispatch, MenuConfigEdit }) => ({
  loading,
  dispatch,
  MenuConfigEdit,
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
    closeThenGoto('/sys/system/menuConfig');
  };

  render() {
    const {
      loading,
      form,
      MenuConfigEdit: { formData, attachments, attachmentsSelected },
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
              name="funName"
              label={formatMessage({ id: 'sys.system.menuConfig.name', desc: '????????????' })}
              decorator={{
                initialValue: formData.funName || '',
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Input placeholder="?????????????????????" />
            </Field>
            <Field
              name="funCode"
              label={formatMessage({ id: 'sys.system.menuConfig.code', desc: '????????????' })}
              decorator={{
                initialValue: formData.funCode || '',
              }}
            >
              <Input placeholder="?????????????????????" />
            </Field>

            <Field
              name="selecteFunUrl"
              label={formatMessage({ id: 'sys.system.menuConfig.jumpPage', desc: '????????????' })}
              decorator={{
                initialValue: formData.selecteFunUrl || '',
              }}
            >
              <Selection.UDC
                code="OPE:MOB_FUNCTION_URL"
                placeholder="?????????????????????"
                transfer={{ name: 'name', code: 'sphd1' }}
              />
            </Field>
            <Field
              name="funUrl"
              label={formatMessage({ id: 'sys.market.banner.link', desc: '??????' })}
              decorator={{
                initialValue: formData.selecteFunUrl || formData.funUrl || '',
                rules: [{ required: true, message: '?????????????????????,???????????????????????????' }],
              }}
            >
              <Input placeholder="?????????????????????,???????????????????????????" />
            </Field>
            <Field
              name="funType"
              label={formatMessage({ id: 'sys.market.banner.category', desc: '??????' })}
              decorator={{
                initialValue: formData.funType || '',
                rules: [{ required: true, message: '???????????????' }],
              }}
            >
              <Selection.UDC code="OPE:MOB_FUNCTION_TYPE" placeholder="???????????????" />
            </Field>
            <Field
              name="funType2"
              label={formatMessage({
                id: 'sys.system.menuConfig.moreFeatureBtn',
                desc: '????????????????????????',
              })}
              decorator={{
                initialValue: formData.funType2 || 'NO',
                rules: [{ required: true, message: '??????????????????????????????' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="??????????????????????????????" />
            </Field>

            <Field
              name="enabledFlag"
              label={formatMessage({ id: 'sys.system.menuConfig.enable', desc: '????????????' })}
              decorator={{
                initialValue: formData.enabledFlag || 'YES',
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="?????????????????????" />
            </Field>
            <Field
              name="authFlag"
              label="??????????????????"
              decorator={{
                initialValue: formData.authFlag || 'YES',
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="???????????????????????????" />
            </Field>
            <Field
              name="funSort"
              label={formatMessage({ id: 'sys.market.elSound.artSort', desc: '??????' })}
              decorator={{
                initialValue: formData.funSort || '',
                rules: [{ required: true, message: '???????????????' }],
              }}
            >
              <InputNumber placeholder="???????????????" style={{ width: '100%' }} />
            </Field>
            <Field presentational />
            <Field name="icon" label="??????">
              {/* <FileManagerEnhance
                api="/api/sys/v1/mob/function/icon/sfs/token"
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
            {formData.funType === 'BOTTOM_NAV' ? (
              <Field name="iconSelect" label="????????????">
                {/* <FileManagerEnhance
                  api="/api/sys/v1/mob/function/selectIcon/sfs/token"
                  dataKey={formData.id}
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
                ????????????: ??????*.jpg, *.gif, *.png,????????????10KB,???????????????
              </Field>
            ) : (
              ''
            )}
            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '??????' })}
              decorator={{
                initialValue: formData.remark || '',
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
