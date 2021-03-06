import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { isEmpty } from 'ramda';
import classnames from 'classnames';
import { Button, Form, Card, Input, List, Row, Col, Radio, DatePicker, Divider, Icon } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { FileManagerEnhance, UdcSelect, Selection } from '@/pages/gen/field';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import { selectUsersWithBu } from '@/services/gen/list';
import { fromQs } from '@/utils/stringUtils';
import styles from '../index.less';

const { Field } = FieldList;
const DOMAIN = 'growthCompoundAbility';
const RadioGroup = Radio.Group;

@connect(({ growthCompoundAbility }) => ({ growthCompoundAbility }))
@Form.create({
  onFieldsChange(props, changedFields) {
    if (isEmpty(changedFields)) return;
    const { name, value } = Object.values(changedFields)[0];
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: { [name]: value },
    });
  },
})
@mountToTab()
class CompoundAbility extends PureComponent {
  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/getCapaHandle`,
      payload: {
        id,
      },
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      growthCompoundAbility: { formData = {} },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        dispatch({
          type: `${DOMAIN}/saveCapa`,
          payload: { ...formData, ...values },
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/user/center/growth');
  };

  render() {
    const { form, growthCompoundAbility, loading, dispatch } = this.props;
    const { getFieldDecorator } = form;
    const { formData = {}, dataSource = [], total = 0 } = growthCompoundAbility;
    const { twResCapaSetViews = [], resIdList = [] } = formData;
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
      pagination: false,
      enableSelection: false,
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
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={false}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.submit`, desc: '??????' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
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
              <Input.TextArea rows={3} placeholder="???????????????" />
            </Field>

            <Field name="attache" label="??????">
              <FileManagerEnhance
                api="/api/base/v1/resCapaSetApply/sfs/token"
                dataKey={formData.id}
                listType="text"
                disabled={false}
              />
            </Field>

            {formData.apprType === 'ASSIGN_RES' || formData.apprType === 'BY_CAPASET' ? (
              <Field
                name="apprRes"
                label="?????????"
                decorator={{
                  initialValue: formData.apprRes ? parseInt(formData.apprRes, 10) : '',
                  rules: [{ required: true, message: '??????????????????' }],
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
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CompoundAbility;
