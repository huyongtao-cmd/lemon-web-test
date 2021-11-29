import React from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import { Card, Row, Col, Input, Form, Button } from 'antd';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import RichText from '@/components/common/RichText';
import Ueditor from '@/components/common/Ueditor';
import FieldList from '@/components/layout/FieldList';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { fromQs } from '@/utils/stringUtils';

import styles from './index.less';

const { Field } = FieldList;

// import styles from './index.less';
const DOMAIN = 'issueFeedback';

@connect(({ loading, issueFeedback, dispatch }) => ({
  loading,
  issueFeedback,
  dispatch,
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
class issueFeedback extends React.PureComponent {
  state = {
    // richTextContent: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'issueFeedback/clean',
    });
    dispatch({
      type: 'issueFeedback/query',
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      issueFeedback: { formData },
      dispatch,
    } = this.props;
    // const { richTextContent } = this.state;
    const richTextContent = this.editor.getContent();
    const { fromPage = '' } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        if (!richTextContent || richTextContent.replace(/(^\s*)|(\s*$)/g, '').length < 12) {
          createMessage({ type: 'error', description: '反馈内容最少需要5个字' });
          return;
        }
        if (formData.problemTitle.replace(/(^\s*)|(\s*$)/g, '').length > 80) {
          createMessage({ type: 'error', description: '反馈标题最长80个字符' });
          return;
        }
        const form = {
          ...formData,
          problemContent: richTextContent,
          problemUrl: markAsTab(fromPage),
          problemTitle: formData.problemTitle.replace(/(^\s*)|(\s*$)/g, ''),
        };
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
      }
    });
  };

  // getRichText = value => {
  //   this.setState({
  //     richTextContent: value,
  //   });
  // };

  render() {
    const {
      form,
      issueFeedback: { formData, btnCanUse, cmsInfo },
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <PageHeaderWrapper title="问题反馈">
        <Card title="问题反馈">
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            className={styles.formWrap}
            // hasSeparator={1}
          >
            <Field
              name="problemTitle"
              label="反馈标题:"
              decorator={{
                initialValue: formData.problemTitle,
                rules: [
                  {
                    required: true,
                    message: '请输入反馈标题',
                  },
                ],
              }}
            >
              <Input placeholder="反馈标题最长80个字符" />
            </Field>

            <Field
              name="problemType"
              label="反馈分类:"
              decorator={{
                initialValue: formData.problemType,
                rules: [
                  {
                    required: true,
                    message: '请选择反馈分类',
                  },
                ],
              }}
            >
              <Selection.UDC code="APM:PROBLEM_TYPE" placeholder="请选择反馈分类" />
            </Field>
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
            <div style={{ marginTop: '10px' }} dangerouslySetInnerHTML={{ __html: cmsInfo }} />
          </div>

          <div style={{ textAlign: 'center', margin: '50px auto' }}>
            <Button
              className="tw-btn-primary"
              type="primary"
              // icon="save"
              size="large"
              disabled={!btnCanUse}
              onClick={() => this.handleSave()}
            >
              提交反馈
            </Button>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default issueFeedback;
