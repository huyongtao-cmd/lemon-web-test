import { connect } from 'dva';
import React from 'react';
import moment from 'moment';
import { Button, Card, Form, Input, Divider, Radio, InputNumber, Checkbox, Modal } from 'antd';
import classnames from 'classnames';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { createConfirm } from '@/components/core/Confirm';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { UdcSelect, FileManagerEnhance, DatePicker, Selection } from '@/pages/gen/field';
import AsyncSelect from '@/components/common/AsyncSelect';
import { selectUsers } from '@/services/sys/user';
import { selectProjectTmpl, selectProject } from '@/services/user/project/project';
import { closeThenGoto } from '@/layouts/routerControl';
import createMessage from '@/components/core/AlertMessage';
import EditableDataTable from '@/components/common/EditableDataTable';
import { genFakeId } from '@/utils/mathUtils';
import update from 'immutability-helper';
import { isEmpty, isNil } from 'ramda';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { stringify } from 'qs';
import Loading from '@/components/core/DataLoading';
import { getUrl } from '@/utils/flowToRouter';
import { selectUsersWithBu } from '@/services/gen/list';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const DOMAIN = 'userProjectEdit';

@connect(({ loading, userProjectEdit, dispatch }) => ({
  loading,
  userProjectEdit,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    const key = Object.keys(changedFields)[0];
    const value = Object.values(changedFields)[0];
    if (value) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { key, value: value.value },
      });
    }
  },
})
class ProjectEdit extends React.Component {
  state = {
    projectReportModalVisible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PROJECT_MANAGEMENT_PROJECT_SAVE' },
    });
    dispatch({
      type: `${DOMAIN}/query`,
      payload: param,
    });
  }

  // 保存按钮
  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/save`,
        });
      }
    });
  };

  // 行编辑触发事件
  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      userProjectEdit: { dataSource },
      dispatch,
    } = this.props;

    let value = rowFieldValue;

    // input框赋值转换
    value = value && value.target ? value.target.value : value;

    const newDataSource = update(dataSource, {
      [rowIndex]: {
        [rowField]: {
          $set: value,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource: newDataSource },
    });
  };

  // 点击取消按钮
  toggleProjectReportModal = e => {
    const { projectReportModalVisible } = this.state;
    this.setState({ projectReportModalVisible: !projectReportModalVisible });
  };

  // 自动计算项目汇报计划
  handleAutoReportPlan = e => {
    const {
      userProjectEdit: {
        formData,
        formData: {
          startDate,
          endDate,
          planStartDate,
          planEndDate,
          firstPeriodAmt,
          lastPeriodAmt,
          amt,
        },
        dataSource,
      },
      dispatch,
    } = this.props;
    const planStartDateTemp = startDate || planStartDate;
    const planEndDateTemp = endDate || planEndDate;
    if (moment(planEndDateTemp).isBefore(moment(planStartDateTemp))) {
      createMessage({ type: 'warn', description: '结束日期不能早于开始日期!' });
      return;
    }
    const periods =
      moment(planEndDateTemp)
        .date(1)
        .diff(moment(planStartDateTemp).date(1), 'months') + 1;
    const firstPeriodDay = moment(planStartDateTemp).date();
    const lastPeriodDay = moment(planEndDateTemp).date();

    // eslint-disable-next-line
    let reportPlans = [];
    if (
      firstPeriodDay === 1 &&
      lastPeriodDay ===
        moment(planEndDateTemp)
          .endOf('month')
          .date()
    ) {
      // 整月的情况
      if (isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 未填写首期,末期金额
        const periodAmt = amt / periods;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < periods; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
      } else if (!isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
      } else if (isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        const periodAmt = (amt - lastPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      } else if (!isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt - lastPeriodAmt) / (periods - 2);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      }
    } else if (firstPeriodDay === lastPeriodDay + 1) {
      // 整月的情况
      if (isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 未填写首期,末期金额
        const periodAmt = amt / (periods - 1);
        const daysTemp = moment(planStartDateTemp).daysInMonth();
        const firstPeriodAmtTemp = (periodAmt * (daysTemp - firstPeriodDay + 1)) / 30;
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmtTemp.toFixed(2),
        });
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: (amt - firstPeriodAmtTemp - periodAmt * (periods - 2)).toFixed(2),
        });
      } else if (!isNil(firstPeriodAmt) && isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
      } else if (isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,未填写末期金额
        const periodAmt = (amt - lastPeriodAmt) / (periods - 1);
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      } else if (!isNil(firstPeriodAmt) && !isNil(lastPeriodAmt)) {
        // 填写首期,末期金额
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(moment(planStartDateTemp).date(1)),
          amt: firstPeriodAmt.toFixed(2),
        });
        const periodAmt = (amt - firstPeriodAmt - lastPeriodAmt) / (periods - 2);
        // eslint-disable-next-line no-plusplus
        for (let i = 1; i < periods - 1; i++) {
          reportPlans.push({
            id: genFakeId(-1),
            periodDate: formatDT(
              moment(planStartDateTemp)
                .date(1)
                .add(i, 'months')
            ),
            amt: periodAmt.toFixed(2),
          });
        }
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(periods - 1, 'months')
          ),
          amt: lastPeriodAmt.toFixed(2),
        });
      }
    } else {
      // 非整月情况,必须自己输入首期金额和末期金额
      if (isNil(firstPeriodAmt) || isNil(lastPeriodAmt)) {
        createMessage({ type: 'warn', description: '非整月周期的项目需要填写首期金额和末期金额!' });
        return;
      }
      const periodAmt = (amt - firstPeriodAmt - lastPeriodAmt) / (periods - 2);
      reportPlans.push({
        id: genFakeId(-1),
        periodDate: formatDT(moment(planStartDateTemp).date(1)),
        amt: firstPeriodAmt.toFixed(2),
      });
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i < periods - 1; i++) {
        reportPlans.push({
          id: genFakeId(-1),
          periodDate: formatDT(
            moment(planStartDateTemp)
              .date(1)
              .add(i, 'months')
          ),
          amt: periodAmt.toFixed(2),
        });
      }
      reportPlans.push({
        id: genFakeId(-1),
        periodDate: formatDT(
          moment(planStartDateTemp)
            .date(1)
            .add(periods - 1, 'months')
        ),
        amt: lastPeriodAmt.toFixed(2),
      });
    }

    this.toggleProjectReportModal();

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        dataSource: update(dataSource, {
          $push: reportPlans,
        }),
      },
    });
  };

  renderPage = () => {
    const {
      dispatch,
      loading,
      userProjectEdit: { formData, dataSource, deleteKeys, pageConfig },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    // console.log(pageConfig, 'pageConfig');
    const { projectReportModalVisible } = this.state;
    const param = fromQs();
    // 页面配置信息数据处理
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentProjrctConfig = [];
    let currentReportConfig = [];
    let currentContractConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_PROJECT') {
        currentProjrctConfig = view;
      } else if (view.tableName === 'T_PROJ_REPORT_PLAN') {
        currentReportConfig = view;
      } else if (view.tableName === 'T_CONTRACT') {
        currentContractConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsProject } = currentProjrctConfig; // 项目表
    const { pageFieldViews: pageFieldViewsReport } = currentReportConfig; // 项目汇报表
    const { pageFieldViews: pageFieldViewsContract } = currentContractConfig; // 合同表

    const pageFieldJsonProject = {}; // 项目表
    const pageFieldJsonReport = {}; // 项目汇报表
    const pageFieldJsonContract = {}; // 合同表
    if (pageFieldViewsProject) {
      pageFieldViewsProject.forEach(field => {
        pageFieldJsonProject[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsReport) {
      pageFieldViewsReport.forEach(field => {
        pageFieldJsonReport[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsContract) {
      pageFieldViewsContract.forEach(field => {
        pageFieldJsonContract[field.fieldKey] = field;
      });
    }
    const basicFields = [
      <Field
        name="projName"
        key="projName"
        label={pageFieldJsonProject.projName.displayName}
        sortNo={pageFieldJsonProject.projName.sortNo}
        decorator={{
          initialValue: formData.projName,
          rules: [
            {
              required: !!pageFieldJsonProject.projName.requiredFlag,
              message: `请输入${pageFieldJsonProject.projName.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.projName.displayName}`} />
      </Field>,
      <Field
        name="projNo"
        key="projNo"
        label={pageFieldJsonProject.projNo.displayName}
        sortNo={pageFieldJsonProject.projNo.sortNo}
        decorator={{
          initialValue: formData.projNo,
          rules: [
            {
              required: !!pageFieldJsonProject.projNo.requiredFlag,
              message: `请输入${pageFieldJsonProject.projNo.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.projNo.displayName}`} disabled />
      </Field>,
      <Field
        name="custIdst"
        key="custIdst"
        label={pageFieldJsonProject.custIdst.displayName}
        sortNo={pageFieldJsonProject.custIdst.sortNo}
        decorator={{
          initialValue: formData.custIdst,
          rules: [
            {
              required: !!pageFieldJsonProject.custIdst.requiredFlag,
              message: `请选择${pageFieldJsonProject.custIdst.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="TSK.OU_IDST"
          placeholder={`请选择${pageFieldJsonProject.custIdst.displayName}`}
        />
      </Field>,
      <Field
        name="custRegion"
        key="custRegion"
        label={pageFieldJsonProject.custRegion.displayName}
        sortNo={pageFieldJsonProject.custRegion.sortNo}
        decorator={{
          initialValue: formData.custRegion,
          rules: [
            {
              required: !!pageFieldJsonProject.custRegion.requiredFlag,
              message: `请选择${pageFieldJsonProject.custRegion.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="TSK:CUST_REGION"
          placeholder={`请选择${pageFieldJsonProject.custRegion.displayName}`}
        />
      </Field>,
      <Field
        name="deliveryAddress"
        key="deliveryAddress"
        label={pageFieldJsonContract.deliveryAddress.displayName}
        sortNo={pageFieldJsonContract.deliveryAddress.sortNo}
        decorator={{
          initialValue: formData.deliveryAddress,
          rules: [
            {
              required: !!pageFieldJsonContract.deliveryAddress.requiredFlag,
              message: `请输入${pageFieldJsonContract.deliveryAddress.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="ouName"
        key="ouId"
        label={pageFieldJsonContract.ouId.displayName}
        sortNo={pageFieldJsonContract.ouId.sortNo}
        decorator={{
          initialValue: formData.ouName && formData.ouName + '',
          rules: [
            {
              required: !!pageFieldJsonContract.ouId.requiredFlag,
              message: `请输入${pageFieldJsonContract.ouId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="workTypeDesc"
        key="workType"
        label={pageFieldJsonContract.workType.displayName}
        sortNo={pageFieldJsonContract.workType.sortNo}
        decorator={{
          initialValue: formData.workTypeDesc,
          rules: [
            {
              required: !!pageFieldJsonContract.workType.requiredFlag,
              message: `请选择${pageFieldJsonContract.workType.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="projTempId"
        kwy="projTempId"
        label={pageFieldJsonProject.projTempId.displayName}
        sortNo={pageFieldJsonProject.projTempId.sortNo}
        decorator={{
          initialValue: formData.projTempId && formData.projTempId + '',
          rules: [
            {
              required: !!pageFieldJsonProject.projTempId.requiredFlag,
              message: `请选择${pageFieldJsonProject.projTempId.displayName}`,
            },
          ],
        }}
      >
        <AsyncSelect
          source={() => selectProjectTmpl().then(resp => resp.response)}
          placeholder={`请选择${pageFieldJsonProject.projTempId.displayName}`}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
          disabled={param.mode === 'update' && formData.projStatus !== 'CREATE'}
        />
      </Field>,
      <Field
        name="planStartDate"
        key="planStartDate"
        label={pageFieldJsonProject.planStartDate.displayName}
        sortNo={pageFieldJsonProject.planStartDate.sortNo}
        decorator={{
          initialValue: formData.planStartDate,
          rules: [
            {
              required: !!pageFieldJsonProject.planStartDate.requiredFlag,
              message: `请选择${pageFieldJsonProject.planStartDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="planEndDate"
        key="planEndDate"
        label={pageFieldJsonProject.planEndDate.displayName}
        sortNo={pageFieldJsonProject.planEndDate.sortNo}
        decorator={{
          initialValue: formData.planEndDate,
          rules: [
            {
              required: !!pageFieldJsonProject.planEndDate.requiredFlag,
              message: `请选择${pageFieldJsonProject.planEndDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker className="x-fill-100" />
      </Field>,
      <Field
        name="custpaytravelFlag"
        key="custpaytravelFlag"
        label={pageFieldJsonContract.custpaytravelFlag.displayName}
        sortNo={pageFieldJsonContract.custpaytravelFlag.sortNo}
        decorator={{
          initialValue: formData.custpaytravelFlag || '',
          rules: [
            {
              required: !!pageFieldJsonContract.custpaytravelFlag.requiredFlag,
              message: `请输入${pageFieldJsonContract.custpaytravelFlag.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect code="ACC:CONTRACT_CUSTPAY_TRAVEL" placeholder="请选择..." disabled />
      </Field>,
      <Field name="sow" label="SOW节选">
        <FileManagerEnhance
          api="/api/op/v1/project/sow/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
          // 自动复制功能参数，不常用
          // copy={!isNil(formData.noProjId) ? formData.noProjId : null}
          // copy={41}
          // copyData={{
          //   from: {
          //     api: '/api/op/v1/noContract/project/sow/sfs/token',
          //     sfsRepoCode: 'noContract',
          //     sfsClsPath: 'sow',
          //   },
          //   to: {
          //     api: '/api/op/v1/project/sow/sfs/token',
          //     sfsRepoCodeNew: 'project',
          //     sfsClsPathNew: 'sow',
          //   },
          // }}
        />
      </Field>,
      <FieldLine
        key="maxTravelFee"
        label={pageFieldJsonProject.maxTravelFee.displayName}
        sortNo={pageFieldJsonProject.maxTravelFee.sortNo}
      >
        <Field
          name="maxTravelFee"
          key="maxTravelFee"
          decorator={{
            initialValue: formData.maxTravelFee,
            rules: [
              {
                required: !!pageFieldJsonProject.maxTravelFee.requiredFlag,
                message: `请输入${pageFieldJsonProject.maxTravelFee.displayName}`,
              },
              { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Input placeholder={`请输入${pageFieldJsonProject.maxTravelFee.displayName}`} />
        </Field>
        <Field name="maxTravelFeeDesc" wrapperCol={{ span: 23, offset: 1, xxl: 23 }}>
          <span>/天</span>
        </Field>
      </FieldLine>,
      <Field
        name="currCodeDesc"
        key="currCode"
        label={pageFieldJsonContract.currCode.displayName}
        sortNo={pageFieldJsonContract.currCode.sortNo}
        decorator={{
          initialValue: formData.currCodeDesc,
          rules: [
            {
              required: !!pageFieldJsonContract.currCode.requiredFlag,
              message: `请选择${pageFieldJsonContract.currCode.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="remark"
        key="remark"
        label={pageFieldJsonProject.remark.displayName}
        sortNo={pageFieldJsonProject.remark.sortNo}
        decorator={{
          initialValue: formData.remark,
          rules: [
            {
              required: !!pageFieldJsonProject.remark.requiredFlag,
              message: `请输入${pageFieldJsonProject.remark.displayName}`,
            },
            { max: 400, message: '不超过400个字' },
          ],
        }}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
      >
        <Input.TextArea
          placeholder={`请输入${pageFieldJsonProject.remark.displayName}`}
          autosize={{ minRows: 3, maxRows: 6 }}
        />
      </Field>,
      <Field
        name="projStatus"
        key="projStatus"
        label={pageFieldJsonProject.projStatus.displayName}
        sortNo={pageFieldJsonProject.projStatus.sortNo}
        decorator={{
          initialValue: formData.projStatus,
          rules: [
            {
              required: !!pageFieldJsonProject.projStatus.requiredFlag,
              message: `请选择${pageFieldJsonProject.projStatus.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="TSK.PROJ_STATUS"
          placeholder={`请选择${pageFieldJsonProject.projStatus.displayName}`}
          disabled
        />
      </Field>,
      <Field
        name="createUserName"
        key="createUserId"
        label={pageFieldJsonProject.createUserId.displayName}
        sortNo={pageFieldJsonProject.createUserId.sortNo}
        decorator={{
          initialValue: formData.createUserName,
          rules: [
            {
              required: !!pageFieldJsonProject.createUserId.requiredFlag,
              message: `${pageFieldJsonProject.createUserId.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`${pageFieldJsonProject.createUserId.displayName}`} disabled />
      </Field>,
      <Field
        name="createTime"
        key="createTime"
        label={pageFieldJsonProject.createTime.displayName}
        sortNo={pageFieldJsonProject.createTime.sortNo}
        decorator={{
          initialValue: formData.createTime,
          rules: [
            {
              required: !!pageFieldJsonProject.createTime.requiredFlag,
              message: `${pageFieldJsonProject.createTime.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`${pageFieldJsonProject.createTime.displayName}`} disabled />
      </Field>,
    ];
    const filterList1 = basicFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const releateFields = [
      <Field
        name="deliBuName"
        key="deliBuId"
        label={pageFieldJsonContract.deliBuId.displayName}
        sortNo={pageFieldJsonContract.deliBuId.sortNo}
        decorator={{
          initialValue: formData.deliBuName && formData.deliBuName + '',
          rules: [
            {
              required: !!pageFieldJsonContract.deliBuId.requiredFlag,
              message: `请选择${pageFieldJsonContract.deliBuId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="deliResName"
        key="deliResId"
        label={pageFieldJsonContract.deliResId.displayName}
        sortNo={pageFieldJsonContract.deliResId.sortNo}
        decorator={{
          initialValue: formData.deliResName && formData.deliResName + '',
          rules: [
            {
              required: !!pageFieldJsonContract.deliResId.requiredFlag,
              message: `请选择${pageFieldJsonContract.deliResId.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="projectDifficult"
        key="projectDifficult"
        label={pageFieldJsonProject.projectDifficult.displayName}
        sortNo={pageFieldJsonProject.projectDifficult.sortNo}
        decorator={{
          initialValue: formData.projectDifficult,
          rules: [
            {
              required: !!pageFieldJsonProject.projectDifficult.requiredFlag,
              message: `请选择${pageFieldJsonProject.projectDifficult.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="ACC:PROJECT_DIFFICULTY"
          placeholder={`请选择${pageFieldJsonProject.projectDifficult.displayName}`}
        />
      </Field>,
      <Field
        name="projectImportance"
        key="projectImportance"
        label={pageFieldJsonProject.projectImportance.displayName}
        sortNo={pageFieldJsonProject.projectImportance.sortNo}
        decorator={{
          initialValue: formData.projectImportance,
          rules: [
            {
              required: !!pageFieldJsonProject.projectImportance.requiredFlag,
              message: `请选择${pageFieldJsonProject.projectImportance.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="ACC:PROJECT_IMPORTANCE"
          placeholder={`请选择${pageFieldJsonProject.projectImportance.displayName}`}
        />
      </Field>,
      <Field
        name="pmResId"
        key="pmResId"
        label={pageFieldJsonProject.pmResId.displayName}
        sortNo={pageFieldJsonProject.pmResId.sortNo}
        decorator={{
          initialValue: formData.pmResId && formData.pmResId + '',
          rules: [
            {
              required: !!pageFieldJsonProject.pmResId.requiredFlag,
              message: `请选择${pageFieldJsonProject.pmResId.displayName}`,
            },
          ],
        }}
      >
        <AsyncSelect
          source={() => selectUsers().then(resp => resp.response)}
          placeholder={`请选择${pageFieldJsonProject.pmResId.displayName}`}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,
      <Field
        name="pmEqvaRatio"
        key="pmEqvaRatio"
        label={pageFieldJsonProject.pmEqvaRatio.displayName}
        sortNo={pageFieldJsonProject.pmEqvaRatio.sortNo}
        decorator={{
          initialValue: formData.pmEqvaRatio,
          rules: [
            {
              required: !!pageFieldJsonProject.pmEqvaRatio.requiredFlag,
              message: `请输入${pageFieldJsonProject.pmEqvaRatio.displayName}`,
            },
            {
              pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
              message: '请输入浮点数',
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.pmEqvaRatio.displayName}`} />
      </Field>,
      <Field
        name="salesmanResName"
        key="salesmanResId"
        label={pageFieldJsonContract.salesmanResId.displayName}
        sortNo={pageFieldJsonContract.salesmanResId.sortNo}
        decorator={{
          initialValue: formData.salesmanResName && formData.salesmanResName + '',
          rules: [
            {
              required: !!pageFieldJsonContract.salesmanResId.requiredFlag,
              message: `请选择${pageFieldJsonContract.salesmanResId.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请选择${pageFieldJsonContract.salesmanResId.displayName}`} disabled />
      </Field>,
      <Field
        name="pmoResId"
        key="pmoResId"
        label={pageFieldJsonProject.pmoResId.displayName}
        sortNo={pageFieldJsonProject.pmoResId.sortNo}
        decorator={{
          initialValue: formData.pmoResId,
          rules: [
            {
              required: !!pageFieldJsonProject.pmoResId.requiredFlag,
              message: `请选择${pageFieldJsonProject.pmoResId.displayName}`,
            },
          ],
        }}
      >
        <Selection.Columns
          className="x-fill-100"
          source={() => selectUsersWithBu()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {}}
          placeholder={`请选择${pageFieldJsonProject.pmoResId.displayName}`}
        />
      </Field>,
    ];
    const filterList2 = releateFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const budgetFields = [
      <Field
        name="totalDays"
        key="totalDays"
        label={pageFieldJsonProject.totalDays.displayName}
        sortNo={pageFieldJsonProject.totalDays.sortNo}
        decorator={{
          initialValue: formData.totalDays,
          rules: [
            {
              required: !!pageFieldJsonProject.totalDays.requiredFlag,
              message: `请输入${pageFieldJsonProject.totalDays.displayName}`,
            },
            {
              pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
              message: '请输入浮点数',
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.totalDays.displayName}`} />
      </Field>,
      <Field
        name="totalEqva"
        key="totalEqva"
        label={pageFieldJsonProject.totalEqva.displayName}
        sortNo={pageFieldJsonProject.totalEqva.sortNo}
        decorator={{
          initialValue: formData.totalEqva,
          rules: [
            {
              required: !!pageFieldJsonProject.totalEqva.requiredFlag,
              message: `请输入${pageFieldJsonProject.totalEqva.displayName}`,
            },
            {
              pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
              message: '请输入浮点数',
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.totalEqva.displayName}`} />
      </Field>,
      <FieldLine
        key="eqvaPrice"
        label={pageFieldJsonProject.eqvaPrice.displayName}
        sortNo={pageFieldJsonProject.eqvaPrice.sortNo}
        required={!!pageFieldJsonProject.eqvaPrice.requiredFlag}
      >
        <Field
          name="eqvaPrice"
          key="eqvaPrice"
          decorator={{
            initialValue: formData.eqvaPrice,
            rules: [
              {
                required: !!pageFieldJsonProject.totalEqva.requiredFlag,
                message: `请输入${pageFieldJsonProject.eqvaPrice.displayName}`,
              },
              {
                pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
                message: '请输入浮点数',
              },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Input placeholder={`请输入${pageFieldJsonProject.eqvaPrice.displayName}`} />
        </Field>
        <Field
          name="eqvaPriceTotal"
          decorator={{
            initialValue: formData.eqvaPriceTotal,
            rules: [
              { required: false, message: '请输入当量预估总价' },
              { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Input placeholder="当量预估总价" disabled />
        </Field>
      </FieldLine>,
      <Field
        name="totalReimbursement"
        key="totalReimbursement"
        label={pageFieldJsonProject.totalReimbursement.displayName}
        sortNo={pageFieldJsonProject.totalReimbursement.sortNo}
        decorator={{
          initialValue: formData.totalReimbursement,
          rules: [
            {
              required: !!pageFieldJsonProject.totalReimbursement.requiredFlag,
              message: `请输入${pageFieldJsonProject.totalReimbursement.displayName}`,
            },
            {
              pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
              message: '请输入浮点数',
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.totalReimbursement.displayName}`} />
      </Field>,
      <Field name="reimbursement" label="预算附件">
        <FileManagerEnhance
          api="/api/op/v1/project/budget/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,
      <Field
        name="totalCost"
        key="totalCost"
        label={pageFieldJsonProject.totalCost.displayName}
        sortNo={pageFieldJsonProject.totalCost.sortNo}
        decorator={{
          initialValue: formData.totalCost,
          rules: [
            {
              required: !!pageFieldJsonProject.totalCost.requiredFlag,
              message: `请输入${pageFieldJsonProject.totalCost.displayName}`,
            },
            {
              pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
              message: '请输入浮点数',
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.totalCost.displayName}`} />
      </Field>,
    ];
    const filterList3 = budgetFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const authorizationFields = [
      <Field
        name="epibolyPermitFlag"
        key="epibolyPermitFlag"
        label={pageFieldJsonProject.epibolyPermitFlag.displayName}
        sortNo={pageFieldJsonProject.epibolyPermitFlag.sortNo}
        decorator={{
          initialValue: formData.epibolyPermitFlag,
          rules: [
            {
              required: !!pageFieldJsonProject.epibolyPermitFlag.requiredFlag,
              message: `请输入${pageFieldJsonProject.epibolyPermitFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          onChange={e => {
            formData.epibolyPermitFlag = e.target.value;
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="subcontractPermitFlag"
        key="subcontractPermitFlag"
        label={pageFieldJsonProject.subcontractPermitFlag.displayName}
        sortNo={pageFieldJsonProject.subcontractPermitFlag.sortNo}
        decorator={{
          initialValue: formData.subcontractPermitFlag,
          rules: [
            {
              required: !!pageFieldJsonProject.subcontractPermitFlag.requiredFlag,
              message: `请输入${pageFieldJsonProject.subcontractPermitFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          onChange={e => {
            formData.subcontractPermitFlag = e.target.value;
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="timesheetPeriod"
        key="timesheetPeriod"
        label={pageFieldJsonProject.timesheetPeriod.displayName}
        sortNo={pageFieldJsonProject.timesheetPeriod.sortNo}
        decorator={{
          initialValue: formData.timesheetPeriod,
          rules: [
            {
              required: !!pageFieldJsonProject.timesheetPeriod.requiredFlag,
              message: `请选择${pageFieldJsonProject.timesheetPeriod.displayName}`,
            },
          ],
        }}
      >
        <UdcSelect
          code="TSK.TIMESHEET_SETTLE_PERIOD"
          placeholder={`请选择${pageFieldJsonProject.timesheetPeriod.displayName}`}
        />
      </Field>,
      <Field
        name="finishApproveFlag"
        key="finishApproveFlag"
        label={pageFieldJsonProject.finishApproveFlag.displayName}
        sortNo={pageFieldJsonProject.finishApproveFlag.sortNo}
        decorator={{
          initialValue: formData.finishApproveFlag,
          rules: [
            {
              required: !!pageFieldJsonProject.finishApproveFlag.requiredFlag,
              message: `请输入${pageFieldJsonProject.finishApproveFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          onChange={e => {
            formData.finishApproveFlag = e.target.value;
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="deposit"
        key="deposit"
        label={pageFieldJsonProject.deposit.displayName}
        sortNo={pageFieldJsonProject.deposit.sortNo}
        decorator={{
          initialValue: formData.deposit,
          rules: [
            {
              required: !!pageFieldJsonProject.deposit.requiredFlag,
              message: `请选择${pageFieldJsonProject.deposit.displayName}`,
            },
            {
              pattern: /^(\d|[1-9]\d|100)(\.\d{1,2})?$/,
              message: '可输入0-100，最多保留2位小数',
            },
          ],
        }}
      >
        <Input placeholder={`请选择${pageFieldJsonProject.deposit.displayName}`} />
      </Field>,
      <Field
        name="muiltiTaskFlag"
        key="muiltiTaskFlag"
        label={pageFieldJsonProject.muiltiTaskFlag.displayName}
        sortNo={pageFieldJsonProject.muiltiTaskFlag.sortNo}
        decorator={{
          initialValue: formData.muiltiTaskFlag,
          rules: [
            {
              required: !!pageFieldJsonProject.muiltiTaskFlag.requiredFlag,
              message: `请选择是否${pageFieldJsonProject.muiltiTaskFlag.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          onChange={e => {
            formData.muiltiTaskFlag = e.target.value;
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="containsCustomerFlag"
        key="containsCustomerFlag"
        label={pageFieldJsonProject.containsCustomerFlag.displayName}
        sortNo={pageFieldJsonProject.containsCustomerFlag.sortNo}
        decorator={{
          initialValue: formData.containsCustomerFlag,
          rules: [
            {
              required: !!pageFieldJsonProject.containsCustomerFlag.requiredFlag,
              message: `请选择${pageFieldJsonProject.containsCustomerFlag.displayName}`,
            },
          ],
        }}
        labelCol={{ span: 10, xxl: 8 }}
      >
        <RadioGroup
          onChange={e => {
            formData.containsCustomerFlag = e.target.value;
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
      <Field
        name="budgetSwitchFlag"
        key="budgetSwitchFlag"
        label={pageFieldJsonProject.budgetSwitchFlag.displayName}
        sortNo={pageFieldJsonProject.budgetSwitchFlag.sortNo}
        decorator={{
          initialValue: formData.budgetSwitchFlag,
          rules: [
            {
              required: !!pageFieldJsonProject.budgetSwitchFlag.requiredFlag,
              message: `请选择${pageFieldJsonProject.budgetSwitchFlag.displayName}`,
            },
          ],
        }}
        labelCol={{ span: 10, xxl: 8 }}
      >
        <RadioGroup
          onChange={e => {
            formData.budgetSwitchFlag = e.target.value;
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </RadioGroup>
      </Field>,
    ];
    const filterList4 = authorizationFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const otherinfoFields = [
      <Field
        name="userdefinedNo"
        key="userdefinedNo"
        label={pageFieldJsonContract.userdefinedNo.displayName}
        sortNo={pageFieldJsonContract.userdefinedNo.sortNo}
        decorator={{
          initialValue: formData.userdefinedNo,
          rules: [
            {
              required: !!pageFieldJsonContract.userdefinedNo.requiredFlag,
              message: `请输入${pageFieldJsonContract.userdefinedNo.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="relatedProjId"
        key="relatedProjId"
        label={pageFieldJsonProject.relatedProjId.displayName}
        sortNo={pageFieldJsonProject.relatedProjId.sortNo}
        decorator={{
          initialValue: formData.relatedProjId && formData.relatedProjId + '',
          rules: [
            {
              required: !!pageFieldJsonProject.relatedProjId.requiredFlag,
              message: `请选择${pageFieldJsonProject.relatedProjId.displayName}`,
            },
          ],
        }}
      >
        <AsyncSelect
          source={() => selectProject().then(resp => resp.response)}
          placeholder={`请选择${pageFieldJsonProject.relatedProjId.displayName}`}
          showSearch
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        />
      </Field>,
      <Field
        name="performanceDesc"
        key="performanceDesc"
        label={pageFieldJsonProject.performanceDesc.displayName}
        sortNo={pageFieldJsonProject.performanceDesc.sortNo}
        decorator={{
          initialValue: formData.performanceDesc,
          rules: [
            {
              required: !!pageFieldJsonProject.performanceDesc.requiredFlag,
              message: `请输入${pageFieldJsonProject.performanceDesc.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${pageFieldJsonProject.performanceDesc.displayName}`} />
      </Field>,

      <Field name="performance" label="绩效附件">
        <FileManagerEnhance
          api="/api/op/v1/project/performance/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,
      <FieldLine
        key="amt"
        label={
          pageFieldJsonContract.amt.displayName + '/' + pageFieldJsonContract.taxRate.displayName
        }
        sortNo={pageFieldJsonContract.amt.sortNo}
        required={!!pageFieldJsonContract.amt.requiredFlag}
      >
        <Field
          name="amt"
          decorator={{
            initialValue: formData.amt,
            rules: [
              {
                required: !!pageFieldJsonContract.amt.requiredFlag,
                message: `请输入${pageFieldJsonContract.amt.displayName}`,
              },
              { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Input placeholder={`请输入${pageFieldJsonContract.amt.displayName}`} disabled />
        </Field>
        <Field
          name="taxRate"
          decorator={{
            initialValue: formData.taxRate,
            rules: [
              {
                required: !!pageFieldJsonContract.taxRate.requiredFlag,
                message: `请输入${pageFieldJsonContract.taxRate.displayName}`,
              },
              { pattern: /^[-+]?[0-9]*\.?[0-9]+$/, message: '请输入浮点数' },
            ],
          }}
          wrapperCol={{ span: 23, xxl: 23 }}
        >
          <Input placeholder={`请输入${pageFieldJsonContract.taxRate.displayName}`} disabled />
        </Field>
      </FieldLine>,
      <Field
        name="effectiveAmt"
        key="effectiveAmt"
        label={pageFieldJsonContract.effectiveAmt.displayName}
        sortNo={pageFieldJsonContract.effectiveAmt.sortNo}
        decorator={{
          initialValue: formData.effectiveAmt,
          rules: [
            {
              required: !!pageFieldJsonContract.effectiveAmt.requiredFlag,
              message: `请输入${pageFieldJsonContract.effectiveAmt.displayName}`,
            },
            {
              pattern: /^[-+]?[0-9]*\.?[0-9]+$/,
              message: '请输入浮点数',
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,
      <Field
        name="closeReasonDesc"
        key="closeReason"
        label={pageFieldJsonProject.closeReason.displayName}
        sortNo={pageFieldJsonProject.closeReason.sortNo}
        decorator={{
          initialValue: formData.closeReasonDesc,
          rules: [
            {
              required: !!pageFieldJsonProject.closeReason.requiredFlag,
              message: `请输入${pageFieldJsonProject.closeReason.displayName}`,
            },
          ],
        }}
      >
        <Input disabled />
      </Field>,

      <Field name="11" label="附件">
        <FileManagerEnhance
          api="/api/op/v1/project/attachment/sfs/token"
          dataKey={formData.id}
          listType="text"
          disabled={false}
        />
      </Field>,
    ];
    const filterList5 = otherinfoFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1) ||
          (pageFieldJsonContract[field.key] && pageFieldJsonContract[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    const autoReportFields = [
      <Field
        name="autoReportFlag"
        key="autoReportFlag"
        label={pageFieldJsonProject.autoReportFlag.displayName}
        sortNo={pageFieldJsonProject.autoReportFlag.sortNo}
        decorator={{
          initialValue: formData.autoReportFlag,
          rules: [
            {
              required: !!pageFieldJsonProject.autoReportFlag.requiredFlag,
              message: `请选择${pageFieldJsonProject.autoReportFlag.displayName}`,
            },
          ],
        }}
      >
        <Radio.Group
          onChange={e => {
            const { value } = e.target;
            const reportParams = {
              reportPeriodAmt: undefined,
              reportStartDate: undefined,
              reportQty: undefined,
            };
            if (value === 0) {
              setFieldsValue(reportParams);
              dispatch({
                type: `${DOMAIN}/updateForm2`,
                payload: reportParams,
              });
            }
          }}
        >
          <Radio value={1}>是</Radio>
          <Radio value={0}>否</Radio>
        </Radio.Group>
      </Field>,
    ];
    const filterList6 = autoReportFields
      .filter(
        field =>
          !field.key ||
          (pageFieldJsonProject[field.key] && pageFieldJsonProject[field.key].visibleFlag === 1)
      )
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <>
        <FieldList
          layout="horizontal"
          legend="项目简况"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList1}
        </FieldList>
        <Divider dashed />
        <FieldList
          layout="horizontal"
          legend="相关人员"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList2}
        </FieldList>
        <Divider dashed />
        <FieldList
          layout="horizontal"
          legend="总预算信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList3}
        </FieldList>
        <Divider dashed />
        <FieldList
          layout="horizontal"
          legend="授权信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList4}
        </FieldList>
        <Divider dashed />
        <FieldList
          layout="horizontal"
          legend="其他信息"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList5}
        </FieldList>
        <Divider dashed />
        <FieldList
          layout="horizontal"
          legend="项目汇报策略"
          getFieldDecorator={getFieldDecorator}
          col={2}
        >
          {filterList6}
        </FieldList>
      </>
    );
  };

  render() {
    const {
      dispatch,
      loading,
      userProjectEdit: { formData, dataSource, deleteKeys, pageConfig },
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    // console.log(pageConfig, 'pageConfig');
    const { projectReportModalVisible } = this.state;
    // loading完成之前将按钮设为禁用
    const disabledBtn =
      loading.effects[`${DOMAIN}/query`] ||
      loading.effects[`${DOMAIN}/save`] ||
      loading.effects[`${DOMAIN}/getPageConfig`];
    const param = fromQs();

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }

    let currentReportConfig = [];
    pageConfig.pageBlockViews.forEach(view => {
      if (view.tableName === 'T_PROJ_REPORT_PLAN') {
        currentReportConfig = view;
      }
    });
    const { pageFieldViews: pageFieldViewsReport } = currentReportConfig; // 项目汇报表
    const pageFieldJsonReport = {}; // 项目汇报表
    if (pageFieldViewsReport) {
      pageFieldViewsReport.forEach(field => {
        pageFieldJsonReport[field.fieldKey] = field;
      });
    }
    const editTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      total: 0,
      dataSource,
      showCopy: true,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: update(dataSource, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (_selectedRowKeys, selectedRows) => {
        const unValidSize = selectedRows.filter(row => row.briefId).length;
        if (unValidSize > 0) {
          createMessage({ type: 'warn', description: '已汇报的不能删除!' });
          return;
        }
        const newDataSource = dataSource.filter(row => _selectedRowKeys.indexOf(row.id) < 0);
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
            deleteKeys: [...deleteKeys, ..._selectedRowKeys],
          },
        });
      },
      onCopyItem: copied => {
        const newDataSource = update(dataSource, {
          $push: copied.map(item => ({
            ...item,
            id: genFakeId(-1),
          })),
        });
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            dataSource: newDataSource,
          },
        });
      },
      columns: [
        pageFieldJsonReport.periodDate.visibleFlag && {
          title: `${pageFieldJsonReport.periodDate.displayName}`,
          sortNo: `${pageFieldJsonReport.periodDate.sortNo}`,
          dataIndex: 'periodDate',
          required: !!pageFieldJsonReport.periodDate.requiredFlag,
          align: 'center',
          width: 100,
          options: {
            rules: [
              {
                required: !!pageFieldJsonReport.periodDate.requiredFlag,
                message: `请输入${pageFieldJsonReport.periodDate.displayName}！`,
              },
            ],
          },
          render: (value, row, index) => (
            <DatePicker.MonthPicker
              placeholder={`${pageFieldJsonReport.periodDate.displayName}`}
              value={value}
              disabled={row.briefId}
              size="small"
              style={{ width: '100%' }}
              onChange={this.onCellChanged(index, 'periodDate')}
            />
          ),
        },
        pageFieldJsonReport.amt.visibleFlag && {
          title: `${pageFieldJsonReport.amt.displayName}`,
          sortNo: `${pageFieldJsonReport.amt.sortNo}`,
          dataIndex: 'amt',
          required: !!pageFieldJsonReport.amt.requiredFlag,
          width: 100,
          options: {
            rules: [
              {
                required: !!pageFieldJsonReport.amt.requiredFlag,
                message: `请输入${pageFieldJsonReport.amt.displayName}！`,
              },
            ],
          },
          render: (value, row, index) => (
            <InputNumber
              defaultValue={value}
              value={value}
              disabled={row.briefId}
              size="small"
              style={{ width: '100%' }}
              onChange={this.onCellChanged(index, 'amt')}
            />
          ),
        },
        pageFieldJsonReport.remark.visibleFlag && {
          title: `${pageFieldJsonReport.remark.displayName}`,
          sortNo: `${pageFieldJsonReport.remark.sortNo}`,
          dataIndex: 'remark',
          required: !!pageFieldJsonReport.remark.requiredFlag,
          width: 200,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              value={value}
              size="small"
              onChange={this.onCellChanged(index, 'remark')}
            />
          ),
        },
        pageFieldJsonReport.briefId.visibleFlag && {
          title: `${pageFieldJsonReport.briefId.displayName}`,
          sortNo: `${pageFieldJsonReport.briefId.sortNo}`,
          dataIndex: 'briefNo',
          required: !!pageFieldJsonReport.briefId.requiredFlag,
          align: 'center',
          width: 100,
          render: (value, row, index) => (
            <a
              className="tw-link"
              onClick={() => router.push(`/user/project/projectReportDetail?id=${row.briefId}`)}
            >
              {row.briefNo}
            </a>
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      buttons: [
        {
          key: 'autoReportPlan',
          title: '自动计算汇报计划',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (_selectedRowKeys, selectedRows) => {
            this.toggleProjectReportModal();
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          {param.from && !param.from.includes('noContractProj') ? (
            <Button
              className="tw-btn-primary"
              icon="save"
              size="large"
              disabled={disabledBtn}
              onClick={() => {
                if (formData.projStatus !== 'CREATE') {
                  createMessage({ type: 'error', description: '只有状态为新建的项目才可以派发。' });
                  return;
                }
                closeThenGoto(`/user/distribute/create?projId=${formData.id}`);
              }}
            >
              {/* {formatMessage({ id: `misc.distribute`, desc: '派发' })} */}
              指派项目经理
            </Button>
          ) : (
            ''
          )}

          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={() => {
              const urls = getUrl();
              const from = stringify({ from: urls });
              router.push(
                `/sale/contract/salesSubDetail?mainId=${formData.mainContractId}&id=${
                  formData.contractId
                }&${from}`
              );
            }}
          >
            {formatMessage({ id: `misc.check.contract`, desc: '查看合同' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={disabledBtn}
            onClick={() => {
              const { from } = fromQs();
              if (from) {
                closeThenGoto(from);
                return;
              }
              closeThenGoto('/user/project/projectList');
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          title={
            <Title icon="profile" id="ui.menu.user.project.projectEdit" defaultMessage="项目编辑" />
          }
          bordered={false}
        >
          {loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`] ? (
            <Loading />
          ) : (
            this.renderPage()
          )}
          {formData.autoReportFlag === 1 ? <EditableDataTable {...editTableProps} /> : ''}
        </Card>

        <Modal
          destroyOnClose
          title="自动计算项目汇报计划"
          width={800}
          visible={projectReportModalVisible}
          onOk={this.handleAutoReportPlan}
          onCancel={this.toggleProjectReportModal}
        >
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} noReactive col={2}>
            <Field
              name="startDate"
              label="开始日期"
              decorator={{
                initialValue: formData.planStartDate,
                rules: [
                  {
                    required: true,
                    message: '请输入合同开始日期',
                  },
                ],
              }}
            >
              <DatePicker placeholder="请输入合同开始日期" />
            </Field>

            <Field
              name="endDate"
              label="结束日期"
              decorator={{
                initialValue: formData.planEndDate,
                rules: [
                  {
                    required: true,
                    message: '请输入合同结束日期',
                  },
                ],
              }}
            >
              <DatePicker placeholder="请输入合同结束日期" />
            </Field>

            <Field
              name="firstPeriodAmt"
              label="首期金额"
              decorator={{
                initialValue: formData.firstPeriodAmt,
                rules: [
                  {
                    required: false,
                    message: '请输入首期金额',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入首期金额" />
            </Field>

            <Field
              name="lastPeriodAmt"
              label="末期金额"
              decorator={{
                initialValue: formData.lastPeriodAmt,
                rules: [
                  {
                    required: false,
                    message: '请输入末期金额',
                  },
                ],
              }}
            >
              <InputNumber className="x-fill-100" placeholder="请输入末期金额" />
            </Field>
          </FieldList>
          <h5 style={{ color: 'red' }}>
            提示:开始日期结束日期为正好一N个月份时,不需要输入首期和末期金额,系统会自动计算.
            当不为整个月份时需要手动输入首期末期金额,系统自动算出中间金额.
          </h5>
          <h5 style={{ color: 'red' }}>
            正好为整个月份的情况: 1.开始日期为某个月的1号,结束日期为当月最好一天.比如 2019-01-01 ~
            2019-12-31; 2. 比如:2019-01-15 ~ 2019-06-14
          </h5>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ProjectEdit;
