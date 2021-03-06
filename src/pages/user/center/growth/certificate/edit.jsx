import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, List, Row, Col, Radio, DatePicker } from 'antd';
import moment from 'moment';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { fromQs } from '@/utils/stringUtils';

const { Field, FieldLine } = FieldList;
const DOMAIN = 'growthCertificate';
const RadioGroup = Radio.Group;

@connect(({ growthCertificate }) => ({ growthCertificate }))
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
class Certificate extends PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: 'growthCertificate/getCertFnHandle',
      payload: {
        id,
      },
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      growthCertificate: { formData = {} },
      dispatch,
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveApplyCertFn`,
          payload: {
            ...formData,
            ...values,
            lastRenewDate: values.lastRenewDate
              ? moment(values.lastRenewDate).format('YYYY-MM-DD')
              : null,
            obtainDate: values.obtainDate ? moment(values.obtainDate).format('YYYY-MM-DD') : null,
          },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/user/center/growth');
  };

  render() {
    const { form, growthCertificate, loading } = this.props;
    const { getFieldDecorator } = form;
    const { formData = {} } = growthCertificate;

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
            {formatMessage({ id: `misc.submit`, desc: '??????' })}
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
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="????????????" />}
          bordered={false}
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="examPoint"
              label="????????????"
              decorator={{
                initialValue: formData.examPoint,
              }}
            >
              <Input placeholder="?????????????????????" disabled />
            </Field>
            <Field
              name="certNo"
              label="????????????"
              decorator={{
                initialValue: formData.certNo,
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <Input placeholder="?????????????????????" />
            </Field>

            <Field
              name="attache"
              label="????????????"
              decorator={{
                rules: [{ required: true, message: '?????????????????????' }],
              }}
            >
              <FileManagerEnhance
                api="/api/base/v1/resCourseApply/sfs/token"
                listType="text"
                disabled={false}
                dataKey={formData.id}
              />
            </Field>

            <Field
              name="obtainDate"
              label="????????????"
              decorator={{
                initialValue: formData.obtainDate ? moment(formData.obtainDate) : null,
              }}
            >
              <DatePicker placeholder="?????????????????????" className="x-fill-100" />
            </Field>
            <FieldLine label="?????????" required>
              <Field
                name="validType"
                wrapperCol={{ span: 24, xxl: 24 }}
                decorator={{
                  initialValue: formData.validType,
                  rules: [
                    {
                      required: true,
                      message: '????????????????????????',
                    },
                  ],
                }}
              >
                <RadioGroup>
                  <Radio value="0" style={{ marginRight: 0 }}>
                    ??????
                  </Radio>
                  <Radio value="1" style={{ marginRight: 0 }}>
                    ??????
                  </Radio>
                </RadioGroup>
              </Field>

              <Field
                name="validMonths"
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                decorator={{
                  initialValue: formData.validMonths,
                  rules: [
                    {
                      required: formData.validType === '1',
                      message: '??????????????????',
                    },
                  ],
                }}
              >
                <Input
                  placeholder="?????????"
                  addonAfter="??????"
                  disabled={formData.validType === '0'}
                />
              </Field>
            </FieldLine>
            <Field
              name="lastRenewDate"
              label="??????????????????"
              decorator={{
                initialValue: formData.lastRenewDate ? moment(formData.lastRenewDate) : null,
              }}
            >
              <DatePicker
                placeholder="???????????????????????????"
                className="x-fill-100"
                disabled={formData.validType === '0'}
              />
            </Field>

            <Field
              name="score"
              label="??????"
              decorator={{
                initialValue: formData.score,
              }}
            >
              <Input placeholder="???????????????" />
            </Field>

            <Field
              name="grade"
              label="??????"
              decorator={{
                initialValue: formData.grade,
              }}
            >
              <Input placeholder="???????????????" />
            </Field>
            <Field
              name="releaseBy"
              label="????????????"
              decorator={{
                initialValue: formData.releaseBy,
              }}
            >
              <Input placeholder="?????????????????????" />
            </Field>

            <Field
              name="certDesc"
              label="????????????"
              decorator={{
                initialValue: formData.certDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="?????????????????????" />
            </Field>
            <Field
              name="capaLevelName"
              label="????????????"
              decorator={{
                initialValue: formData.capaLevelName,
              }}
            >
              <Input placeholder="?????????????????????" disabled />
            </Field>
            <Field
              name="capaAbilityName"
              label="???????????????"
              decorator={{
                initialValue: formData.capaAbilityName,
              }}
            >
              <Input placeholder="????????????????????????" disabled />
            </Field>
            <Field
              name="applyResName"
              label="?????????"
              decorator={{
                initialValue: formData.applyResName,
              }}
            >
              <Input placeholder="??????????????????" disabled />
            </Field>
            <Field
              name="applyDate"
              label="????????????"
              decorator={{
                initialValue: formData.applyDate,
              }}
            >
              <Input placeholder="?????????????????????" disabled />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Certificate;
