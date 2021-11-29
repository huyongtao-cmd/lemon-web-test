import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Icon, Input } from 'antd';
import createMessage from '@/components/core/AlertMessage';
import AsyncSelect from '@/components/common/AsyncSelect';
import FieldList from '@/components/layout/FieldList';
import { BuModal } from '@/pages/gen/modal';
import { selectUsers } from '@/services/sys/user';
import { selectInternalOus } from '@/services/gen/list';

const { Field } = FieldList;

// const fieldLabels = {
//   buNo: 'BU编号',
//   buName: 'BU名称',
//   buType: 'BU类型',
//   buStatus: 'BU状态',
//   pid: '父BU',
//   inchargeResId: '负责人',
//   contactDesc: '联系信息',
//   remark: '备注',
// };

const DOMAIN = 'orgbu';

@connect(({ loading, orgbu }) => ({
  loading,
  orgbu,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const { value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateBasic`,
      payload: { key, value },
    });
  },
})
class buBasicInfo extends PureComponent {
  state = {
    buModalVisible: false,
    selectValue: {
      buName: '',
    },
    sumBuIdModalVisible: false, // 汇总BU
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryBuTree`,
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_MASTER_DATA_BASIC_INFORMATION' },
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        pageConfig: {},
      },
    });
  }

  modalOk = (e, selectValue) => {
    const { buModalVisible } = this.state;
    const {
      dispatch,
      orgbu: { formData },
    } = this.props;
    this.setState({
      buModalVisible: !buModalVisible,
      selectValue,
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          ...formData,
          pid: selectValue.id,
        },
      },
    });
  };

  modalCancel = () => {
    const { buModalVisible } = this.state;
    this.setState({
      buModalVisible: !buModalVisible,
    });
  };

  toggleModal = () => {
    const { buModalVisible } = this.state;
    this.setState({
      buModalVisible: !buModalVisible,
    });
  };

  // 汇总bu弹出窗确认
  sumBuIdModalOk = (e, selectValue) => {
    const {
      dispatch,
      orgbu: { formData },
    } = this.props;
    const { sumBuIdModalVisible } = this.state;
    const { id, buName } = selectValue;

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        formData: {
          ...formData,
          sumBuId: id,
          sumBuName: buName,
        },
      },
    });
    this.setState({ sumBuIdModalVisible: !sumBuIdModalVisible });
  };

  // 汇总bu弹出窗取消
  sumBuIdModalCancel = e => {
    const { sumBuIdModalVisible } = this.state;
    this.setState({
      sumBuIdModalVisible: !sumBuIdModalVisible,
    });
  };

  // 汇总bu弹出窗
  sumBuIdModalToggle = () => {
    const { sumBuIdModalVisible } = this.state;
    this.setState({
      sumBuIdModalVisible: !sumBuIdModalVisible,
    });
  };

  renderPage = () => {
    const { selectValue } = this.state;
    const {
      form: { getFieldDecorator },
      orgbu: { formData, pageConfig },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentConfig = pageBlockViews[0];
    const { pageFieldViews } = currentConfig;
    const pageFieldJsonList = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    let fields = [];
    fields = [
      <Field label={pageFieldJsonList.buNo.displayName} key="buNo" presentational>
        <Input disabled value={formData.buNo} />
      </Field>,

      <Field
        name="buName"
        key="buName"
        label={pageFieldJsonList.buName.displayName}
        decorator={{
          initialValue: formData.buName,
          rules: [{ required: true, message: `请输入${pageFieldJsonList.buName.displayName}` }],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonList.buName.displayName}`} />
      </Field>,

      <Field label={pageFieldJsonList.buType.displayName} key="buType" presentational>
        <Input disabled value={formData.buTypeDesc} />
      </Field>,

      <Field label={pageFieldJsonList.buStatus.displayName} key="buStatus" presentational>
        <Input disabled value={formData.buStatusDesc} />
      </Field>,

      <Field
        name="pid"
        key="pid"
        label={pageFieldJsonList.pid.displayName}
        prefix={<Icon type="user" />}
        decorator={{
          initialValue: selectValue.buName ? selectValue.buName : formData.pname,
          rules: [{ required: true, message: `请输入${pageFieldJsonList.pid.displayName}` }],
        }}
      >
        <Input
          disabled
          addonAfter={
            <a className="tw-link-primary" onClick={this.toggleModal}>
              <Icon type="search" />
            </a>
          }
        />
      </Field>,

      <Field
        name="inchargeResId"
        key="inchargeResId"
        label={pageFieldJsonList.inchargeResId.displayName}
        decorator={{
          initialValue: formData.inchargeResId,
          rules: [
            { required: true, message: `请选择${pageFieldJsonList.inchargeResId.displayName}` },
          ],
        }}
      >
        <AsyncSelect
          source={() => selectUsers().then(resp => resp.response)}
          placeholder="负责人下拉"
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,

      <Field
        name="sumBuId"
        key="sumBuId"
        label={pageFieldJsonList.sumBuId.displayName}
        decorator={{
          initialValue: formData.sumBuName,
          rules: [{ required: false, message: `请选择${pageFieldJsonList.sumBuId.displayName}` }],
        }}
      >
        <Input
          disabled
          addonAfter={
            <a className="tw-link-primary" onClick={this.sumBuIdModalToggle}>
              <Icon type="search" />
            </a>
          }
        />
      </Field>,

      <Field
        name="contactDesc"
        key="contactDesc"
        label={pageFieldJsonList.contactDesc.displayName}
        decorator={{
          initialValue: formData.contactDesc,
          rules: [
            { required: false, message: `请输入${pageFieldJsonList.contactDesc.displayName}` },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonList.contactDesc.displayName}`} />
      </Field>,
      <Field
        name="ouId"
        key="ouId"
        label={pageFieldJsonList.ouId.displayName}
        decorator={{
          initialValue: formData.ouId && formData.ouId + '',
          rules: [{ required: true, message: `请选择${pageFieldJsonList.ouId.displayName}` }],
        }}
      >
        <AsyncSelect
          source={() => selectInternalOus().then(resp => resp.response)}
          placeholder={`请输入${pageFieldJsonList.ouId.displayName}`}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,

      <Field
        name="abNo"
        key="abNo"
        label={pageFieldJsonList.abNo.displayName}
        decorator={{
          initialValue: formData.abNo,
        }}
      >
        <Input disabled />
      </Field>,

      <Field
        name="remark"
        key="remark"
        label={pageFieldJsonList.remark.displayName}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 20, xxl: 21 }}
        decorator={{
          initialValue: formData.remark,
          rules: [{ required: false }],
        }}
      >
        <Input.TextArea placeholder={`请输入${pageFieldJsonList.remark.displayName}`} rows={3} />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJsonList[field.key].visibleFlag === 1)
      .sort(
        (field1, field2) =>
          pageFieldJsonList[field1.key].sortNo - pageFieldJsonList[field2.key].sortNo
      );
    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      form: { getFieldDecorator },
      orgbu: { formData, buTree, pageConfig },
    } = this.props;
    const { selectValue, buModalVisible, sumBuIdModalVisible } = this.state;

    return (
      <>
        <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
          {pageConfig ? this.renderPage() : null}
          {/* <Field label={fieldLabels.buNo} presentational>
            <Input disabled value={formData.buNo} />
          </Field>

          <Field
            name="buName"
            label={fieldLabels.buName}
            decorator={{
              initialValue: formData.buName,
              rules: [{ required: true, message: '请输入' + fieldLabels.buName }],
            }}
          >
            <Input placeholder="请输入BU名称" />
          </Field>

          <Field label={fieldLabels.buType} presentational>
            <Input disabled value={formData.buTypeDesc} />
          </Field>

          <Field label={fieldLabels.buStatus} presentational>
            <Input disabled value={formData.buStatusDesc} />
          </Field>

          <Field
            name="pid"
            label={fieldLabels.pid}
            prefix={<Icon type="user" />}
            decorator={{
              initialValue: selectValue.buName ? selectValue.buName : formData.pname,
              rules: [{ required: true, message: '请输入' + fieldLabels.pid }],
            }}
          >
            <Input
              disabled
              addonAfter={
                <a className="tw-link-primary" onClick={this.toggleModal}>
                  <Icon type="search" />
                </a>
              }
            />
          </Field>

          <Field
            name="inchargeResId"
            label={fieldLabels.inchargeResId}
            decorator={{
              initialValue: formData.inchargeResId,
              rules: [{ required: true, message: '请选择' + fieldLabels.inchargeResId }],
            }}
          >
            <AsyncSelect
              source={() => selectUsers().then(resp => resp.response)}
              placeholder="负责人下拉"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Field>

          <Field
            name="sumBuId"
            label="汇总BU"
            decorator={{
              initialValue: formData.sumBuName,
              rules: [{ required: false, message: '请选择汇总BU' }],
            }}
          >
            <Input
              disabled
              addonAfter={
                <a className="tw-link-primary" onClick={this.sumBuIdModalToggle}>
                  <Icon type="search" />
                </a>
              }
            />
          </Field>

          <Field
            name="contactDesc"
            label={fieldLabels.contactDesc}
            decorator={{
              initialValue: formData.contactDesc,
              rules: [{ required: false, message: '请输入' + fieldLabels.contactDesc }],
            }}
          >
            <Input placeholder="请输入联系信息" />
          </Field>

          <Field
            name="ouId"
            label="所属公司"
            decorator={{
              initialValue: formData.ouId && formData.ouId + '',
              rules: [{ required: true, message: '请选择所属公司' }],
            }}
          >
            <AsyncSelect
              source={() => selectInternalOus().then(resp => resp.response)}
              placeholder="请输入所属公司"
              showSearch
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            />
          </Field>

          <Field
            name="abNo"
            label="地址簿号"
            decorator={{
              initialValue: formData.abNo,
            }}
          >
            <Input disabled />
          </Field>

          <Field
            name="remark"
            label={fieldLabels.remark}
            fieldCol={1}
            labelCol={{ span: 4, xxl: 3 }}
            wrapperCol={{ span: 20, xxl: 21 }}
            decorator={{
              initialValue: formData.remark,
              rules: [{ required: false }],
            }}
          >
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Field> */}
        </FieldList>

        <BuModal
          visible={buModalVisible && !sumBuIdModalVisible}
          handleOk={this.modalOk}
          handleCancel={this.modalCancel}
          items={buTree}
        />
        <BuModal
          visible={sumBuIdModalVisible && !buModalVisible}
          handleOk={this.sumBuIdModalOk}
          handleCancel={this.sumBuIdModalCancel}
          items={buTree}
        />
      </>
    );
  }
}

export default buBasicInfo;
