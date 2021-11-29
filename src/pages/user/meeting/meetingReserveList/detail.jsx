import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, Select, TimePicker } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import Loading from '@/components/core/DataLoading';

const { Field, FieldLine } = FieldList;
const DOMAIN = 'meetingReserveListDetail';
@connect(({ loading, meetingReserveListDetail, dispatch, user }) => ({
  loading,
  meetingReserveListDetail,
  dispatch,
  user,
}))
@Form.create()
@mountToTab()
class MeetingReserveListDetail extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      user: { user },
    } = this.props;
    const {
      extInfo: { resName, baseBuName },
    } = user;
    const { mode, id, formPage, date, meetingName } = fromQs();
    dispatch({ type: `${DOMAIN}/getMeetingRoom` });
    dispatch({
      type: `${DOMAIN}/queryDetail`,
      payload: {
        mode,
        id: isNil(id) ? '' : id,
        resName,
        baseBuName,
        formPage: isNil(formPage) ? '' : formPage,
        meetingName: isNil(meetingName) ? '' : meetingName,
        date: isNil(date) ? '' : date,
      },
    });
    // 获取自定义配置
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'MEETING_DETAIL' },
    });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      meetingReserveListDetail,
      dispatch,
      user: { user },
    } = this.props;
    const { searchForm } = meetingReserveListDetail;
    const { mode, id } = fromQs();
    const {
      extInfo: { baseBuId },
    } = user;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { mode, values, id: isNil(id) ? '' : id, buId: baseBuId },
        }).then(response => {
          if (response.ok) {
            createMessage({ type: 'success', description: '操作成功' });
            closeThenGoto('/user/meetingManage/meetingReserveList/index?_refresh=0');
          } else {
            createMessage({ type: 'error', description: response.reason || '操作失败' });
          }
        });
      }
    });
  };

  radioChange = val => {};

  renderPageConfig = () => {
    const { meetingReserveListDetail, loading } = this.props;
    const { currentItem, pageConfig, meetingRoomList } = meetingReserveListDetail;
    const { mode } = fromQs();
    if (pageConfig) {
      if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
        return <div />;
      }
      const currentBlockConfig = pageConfig.pageBlockViews[0];
      const { pageFieldViews } = currentBlockConfig;
      const pageFieldJson = {};
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const fields = [
        <Field
          name="meetingName"
          label={pageFieldJson.meetingName.displayName}
          sortNo={pageFieldJson.meetingName.sortNo}
          decorator={{
            initialValue: currentItem.meetingName ? currentItem.meetingName : undefined,
            rules: [
              {
                required: pageFieldJson.meetingName.requiredFlag,
                message: `请选择${pageFieldJson.meetingName.displayName}`,
              },
            ],
          }}
        >
          <Select
            className="x-fill-100"
            loading={loading.effects[`${DOMAIN}/getMeetingRoom`]}
            placeholder={`请选择${pageFieldJson.meetingName.displayName}`}
            disabled={mode === 'view'}
          >
            {meetingRoomList.length > 0 &&
              meetingRoomList.map(item => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
          </Select>
        </Field>,
        <Field
          name="meetingPn"
          label={pageFieldJson.meetingPn.displayName}
          sortNo={pageFieldJson.meetingPn.sortNo}
          decorator={{
            initialValue: currentItem.meetingPn ? currentItem.meetingPn : '',
            rules: [
              {
                required: pageFieldJson.meetingPn.requiredFlag,
                message: `请输入${pageFieldJson.meetingPn.displayName}`,
              },
            ],
          }}
        >
          <Input
            placeholder={`请输入${pageFieldJson.meetingPn.displayName}`}
            disabled={mode === 'view'}
          />
        </Field>,
        <FieldLine
          label={pageFieldJson.startDate.displayName}
          sortNo={pageFieldJson.startDate.sortNo}
          required={pageFieldJson.startDate.requiredFlag}
        >
          <Field
            name="startDate"
            wrapperCol={{ span: 23, xxl: 23 }}
            decorator={{
              initialValue: currentItem.startDate || undefined,
              rules: [
                {
                  required: pageFieldJson.startDate.requiredFlag,
                  message: `请选择${pageFieldJson.startDate.displayName}`,
                },
              ],
            }}
          >
            <DatePicker
              placeholder={`请选择${pageFieldJson.startDate.displayName}`}
              className="x-fill-100"
              disabled={mode === 'view'}
            />
          </Field>
          <Field
            name="starTime"
            wrapperCol={{ span: 24, xxl: 24 }}
            decorator={{
              initialValue: currentItem.starTime || undefined,
              rules: [
                {
                  required: pageFieldJson.starTime.requiredFlag,
                  message: `请选择${pageFieldJson.starTime.displayName}`,
                },
              ],
            }}
          >
            <TimePicker
              format="HH:mm"
              placeholder={`请选择${pageFieldJson.starTime.displayName}`}
              className="x-fill-100"
              disabled={mode === 'view'}
            />
          </Field>
        </FieldLine>,
        <FieldLine
          label={pageFieldJson.endDate.displayName}
          sortNo={pageFieldJson.endDate.sortNo}
          required={pageFieldJson.endDate.requiredFlag}
        >
          <Field
            name="endDate"
            wrapperCol={{ span: 23, xxl: 23 }}
            decorator={{
              initialValue: currentItem.endDate || undefined,
              rules: [
                {
                  required: pageFieldJson.endDate.requiredFlag,
                  message: `请选择${pageFieldJson.endDate.displayName}`,
                },
              ],
            }}
          >
            <DatePicker
              placeholder={`请选择${pageFieldJson.endDate.displayName}`}
              className="x-fill-100"
              disabled={mode === 'view'}
            />
          </Field>
          <Field
            name="endTime"
            wrapperCol={{ span: 24, xxl: 24 }}
            decorator={{
              initialValue: currentItem.endTime || undefined,
              rules: [
                {
                  required: pageFieldJson.endTime.requiredFlag,
                  message: `请选择${pageFieldJson.endTime.displayName}`,
                },
              ],
            }}
          >
            <TimePicker
              format="HH:mm"
              placeholder={`请选择${pageFieldJson.endTime.displayName}`}
              className="x-fill-100"
              disabled={mode === 'view'}
            />
          </Field>
        </FieldLine>,
        <Field
          name="isNeedPhone"
          key="isNeedPhone"
          label={pageFieldJson.isNeedPhone.displayName}
          sortNo={pageFieldJson.isNeedPhone.sortNo}
          decorator={{
            initialValue: currentItem.isNeedPhone,
            rules: [
              {
                required: pageFieldJson.isNeedPhone.requiredFlag,
                message: `请选择${pageFieldJson.isNeedPhone.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="COM:YESNO"
            placeholder={`请选择${pageFieldJson.isNeedPhone.displayName}`}
            disabled={mode === 'view'}
          />
        </Field>,
        <Field
          name="isNeedProjector"
          key="isNeedProjector"
          label={pageFieldJson.isNeedProjector.displayName}
          sortNo={pageFieldJson.isNeedProjector.sortNo}
          decorator={{
            initialValue: currentItem.isNeedProjector,
            rules: [
              {
                required: pageFieldJson.isNeedProjector.requiredFlag,
                message: `请选择${pageFieldJson.isNeedProjector.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="COM:YESNO"
            placeholder={`请选择${pageFieldJson.isNeedProjector.displayName}`}
            disabled={mode === 'view'}
          />
        </Field>,
        <Field
          name="isNeedVideo"
          key="isNeedVideo"
          label={pageFieldJson.isNeedVideo.displayName}
          sortNo={pageFieldJson.isNeedVideo.sortNo}
          decorator={{
            initialValue: currentItem.isNeedVideo,
            rules: [
              {
                required: pageFieldJson.isNeedVideo.requiredFlag,
                message: `请选择${pageFieldJson.isNeedVideo.displayName}`,
              },
            ],
          }}
        >
          <Selection.UDC
            code="COM:YESNO"
            placeholder={`请选择${pageFieldJson.isNeedVideo.displayName}`}
            disabled={mode === 'view'}
          />
        </Field>,
        <Field
          name="createUserName"
          label="创建人"
          decorator={{
            initialValue: currentItem.createUserName || undefined,
          }}
        >
          <Input disabled />
        </Field>,
        <Field
          name="buName"
          label="申请人BU"
          decorator={{
            initialValue: currentItem.buName ? currentItem.buName : '',
          }}
        >
          <Input disabled />
        </Field>,
        <Field
          name="createTime"
          label="创建时间"
          decorator={{
            initialValue: currentItem.createTime ? currentItem.createTime : '',
          }}
        >
          <DatePicker placeholder="请输入申请时间" disabled />
        </Field>,
        <Field
          name="note"
          label={pageFieldJson.note.displayName}
          sortNo={pageFieldJson.note.sortNo}
          decorator={{
            initialValue: currentItem.note || '',
            rules: [
              {
                required: pageFieldJson.note.requiredFlag,
                message: `请输入${pageFieldJson.note.displayName}`,
              },
            ],
          }}
          fieldCol={1}
          labelCol={{ span: 4, xxl: 3 }}
          wrapperCol={{ span: 19, xxl: 20 }}
        >
          <Input.TextArea
            rows={3}
            placeholder={mode === 'view' ? '' : `请输入${pageFieldJson.note.displayName}`}
            disabled={mode === 'view'}
          />
        </Field>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return filterList;
    }
    return '';
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      meetingReserveListDetail,
    } = this.props;
    const { mode } = fromQs();
    const { currentItem, meetingRoomList } = meetingReserveListDetail;
    // loading完成之前将按钮设为禁用
    const saveLoading = loading.effects[`${DOMAIN}/save`];
    const queryLoading = loading.effects[`${DOMAIN}/queryDetail`];
    const pageConfigLoading = loading.effects[`${DOMAIN}/getPageConfig`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          {mode !== 'view' ? (
            <Button
              className="tw-btn-primary"
              icon="save"
              loading={saveLoading}
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
              closeThenGoto('/user/meetingManage/meetingReserveList/index?_refresh=0');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="会议室预约" />}
          bordered={false}
        >
          {!queryLoading && !pageConfigLoading ? (
            <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
              {this.renderPageConfig()}
            </FieldList>
          ) : (
            <Loading />
          )}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default MeetingReserveListDetail;
