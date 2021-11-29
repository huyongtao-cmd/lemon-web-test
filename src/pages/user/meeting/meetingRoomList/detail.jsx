import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectIamUsers } from '@/services/gen/list';
import Loading from '@/components/core/DataLoading';

const { Field } = FieldList;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'meetingRoomListDetail';
@connect(({ loading, meetingRoomListDetail, dispatch, user }) => ({
  loading,
  meetingRoomListDetail,
  dispatch,
  user,
}))
@Form.create()
@mountToTab()
class MeetingRoomListDetail extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: {
        user: {
          extInfo: { userId },
        },
      },
    } = this.props;
    const { mode, id } = fromQs();
    dispatch({ type: `${DOMAIN}/queryDetail`, payload: { mode, id: isNil(id) ? '' : id, userId } });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      meetingRoomListDetail,
      dispatch,
    } = this.props;
    const { searchForm } = meetingRoomListDetail;
    const { mode, id } = fromQs();

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { mode, values, id: isNil(id) ? '' : id },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/user/meetingManage/meetingRoomList/index?_refresh=0');
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  radioChange = val => {};

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      meetingRoomListDetail,
    } = this.props;
    const { mode } = fromQs();
    const { currentItem } = meetingRoomListDetail;
    // loading完成之前将按钮设为禁用
    const saveBtn = loading.effects[`${DOMAIN}/save`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          {mode !== 'view' ? (
            <Button
              className="tw-btn-primary"
              icon="save"
              loading={saveBtn}
              size="large"
              onClick={this.handleSubmit}
            >
              {formatMessage({ id: `misc.save`, desc: '保存' })}
            </Button>
          ) : (
            ''
          )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              closeThenGoto('/user/meetingManage/meetingRoomList/index?_refresh=0');
              // closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="会议室" />}
          bordered={false}
        >
          {!queryBtn ? (
            <>
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="meetingName"
                  label="会议室名称"
                  decorator={{
                    initialValue: currentItem.meetingName ? currentItem.meetingName : '',
                    rules: [
                      {
                        required: true,
                        message: '请输入会议室名称',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入会议室名称" disabled={mode === 'view'} />
                </Field>
                <Field
                  name="meetingPlace"
                  label="会议室地点"
                  decorator={{
                    initialValue: currentItem.meetingPlace ? currentItem.meetingPlace : '',
                    rules: [
                      {
                        required: true,
                        message: '请输入会议室地点',
                      },
                    ],
                  }}
                >
                  <Input placeholder="请输入会议室地点" disabled={mode === 'view'} />
                </Field>
              </FieldList>
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="meetingRoomStatus"
                  label="会议室状态"
                  decorator={{
                    rules: [
                      {
                        required: true,
                        message: '请输入会议室状态',
                      },
                    ],
                    initialValue: currentItem.meetingRoomStatus || undefined,
                  }}
                >
                  <UdcSelect
                    code="RES:MEETING_ROOM_STATUS"
                    placeholder="请选择状态"
                    disabled={mode === 'view'}
                  />
                </Field>
              </FieldList>
              <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="createTime"
                  label="创建时间"
                  decorator={{
                    initialValue: currentItem.createTime ? currentItem.createTime : '',
                  }}
                >
                  <DatePicker className="x-fill-100" format="YYYY-MM-DD" disabled />
                </Field>
                <Field
                  name="createUserId"
                  label="创建人"
                  decorator={{
                    initialValue: currentItem.createUserId || undefined,
                  }}
                >
                  <Selection.Columns
                    className="x-fill-100"
                    source={() => selectIamUsers()}
                    columns={particularColumns}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    dropdownMatchSelectWidth
                    showSearch
                    onColumnsChange={value => {}}
                    placeholder="请选择创建人"
                    disabled
                  />
                </Field>
              </FieldList>
            </>
          ) : (
            <Loading />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MeetingRoomListDetail;
