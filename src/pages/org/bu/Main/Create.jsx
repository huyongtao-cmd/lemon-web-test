import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { Button, Card, Divider, Form, Icon, Input, Row, Select } from 'antd';

import AsyncSelect from '@/components/common/AsyncSelect';
import { createConfirm } from '@/components/core/Confirm';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import Title from '@/components/layout/Title';
import FieldList from '@/components/layout/FieldList';

import { UdcSelect, Selection } from '@/pages/gen/field';
import { BuModal } from '@/pages/gen/modal';
import { closeThenGoto, mountToTab } from '@/layouts/routerControl';

import { selectUsers, selectUsersAll } from '@/services/sys/user';
import { selectInternalOus, selectBeginPeriods } from '@/services/gen/list';
import CreateModal from './CreateModal';
import { fromQs } from '@/utils/stringUtils';
import styles from './styles.less';

const { Option } = Select;
const { Field } = FieldList;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'orgbuCreate';

const buCategoryCfg = [
  {
    name: 'buCat1',
    label: '类别码1',
    code: 'ORG.BU_CAT1',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat2',
    label: '类别码2',
    code: 'ORG.BU_CAT2',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat3',
    label: '类别码3',
    code: 'ORG.BU_CAT3',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat4',
    label: '类别码4',
    code: 'ORG.BU_CAT4',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat5',
    label: '类别码5',
    code: 'ORG.BU_CAT5',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat6',
    label: '类别码6',
    code: 'ORG.BU_CAT6',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat7',
    label: '类别码7',
    code: 'ORG.BU_CAT7',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat8',
    label: '类别码8',
    code: 'ORG.BU_CAT8',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat9',
    label: '类别码9',
    code: 'ORG.BU_CAT9',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat10',
    label: '类别码10',
    code: 'ORG.BU_CAT10',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat11',
    label: '类别码11',
    code: 'ORG.BU_CAT11',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat12',
    label: '类别码12',
    code: 'ORG.BU_CAT12',
    placeholder: '请选择类别码',
  },
  {
    name: 'buCat13',
    label: '类别码13',
    code: 'ORG.BU_CAT13',
    placeholder: '请选择类别码',
  },

  {
    name: 'buCat14',
    label: '类别码14',
    code: 'ORG.BU_CAT14',
    placeholder: '请选择类别码',
  },

  {
    name: 'buCat15',
    label: '类别码15',
    code: 'ORG.BU_CAT15',
    placeholder: '请选择类别码',
  },

  {
    name: 'buCat16',
    label: '类别码16',
    code: 'ORG.BU_CAT16',
    placeholder: '请选择类别码',
  },

  {
    name: 'buCat17',
    label: '类别码17',
    code: 'ORG.BU_CAT17',
    placeholder: '请选择类别码',
  },

  {
    name: 'buCat18',
    label: '类别码18',
    code: 'ORG.BU_CAT18',
    placeholder: '请选择类别码',
  },

  {
    name: 'buCat19',
    label: '类别码19',
    code: 'ORG.BU_CAT19',
    placeholder: '请选择类别码',
  },

  {
    name: 'buCat20',
    label: '类别码20',
    code: 'ORG.BU_CAT20',
    placeholder: '请选择类别码',
  },
];

