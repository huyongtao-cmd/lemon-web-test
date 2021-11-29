import React, { Component } from 'react';
import { connect } from 'dva';
import { isEmpty, isNil, hasIn } from 'ramda';
import { Card, Form, Input, Divider, Tooltip, InputNumber, Radio, Icon } from 'antd';
import BpmWrapper from '@/pages/gen/BpmMgmt/BpmWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import EditableDataTable from '@/components/common/EditableDataTable';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import createMessage from '@/components/core/AlertMessage';
import { pushFlowTask } from '@/services/gen/flow';
import { createConfirm } from '@/components/core/Confirm';
import { selectUsersWithBu } from '@/services/gen/list';
import { add, genFakeId } from '@/utils/mathUtils';
import moment from 'moment';
import { getUrl } from '@/utils/flowToRouter';
import { fromQs } from '@/utils/stringUtils';
import styles from '../index.less';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const DOMAIN = 'growthCompoundAbility';

@connect(({ loading, growthCompoundAbility, dispatch }) => ({
  loading,
  growthCompoundAbility,
  dispatch,
}))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    if (value || value === 0) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: { [name]: value },
      });
    }
  },
})
@mountToTab()
class PrefCheckFlow extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id, taskId } = fromQs();
    dispatch({
      type: `${DOMAIN}/getCapaHandle`,
      payload: {
        id,
      },
    });
    taskId &&
      dispatch({
        type: `${DOMAIN}/fetchConfig`,
        payload: taskId,
      });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { validateFieldsAndScroll, getFieldDecorator, setFields },
      growthCompoundAbility: {
        formData,
        flowForm,
        fieldsConfig,
        examTmplPointViewList,
        dataSource = [],
        total = 0,
      },
    } = this.props;

    const { id, taskId, prcId, from, mode } = fromQs();
    const { twResCapaSetViews = [], resIdList = [] } = formData;

    const flowCanEdit = !(
      fieldsConfig.buttons &&
      fieldsConfig.buttons[0] &&
      fieldsConfig.buttons[0].branches &&
      fieldsConfig.buttons[0].branches[0] &&
      fieldsConfig.buttons[0].branches[0].code === 'FLOW_PASS'
    );

    const abilityDetailTableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading: false,
      expirys: 0,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      dataSource: twResCapaSetViews,
      total,
      enableSelection: false,
      pagination: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      columns: [
        {
          title: '单项能力',
          align: 'center',
          dataIndex: 'capaName',
          key: 'capaName',
          width: '10%',
        },
        {
          title: '获得状态',
          align: 'center',
          dataIndex: 'isHave',
          key: 'isHave',
          width: '10%',
          render: (value, row, key) => (value ? '已获得' : '未获得'),
        },
        {
          title: '能力描述',
          dataIndex: 'ddesc',
          key: 'ddesc',
          width: '30%',
          render: (value, row, key) => {
            const { twResAbilityViews = [] } = row;
            let descHeight = '100px';
            if (twResAbilityViews && twResAbilityViews.length > 2) {
              descHeight = twResAbilityViews.length * 50 + 'px';
            }

            return (
              <div
                className={`${styles['table-cell-scroll']} ${styles['table-padding']}`}
                style={{
                  height: descHeight,
                }}
              >
                <pre>{row.ddesc}</pre>
              </div>
            );
          },
        },
        {
          title: '考核点',
          align: 'center',
          dataIndex: 'twResAbilityViews',
          key: 'abilityName',
          width: '15%',
          render: (value, row, key) => (
            <div className={styles['table-cell-height']}>
              {value &&
                value.map(item => (
                  <div
                    key={item.id}
                    style={{
                      height: '50px',
                      lineHeight: '50px',
                    }}
                    className={styles['table-cell-border']}
                  >
                    {item.abilityName}
                  </div>
                ))}
            </div>
          ),
        },
        {
          title: '完成状态',
          align: 'center',
          dataIndex: 'twResAbilityViews',
          key: 'isHave',
          width: '10%',
          render: (value, row, key) => (
            <div className={styles['table-cell-height']}>
              {value &&
                value.map(item => (
                  <div
                    key={item.id}
                    style={{
                      height: '50px',
                      lineHeight: '50px',
                    }}
                    className={styles['table-cell-border']}
                  >
                    {item.isHave ? (
                      <Icon type="check" />
                    ) : (
                      <Icon type="close" style={{ color: '#f5222d' }} />
                    )}
                  </div>
                ))}
            </div>
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <BpmWrapper
          fieldsConfig={fieldsConfig}
          flowForm={flowForm}
          onBpmChanges={value => {
            dispatch({
              type: `${DOMAIN}/updateFlowForm`,
              payload: value,
            });
          }}
          onBtnClick={({ operation, bpmForm }) => {
            const { remark, branch } = bpmForm;
            const { key, branches } = operation;
            const resultParams = {
              FLOW_PASS: 'APPROVED',
              FLOW_COMMIT: 'APPLIED',
              FLOW_RETURN: 'REJECTED',
            };
            validateFieldsAndScroll((error, values) => {
              if (!error) {
                const params = {
                  ...formData,
                  ...values,
                  flow: {
                    branch,
                    remark,
                    result: resultParams[key],
                    taskId,
                  },
                };
                dispatch({
                  type: `${DOMAIN}/saveflowCapaFn`,
                  payload: params,
                });
              }
            });
            return Promise.resolve(false);
          }}
        >
          <Card
            className="tw-card-adjust"
            style={{ marginTop: '6px' }}
            title={<Title icon="profile" text="复合能力申请" />}
            bordered={false}
          >
            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="jobType"
                label="复合能力"
                decorator={{
                  initialValue: formData.jobType,
                }}
              >
                <Input placeholder="" disabled />
              </Field>

              <Field
                name="eqvaRatio"
                label="标准当量系数"
                decorator={{
                  initialValue: formData.eqvaRatio,
                }}
              >
                <Input placeholder="" disabled />
              </Field>

              <Field
                name="ddesc"
                label="能力描述"
                decorator={{
                  initialValue: formData.ddesc,
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
                style={{
                  marginBottom: '20px',
                }}
              >
                <Input.TextArea rows={3} disabled placeholder="请输入能力描述" />
              </Field>
              <div className={styles['field-table']}>
                <div className={styles['tag-name']}>能力构成</div>
                <div
                  className={`${styles['table-wrap']} ${styles['table-clear-padding']}`}
                  style={{ margin: '-18px 0px 0px -24px' }}
                >
                  <DataTable {...abilityDetailTableProps} />
                </div>
              </div>
              <Divider dashed />

              <Field
                name="selfDesc"
                label="自评"
                decorator={{
                  initialValue: formData.selfDesc,
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea rows={3} placeholder="请输入自评" disabled={flowCanEdit} />
              </Field>

              <Field name="attache" label="附件">
                <FileManagerEnhance
                  api="/api/base/v1/resCapaSetApply/sfs/token"
                  dataKey={formData.id}
                  listType="text"
                  disabled={flowCanEdit}
                />
              </Field>

              {(formData.apprType === 'ASSIGN_RES' || formData.apprType === 'BY_CAPASET') &&
              !flowCanEdit ? (
                <Field
                  name="apprRes"
                  label="审核人"
                  decorator={{
                    initialValue: formData.apprRes ? parseInt(formData.apprRes, 10) : '',
                    rules: [{ required: !flowCanEdit, message: '请选择审核人' }],
                  }}
                >
                  <Selection.Columns
                    source={resIdList}
                    columns={[
                      { dataIndex: 'code', title: '编号', span: 10 },
                      { dataIndex: 'name', title: '名称', span: 14 },
                    ]}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    placeholder="请选择审核人"
                    showSearch
                    disabled={flowCanEdit}
                  />
                </Field>
              ) : (
                ''
              )}

              <Field
                name="applyResName"
                label="申请人"
                decorator={{
                  initialValue: formData.applyResName,
                }}
              >
                <Input placeholder="" disabled />
              </Field>
              <Field
                name="applyDate"
                label="申请日期"
                decorator={{
                  initialValue: formData.applyDate,
                }}
              >
                <Input placeholder="" disabled />
              </Field>
              <Divider dashed />
              <Field
                name="apprResult"
                label="审核结果"
                decorator={{
                  initialValue: formData.apprResult,
                  rules: [{ required: !flowCanEdit || mode !== 'view', message: '请选择审核结果' }],
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <RadioGroup disabled={!flowCanEdit || mode === 'view'}>
                  <Radio value="YES">审核通过</Radio>
                  <Radio value="NO">审核未通过</Radio>
                </RadioGroup>
              </Field>

              <Field
                name="apprDesc"
                label="审核说明"
                decorator={{
                  initialValue: formData.apprDesc,
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="请输入能力描述"
                  disabled={!flowCanEdit || mode === 'view'}
                />
              </Field>
            </FieldList>
          </Card>
        </BpmWrapper>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckFlow;
