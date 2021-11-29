import React, { PureComponent } from 'react';
import { Input, Radio } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import SelectWithCols from '@/components/common/SelectWithCols';
import FieldList from '@/components/layout/FieldList';
import { UdcSelect } from '@/pages/gen/field';
import { commonCol } from '../config/index';

const { Field } = FieldList;
const RadioGroup = Radio.Group;
// const DOMAIN = 'userOppsDetail';

class OppoCreateCust extends PureComponent {
  state = {
    custSource: [],
  };

  componentDidMount() {
    const { dispatch, domain } = this.props;
    dispatch({ type: `${domain}/selectCust` }).then(() => {
      this.fetchData();
    });
  }

  fetchData = () => {
    const {
      userOppsDetail: { custList },
    } = this.props;
    this.setState({ custSource: custList });
  };

  renderPage = () => {
    const {
      userOppsDetail: { formData, mode, custList, pageConfig },
      user: {
        user: { info },
      },
      form: { getFieldDecorator },
      form,
    } = this.props;
    // console.log(pageConfig);
    const { custSource } = this.state;
    const isCreate = mode === 'create';
    formData.createUserId = isCreate && info ? info.id : formData.createUserId;

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = pageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');
    const fields = [
      <Field
        name="oppoName"
        key="oppoName"
        sortNo={pageFieldJson.oppoName.sortNo}
        label={pageFieldJson.oppoName.displayName}
        decorator={{
          initialValue: formData.oppoName,
          rules: [
            {
              required: !!pageFieldJson.oppoName.requiredFlag,
              message: `请输入${pageFieldJson.oppoName.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.oppoName.displayName}`} />
      </Field>,

      <Field
        name="leadsNo"
        key="leadsNo"
        sortNo={pageFieldJson.leadsNo.sortNo}
        label={pageFieldJson.leadsNo.displayName}
        decorator={{
          initialValue: formData.leadsNo,
          rules: [
            {
              required: !!pageFieldJson.leadsNo.requiredFlag,
              message: `请输入${pageFieldJson.leadsNo.displayName}`,
            },
          ],
        }}
      >
        <Input
          disabled
          placeholder={formatMessage({ id: `app.hint.systemcreate`, desc: '系统生成' })}
        />
      </Field>,

      <Field
        name="saleContent"
        key="saleContent"
        sortNo={pageFieldJson.saleContent.sortNo}
        label={pageFieldJson.saleContent.displayName}
        decorator={{
          initialValue: formData.saleContent,
          rules: [
            {
              required: !!pageFieldJson.saleContent.requiredFlag,
              message: `请输入${pageFieldJson.saleContent.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.saleContent.displayName}`} />
      </Field>,

      <Field
        name="custRegion"
        key="custRegion"
        sortNo={pageFieldJson.custRegion.sortNo}
        label={pageFieldJson.custRegion.displayName}
        decorator={{
          initialValue: formData.custRegion,
          rules: [
            {
              required: !!pageFieldJson.custRegion.requiredFlag,
              message: `请选择${pageFieldJson.custRegion.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK:CUST_REGION" />
      </Field>,

      <Field
        name="oldcustFlag"
        key="oldcustFlag"
        sortNo={pageFieldJson.oldcustFlag.sortNo}
        label={pageFieldJson.oldcustFlag.displayName}
        decorator={{
          initialValue: formData.oldcustFlag,
          rules: [
            {
              required: !!pageFieldJson.oldcustFlag.requiredFlag,
              message: '请选择勾选至少1条记录',
            },
          ],
        }}
      >
        <RadioGroup
          onChange={e => {
            formData.oldcustFlag = e.target.value;
            form.setFieldsValue({
              custId: null,
              custName: null,
            });
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,

      formData.oldcustFlag ? (
        <Field // 老客户显示
          name="custId"
          key="custId"
          sortNo={pageFieldJson.custId.sortNo}
          label={pageFieldJson.custId.displayName}
          decorator={{
            initialValue: formData.custId
              ? { code: formData.custId, name: formData.custName }
              : undefined,
            rules: [
              {
                required: !!pageFieldJson.custId.displayName,
                message: `请输入${pageFieldJson.custId.displayName}`,
              },
            ],
          }}
        >
          <SelectWithCols
            labelKey="name"
            columns={commonCol}
            dataSource={custSource}
            onChange={value => {
              form.setFieldsValue({
                custId: value ? value.id : null,
                custName: value ? value.name : null,
              });
            }}
            selectProps={{
              showSearch: true,
              onSearch: value => {
                this.setState({
                  custSource: custList.filter(
                    d =>
                      (d.code && d.code.indexOf(value) > -1) ||
                      (d.name && d.name.toLowerCase().indexOf(value.toLowerCase()) > -1)
                  ),
                });
              },
              allowClear: true,
              style: { width: '100%' },
            }}
          />
        </Field>
      ) : (
        <div key="" />
      ),

      !formData.oldcustFlag ? ( // 非老客户显示
        <Field label="" presentational>
          &nbsp;
        </Field>
      ) : (
        <div key="" />
      ),

      <Field
        name="custName"
        key="custName"
        sortNo={pageFieldJson.custName.sortNo}
        label={pageFieldJson.custName.displayName}
        decorator={{
          initialValue: formData.custName,
          rules: [
            {
              required: !!pageFieldJson.custName.requiredFlag,
              message: `请输入${pageFieldJson.custName.displayName}`,
            },
          ],
        }}
      >
        <Input
          disabled={formData.oldcustFlag === 1}
          maxLength={35}
          placeholder={`请输入${pageFieldJson.custName.displayName}`}
        />
      </Field>,

      <Field
        name="custProj"
        key="custProj"
        sortNo={pageFieldJson.custProj.sortNo}
        label={pageFieldJson.custProj.displayName}
        decorator={{
          initialValue: formData.custProj,
          rules: [
            {
              required: !!pageFieldJson.custProj.requiredFlag,
              message: `请输入${pageFieldJson.custProj.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.custProj.displayName}`} />
      </Field>,

      <Field
        name="contactName"
        key="contactName"
        sortNo={pageFieldJson.contactName.sortNo}
        label={pageFieldJson.contactName.displayName}
        decorator={{
          initialValue: formData.contactName,
          rules: [
            {
              required: !!pageFieldJson.contactName.requiredFlag,
              message: `请输入${pageFieldJson.contactName.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.contactName.displayName}`} />
      </Field>,

      <Field
        name="contactPhone"
        key="contactPhone"
        sortNo={pageFieldJson.contactPhone.sortNo}
        label={pageFieldJson.contactPhone.displayName}
        decorator={{
          initialValue: formData.contactPhone,
          rules: [
            {
              required: !!pageFieldJson.contactPhone.requiredFlag,
              message: `请输入${pageFieldJson.contactPhone.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.contactPhone.displayName}`} />
      </Field>,

      <Field
        name="contactDept"
        key="contactDept"
        sortNo={pageFieldJson.contactDept.sortNo}
        label={pageFieldJson.contactDept.displayName}
        decorator={{
          initialValue: formData.contactDept,
          rules: [
            {
              required: !!pageFieldJson.contactDept.requiredFlag,
              message: `请输入${pageFieldJson.contactDept.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.contactDept.displayName}`} />
      </Field>,

      <Field
        name="contactPosition"
        key="contactPosition"
        sortNo={pageFieldJson.contactPosition.sortNo}
        label={pageFieldJson.contactPosition.displayName}
        decorator={{
          initialValue: formData.contactPosition,
          rules: [
            {
              required: !!pageFieldJson.contactPosition.requiredFlag,
              message: `请输入${pageFieldJson.contactPosition.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.contactPosition.displayName}`} />
      </Field>,

      <Field
        name="contactWebsite"
        key="contactWebsite"
        sortNo={pageFieldJson.contactWebsite.sortNo}
        label={pageFieldJson.contactWebsite.displayName}
        decorator={{
          initialValue: formData.contactWebsite,
          rules: [
            {
              required: !!pageFieldJson.contactWebsite.requiredFlag,
              message: `请输入${pageFieldJson.contactWebsite.displayName}`,
            },
          ],
        }}
      >
        <Input
          maxLength={35}
          placeholder={`请输入${
            pageFieldJson.contactWebsite.displayName
          }(格式:http://www.elitesland.com)`}
        />
      </Field>,

      <Field
        name="custProp"
        key="custProp"
        sortNo={pageFieldJson.custProp.sortNo}
        label={pageFieldJson.custProp.displayName}
        decorator={{
          initialValue: formData.custProp,
          rules: [
            {
              required: !!pageFieldJson.custProp.requiredFlag,
              message: `请选择${pageFieldJson.custProp.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK.OU_PROP" />
      </Field>,
      <Field
        name="custIdst"
        key="custIdst"
        sortNo={pageFieldJson.custIdst.sortNo}
        label={pageFieldJson.custIdst.displayName}
        decorator={{
          initialValue: formData.custIdst,
          rules: [
            {
              required: !!pageFieldJson.custIdst.requiredFlag,
              message: `请选择${pageFieldJson.custIdst.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="TSK.OU_IDST" placeholder={`请选择${pageFieldJson.custIdst.displayName}`} />
      </Field>,
      <Field
        name="leadsName"
        key="leadsId"
        sortNo={pageFieldJson.leadsId.sortNo}
        label={pageFieldJson.leadsId.displayName}
        decorator={{
          initialValue: formData.leadsName,
          rules: [
            {
              required: !!pageFieldJson.leadsId.requiredFlag,
              message: `请输入${pageFieldJson.leadsId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,

      <Field
        name="oppoStatusDesc"
        key="oppoStatus"
        sortNo={pageFieldJson.oppoStatus.sortNo}
        label={pageFieldJson.oppoStatus.displayName}
        decorator={{
          initialValue: formData.oppoStatusDesc ? formData.oppoStatusDesc : '创建',
          rules: [
            {
              required: !!pageFieldJson.oppoStatus.requiredFlag,
              message: `请输入${pageFieldJson.oppoStatus.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,

      <Field
        name="closeReasonDesc"
        key="closeReason"
        sortNo={pageFieldJson.closeReason.sortNo}
        label={pageFieldJson.closeReason.displayName}
        decorator={{
          initialValue: formData.closeReasonDesc,
          rules: [
            {
              required: !!pageFieldJson.closeReason.requiredFlag,
              message: `请输入${pageFieldJson.closeReason.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,

      <Field
        name="createUserName"
        key="createUserId"
        sortNo={pageFieldJson.createUserId.sortNo}
        label={pageFieldJson.createUserId.displayName}
        decorator={{
          initialValue: isCreate && info ? info.name : formData.createUserName,
          rules: [
            {
              required: !!pageFieldJson.createUserId.requiredFlag,
              message: `请输入${pageFieldJson.createUserId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,

      <Field
        name="createTime"
        key="createTime"
        sortNo={pageFieldJson.createTime.sortNo}
        label={pageFieldJson.createTime.displayName}
        decorator={{
          initialValue: isCreate
            ? moment().format('YYYY-MM-DD')
            : moment(formData.createTime).format('YYYY-MM-DD'),
          rules: [
            {
              required: !!pageFieldJson.createTime.requiredFlag,
              message: `请输入${pageFieldJson.createTime.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,

      <Field
        name="remark"
        key="remark"
        sortNo={pageFieldJson.remark.sortNo}
        label={pageFieldJson.remark.displayName}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 20, xxl: 21 }}
        decorator={{
          initialValue: formData.remark,
          rules: [
            {
              required: !!pageFieldJson.remark.requiredFlag,
              message: `请输入${pageFieldJson.remark.displayName}`,
            },
          ],
        }}
      >
        <Input.TextArea placeholder={`请输入${pageFieldJson.remark.displayName}`} rows={3} />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <FieldList
        layout="horizontal"
        legend="客户信息"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      form,
      userOppsDetail: { formData, mode, custList, pageConfig },
      user: {
        user: { info },
      }, // 新增时取得报备人(当前登录人)的id和姓名
      form: { getFieldDecorator },
    } = this.props;

    return this.renderPage();
  }
}

export default OppoCreateCust;
