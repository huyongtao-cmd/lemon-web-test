import React, { PureComponent } from 'react';
import { Input } from 'antd';
import { formatMessage } from 'umi/locale';
import FieldList from '@/components/layout/FieldList';
import { UdcCheck, Selection } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { commonCol } from '../config/index';

const { Field } = FieldList;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
// const DOMAIN = 'userOppsDetail';
class OppoCreateSource extends PureComponent {
  state = {
    userSource: [],
    buSource: [],
  };

  componentDidMount() {
    const {
      dispatch,
      domain,
      userOppsDetail: { userList, buList },
    } = this.props;

    userList && userList.length
      ? this.fetchUserDate()
      : dispatch({ type: `${domain}/selectUsers` }).then(() => this.fetchUserDate());
    buList && buList.length
      ? this.fetchBuDate()
      : dispatch({ type: `${domain}/selectBus` }).then(() => this.fetchBuDate());
  }

  fetchBuDate = () => {
    const {
      userOppsDetail: { buList },
    } = this.props;
    this.setState({ buSource: buList });
  };

  fetchUserDate = () => {
    const {
      userOppsDetail: { userList },
    } = this.props;
    this.setState({ userSource: userList });
  };

  renderPage = () => {
    const {
      userOppsDetail: { formData, userList, buList, pageConfig },
      form: { getFieldDecorator },
    } = this.props;
    const { userSource, buSource } = this.state;
    const isInternal = formData.sourceType === 'INTERNAL';
    const internalResKey = { name: formData.internalResName, code: formData.internalResId };
    const internalBuKey = { name: formData.internalBuName, code: formData.internalBuId };

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
        name="sourceType"
        key="sourceType"
        sortNo={pageFieldJson.sourceType.sortNo}
        label={pageFieldJson.sourceType.displayName}
        decorator={{
          initialValue: formData.sourceType,
          rules: [
            {
              required: !!pageFieldJson.sourceType.requiredFlag,
              message: '请选择勾选至少1条记录',
            },
          ],
        }}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
      >
        <UdcCheck
          multiple={false}
          code="TSK.SOURCE_TYPE"
          placeholder={`${pageFieldJson.sourceType.displayName}`}
        />
      </Field>,
      !isInternal ? (
        <Field
          // key={1}
          key="externalIden"
          name="externalIden"
          sortNo={pageFieldJson.externalIden.sortNo}
          label={pageFieldJson.externalIden.displayName}
          decorator={{
            initialValue: formData.externalIden,
            rules: [
              {
                required: !!pageFieldJson.externalIden.requiredFlag,
                message: `请输入${pageFieldJson.externalIden.displayName}`,
              },
            ],
          }}
        >
          <Input maxLength={35} placeholder={`请输入${pageFieldJson.externalIden.displayName}`} />
        </Field>
      ) : (
        <Field
          // key={1}
          key="internalBuId"
          name="internalBuId"
          sortNo={pageFieldJson.internalBuId.sortNo}
          label={pageFieldJson.internalBuId.displayName}
          decorator={{
            initialValue: formData.internalBuId || undefined,
            rules: [
              {
                required: !!pageFieldJson.internalBuId.requiredFlag,
                message: `请输入${pageFieldJson.internalBuId.displayName}`,
              },
            ],
          }}
        >
          <Selection.ColumnsForBu disabled={formData.leadsNo} />
        </Field>
      ),
      !isInternal ? (
        <Field
          // key={2}
          key="externalName"
          name="externalName"
          sortNo={pageFieldJson.externalName.sortNo}
          label={pageFieldJson.externalName.displayName}
          decorator={{
            initialValue: formData.externalName,
            rules: [
              {
                required: !!pageFieldJson.externalName.requiredFlag,
                message: `请输入${pageFieldJson.externalName.displayName}`,
              },
            ],
          }}
        >
          <Input maxLength={35} placeholder={`请输入${pageFieldJson.externalName.displayName}`} />
        </Field>
      ) : (
        <Field
          // key={2}
          key="internalResId"
          name="internalResId"
          sortNo={pageFieldJson.internalResId.sortNo}
          label={pageFieldJson.internalResId.displayName}
          decorator={{
            // trigger: 'onBlur',
            initialValue: formData.internalResId || undefined,
            rules: [
              {
                required: !!pageFieldJson.internalResId.requiredFlag,
                message: `请输入${pageFieldJson.internalResId.displayName}`,
              },
            ],
          }}
        >
          <Selection.Columns
            key="internalResId"
            className="x-fill-100"
            source={userSource}
            columns={particularColumns}
            transfer={{ key: 'id', code: 'id', name: 'name' }}
            dropdownMatchSelectWidth={false}
            showSearch
            onColumnsChange={value => {}}
            placeholder={`请选择${pageFieldJson.internalResId.displayName}`}
            disabled={pageFieldJson.internalResId.fieldMode === 'UNEDITABLE' || formData.leadsNo}
          />
        </Field>
      ),
      !isInternal ? (
        <Field
          // key={3}
          key="externalPhone"
          name="externalPhone"
          sortNo={pageFieldJson.externalPhone.sortNo}
          label={pageFieldJson.externalPhone.displayName}
          decorator={{
            initialValue: formData.externalPhone,
            rules: [
              {
                required: !!pageFieldJson.externalPhone.requiredFlag,
                message: `请输入${pageFieldJson.externalPhone.displayName}`,
              },
            ],
          }}
        >
          <Input maxLength={35} placeholder={`请输入${pageFieldJson.externalPhone.displayName}`} />
        </Field>
      ) : (
        <div key="externalPhone" />
      ),
      <Field
        name="profitDesc"
        key="profitDesc"
        sortNo={pageFieldJson.profitDesc.sortNo}
        label={pageFieldJson.profitDesc.displayName}
        decorator={{
          initialValue: formData.profitDesc,
          rules: [
            {
              required: !!pageFieldJson.profitDesc.requiredFlag,
              message: `请输入${pageFieldJson.profitDesc.displayName}`,
            },
          ],
        }}
      >
        <Input maxLength={35} placeholder={`请输入${pageFieldJson.profitDesc.displayName}`} />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <FieldList
        layout="horizontal"
        legend={formatMessage({ id: `app.settings.menuMap.source`, desc: '来源信息' })}
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      userOppsDetail: { formData, userList, buList },
      form: { getFieldDecorator },
    } = this.props;
    const { userSource, buSource } = this.state;
    const isInternal = formData.sourceType === 'INTERNAL';

    const internalResKey = { name: formData.internalResName, code: formData.internalResId };
    const internalBuKey = { name: formData.internalBuName, code: formData.internalBuId };
    return this.renderPage();
  }
}

export default OppoCreateSource;