@connect(({ loading, orgbuCreate, dispatch }) => ({
  dispatch,
  loading,
  orgbuCreate,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (changedFields && Object.values(changedFields)[0]) {
      const { name, value } = Object.values(changedFields)[0];
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class Create extends PureComponent {
  state = {
    buModalVisible: false, // 模版
    pidModalVisible: false, // 父级BU
    sumBuIdModalVisible: false, // 汇总BU
    buNoDisabled: true, // BU编号默认不可编辑，BU类型为“平台支持类BU（BM）”时，编号可编辑
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryBuTree`,
    });
    dispatch({
      type: `${DOMAIN}/clearForm`,
    });
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_MASTER_DATA_SAVE' },
    });

    const { id, taskId, offerFrom } = fromQs();

    if (offerFrom && offerFrom.includes('OfferAndResDetails')) {
      id && dispatch({ type: `${DOMAIN}/query`, payload: { resId: id } });
    }
  }

  handleCancel = () => {
    closeThenGoto(`/org/bu/main`);
  };

  pidModalOk = (e, selectValue) => {
    const { dispatch } = this.props;
    const { pidModalVisible } = this.state;
    const { id, buName } = selectValue;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        pid: id,
        pName: buName,
      },
    });
    this.setState({ pidModalVisible: !pidModalVisible });
  };

  pidModalCancel = e => {
    const { pidModalVisible } = this.state;
    this.setState({
      pidModalVisible: !pidModalVisible,
    });
  };

  pidModalToggle = () => {
    const { pidModalVisible } = this.state;
    this.setState({
      pidModalVisible: !pidModalVisible,
    });
  };

  // 汇总bu弹出窗确认
  sumBuIdModalOk = (e, selectValue) => {
    const { dispatch } = this.props;
    const { sumBuIdModalVisible } = this.state;
    const { id, buName } = selectValue;
    dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: {
        sumBuId: id,
        sumBuName: buName,
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

  toggleModal = () => {
    const { buModalVisible } = this.state;
    this.setState({
      buModalVisible: !buModalVisible,
    });
  };

  handleConfirm = () => {
    createConfirm({
      title: 'misc.hint',
      content: '确定要创建BU吗?',
      iconType: 'exclamation-circle',
      onOk: () => {
        const {
          form: { validateFieldsAndScroll },
          dispatch,
        } = this.props;
        validateFieldsAndScroll((error, values) => {
          if (!error) {
            dispatch({
              type: `${DOMAIN}/create`,
            });
          }
        });
      },
    });
  };

  // BU类型为“平台支持类BU（BM）”时，编号可编辑
  handleChangeBuType = value => {
    const { form } = this.props;
    const { buNoDisabled } = this.state;
    form.setFieldsValue({
      buNo: null,
    });
    if (value && value === 'BM') {
      this.setState({
        buNoDisabled: false,
      });
    } else {
      this.setState({
        buNoDisabled: true,
      });
    }
  };

  renderPage = () => {
    const { loading, form, orgbuCreate } = this.props;
    const { getFieldDecorator } = form;
    const { buTree, createData, pageConfig } = orgbuCreate;
    const { buNoDisabled } = this.state;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentConfigBasic = [];
    let currentConfigTemplate = [];
    pageBlockViews.forEach(view => {
      if (view.blockKey === 'BU_MASTER_DATA_SAVE_BASE') {
        // BU主数据-新增页面
        currentConfigBasic = view; // 基本信息区域
      } else if (view.blockKey === 'BU_MASTER_DATA_SAVE_POP') {
        // BU主数据-弹窗页面
        currentConfigTemplate = view; // 选择模板弹出区域
      }
    });
    const { pageFieldViews: pageFieldViewsBasic } = currentConfigBasic;
    const { pageFieldViews: pageFieldViewsTemplate } = currentConfigTemplate;
    const pageFieldJsonBasic = {};
    const pageFieldJsonTemplate = {};
    if (pageFieldViewsBasic) {
      pageFieldViewsBasic.forEach(field => {
        pageFieldJsonBasic[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsTemplate) {
      pageFieldViewsTemplate.forEach(field => {
        pageFieldJsonTemplate[field.fieldKey] = field;
      });
    }
    let fields = [];
    fields = [
      <Field
        name="buNo"
        key="buNo"
        label={pageFieldJsonBasic.buNo.displayName}
        sortNo={pageFieldJsonBasic.buNo.sortNo}
        decorator={{
          initialValue: createData.buNo,
          rules: [{ required: false, message: `${pageFieldJsonBasic.buNo.displayName}` }],
        }}
      >
        <Input disabled={buNoDisabled} />
      </Field>,
      <Field
        name="pName"
        key="pid"
        label={pageFieldJsonBasic.pid.displayName}
        sortNo={pageFieldJsonBasic.pid.sortNo}
        decorator={{
          initialValue: createData.pName,
          rules: [{ required: true, message: `请选择${pageFieldJsonBasic.pid.displayName}` }],
        }}
      >
        <Input
          disabled
          addonAfter={
            <a className="tw-link-primary" onClick={this.pidModalToggle}>
              <Icon type="search" />
            </a>
          }
        />
      </Field>,

      <Field
        name="buTmplId"
        key="buTmplId"
        sortNo={pageFieldJsonBasic.buTmplId.sortNo}
        label={pageFieldJsonBasic.buTmplId.displayName}
        decorator={{
          initialValue: createData.buTmplId,
          rules: [{ required: true, message: `请选择${pageFieldJsonBasic.buTmplId.displayName}` }],
        }}
      >
        <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
          <Input value={createData.tmplName} disabled />
          <Button
            className={classnames('tw-btn-primary', styles.btnTmp)}
            type="primary"
            size="default"
            disabled={false}
            onClick={this.toggleModal}
            style={{ marginLeft: 16 }}
          >
            选择模板
          </Button>
        </Row>
      </Field>,

      <Field
        name="sumBuName"
        key="sumBuId"
        label={pageFieldJsonBasic.sumBuId.displayName}
        sortNo={pageFieldJsonBasic.sumBuId.sortNo}
        decorator={{
          initialValue: createData.sumBuName,
          rules: [{ required: false, message: `请选择${pageFieldJsonBasic.sumBuId.displayName}` }],
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
        name="buName"
        key="buName"
        label={pageFieldJsonBasic.buName.displayName}
        sortNo={pageFieldJsonBasic.buName.sortNo}
        decorator={{
          initialValue: createData.buName,
          rules: [{ required: true, message: `请输入${pageFieldJsonBasic.buName.displayName}` }],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonBasic.buName.displayName}`} />
      </Field>,
      <Field
        name="buType"
        key="buType"
        label={pageFieldJsonBasic.buType.displayName}
        sortNo={pageFieldJsonBasic.buType.sortNo}
        prefix={<Icon type="user" />}
        decorator={{
          initialValue: createData.buType,
          rules: [{ required: true, message: `请输入${pageFieldJsonBasic.buType.displayName}` }],
        }}
      >
        <UdcSelect
          code="ORG.BU_TYPE"
          placeholder={`请输入${pageFieldJsonBasic.buType.displayName}`}
          onChange={this.handleChangeBuType}
        />
      </Field>,
      <Field
        name="beginPeriodId"
        key="beginPeriodId"
        label={pageFieldJsonBasic.beginPeriodId.displayName}
        sortNo={pageFieldJsonBasic.beginPeriodId.sortNo}
        decorator={{
          initialValue: createData.beginPeriodId,
          rules: [
            { required: true, message: `请选择${pageFieldJsonBasic.beginPeriodId.displayName}` },
          ],
        }}
      >
        <AsyncSelect
          source={() => selectBeginPeriods().then(resp => resp.response)}
          placeholder={`请选择${pageFieldJsonBasic.beginPeriodId.displayName}`}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,

      <Field
        name="currCode"
        key="currCode"
        label={pageFieldJsonBasic.currCode.displayName}
        sortNo={pageFieldJsonBasic.currCode.sortNo}
        decorator={{
          initialValue: createData.currCode,
          rules: [{ required: true, message: `请输入${pageFieldJsonBasic.currCode.displayName}` }],
        }}
      >
        <UdcSelect
          code="COM.CURRENCY_KIND"
          placeholde={`请选择${pageFieldJsonBasic.currCode.displayName}`}
        />
      </Field>,

      <Field
        name="inchargeResId"
        key="inchargeResId"
        label={pageFieldJsonBasic.inchargeResId.displayName}
        sortNo={pageFieldJsonBasic.inchargeResId.sortNo}
        decorator={{
          initialValue: createData.inchargeResId,
          rules: [
            { required: true, message: `请选择${pageFieldJsonBasic.inchargeResId.displayName}` },
          ],
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={() => selectUsersAll()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          placeholder={`请选择${pageFieldJsonBasic.inchargeResId.displayName}`}
          onColumnsChange={value => {}}
        />

        {/* <AsyncSelect
      source={() => selectUsersAll().then(resp => resp.response)}
      placeholder="负责人下拉"
      showSearch
      filterOption={(input, option) =>
        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
    /> */}
      </Field>,

      <Field
        name="contactDesc"
        key="contactDesc"
        label={pageFieldJsonBasic.contactDesc.displayName}
        sortNo={pageFieldJsonBasic.contactDesc.sortNo}
        decorator={{
          initialValue: createData.contactDesc,
          rules: [{ required: false }],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonBasic.contactDesc.displayName}`} />
      </Field>,

      <Field
        name="ouId"
        key="ouId"
        label={pageFieldJsonBasic.ouId.displayName}
        decorator={{
          initialValue: createData.ouId && createData.ouId + '',
          rules: [{ required: true, message: `请选择${pageFieldJsonBasic.ouId.displayName}` }],
        }}
      >
        <AsyncSelect
          source={() => selectInternalOus().then(resp => resp.response)}
          placeholder={`请输入${pageFieldJsonBasic.ouId.displayName}`}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,

      <Field
        name="remark"
        key="remark"
        label={pageFieldJsonBasic.remark.displayName}
        sortNo={pageFieldJsonBasic.remark.sortNo}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
        decorator={{
          initialValue: createData.remark,
          rules: [{ required: false }],
        }}
      >
        <Input.TextArea rows={3} />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJsonBasic[field.key].visibleFlag === 1)
      .sort(
        (field1, field2) =>
          pageFieldJsonBasic[field1.key].sortNo - pageFieldJsonBasic[field2.key].sortNo
      );
    pageFieldJsonBasic;
    return (
      <FieldList
        layout="horizontal"
        legend="基本信息"
        getFieldDecorator={getFieldDecorator}
        col={2}
      >
        {filterList}
      </FieldList>
    );
  };

  renderBuCat = ({ name, label, code, placeholder }) => {
    const { orgbuCreate } = this.props;
    const { createData } = orgbuCreate;
    return (
      <Field
        key={name}
        name={name}
        label={label}
        decorator={{
          initialValue: createData[name],
          rules: [
            {
              required: (name === 'buCat6' && createData.tmplType === 'SALES') || false,
              message: `请选择${name}`,
            },
          ],
        }}
      >
        <UdcSelect code={code} placeholder={placeholder} />
      </Field>
    );
  };

  render() {
    const { loading, form, orgbuCreate } = this.props;
    const { getFieldDecorator } = form;
    const { buTree, createData, pageConfig } = orgbuCreate;

    const { buModalVisible, pidModalVisible, sumBuIdModalVisible, buNoDisabled } = this.state;

    const createModalProps = {
      domain: DOMAIN,
      visible: buModalVisible,
      toggleModal: this.toggleModal,
    };

    const saveBtn = loading.effects[`${DOMAIN}/create`];

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={saveBtn}
            onClick={this.handleConfirm}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('tw-btn-default', 'separate')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          bordered={false}
          className={classnames(styles.buCreateBasic, 'tw-card-adjust')}
          title={<Title icon="profile" id="org.bu.menu.createBu" defaultMessage="新增BU" />}
        >
          {this.renderPage()}

          <Divider dashed />

          <FieldList
            layout="horizontal"
            legend="类别码"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="regionCode"
              label="管理区域码"
              decorator={{
                initialValue: createData.regionCode,
                rules: [{ required: true, message: '请选择管理区域码' }],
              }}
            >
              <UdcSelect code="COM.REGION_CODE" placeholder="请选择管理区域码" />
            </Field>
            <Field
              name="settleType"
              label="结算类型码"
              decorator={{
                initialValue: createData.settleType,
                rules: [{ required: true, message: '请选择结算类型码' }],
              }}
            >
              <UdcSelect code="ORG.BU_SETTLE_TYPE" placeholder="请选择结算类型码" />
            </Field>

            {buCategoryCfg.map(this.renderBuCat)}
          </FieldList>
        </Card>

        <CreateModal {...createModalProps} />

        <BuModal
          visible={pidModalVisible && !sumBuIdModalVisible}
          handleOk={this.pidModalOk}
          handleCancel={this.pidModalCancel}
          items={buTree}
        />
        <BuModal
          visible={sumBuIdModalVisible && !pidModalVisible}
          handleOk={this.sumBuIdModalOk}
          handleCancel={this.sumBuIdModalCancel}
          items={buTree}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Create;
