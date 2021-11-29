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
import ColorPic from './Color';
import BaseSelect from '@/components/production/basic/BaseSelect.tsx';
import Ueditor from '@/components/common/Ueditor';

const { Field } = FieldList;
const { Option } = Select;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const DOMAIN = 'sysMarketElSoundCreate';

@connect(({ loading, dispatch, sysMarketElSoundCreate }) => ({
  loading,
  dispatch,
  sysMarketElSoundCreate,
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
class BannerCreate extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      artTitleColor: '#000000',
    };
  }

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
      const { artThumb, ...params } = values;
      const { artTitleColor } = this.state;
      if (!error) {
        const artContent = this.editor.getContent();
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { artTitleColor, ...params, artContent },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/plat/contentMgmt/elSound');
  };

  render() {
    const {
      form,
      sysMarketElSoundCreate: { formData, objList },
      loading,
      dispatch,
      attachments = [],
    } = this.props;
    const { getFieldDecorator } = form;
    const { artTitleColor } = this.state;

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
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="基本信息">
            <Field
              name="artTitle"
              label={formatMessage({ id: 'sys.market.elSound.artTitle', desc: '标题' })}
              decorator={{
                initialValue: formData.artTitle || '',
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <Input
                placeholder="请输入标题"
                addonAfter={
                  <ColorPic
                    color={formData.artTitleColor || artTitleColor}
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
              label={formatMessage({ id: 'sys.market.elSound.abstract', desc: '摘要' })}
              decorator={{
                initialValue: formData.artSubTitle || '',
              }}
            >
              <Input placeholder="请输入摘要" />
            </Field>
            <Field
              name="categoryCode"
              label={formatMessage({ id: 'sys.market.elSound.category', desc: '分类' })}
              decorator={{
                initialValue: formData.categoryCode || '',
              }}
            >
              <UdcSelect code="OPE:ARTICLE_CATEGORY_CODE" placeholder="请选择分类" />
            </Field>
            <Field
              name="artType"
              label={formatMessage({ id: 'sys.market.elSound.type', desc: '类型' })}
              decorator={{
                initialValue: formData.artType || '',
              }}
            >
              <UdcSelect code="OPE:ARTICLE_TYPE" placeholder="请选择类型" />
            </Field>
            <Field
              style={{ display: 'none' }}
              name="artUrl"
              label={formatMessage({ id: 'sys.market.elSound.link', desc: '链接' })}
              decorator={{
                initialValue: formData.artUrl || '',
              }}
            >
              <Input style={{ display: 'none' }} placeholder="请输入链接" />
            </Field>
            <Field
              name="artAuthor"
              label={formatMessage({ id: 'sys.market.elSound.auth', desc: '作者' })}
              decorator={{
                initialValue: formData.artAuthor || '',
              }}
            >
              <Input placeholder="请输入作者" />
            </Field>
            <Field
              name="artSource"
              label={formatMessage({ id: 'sys.market.elSound.artSource', desc: '来源' })}
              decorator={{
                initialValue: formData.artSource || '',
              }}
            >
              <Input placeholder="请输入来源" />
            </Field>
            <Field
              name="artOrtop"
              label={formatMessage({ id: 'sys.market.elSound.isTop', desc: '是否置顶' })}
              decorator={{
                initialValue: formData.artOrtop || 0,
              }}
            >
              <RadioGroup>
                <Radio value={1} defaultChecked="true">
                  是
                </Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="artSort"
              label={formatMessage({ id: 'sys.market.elSound.sort', desc: '排序' })}
              decorator={{
                initialValue: formData.artSort || '',
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入排序" />
            </Field>
            <Field
              style={{ display: 'none' }}
              name="readCount"
              label={formatMessage({ id: 'sys.market.elSound.readNum', desc: '阅读次数' })}
              decorator={{
                initialValue: formData.readCount || '',
              }}
            >
              <InputNumber
                style={{ display: 'none' }}
                className="x-fill-100"
                placeholder="请输入阅读次数"
              />
            </Field>
            {/* <Field name="artThumb" label="缩略图">
              <FileManagerEnhance
                api="/api/op/v1/article/sfs/token"
                listType="text"
                disabled={false}
                multiple={false}
                dataKey={formData.id}
              />
            </Field> */}
            {/* <Field  style={{display:'none'}}  name="attach" label="缩略图">
              <FormItem  style={{display:'none'}}
                fieldType="FileUpload"
                fieldKey="attach"
                fileList={attachments}
                accept=".jpg,.git,.png"
                // multiple 只能单选
              />
            </Field> */}

            <Field
              name="noticeScope"
              label="公告范围类型"
              decorator={{
                initialValue: 'ALL',
                rules: [{ required: true, message: '必填' }],
              }}
            >
              <BaseSelect
                parentKey="FUNCTION:SYSTEM_ARTICLE:NOTICE_TYPE"
                onChange={value => {
                  console.log('范围类型', value);
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
              {/* <UdcSelect code="OPE:ARTICLE_SendZone" placeholder="请选择公告范围类型" /> */}
            </Field>
            <Field name="objId" label="公告范围">
              <BaseSelect
                disabled={!formData.noticeScope || formData.noticeScope === 'ALL'}
                descList={objList}
                placeholder="请选择公告范围"
              />
            </Field>
            <Field
              name="remark"
              label={formatMessage({ id: 'sys.system.remark', desc: '备注' })}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
            {/*<Field*/}
            {/*  name="artContent"*/}
            {/*  label={formatMessage({ id: 'sys.market.elSound.artContent', desc: '文章内容' })}*/}
            {/*  fieldCol={1}*/}
            {/*  labelCol={{ span: 4, xxl: 3 }}*/}
            {/*  wrapperCol={{ span: 19, xxl: 20 }}*/}
            {/*  decorator={{*/}
            {/*    initialValue: formData.artContent || '',*/}
            {/*  }}*/}
            {/*>*/}
            {/*  <RichText />
            */}
            {/*  /!* <RichText onChange={value => console.warn(value)} /> *!/*/}
            {/*</Field>*/}
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
              initialContent=""
              ref={editor => {
                this.editor = editor;
              }}
            />
            <div
              style={{ marginTop: '10px' }}
              dangerouslySetInnerHTML={{ __html: formData.artContent }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BannerCreate;
