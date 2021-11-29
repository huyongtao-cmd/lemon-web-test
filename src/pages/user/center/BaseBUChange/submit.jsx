import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Radio, Button, Divider } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { selectUsersWithBu } from '@/services/gen/list';
import { Selection, DatePicker } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import moment from 'moment';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'baseChangeFlow';

@connect(({ loading, baseChangeFlow, dispatch, user }) => ({
  loading,
  baseChangeFlow,
  dispatch,
  user,
}))
@mountToTab()
class BaseBUSubmit extends Component {
  componentDidMount() {
    const {
      dispatch,
      baseChangeFlow: { fieldsConfig, formData },
    } = this.props;
    const {
      // panels: { disabledOrHidden },
      taskKey,
    } = fieldsConfig;
    const { id, taskId, mode } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: id,
    });
  }

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll, setFieldsValue },
      baseChangeFlow: { formData, baseBuData, fieldsConfig, oldPResId },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;

    const { id, mode } = fromQs();

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="BaseBU变更申请" />}
          bordered={false}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="原BU"
          >
            <Field
              name="resId"
              label="变更资源"
              decorator={{
                initialValue: formData.resName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="oldBuId"
              label="BaseBU"
              decorator={{
                initialValue: formData.oldBuName || '',
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="oldPResId"
              label="上级资源"
              decorator={{
                initialValue: formData.oldPResName || '',
              }}
            >
              <Input disabled />
            </Field>
          </FieldList>
          <Divider dashed />
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            legend="新BU"
          >
            <Field
              name="newBuId"
              label="新BaseBU"
              decorator={{
                initialValue: formData.newBuId || '',
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectBuMultiCol()}
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
              />
            </Field>
            <Field
              name="newPResId"
              label="上级资源"
              decorator={{
                initialValue: formData.newPResName || '',
              }}
            >
              <Selection.Columns
                source={selectUsersWithBu}
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                placeholder="上级资源"
                showSearch
              />
            </Field>
            <Field
              name="dateFrom"
              label="加入时间"
              decorator={{
                initialValue: formData.dateFrom,
              }}
            >
              <DatePicker
                format="YYYY-MM-DD"
                className="x-fill-100"
                onChange={this.onChange}
                // value={moment(formData.dateFrom)}
              />
            </Field>
            <Field
              name="changeDesc"
              label="变更说明"
              decorator={{
                initialValue: formData.changeDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入变更说明" />
            </Field>
            <Field
              name="applyResId"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate || '',
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

export default BaseBUSubmit;
