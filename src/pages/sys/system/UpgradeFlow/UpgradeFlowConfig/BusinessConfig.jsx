import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, Select, InputNumber } from 'antd';
import AsyncSelect from '@/components/common/AsyncSelect';
import { FileManagerEnhance, Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import DataTable from '@/components/common/DataTable';
import EventBussiness from '../components/modal/EventBussiness';

const { Field } = FieldList;
const DOMAIN = 'flowUpgradeBusinessConfig';
const { Option } = Select;

@connect(({ loading, dispatch, flowUpgradeBusinessConfig }) => ({
  loading,
  dispatch,
  flowUpgradeBusinessConfig,
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
class BusinessConfig extends PureComponent {
  state = {
    backPageParams: '',
    defKey: '',
    eventModalShow: false,
  };

  componentDidMount() {
    const { id, name } = fromQs();
    const idArr = id.split(':');
    const backPageParams = {
      id: idArr[2],
      flowid: id,
    };

    this.setState({
      backPageParams,
      defKey: idArr[0],
    });

    this.initPage(id, name, idArr[0]);
  }

  initPage = (procDefKey, name, defKey) => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          procDefKey,
          businessDefName: name,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/getDetails`,
      payload: {
        id: defKey,
      },
    });
    dispatch({
      type: `${DOMAIN}/getFlowTemInfo`,
    });
    dispatch({
      type: `${DOMAIN}/getResolveField`,
      payload: {
        defKey,
        refresh: false,
      },
    });
    dispatch({
      type: `${DOMAIN}/getBusinessEvent`,
      payload: {
        defKey,
        status: '',
      },
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { backPageParams } = this.state;
    validateFieldsAndScroll((error, values) => {
      const defFields = [];
      const events = [];
      const defKey = fromQs().id ? fromQs().id.split(':')[0] : '';
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { ...values, defFields, events, defKey, backPageParams },
        });
      }
    });
  };

  backFlow = () => {
    const { id } = fromQs();
    const idArr = id.split(':');
    closeThenGoto(
      `/sys/flowMen/UpgradeFlow/UpgradeFlowConfig?id=${idArr[2]}&flowid=${id}&_refresh=0`
    );
  };

  closeEventModal = () => {
    this.setState({
      eventModalShow: false,
    });
  };

  saveEventInfo = () => {
    const {
      flowUpgradeBusinessConfig: { eventFormData = {} },
      dispatch,
    } = this.props;
    const { defKey } = this.state;

    dispatch({
      type: `${DOMAIN}/saveSingleEvent`,
      payload: {
        ...eventFormData,
        defKey,
      },
    });
    this.setState({
      eventModalShow: false,
    });
  };

  render() {
    const {
      loading,
      form,
      flowUpgradeBusinessConfig: {
        formData,
        cmsInfo = '',
        dataSource,
        dataSourceEvent,
        eventFormData = {},
      },
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      dispatch,
      total,
    } = this.props;
    const { defKey, eventModalShow } = this.state;

    const submitting = loading.effects[`${DOMAIN}/save`];

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource,
      total,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      columns: [
        {
          key: 'fieldVar',
          title: '字段变量',
          dataIndex: 'field',
          align: 'center',
          render: (value, row, index) => '${' + value + '}',
        },
        {
          key: 'name',
          title: '字段名称',
          dataIndex: 'name',
          align: 'center',
        },
        {
          key: 'field',
          title: '字段表识',
          dataIndex: 'field',
          align: 'center',
        },
        {
          key: 'type',
          title: '字段类型',
          dataIndex: 'type',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'refresh',
          className: 'tw-btn-primary',
          title: '刷新',
          icon: 'sync',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/getResolveField`,
              payload: {
                defKey,
                refresh: true,
              },
            });
          },
        },
      ],
    };

    const tablePropsEvent = {
      columnsCache: DOMAIN,
      dispatch,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource: dataSourceEvent,
      total,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      columns: [
        {
          key: 'businessEvenCodeVar',
          title: '事件变量',
          dataIndex: 'businessEvenCode',
          align: 'center',
          render: (value, row, index) => {
            const { businessEvenCode, businessEvenMethod, businessEvenParame } = row;
            const eventVal =
              '${' + businessEvenCode + '.' + businessEvenMethod + '(' + businessEvenParame + ')}';
            return eventVal;
          },
        },
        {
          key: 'businessEvenName',
          title: '事件名称',
          dataIndex: 'businessEvenName',
          align: 'center',
        },
        {
          key: 'businessEvenCode',
          title: '事件码',
          dataIndex: 'businessEvenCode',
          align: 'center',
        },

        {
          key: 'businessEvenMethod',
          title: '事件方法',
          dataIndex: 'businessEvenMethod',
          align: 'center',
        },
        {
          key: 'businessEvenParame',
          title: '事件参数',
          dataIndex: 'businessEvenParame',
          align: 'center',
        },
        {
          key: 'businessEvenClass',
          title: '事件类',
          dataIndex: 'businessEvenClass',
          align: 'center',
        },
        {
          key: 'businessEvenType',
          title: '事件类型',
          dataIndex: 'businessEvenType',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'creat',
          icon: 'plus-square',
          className: 'tw-btn-primary',
          title: '新建',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: () => {
            dispatch({
              type: `${DOMAIN}/clearEventFormData`,
            });
            this.setState({
              eventModalShow: true,
            });
          },
        },
        {
          key: 'config',
          icon: 'setting',
          className: 'tw-btn-info',
          title: '修改',
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/clearEventFormData`,
            });
            dispatch({
              type: `${DOMAIN}/getSingleEvent`,
              payload: {
                id: selectedRows[0].id,
              },
            });
            this.setState({
              eventModalShow: true,
            });
          },
        },

        {
          key: 'remove',
          icon: 'file-excel',
          className: 'tw-btn-error',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRowKeys => selectedRowKeys.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            dispatch({
              type: `${DOMAIN}/deleteEvent`,
              payload: { ids: selectedRowKeys.join(','), defKey },
            });
          },
        },
      ],
    };

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
          {/* <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.backFlow}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button> */}
        </Card>
        <Card bordered={false} style={{ marginBottom: '4px' }}>
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="工作流程">
            <Field
              name="procDefKey"
              label="流程定义"
              decorator={{
                initialValue: formData.procDefKey || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="businessDefName"
              label="流程名称"
              decorator={{
                initialValue: formData.businessDefName || '',
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="businessDefFlowNo"
              label="流程编号定义"
              decorator={{
                initialValue: formData.businessDefFlowNo || '',
                rules: [{ required: true, message: '请输入流程编号定义' }],
              }}
            >
              <Input />
            </Field>

            <Field
              name="businessDefNameTmpl"
              label="流程名称模板"
              decorator={{
                initialValue: formData.businessDefNameTmpl || '',
                rules: [{ required: true, message: '请输入流程名称模板' }],
              }}
            >
              <Input />
            </Field>
            <Field
              name="businessDefNameRelated"
              label="相关信息模板"
              style={{
                letterSpacing: '-1px',
              }}
              decorator={{
                initialValue: formData.businessDefNameRelated || '',
                rules: [{ required: true, message: '请输入流程相关信息模板' }],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              extra={<div dangerouslySetInnerHTML={{ __html: cmsInfo }} />}
            >
              <Input.TextArea rows={3} placeholder="请输入流程相关信息模板" />
            </Field>
          </FieldList>
        </Card>
        <Card bordered={false} title="业务事件" style={{ marginBottom: '4px' }}>
          <DataTable {...tablePropsEvent} />
        </Card>
        <Card bordered={false} title="业务字段" style={{ marginBottom: '4px' }}>
          <DataTable {...tableProps} />
        </Card>

        <EventBussiness
          eventFormData={eventFormData}
          visible={eventModalShow}
          handleCancel={this.closeEventModal}
          handleOk={this.saveEventInfo}
        />
      </PageHeaderWrapper>
    );
  }
}

export default BusinessConfig;
