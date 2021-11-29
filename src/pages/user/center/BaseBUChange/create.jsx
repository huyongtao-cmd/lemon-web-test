import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Radio, Button, Divider, DatePicker } from 'antd';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { selectUsersWithBu } from '@/services/gen/list';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import moment from 'moment';
import { selectBuMultiCol } from '@/services/org/bu/bu';

const { Field } = FieldList;

const DOMAIN = 'changeBase';

@connect(({ loading, changeBase, dispatch, user }) => ({
  loading,
  changeBase,
  dispatch,
  user,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class BaseBUCreate extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      changeBase: { formData },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/baseBUChangeApply`,
          payload: {
            ...formData,
            ...values,
            applyResId: extInfo.resId,
            dateFrom: moment(values.dateFrom).format('YYYY-MM-DD'),
            oldPResId: formData.presId,
            oldBuId: formData.oldBuId,
          },
        });
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, validateFieldsAndScroll },
      changeBase: { formData },
      user: {
        user: { extInfo = {} }, // 取当前登录人的resId
      },
    } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/baseBUChangeApply`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            loading={loading.effects[`${DOMAIN}/baseBUChangeApply`]}
            onClick={this.handleSubmit}
            disabled={disabledBtn}
          >
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/user/flow/panel')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
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
                initialValue: formData.resId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择变更资源',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectUsersWithBu()}
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                showSearch
                dropdownMatchSelectWidth={false}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                onChange={e => {
                  dispatch({
                    type: `${DOMAIN}/query`,
                    payload: {
                      resId: e,
                    },
                  });
                }}
              />
            </Field>
            <Field
              name="oldBuId"
              label="BaseBU"
              decorator={{
                initialValue: formData.buName || '',
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="oldPResId"
              label="上级资源"
              decorator={{
                initialValue: formData.presName || '',
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
                rules: [
                  {
                    required: true,
                    message: '请输入新baseBU',
                  },
                ],
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
                initialValue: formData.newPResId || '',
                rules: [
                  {
                    required: true,
                    message: '请输入上级资源',
                  },
                ],
              }}
            >
              <Selection.Columns
                className="x-fill-100"
                source={() => selectUsersWithBu()}
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
              <DatePicker format="YYYY-MM-DD" className="x-fill-100" />
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
                initialValue: extInfo.resName || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: moment(new Date()).format('YYYY-MM-DD') || '',
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

export default BaseBUCreate;
