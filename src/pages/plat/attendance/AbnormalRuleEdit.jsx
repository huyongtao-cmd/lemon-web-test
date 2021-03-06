import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, List, Row, Col } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import DataTable from '@/components/common/DataTable';
import { UdcSelect } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';

const { Field } = FieldList;
const DOMAIN = 'attendanceAbnormalRuleDetail';

@connect(({ attendanceAbnormalRuleDetail }) => ({ attendanceAbnormalRuleDetail }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class SystemRoleDetail extends PureComponent {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/clean` });
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: {
          id,
        },
      });
    dispatch({
      type: `${DOMAIN}/queryTips`,
      payload: {
        proType: 'ATTENDANCE',
      },
    });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { id } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const params = { ...values };
        if (id) {
          params.id = id;
        }
        params.enable = values.isEnable === 'NO' ? 0 : 1;
        delete params.isEnable;
        dispatch({
          type: `${DOMAIN}/save`,
          payload: { params },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/hr/attendanceMgmt/attendance/AbnormalRule');
  };

  render() {
    const { form, attendanceAbnormalRuleDetail, loading } = this.props;
    const { getFieldDecorator } = form;
    const { formData, dataSource = [], total = 0 } = attendanceAbnormalRuleDetail;

    const tableProps = {
      columnsCache: DOMAIN,
      loading,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource,
      total,
      showSearch: false,
      showColumn: false,
      showExport: false,
      columns: [
        {
          title: '??????',
          dataIndex: 'name',
          width: '25%',
        },
        {
          title: '?????????',
          dataIndex: 'field',
          width: '25%',
        },
        {
          title: '????????????',
          dataIndex: 'type',
          width: '25%',
        },
        {
          title: '??????',
          dataIndex: 'remark',
          width: '25%',
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
            disabled={false}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '??????' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false}>
          <FieldList getFieldDecorator={getFieldDecorator} col={2} legend="??????????????????">
            <Field
              name="proName"
              label={formatMessage({ id: 'sys.system.name', desc: '??????' })}
              decorator={{
                initialValue: formData.proName,
                rules: [{ required: true, message: '??????' }],
              }}
            >
              <Input placeholder="???????????????" />
            </Field>
            <Field
              name="proCode"
              label={formatMessage({ id: 'sys.scheduledtask.code', desc: '??????' })}
              decorator={{
                initialValue: formData.proCode,
                rules: [{ required: true, message: '??????' }],
              }}
            >
              <Input placeholder="???????????????" />
            </Field>

            <Field
              name="proExpression"
              label="?????????????????????"
              decorator={{
                initialValue: formData.proExpression,
                rules: [{ required: true, message: '??????' }],
              }}
            >
              <Input placeholder="??????????????????????????????" />
            </Field>

            <Field
              name="isEnable"
              label="????????????"
              decorator={{
                initialValue: formData.isEnable ? 'YES' : 'NO',
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ],
              }}
            >
              <UdcSelect code="COM.YESNO" placeholder="?????????????????????" />
            </Field>

            <Field
              name="proType"
              label="??????"
              decorator={{
                initialValue: formData.proType,
                rules: [{ required: true, message: '??????' }],
              }}
            >
              <Input placeholder="???????????????" />
            </Field>

            <Field
              name="remark"
              label={formatMessage({ id: 'sys.scheduledtask.desc', desc: '??????' })}
              decorator={{
                initialValue: formData.remark,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="???????????????" />
            </Field>
          </FieldList>
          <div className="ant-col-xs-24 ant-col-sm-24 ant-col-md-24 ant-col-lg-24 ant-col-xl-22 ant-col-xxl-19">
            <DataTable {...tableProps} />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default SystemRoleDetail;
