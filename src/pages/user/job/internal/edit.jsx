import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isEmpty } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'internalEdit';

@connect(({ loading, internalEdit, recruit, dispatch }) => ({
  loading,
  internalEdit,
  recruit,
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
class RecruitEdit extends PureComponent {
  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/queryUserMessage` }); // 拉取个人信息

    dispatch({ type: `${DOMAIN}/res` });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      recruit: { searchForm },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/submit`,
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      internalEdit: { formData, resDataSource },
    } = this.props;

    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              if (from.includes('internal') || from.includes('job')) {
                closeThenGoto(`${from}?_refresh=0`);
              } else {
                closeThenGoto(`${from}`);
              }
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={
            <Title icon="profile" id="ui.menu.plat.res.jobInternal" defaultMessage="岗位内部推荐" />
          }
          bordered={false}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="recommName"
              label="被推荐人"
              decorator={{
                initialValue: formData.recommName || '',
                rules: [
                  {
                    required: true,
                    message: '请输入被推荐人名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入被推荐人名称" />
            </Field>
            <Field
              name="recommMobile"
              label="被推荐人手机号"
              decorator={{
                initialValue: formData.recommMobile || '',
                rules: [
                  {
                    required: true,
                    message: '请输入被推荐人手机号',
                  },
                ],
              }}
            >
              <Input placeholder="请输入被推荐人手机号" />
            </Field>
            <Field
              name="artThumb"
              label="被推荐人简历"
              decorator={{
                initialValue: formData.artThumb || '',
                rules: [
                  {
                    required: true,
                    message: '请上传被推荐人简历',
                  },
                ],
              }}
            >
              <FileManagerEnhance
                api="/api/person/v1/jobInternalRecomm/sfs/token"
                listType="text"
                multiple={false}
              />
            </Field>
            <Field
              name="relationship"
              label="与推荐人关系"
              decorator={{
                initialValue: formData.relationship || '',
                rules: [
                  {
                    required: true,
                    message: '请输入与推荐人关系',
                  },
                ],
              }}
            >
              <Input placeholder="请输入与推荐人关系" />
            </Field>

            <Field
              name="recommReason"
              label="推荐理由"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.recommReason || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入推荐理由" />
            </Field>

            <Field
              name="resId"
              label="推荐人"
              decorator={{
                initialValue: formData.resId || '',
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={resDataSource}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {}}
                disabled
              />
            </Field>
            <Field
              name="recommDate"
              label="推荐日期"
              decorator={{
                initialValue: formData.recommDate || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default RecruitEdit;
