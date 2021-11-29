import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty, isNil } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import router from 'umi/router';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { Selection, DatePicker, UdcSelect } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectIamUsers } from '@/services/gen/list';
import DataTable from '@/components/common/DataTable';
import Loading from '@/components/core/DataLoading';
import moment from 'moment';

const { Field } = FieldList;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];
const DOMAIN = 'invoiceList';
@connect(({ loading, invoiceList, dispatch }) => ({
  loading,
  invoiceList,
  dispatch,
}))
@Form.create()
@mountToTab()
class InvoiceDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { mode, id } = fromQs();
    dispatch({ type: `${DOMAIN}/queryDetail`, payload: { mode, id: isNil(id) ? '' : id } });
    dispatch({
      type: `${DOMAIN}/getDetailPageConfig`,
      payload: { pageNo: 'INVOICE_VIEW' },
    });
  }

  handleSubmit = () => {};

  radioChange = val => {};

  dtlViewTableProps = () => {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      invoiceList: { currentItem, detailPageConfig },
    } = this.props;

    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];

    if (detailPageConfig) {
      if (!detailPageConfig.pageBlockViews || detailPageConfig.pageBlockViews.length < 1) {
        return <div />;
      }

      let currentDetailListConfig = [];
      detailPageConfig.pageBlockViews.forEach(view => {
        if (view.blockKey === 'INVOICE_DETAIL_DETAIL') {
          // 发票池
          currentDetailListConfig = view; // 明细区域
        }
      });
      const { pageFieldViews: pageFieldViewsDetailList } = currentDetailListConfig; // 明细区域

      const pageFieldJsonDetailList = {}; // 明细区域

      if (pageFieldViewsDetailList) {
        pageFieldViewsDetailList.forEach(field => {
          pageFieldJsonDetailList[field.fieldKey] = field;
        });
      }

      const fields = [
        {
          // title: '货物或应税劳务名称',
          title: `${pageFieldJsonDetailList.commodityName.displayName}`,
          sortNo: `${pageFieldJsonDetailList.commodityName.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.commodityName.visibleFlag}`,
          dataIndex: 'commodityName',
          align: 'center',
          width: '30%',
        },
        {
          // title: '规格型号',
          title: `${pageFieldJsonDetailList.specificationModel.displayName}`,
          sortNo: `${pageFieldJsonDetailList.specificationModel.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.specificationModel.visibleFlag}`,
          dataIndex: 'specificationModel',
          align: 'center',
          width: '35%',
        },
        {
          // title: '单位',
          title: `${pageFieldJsonDetailList.unit.displayName}`,
          sortNo: `${pageFieldJsonDetailList.unit.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.unit.visibleFlag}`,
          dataIndex: 'unit',
          align: 'center',
          width: '35%',
        },
        {
          // title: '数量',
          title: `${pageFieldJsonDetailList.quantity.displayName}`,
          sortNo: `${pageFieldJsonDetailList.quantity.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.quantity.visibleFlag}`,
          dataIndex: 'quantity',
          align: 'center',
          width: '35%',
        },
        {
          // title: '单价',
          title: `${pageFieldJsonDetailList.unitPrice.displayName}`,
          sortNo: `${pageFieldJsonDetailList.unitPrice.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.unitPrice.visibleFlag}`,
          dataIndex: 'unitPrice',
          align: 'center',
          width: '35%',
        },
        {
          // title: '金额',
          title: `${pageFieldJsonDetailList.amount.displayName}`,
          sortNo: `${pageFieldJsonDetailList.amount.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.amount.visibleFlag}`,
          dataIndex: 'amount',
          align: 'center',
          width: '35%',
        },
        {
          // title: '税率',
          title: `${pageFieldJsonDetailList.taxRate.displayName}`,
          sortNo: `${pageFieldJsonDetailList.taxRate.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.taxRate.visibleFlag}`,
          dataIndex: 'taxRate',
          align: 'center',
          width: '35%',
        },
        {
          // title: '税额',
          title: `${pageFieldJsonDetailList.tax.displayName}`,
          sortNo: `${pageFieldJsonDetailList.tax.sortNo}`,
          visibleFlag: `${pageFieldJsonDetailList.tax.visibleFlag}`,
          dataIndex: 'tax',
          align: 'center',
          width: '35%',
        },
      ]
        .filter(field => !field.key || pageFieldJsonDetailList[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.sortNo - field2.sortNo);

      return {
        sortBy: 'id',
        rowKey: 'id',
        sortDirection: 'DESC',
        columnsCache: DOMAIN,
        loading: queryBtn,
        dataSource: currentItem.dtls || [],
        showColumn: false,
        onRow: () => {},
        showSearch: false,
        showExport: false,
        pagination: false,
        enableSelection: false,
        enableDoubleClick: false,
        columns: fields,
      };
    }
    return {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: queryBtn,
      dataSource: [],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [],
    };
  };

  renderPageConfig = () => {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      invoiceList: { currentItem, detailPageConfig },
    } = this.props;
    const { mode } = fromQs();

    if (detailPageConfig) {
      if (!detailPageConfig.pageBlockViews || detailPageConfig.pageBlockViews.length < 1) {
        return <div />;
      }

      let currentMainListConfig = [];
      detailPageConfig.pageBlockViews.forEach(view => {
        if (view.blockKey === 'INVOICE_DETAIL_MAIN') {
          currentMainListConfig = view; // 主区域
        }
      });
      const { pageFieldViews: pageFieldViewsMainList } = currentMainListConfig; // 主区域

      const pageFieldJsonMainList = {}; // 主区域

      if (pageFieldViewsMainList) {
        pageFieldViewsMainList.forEach(field => {
          pageFieldJsonMainList[field.fieldKey] = field;
        });
      }

      const fields = [
        <Field
          name="invoiceCode"
          label={pageFieldJsonMainList.invoiceCode.displayName}
          sortNo={pageFieldJsonMainList.invoiceCode.sortNo}
          decorator={{
            initialValue: currentItem.invoiceCode ? currentItem.invoiceCode : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入发票代码',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="invoiceNo"
          label={pageFieldJsonMainList.invoiceNo.displayName}
          sortNo={pageFieldJsonMainList.invoiceNo.sortNo}
          decorator={{
            initialValue: currentItem.invoiceNo ? currentItem.invoiceNo : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入发票号码',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="invoiceDate"
          label={pageFieldJsonMainList.invoiceDate.displayName}
          sortNo={pageFieldJsonMainList.invoiceDate.sortNo}
          decorator={{
            initialValue: currentItem.invoiceDate ? moment(currentItem.invoiceDate) : '',
          }}
        >
          <DatePicker className="x-fill-100" format="YYYY-MM-DD" disabled />
        </Field>,
        <Field
          name="invState"
          label={pageFieldJsonMainList.invState.displayName}
          sortNo={pageFieldJsonMainList.invState.sortNo}
          decorator={{
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入发票状态',
            //   },
            // ],
            initialValue: currentItem.invState || undefined,
          }}
        >
          <UdcSelect code="ACC:INV_STATUS" disabled={mode === 'view'} />
        </Field>,
        <Field
          name="saleName"
          label={pageFieldJsonMainList.saleName.displayName}
          sortNo={pageFieldJsonMainList.saleName.sortNo}
          decorator={{
            initialValue: currentItem.saleName ? currentItem.saleName : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入销方名称',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="saleTaxNo"
          label={pageFieldJsonMainList.saleTaxNo.displayName}
          sortNo={pageFieldJsonMainList.saleTaxNo.sortNo}
          decorator={{
            initialValue: currentItem.saleTaxNo ? currentItem.saleTaxNo : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入销方税号',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="saleBank"
          label={pageFieldJsonMainList.saleBank.displayName}
          sortNo={pageFieldJsonMainList.saleBank.sortNo}
          decorator={{
            initialValue: currentItem.saleBank ? currentItem.saleBank : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入销方开户行账户',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="saleAddressPhone"
          label={pageFieldJsonMainList.saleAddressPhone.displayName}
          sortNo={pageFieldJsonMainList.saleAddressPhone.sortNo}
          decorator={{
            initialValue: currentItem.saleAddressPhone ? currentItem.saleAddressPhone : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入销方地址电话',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="purchaserName"
          label={pageFieldJsonMainList.purchaserName.displayName}
          sortNo={pageFieldJsonMainList.purchaserName.sortNo}
          decorator={{
            initialValue: currentItem.purchaserName ? currentItem.purchaserName : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入购方名称',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="purchaserTaxNo"
          label={pageFieldJsonMainList.purchaserTaxNo.displayName}
          sortNo={pageFieldJsonMainList.purchaserTaxNo.sortNo}
          decorator={{
            initialValue: currentItem.purchaserTaxNo ? currentItem.purchaserTaxNo : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入购方税号',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="purchaserBank"
          label={pageFieldJsonMainList.purchaserBank.displayName}
          sortNo={pageFieldJsonMainList.purchaserBank.sortNo}
          decorator={{
            initialValue: currentItem.purchaserBank ? currentItem.purchaserBank : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入购方开户行账户',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="purchaserAddressPhone"
          label={pageFieldJsonMainList.purchaserAddressPhone.displayName}
          sortNo={pageFieldJsonMainList.purchaserAddressPhone.sortNo}
          decorator={{
            initialValue: currentItem.purchaserAddressPhone
              ? currentItem.purchaserAddressPhone
              : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入购方地址电话',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="totalAmount"
          label={pageFieldJsonMainList.totalAmount.displayName}
          sortNo={pageFieldJsonMainList.totalAmount.sortNo}
          decorator={{
            initialValue: currentItem.totalAmount ? currentItem.totalAmount : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入合计金额',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="totalTax"
          label={pageFieldJsonMainList.totalTax.displayName}
          sortNo={pageFieldJsonMainList.totalTax.sortNo}
          decorator={{
            initialValue: currentItem.totalTax ? currentItem.totalTax : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入合计税额',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="checkCode"
          label={pageFieldJsonMainList.checkCode.displayName}
          sortNo={pageFieldJsonMainList.checkCode.sortNo}
          decorator={{
            initialValue: currentItem.checkCode ? currentItem.checkCode : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入校验码',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="amountTax"
          label={pageFieldJsonMainList.amountTax.displayName}
          sortNo={pageFieldJsonMainList.amountTax.sortNo}
          decorator={{
            initialValue: currentItem.amountTax ? currentItem.amountTax : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入价税合计',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="amountTaxCn"
          label={pageFieldJsonMainList.amountTaxCn.displayName}
          sortNo={pageFieldJsonMainList.amountTaxCn.sortNo}
          decorator={{
            initialValue: currentItem.amountTaxCn ? currentItem.amountTaxCn : '',
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入价税合计_中文',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="invReimStatus"
          label={pageFieldJsonMainList.invReimStatus.displayName}
          sortNo={pageFieldJsonMainList.invReimStatus.sortNo}
          decorator={{
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入报销状态',
            //   },
            // ],
            initialValue: currentItem.invReimStatus || undefined,
          }}
        >
          <UdcSelect code="ACC:INV_REIMB_STATUS" disabled={mode === 'view'} />
        </Field>,
        <Field
          name="reimDId"
          label={pageFieldJsonMainList.reimDId.displayName}
          sortNo={pageFieldJsonMainList.reimDId.sortNo}
          decorator={{
            initialValue: currentItem.reimNo ? currentItem.reimNo : '',
          }}
        >
          <span>
            <a
              onClick={() => {
                const { reimType2, reimNo, reimId } = currentItem;
                if (reimId && reimNo && reimType2) {
                  let type;
                  switch (reimType2) {
                    // 差旅报销
                    case 'TRIP': {
                      type = 'trip';
                      break;
                    }
                    // 行政订票报销
                    case 'TICKET': {
                      type = 'trip';
                      break;
                    }
                    // 专项费用报销
                    case 'SPEC': {
                      type = 'spec';
                      break;
                    }
                    // 特殊费用报销 -因公报销
                    case 'BSPECIAL': {
                      type = 'particular';
                      break;
                    }
                    // 特殊费用报销 -个人报销
                    case 'PSPECIAL': {
                      type = 'particular';
                      break;
                    }
                    // 提现付款报销
                    case 'WITHDRAW_PAY': {
                      type = 'withdrawFlowPay';
                      break;
                    }
                    // 非差旅报销
                    default: {
                      type = 'normal';
                      break;
                    }
                  }
                  router.push(`/plat/expense/${type}/view?id=${reimId}`);
                }
              }}
            >
              {currentItem.reimNo}
            </a>
          </span>
          {/* <Input></Input>
            disabled
            onClick={() => {
           
            }}
          /> */}
        </Field>,
        <Field
          name="createUserId"
          label={pageFieldJsonMainList.createUserId.displayName}
          sortNo={pageFieldJsonMainList.createUserId.sortNo}
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
            disabled
          />
        </Field>,
        <Field
          name="invOwnerId"
          label={pageFieldJsonMainList.invOwnerId.displayName}
          sortNo={pageFieldJsonMainList.invOwnerId.sortNo}
          decorator={{
            initialValue: Number(currentItem.invOwnerId) || undefined,
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
            disabled
          />
        </Field>,
        <Field
          name="drawer"
          label={pageFieldJsonMainList.drawer.displayName}
          sortNo={pageFieldJsonMainList.drawer.sortNo}
          decorator={{
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入乘车/机人',
            //   },
            // ],
            initialValue: currentItem.drawer || undefined,
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="leaveCity"
          label={pageFieldJsonMainList.leaveCity.displayName}
          sortNo={pageFieldJsonMainList.leaveCity.sortNo}
          decorator={{
            initialValue: currentItem.leaveCity || undefined,
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入出发站',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="arriveCity"
          label={pageFieldJsonMainList.arriveCity.displayName}
          sortNo={pageFieldJsonMainList.arriveCity.sortNo}
          decorator={{
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入到达站',
            //   },
            // ],
            initialValue: currentItem.arriveCity || undefined,
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="trainNumber"
          label={pageFieldJsonMainList.trainNumber.displayName}
          sortNo={pageFieldJsonMainList.trainNumber.sortNo}
          decorator={{
            initialValue: currentItem.trainNumber || undefined,
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入车次/航班',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="idNum"
          label={pageFieldJsonMainList.idNum.displayName}
          sortNo={pageFieldJsonMainList.idNum.sortNo}
          decorator={{
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入身份证号',
            //   },
            // ],
            initialValue: currentItem.idNum || undefined,
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="trainSeat"
          label={pageFieldJsonMainList.trainSeat.displayName}
          sortNo={pageFieldJsonMainList.trainSeat.sortNo}
          decorator={{
            initialValue: currentItem.trainSeat || undefined,
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入座位等级',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="leaveTime"
          label={pageFieldJsonMainList.leaveTime.displayName}
          sortNo={pageFieldJsonMainList.leaveTime.sortNo}
          decorator={{
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入出发时间',
            //   },
            // ],
            initialValue: currentItem.leaveTime || undefined,
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="arriveTime"
          label={pageFieldJsonMainList.arriveTime.displayName}
          sortNo={pageFieldJsonMainList.arriveTime.sortNo}
          decorator={{
            initialValue: currentItem.arriveTime || undefined,
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入到达时间',
            //   },
            // ],
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="mileage"
          label={pageFieldJsonMainList.mileage.displayName}
          sortNo={pageFieldJsonMainList.mileage.sortNo}
          decorator={{
            // rules: [
            //   {
            //     required: true,
            //     message: '请输入里程',
            //   },
            // ],
            initialValue: currentItem.mileage || undefined,
          }}
        >
          <Input disabled={mode === 'view'} />
        </Field>,
        <Field
          name="remark"
          label={pageFieldJsonMainList.remark.displayName}
          sortNo={pageFieldJsonMainList.remark.sortNo}
          decorator={{
            initialValue: currentItem.remark || undefined,
          }}
        >
          <Input.TextArea rows={2} disabled={mode === 'view'} />
        </Field>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJsonMainList[field.key].visibleFlag === 1)
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
      invoiceList: { currentItem },
    } = this.props;

    const saveBtn = loading.effects[`${DOMAIN}/save`];
    const queryBtn = loading.effects[`${DOMAIN}/queryDetail`];

    const { mode } = fromQs();
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
              保存
            </Button>
          ) : (
            ''
          )}
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              closeThenGoto('/user/center/invoice?_refresh=0');
              // closeThenGoto(markAsTab(from));
            }}
          >
            返回
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="发票详情" />}
          bordered={false}
        >
          {!queryBtn ? (
            <>
              <FieldList
                legend="基本信息"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              >
                {this.renderPageConfig()}
              </FieldList>
              <FieldList legend="明细信息" getFieldDecorator={getFieldDecorator} col={2}>
                <Field
                  name="pResEvalListView"
                  fieldCol={1}
                  labelCol={{ span: 2, xxl: 2 }}
                  wrapperCol={{ span: 22, xxl: 22 }}
                >
                  <DataTable
                    {...this.dtlViewTableProps()}
                    dataSource={
                      !isEmpty(currentItem) &&
                      !isNil(currentItem.dtls) &&
                      Array.isArray(currentItem.dtls)
                        ? currentItem.dtls
                        : []
                    }
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

export default InvoiceDetail;
