import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Select, Radio, InputNumber } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import RichText from '@/components/common/RichText';
import { fromQs } from '@/utils/stringUtils';
import { genFakeId } from '@/utils/mathUtils';
import ColorPic from './Color';
import FormItem from '@/components/production/business/FormItem.tsx';
import Ueditor from '@/components/common/Ueditor';
import BaseSelect from '@/components/production/basic/BaseSelect.tsx';
import { format } from 'mathjs';

const { Field } = FieldList;
const DOMAIN = 'sysMarketElSoundEdit';
const { Option } = Select;
const RadioGroup = Radio.Group;

@connect(({ loading, dispatch, sysMarketElSoundEdit }) => ({
  loading,
  dispatch,
  sysMarketElSoundEdit,
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
class elSoundEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      artTitleColor: '#000000',
    };
  }

  async componentDidMount() {
    const param = fromQs().id;
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    await dispatch({
      type: `${DOMAIN}/getDetails`,
      payload: param,
    });
    await dispatch({
      type: `${DOMAIN}/queryObjList`,
      payload: {},
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      sysMarketElSoundEdit: { formData, objList },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      const param = fromQs().id;
      const { artThumb, ...params } = values;
      const { artTitleColor } = this.state;
      if (!error) {
        const artContent = this.editor.getContent();
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { id: param, artTitleColor, ...params, artContent },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/plat/contentMgmt/elSound');
  };

  render() {
    const {
      loading,
      form,
      dispatch,
      sysMarketElSoundEdit: { formData, attachments, objList },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
    } = this.props;
    const { artTitleColor } = this.state;
    const submitting = loading.effects[`${DOMAIN}/save`];

    this.setState({
      artTitleColor: formData.artTitleColor,
    });
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
              name="artTitle"
              label={formatMessage({ id: 'sys.market.elSound.artTitle', desc: '??????' })}
              decorator={{
                initialValue: formData.artTitle || '',
                rules: [{ required: true, message: '??????' }],
              }}
            >
              <Input
                placeholder="???????????????"
                addonAfter={
                  <ColorPic
                    color={formData.artTitleColor || {}}
                    onChange={color => {
                      this.setState({
                        artTitleColor: color,
                      });
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          artTitleColor: color,
                        },
                      });
                    }}
                  />
                }
              />
            </Field>
            <Field
              name="artSubTitle"
              label={formatMessage({ id: 'sys.market.elSound.abstract', desc: '??????' })}
              decorator={{
                initialValue: formData.artSubTitle || '',
              }}
            >
              <Input placeholder="???????????????" />
            </Field>
            <Field
              name="categoryCode"
              label={formatMessage({ id: 'sys.market.elSound.category', desc: '??????' })}
              decorator={{
                initialValue: formData.categoryCode || '',
              }}
            >
              <UdcSelect code="OPE:ARTICLE_CATEGORY_CODE" placeholder="???????????????" />
            </Field>
            <Field
              name="artType"
              label={formatMessage({ id: 'sys.market.elSound.type', desc: '??????' })}
              decorator={{
                initialValue: formData.artType || '',
              }}
            >
              <UdcSelect code="OPE:ARTICLE_TYPE" placeholder="???????????????" />
            </Field>
            <Field
              style={{ display: 'none' }}
              name="artUrl"
              label={formatMessage({ id: 'sys.market.elSound.link', desc: '??????' })}
              decorator={{
                initialValue: formData.artUrl || '',
              }}
            >
              <Input style={{ display: 'none' }} placeholder="???????????????" />
            </Field>
            <Field
              name="artAuthor"
              label={formatMessage({ id: 'sys.market.elSound.auth', desc: '??????' })}
              decorator={{
                initialValue: formData.artAuthor || '',
              }}
            >
              <Input placeholder="???????????????" />
            </Field>
            <Field
              name="artSource"
              label={formatMessage({ id: 'sys.market.elSound.artSource', desc: '??????' })}
              decorator={{
                initialValue: formData.artSource || '',
              }}
            >
              <Input placeholder="???????????????" />
            </Field>
            <Field
              name="artOrtop"
              label={formatMessage({ id: 'sys.market.elSound.isTop', desc: '????????????' })}
              decorator={{
                initialValue: formData.artOrtop || '',
              }}
            >
              <RadioGroup initialValue={formData.artOrtop || ''}>
                <Radio value={1}>???</Radio>
                <Radio value={0}>???</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="artSort"
              label={formatMessage({ id: 'sys.market.elSound.sort', desc: '??????' })}
              decorator={{
                initialValue: formData.artSort || '',
              }}
            >
              <InputNumber className="x-fill-100" placeholder="???????????????" />
            </Field>
            {/* <Field 
              name="readCount"
              label={formatMessage({ id: 'sys.market.elSound.readNum', desc: '????????????' })}
              decorator={{
                initialValue: formData.readCount || '',
              }}
            >
              <InputNumber className="x-fill-100" placeholder="?????????????????????" />
            </Field> */}
            {/* <Field name="artThumb" label="?????????">
              <FileManagerEnhance
                api="/api/op/v1/article/sfs/token"
                listType="text"
                disabled={false}
                multiple={false}
                dataKey={formData.id}
              />
            </Field> */}
            {/* <Field  style={{display:'none'}}  name="attach" label="?????????">
              <FormItem  style={{display:'none'}}
                fieldType="FileUpload"
                fieldKey="attach"
                fileList={attachments}
                accept=".jpg,.git,.png"
                // multiple ????????????
              />
            </Field> */}
            <Field
              name="noticeScope"
              label="??????????????????"
              decorator={{
                initialValue: formData.noticeScope,
                rules: [{ required: true, message: '??????' }],
              }}
            >
              <BaseSelect
                parentKey="FUNCTION:SYSTEM_ARTICLE:NOTICE_TYPE"
                onChange={value => {
                  console.log('????????????', value);
                  if (value === 'ALL') {
                  } else if (value === 'OU') {
                    dispatch({
                      type: `${DOMAIN}/queryOuList`,
                      payload: {},
                    });
                  } else if (value === 'BU') {
                    dispatch({
                      type: `${DOMAIN}/queryBuList`,
                      payload: {},
                    });
                  }
                }}
              />
              {/* <UdcSelect code="OPE:ARTICLE_SendZone" placeholder="???????????????????????????" /> */}
            </Field>
            <Field
              name="objId"
              label="????????????"
              decorator={{
                initialValue: formData.objId,
              }}
            >
              <BaseSelect
                disabled={!formData.noticeScope || formData.noticeScope === 'ALL'}
                descList={objList}
                placeholder="?????????????????????"
              />
            </Field>
            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '??????' })}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="???????????????" />
            </Field>
            {/* {formData.artContent && (
              <Field
                name="artContent"
                label={formatMessage({ id: 'sys.market.elSound.artContent', desc: '????????????' })}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                decorator={{
                  initialValue: formData.artContent,
                }}
              >
                <RichText />
              </Field>
            )} */}
          </FieldList>
          <div
            style={{
              margin: '20px auto 0',
              width: '86%',
            }}
          >
            {/* <RichText
              onChange={value => {
                this.getRichText(value);
              }}
            /> */}
            <Ueditor
              id="issueEditor"
              height="400"
              width="100%"
              initialContent={formData.artContent}
              ref={editor => {
                this.editor = editor;
              }}
            />
            <div
              style={{ marginTop: '10px', display: 'none' }}
              dangerouslySetInnerHTML={{ __html: formData.artContent }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default elSoundEdit;
