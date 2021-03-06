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
          title: '????????????',
          align: 'center',
          dataIndex: 'capaName',
          key: 'capaName',
          width: '10%',
        },
        {
          title: '????????????',
          align: 'center',
          dataIndex: 'isHave',
          key: 'isHave',
          width: '10%',
          render: (value, row, key) => (value ? '?????????' : '?????????'),
        },
        {
          title: '????????????',
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
          title: '?????????',
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
          title: '????????????',
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
            title={<Title icon="profile" text="??????????????????" />}
            bordered={false}
          >
            <FieldList getFieldDecorator={getFieldDecorator} col={2}>
              <Field
                name="jobType"
                label="????????????"
                decorator={{
                  initialValue: formData.jobType,
                }}
              >
                <Input placeholder="" disabled />
              </Field>

              <Field
                name="eqvaRatio"
                label="??????????????????"
                decorator={{
                  initialValue: formData.eqvaRatio,
                }}
              >
                <Input placeholder="" disabled />
              </Field>

              <Field
                name="ddesc"
                label="????????????"
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
                <Input.TextArea rows={3} disabled placeholder="?????????????????????" />
              </Field>
              <div className={styles['field-table']}>
                <div className={styles['tag-name']}>????????????</div>
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
                label="??????"
                decorator={{
                  initialValue: formData.selfDesc,
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea rows={3} placeholder="???????????????" disabled={flowCanEdit} />
              </Field>

              <Field name="attache" label="??????">
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
                  label="?????????"
                  decorator={{
                    initialValue: formData.apprRes ? parseInt(formData.apprRes, 10) : '',
                    rules: [{ required: !flowCanEdit, message: '??????????????????' }],
                  }}
                >
                  <Selection.Columns
                    source={resIdList}
                    columns={[
                      { dataIndex: 'code', title: '??????', span: 10 },
                      { dataIndex: 'name', title: '??????', span: 14 },
                    ]}
                    transfer={{ key: 'id', code: 'id', name: 'name' }}
                    placeholder="??????????????????"
                    showSearch
                    disabled={flowCanEdit}
                  />
                </Field>
              ) : (
                ''
              )}

              <Field
                name="applyResName"
                label="?????????"
                decorator={{
                  initialValue: formData.applyResName,
                }}
              >
                <Input placeholder="" disabled />
              </Field>
              <Field
                name="applyDate"
                label="????????????"
                decorator={{
                  initialValue: formData.applyDate,
                }}
              >
                <Input placeholder="" disabled />
              </Field>
              <Divider dashed />
              <Field
                name="apprResult"
                label="????????????"
                decorator={{
                  initialValue: formData.apprResult,
                  rules: [{ required: !flowCanEdit || mode !== 'view', message: '?????????????????????' }],
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <RadioGroup disabled={!flowCanEdit || mode === 'view'}>
                  <Radio value="YES">????????????</Radio>
                  <Radio value="NO">???????????????</Radio>
                </RadioGroup>
              </Field>

              <Field
                name="apprDesc"
                label="????????????"
                decorator={{
                  initialValue: formData.apprDesc,
                }}
                fieldCol={1}
                labelCol={{ span: 4, xxl: 3 }}
                wrapperCol={{ span: 19, xxl: 20 }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="?????????????????????"
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
