import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isNil, isEmpty } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import BusinessForm from '@/components/production/business/BusinessForm';
import FormItem from '@/components/production/business/FormItem';
import BusinessFormTitle from '@/components/production/business/BusinessFormTitle.tsx';
import createMessage from '@/components/core/AlertMessage';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const extrWorkColumns = [{ dataIndex: 'name', title: '加班开始日期～加班结束日期', span: 24 }];

const DOMAIN = 'vacationEditNew';

@connect(({ loading, vacationEditNew, vacationMgmtNew, dispatch }) => ({
  loading,
  vacationEditNew,
  vacationMgmtNew,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    const { vacationYear, resId, overtime, extrWorkProjId, extrWorkId } = changedValues;
    const { ...obj } = changedValues;
    if (vacationYear) {
      // eslint-disable-next-line no-param-reassign
      obj.vacationYear = String(vacationYear);
    }
    if (resId) {
      obj.resId = resId;
      obj.extrWorkProjId = undefined;
      obj.extrWorkId = undefined;
      // 项目列表
      props.dispatch({
        type: `${DOMAIN}/queryProjList`,
        payload: { limit: 0, resId },
      });
      // 加班安排
      props.dispatch({
        type: `${DOMAIN}/queryExtrWork`,
        payload: { limit: 0, resId },
      });
    }
    if (overtime) {
      obj.overtime = overtime;
      if (overtime === 'NO') {
        obj.extrWorkProjId = undefined;
        obj.extrWorkId = undefined;
      }
    }
    if (extrWorkProjId) {
      obj.extrWorkProjId = extrWorkProjId.id;
      obj.extrWorkProjName = extrWorkProjId.name;
    }
    if (extrWorkId) {
      obj.extrWorkId = extrWorkId.id;
    }
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: obj,
      });
    }
  },
})
@mountToTab()
class VacationEdit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isInLieu: undefined,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      user,
      vacationEditNew: { formData },
    } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'RES_VACATION_EDIT' },
    });
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      }).then(res => {
        this.setState({
          isInLieu: res.vacationType,
        });
      });
    dispatch({ type: `${DOMAIN}/res` });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      vacationMgmtNew: { searchForm },
      dispatch,
    } = this.props;

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const { id } = fromQs();
        if (id) {
          dispatch({
            type: `${DOMAIN}/edit`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto('/workTable/vacApply/vacApplyListPage?_refresh=0');
              dispatch({ type: `vacationMgmtNew/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        } else {
          dispatch({
            type: `${DOMAIN}/submit`,
          }).then(response => {
            if (response.ok) {
              createMessage({ type: 'success', description: '操作成功' });
              closeThenGoto('/workTable/vacApply/vacApplyListPage?_refresh=0');
              dispatch({ type: `vacationMgmtNew/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        }
      }
    });
  };

  renderPage = () => {
    const {
      loading,
      dispatch,
      form,
      vacationEditNew: { formData, formMode, pageConfig },
    } = this.props;
    const fields = [
      <BusinessFormTitle title="基本信息" />,
      <FormItem
        label="姓名"
        key="resId"
        fieldKey="resId"
        fieldType="ResSimpleSelect"
        initialValue={formData.resId}
        placeholder="请选择姓名"
        onChange={(val, option) => {
          if (val) {
            dispatch({
              type: `${DOMAIN}/fetchInternalOuList`,
              payload: {
                ouAbNo: option[0].ouAbNo,
              },
            });
          }
        }}
        required
      />,
      <FormItem
        label="公司"
        key="company"
        fieldKey="company"
        fieldType="BaseCustomSelect"
        parentKey="CUS:INTERNAL_COMPANY"
        initialValue={formData.company}
        placeholder="请选择公司"
        required
        disabled
      />,
      <FormItem
        label="假期类型"
        key="vacationType"
        fieldKey="vacationType"
        fieldType="BaseCustomSelect"
        parentKey="RES:VAC_TYPE"
        initialValue={formData.vacationType}
        placeholder="请选择假期类型"
        required
      />,
      <FormItem
        label="年度"
        key="vacationYear"
        fieldKey="vacationYear"
        fieldType="BaseInputNumber"
        initialValue={formData.vacationYear}
        placeholder="请输入年度"
        required
      />,
      <FormItem
        label="期间"
        key="dates"
        fieldKey="dates"
        fieldType="BaseDateRangePicker"
        initialValue={formData.dates}
        required
      />,
      <FormItem
        label="有效截止日期"
        key="expirationDate"
        fieldKey="expirationDate"
        fieldType="BaseDatePicker"
        initialValue={formData.expirationDate}
        required
      />,
      <FormItem
        label="总天数"
        key="totalDays"
        fieldKey="totalDays"
        fieldType="BaseInputNumber"
        initialValue={formData.totalDays}
        placeholder="请输入总天数"
        required
      />,
      <FormItem
        label="已用天数"
        key="usedDays"
        fieldKey="usedDays"
        fieldType="BaseInputNumber"
        initialValue={formData.usedDays}
        placeholder="请输入已用天数"
        required
      />,
      <FormItem
        label="备注"
        key="remark"
        fieldKey="remark"
        fieldType="BaseInputTextArea"
        initialValue={formData.remark}
        placeholder="请输入备注"
      />,
    ];
    return (
      <BusinessForm formData={formData} form={form} formMode={formMode} defaultColumnStyle={12}>
        {fields}
      </BusinessForm>
    );
  };

  render() {
    const { loading } = this.props;
    const { isInLieu } = this.state;
    // loading完成之前将按钮设为禁用
    const submitBtn = loading.effects[`${DOMAIN}/submit`];
    const editBtn = loading.effects[`${DOMAIN}/edit`];
    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSubmit}
            disabled={submitBtn || editBtn}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>

          {/* <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/attendanceMgmt/vacationMgmt?_refresh=0')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button> */}
        </Card>
        {this.renderPage()}
      </PageHeaderWrapper>
    );
  }
}

export default VacationEdit;
