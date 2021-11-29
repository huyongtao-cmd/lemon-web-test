import React, { PureComponent } from 'react';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { Card, Input, Button, Form, Checkbox, Radio } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { isEmpty, isNil } from 'ramda';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';
import { Selection, DatePicker } from '@/pages/gen/field';
import Ueditor from '@/components/common/Ueditor';
import createMessage from '@/components/core/AlertMessage';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const { Field, FieldLine } = FieldList;
const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const DOMAIN = 'messageConfigEdit';

@connect(({ loading, messageConfigEdit, dispatch, user, messageConfigList }) => ({
  loading,
  messageConfigEdit,
  dispatch,
  user,
  messageConfigList,
}))
@Form.create({
  onValuesChange(props, changedFields) {
    const { id } = fromQs();
    if (!isEmpty(changedFields)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedFields,
      });
    }
  },
})
class MessageConfigEdit extends PureComponent {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/cleanFormData` });
    dispatch({ type: `${DOMAIN}/queryMessageTag` });
    dispatch({ type: `${DOMAIN}/roles` });
    dispatch({ type: `${DOMAIN}/res` });
    dispatch({ type: `${DOMAIN}/bu` });

    // 有id修改
    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { loadFinish: false },
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      messageConfigList: { searchForm },
    } = this.props;
    const configurationContent = this.editor.getContent();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { id } = fromQs();
        if (id) {
          dispatch({
            type: `${DOMAIN}/edit`,
            payload: {
              configurationContent,
            },
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto('/sys/system/MessageConfig?_refresh=0');
              dispatch({ type: 'messageConfigList/query', payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        } else {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: {
              configurationContent,
            },
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto('/sys/system/MessageConfig?_refresh=0');
              dispatch({ type: 'messageConfigList/query', payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        }
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      messageConfigEdit: {
        formData,
        resDataSource,
        baseBuDataSource,
        tagSource,
        dataSource,
        loadFinish,
      },
    } = this.props;
    const { id } = fromQs();
    let editorFlag = false;
    if (!id) {
      editorFlag = true;
    } else if (loadFinish) {
      editorFlag = true;
    }
    const { messageTag } = formData;
    const result = [];
    if (messageTag && Array.isArray(messageTag) && messageTag.length > 0) {
      tagSource.forEach(tag => {
        messageTag.forEach(tagNo => {
          if (tagNo === tag.tagNo) {
            result.push(tagNo);
          }
        });
      });
      if (result.length !== messageTag.length) {
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: {
            messageTag: result,
          },
        });
      }
    }

    let noticePlaceholder = '';
    if (!formData.noticeScope || formData.noticeScope === 'FULL') {
      noticePlaceholder = '系统自动生成';
    } else if (formData.noticeScope === 'SPECIFY_ROLE') {
      noticePlaceholder = '请选择指定角色';
    } else if (formData.noticeScope === 'SPECIFY_BU') {
      noticePlaceholder = '请选择指定BU';
    } else if (formData.noticeScope === 'SPECIFY_PERSON') {
      noticePlaceholder = '请选择指定人';
    }
    let source = [];
    if (formData.noticeScope === 'SPECIFY_ROLE') {
      source = dataSource;
    } else if (formData.noticeScope === 'SPECIFY_BU') {
      source = baseBuDataSource;
    } else if (formData.noticeScope === 'SPECIFY_PERSON') {
      source = resDataSource;
    }
    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/save`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];
    const editBtn = loading.effects[`${DOMAIN}/edit`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn || editBtn || queryBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="基本信息" />}
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="configurationTitle"
              label="标题"
              decorator={{
                initialValue: formData.configurationTitle,
                rules: [
                  {
                    required: true,
                    message: '请输入标题',
                  },
                ],
              }}
            >
              <Input placeholder="请输入标题" />
            </Field>
            <Field
              name="configurationNo"
              label="消息编码"
              decorator={{
                initialValue: formData.configurationNo || '',
              }}
            >
              <Input placeholder="请输入消息编码" />
            </Field>
            <Field
              name="contentType"
              label="内容类型"
              decorator={{
                initialValue: formData.contentType,
                rules: [
                  {
                    required: true,
                    message: '请选择内容类型',
                  },
                ],
              }}
            >
              <Selection.UDC code="ACC:MESSAGE_TPYE" placeholder="请选择内容类型" disabled />
            </Field>
            <Field
              name="releaseSource"
              label="发布来源"
              decorator={{
                initialValue: formData.releaseSource,
                rules: [
                  {
                    required: true,
                    message: '请输入发布来源',
                  },
                ],
              }}
            >
              <Input placeholder="请输入发布来源" />
            </Field>
            <Field
              name="releaseLevel"
              label="消息级别"
              decorator={{
                initialValue: formData.releaseLevel,
              }}
            >
              <Selection.UDC code="ACC:MESSAGE_LEVEL" placeholder="请选择消息级别" />
            </Field>
            <Field
              name="noticeWay"
              label="通知方式"
              decorator={{
                initialValue: Array.isArray(formData.noticeWay)
                  ? formData.noticeWay
                  : formData.noticeWay && formData.noticeWay.split(','),
                rules: [
                  {
                    required: true,
                    message: '请选择通知方式',
                  },
                ],
              }}
            >
              <Selection.UDC mode="multiple" code="ACC:NOTICE_WAY" placeholder="请选择通知方式" />
            </Field>
            <FieldLine label="通知范围" required>
              <Field
                name="noticeScope"
                decorator={{
                  initialValue: formData.noticeScope,
                  rules: [
                    {
                      required: true,
                      message: '请选择通知范围',
                    },
                  ],
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Selection.UDC
                  code="ACC:NOTICE_SCOPE"
                  placeholder="请选择通知范围"
                  onChange={value => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        roles: undefined,
                      },
                    });
                    setFieldsValue({
                      roles: undefined,
                    });
                  }}
                />
              </Field>
              {!formData.noticeScope ||
              formData.noticeScope === 'FULL' ||
              formData.noticeScope === 'SPECIFY_ROLE' ||
              formData.noticeScope === 'SPECIFY_BU' ||
              formData.noticeScope === 'SPECIFY_PERSON' ? (
                <Field
                  name="roles"
                  decorator={{
                    initialValue: formData.roles,
                  }}
                  wrapperCol={{ span: 23, xxl: 23 }}
                  getFieldDecorator={getFieldDecorator}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={source}
                    // columns={particularColumns}
                    transfer={
                      formData.noticeScope === 'SPECIFY_ROLE'
                        ? { key: 'valCode', code: 'valCode', name: 'name' }
                        : { key: 'id', code: 'id', name: 'name' }
                    }
                    dropdownMatchSelectWidth={false}
                    showSearch
                    placeholder={noticePlaceholder}
                    mode="multiple"
                    disabled={!!(!formData.noticeScope || formData.noticeScope === 'FULL')}
                  />
                </Field>
              ) : (
                <Field
                  name="roles"
                  decorator={{
                    initialValue: formData.roles,
                  }}
                  wrapperCol={{ span: 23, xxl: 23 }}
                  getFieldDecorator={getFieldDecorator}
                >
                  <Input
                    placeholder={
                      formData.noticeScope === 'EXPRESSION' ? '请输入表达式' : '请输入特殊说明'
                    }
                  />
                </Field>
              )}
            </FieldLine>
            <Field
              name="messageTag"
              label="消息标签"
              decorator={{
                initialValue: formData.messageTag,
                rules: [
                  {
                    required: false,
                    message: '请选择消息标签',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={tagSource}
                transfer={{ key: 'id', code: 'tagNo', name: 'tagName' }}
                dropdownMatchSelectWidth={false}
                showSearch
                placeholder="请选择消息标签"
                mode="multiple"
              />
            </Field>
            <Field
              name="triggerMode"
              label="触发方式"
              decorator={{
                initialValue: formData.triggerMode,
                rules: [
                  {
                    required: true,
                    message: '请选择触发方式',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="ACC:TRIGGER_MODE"
                placeholder="请选择触发方式"
                onChange={e => {
                  if (id) {
                    if (e === 'EVENTS_TRIGGER') {
                      dispatch({
                        type: `${DOMAIN}/updateForm`,
                        payload: {
                          triggerTimeExpression: undefined,
                        },
                      });
                      setFieldsValue({
                        triggerTimeExpression: undefined,
                      });
                    }
                  } else if (e === 'TIME_TRIGGER') {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        triggerModeDesc: undefined,
                      },
                    });
                    setFieldsValue({
                      triggerModeDesc: undefined,
                    });
                  }
                }}
              />
            </Field>
            {formData.triggerMode === 'EVENTS_TRIGGER' ? (
              <Field
                name="triggerModeDesc"
                label="事件触发说明"
                decorator={{
                  initialValue: formData.triggerModeDesc,
                  rules: [
                    {
                      required: true,
                      message: '请输入事件触发说明',
                    },
                  ],
                }}
              >
                <Input placeholder="请输入事件触发说明" />
              </Field>
            ) : null}
            {formData.triggerMode === 'TIME_TRIGGER' ? (
              <Field
                name="triggerTimeExpression"
                label="时间表达式"
                decorator={{
                  initialValue: formData.triggerTimeExpression,
                  rules: [
                    {
                      required: true,
                      message: '请输入时间表达式',
                    },
                  ],
                }}
              >
                <Input placeholder="请输入时间表达式" />
              </Field>
            ) : null}

            <Field
              name="enabledFlag"
              label="是否有效"
              decorator={{
                initialValue: formData.enabledFlag,
                rules: [
                  {
                    required: true,
                    message: '请选择是否有效',
                  },
                ],
              }}
            >
              <RadioGroup>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </RadioGroup>
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark,
                rules: [{ required: false, message: '请输入备注' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} maxLength={400} placeholder="请输入备注" />
            </Field>
            <Field
              name="expressionDesc"
              label="表达式说明"
              decorator={{
                initialValue: formData.expressionDesc,
                rules: [{ required: false, message: '请输入表达式说明' }],
              }}
            >
              <Input placeholder="请输入表达式说明" />
            </Field>
          </FieldList>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="消息内容" />}
          bordered={false}
        >
          <div
            className="ant-col-xs-24 ant-col-sm-24 ant-col-md-24 ant-col-lg-24 ant-col-xl-22 ant-col-xxl-19"
            style={{
              margin: '20px 0 60px 25px',
            }}
          >
            {/* <RichText
              onChange={value => {
                this.getRichText(value);
              }}
            /> */}
            {editorFlag ? (
              <Ueditor
                id="messageEditor"
                height="400"
                width="100%"
                initialContent={id ? formData.configurationContent : ''}
                ref={editor => {
                  this.editor = editor;
                }}
              />
            ) : null}
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MessageConfigEdit;
