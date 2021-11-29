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
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="证书上传" />}
          bordered={false}
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="certName"
              label="证书名称"
              decorator={{
                initialValue: formData.certName,
              }}
            >
              <Input placeholder="请输入证书名称" disabled />
            </Field>
            <Field
              name="certNo"
              label="证书号码"
              decorator={{
                initialValue: formData.certNo,
                rules: [{ required: true, message: '请输入证书号码' }],
              }}
            >
              <Input placeholder="请输入证书号码" />
            </Field>

            <Field
              name="attache"
              label="证书附件"
              decorator={{
                rules: [{ required: true, message: '请上传证书附件' }],
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
              label="获得时间"
              decorator={{
                initialValue: formData.obtainDate ? moment(formData.obtainDate) : null,
              }}
            >
              <DatePicker placeholder="请选择获得时间" className="x-fill-100" />
            </Field>
            <FieldLine label="有效期" required>
              <Field
                name="validType"
                wrapperCol={{ span: 24, xxl: 24 }}
                decorator={{
                  initialValue: formData.validType,
                  rules: [
                    {
                      required: true,
                      message: '请选择有效期类型',
                    },
                  ],
                }}
              >
                <RadioGroup>
                  <Radio value="0" style={{ marginRight: 0 }}>
                    长期
                  </Radio>
                  <Radio value="1" style={{ marginRight: 0 }}>
                    定期
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
                      message: '请输入有效期',
                    },
                  ],
                }}
              >
                <Input
                  placeholder="有效期"
                  addonAfter="个月"
                  disabled={formData.validType === '0'}
                />
              </Field>
            </FieldLine>
            <Field
              name="lastRenewDate"
              label="上次认证时间"
              decorator={{
                initialValue: formData.lastRenewDate ? moment(formData.lastRenewDate) : null,
              }}
            >
              <DatePicker
                placeholder="请选择上次认证时间"
                className="x-fill-100"
                disabled={formData.validType === '0'}
              />
            </Field>

            <Field
              name="score"
              label="分数"
              decorator={{
                initialValue: formData.score,
              }}
            >
              <Input placeholder="请输入分数" />
            </Field>

            <Field
              name="grade"
              label="等级"
              decorator={{
                initialValue: formData.grade,
              }}
            >
              <Input placeholder="请输入等级" />
            </Field>
            <Field
              name="releaseBy"
              label="颁发机构"
              decorator={{
                initialValue: formData.releaseBy,
              }}
            >
              <Input placeholder="请输入颁发机构" />
            </Field>

            <Field
              name="certDesc"
              label="证书说明"
              decorator={{
                initialValue: formData.certDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea rows={3} placeholder="请输入证书说明" />
            </Field>
            <Field
              name="capaLevelName"
              label="相关能力"
              decorator={{
                initialValue: formData.capaLevelName,
              }}
            >
              <Input placeholder="请输入相关能力" disabled />
            </Field>
            <Field
              name="capaAbilityName"
              label="相关考核点"
              decorator={{
                initialValue: formData.capaAbilityName,
              }}
            >
              <Input placeholder="请输入相关考核点" disabled />
            </Field>
            <Field
              name="applyResName"
              label="申请人"
              decorator={{
                initialValue: formData.applyResName,
              }}
            >
              <Input placeholder="请输入申请人" disabled />
            </Field>
            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: formData.applyDate,
              }}
            >
              <Input placeholder="请输入申请日期" disabled />
            </Field>
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Certificate;
