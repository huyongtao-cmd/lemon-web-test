import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import { Card, Row, Col, Input, Form, Button, DatePicker, Modal } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Ueditor from '@/components/common/Ueditor';
import FieldList from '@/components/layout/FieldList';
import { Selection, FileManagerEnhance } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';
import { selectIamUsers } from '@/services/gen/list';
import ResModal from './components/Res';
import Loading from '@/components/core/DataLoading';
import DescriptionList from '@/components/layout/DescriptionList';

import styles from './index.less';

const { Field } = FieldList;
const { Description } = DescriptionList;
const FieldListLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

// import styles from './index.less';
const DOMAIN = 'messageInfo';

@connect(({ loading, messageInfo, dispatch, user }) => ({
  loading,
  messageInfo,
  dispatch,
  user,
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
class MessageInfo extends React.PureComponent {
  state = {
    resVisible: false,
    resReset: true,
    userId: '',
  };

  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { userId },
        },
      },
    } = this.props;
    this.setState({
      userId,
    });
    dispatch({ type: `${DOMAIN}/queryMessageTag` });
    const { id } = fromQs();
    dispatch({
      type: 'messageInfo/updateState',
      payload: {
        formData: {},
        btnCanUse: true,
        // loading: true,
      },
    });
    id &&
      dispatch({
        type: 'messageInfo/queryMessageInfo',
        payload: {
          id,
        },
      });
    dispatch({ type: `${DOMAIN}/selectUser` });
    dispatch({ type: `${DOMAIN}/selectBus` });
    dispatch({ type: `${DOMAIN}/queryRoleList` });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageInfo/updateState',
      payload: {
        loading: true,
      },
    });
  }

  preview = () => {
    const releaseBody = this.editor.getContent();
    this.setState({
      visible: true,
      releaseContent: releaseBody,
    });
  };

  handleSave = msgType => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const releaseBody = this.editor.getContent();
    const { id } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const form = {
          ...values,
          releaseBody,
          isPublish: msgType,
        };
        if (id) {
          form.id = id;
        }
        const saveMsg = () => {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: form,
          });
          dispatch({
            type: `${DOMAIN}/updateState`,
            payload: {
              btnCanUse: false,
            },
          });
        };
        if (msgType === 'publish') {
          dispatch({
            type: `${DOMAIN}/updateForm`,
            payload: {
              ...form,
            },
          });
          this.setState({
            resVisible: true,
          });
        } else {
          saveMsg();
        }
      }
    });
  };

  toggleRes = () => {
    const { resVisible } = this.state;
    this.setState({
      resVisible: !resVisible,
    });
  };

  toggleReset = () => {
    const { resReset } = this.state;
    this.setState({
      resReset: !resReset,
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const { nowTitle, visible } = this.state;
    const {
      dispatch,
      form,
      messageInfo: { formData, tagSource, btnCanUse, cmsInfo, loading = true },
    } = this.props;
    const { getFieldDecorator } = form;
    const { resVisible, resReset, userId, releaseContent } = this.state;
    const { id } = fromQs();
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
    return (
      <PageHeaderWrapper title="编辑消息">
        {loading && id ? (
          <Loading />
        ) : (
          <div>
            <Card className="tw-card-rightLine">
              <Button
                className="tw-btn-primary"
                type="primary"
                icon="save"
                size="large"
                disabled={!btnCanUse}
                // loading={loading}
                onClick={() => this.handleSave('save')}
              >
                保存
              </Button>
              <Button
                className="tw-btn-primary"
                type="primary"
                icon="save"
                size="large"
                disabled={!btnCanUse}
                // loading={loading}
                onClick={() => this.handleSave('publish')}
              >
                发布
              </Button>
              <Button
                className="tw-btn-primary"
                type="primary"
                icon="eye"
                size="large"
                disabled={!btnCanUse}
                // loading={loading}
                onClick={() => this.preview()}
              >
                预览
              </Button>
            </Card>
            <Modal
              centered
              title="消息预览"
              visible={visible}
              confirmLoading={false}
              onOk={() => this.toggleVisible()}
              onCancel={() => this.toggleVisible()}
              width={1000}
              footer={[
                <Button
                  className="tw-btn-primary"
                  style={{ backgroundColor: '#284488' }}
                  key="makeSure"
                  onClick={() => this.toggleVisible()}
                >
                  确定
                </Button>,
              ]}
            >
              <div
                style={{
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bolder',
                  marginBottom: '10px',
                }}
              >
                消息预览
              </div>
              <Card bordered={false}>
                <DescriptionList size="large" col={2}>
                  <Description term="标题">{formData.releaseTitle}</Description>
                  <Description term="发布来源">{formData.releaseSource}</Description>
                  <Description term="消息类型">
                    {/* eslint-disable-next-line */}
                    {formData.releaseType === 'SYSTEM_MESSAGES'
                      ? '系统消息'
                      : formData.releaseType === 'PUBLIC_NOTICE'
                        ? '公司公告'
                        : ''}
                  </Description>
                  <Description term="发布时间">{formData.releaseTime}</Description>
                </DescriptionList>
                <div
                  className={`${
                    styles.paper
                  } ant-col-xs-20 ant-col-sm-20 ant-col-md-20 ant-col-lg-20 ant-col-xl-18 ant-col-xxl-15`}
                  dangerouslySetInnerHTML={{ __html: releaseContent }}
                />
              </Card>
            </Modal>
            <Card title="编辑消息">
              <FieldList
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
                className={styles.formWrap}
                // hasSeparator={1}
              >
                <Field
                  name="releaseTitle"
                  label="标题"
                  decorator={{
                    initialValue: formData.releaseTitle,
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

                {/* <Field
                  name="releaseUserId"
                  label="发布者"
                  decorator={{
                    initialValue: formData.releaseUserId
                      ? parseInt(formData.releaseUserId, 10)
                      : userId,
                    rules: [
                      {
                        required: true,
                        message: '请选择发布者',
                      },
                    ],
                  }}
                >
                  <Selection.Columns
                    source={selectIamUsers}
                    columns={[
                      { dataIndex: 'code', title: '编号', span: 10 },
                      { dataIndex: 'name', title: '名称', span: 14 },
                    ]}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    placeholder="请选择发布者"
                    showSearch
                  />
                </Field> */}

                <Field
                  name="releaseType"
                  label="消息类型"
                  decorator={{
                    initialValue: formData.releaseType,
                    rules: [
                      {
                        required: true,
                        message: '请选择消息类型',
                      },
                    ],
                  }}
                >
                  <Selection.UDC code="ACC:MESSAGE_TPYE" placeholder="请选择消息类型" />
                </Field>

                <Field
                  name="releaseLevel"
                  label="消息级别"
                  decorator={{
                    initialValue: formData.releaseLevel,
                    rules: [
                      {
                        required: true,
                        message: '请选择消息级别',
                      },
                    ],
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
                  <Selection.UDC
                    mode="multiple"
                    code="ACC:NOTICE_WAY"
                    placeholder="请选择通知方式"
                  />
                </Field>
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
                {/* <Field
              name="attache"
              label="附件"
              decorator={{
                initialValue: formData.attache,
              }}
            >
              <FileManagerEnhance
                api="/api/worth/v1/invBatchs/sfs/token"
                dataKey={formData.id}
                listType="text"
                // // disabled={false}
                // disabled={status === '4'}
              />
            </Field> */}
              </FieldList>

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
                <Ueditor
                  id="messageEditor"
                  height="400"
                  width="100%"
                  initialContent={id ? formData.releaseBody : ''}
                  ref={editor => {
                    this.editor = editor;
                  }}
                />
              </div>
            </Card>
            <ResModal
              visible={resVisible}
              reset={resReset}
              toggle={this.toggleRes}
              toggleReset={this.toggleReset}
              targetKeys={[]}
              form={form}
            />
          </div>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default MessageInfo;
