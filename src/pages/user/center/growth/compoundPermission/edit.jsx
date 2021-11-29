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
const DOMAIN = 'growthCompoundPermission';
const RadioGroup = Radio.Group;

@connect(({ growthCompoundPermission }) => ({ growthCompoundPermission }))
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
class CompoundPermission extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/clean`,
    }).then(res => this.fetchData());
  }

  fetchData = () => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/getCapaAccEssView`,
      payload: {
        id,
      },
    });
  };

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      growthCompoundPermission: { dataSource },
    } = this.props;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const {
          applyResId,
          applyDate,
          buId,
          presId,
          selectCapaset = [],
          selectCapasetById,
          apprResId: _apprResId,
        } = dataSource;
        const { apprResId, applyDesc } = values;
        let newSelectCapaset = [];
        selectCapaset && selectCapaset.forEach(item => newSelectCapaset.push(item.id));
        newSelectCapaset = newSelectCapaset.join(',');
        const obj = {
          applyResId,
          applyDate,
          buId,
          presId,
          apprResId: apprResId || _apprResId,
          applyDesc,
          capasetLevelId: newSelectCapaset,
          capaSetId: selectCapasetById.id,
        };
        dispatch({
          type: `${DOMAIN}/save`,
          payload: obj,
        });
      }
    });
  };

  handleCancel = () => {
    closeThenGoto('/user/center/growth');
  };

  render() {
    const { form, growthCompoundPermission, loading, dispatch } = this.props;
    const { getFieldDecorator } = form;
    const { formData = {}, dataSource } = growthCompoundPermission;
    const abilityIntroTableProps = {
      domain: DOMAIN, // 必填 用于本地缓存表格的列配置
      rowKey: 'id',
      loading,
      // total,
      dataSource: dataSource.selectCapaset || [],
      pagination: false,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      columns: [
        {
          title: '编号',
          align: 'center',
          dataIndex: 'capasetNo',
          key: 'capasetNo',
          width: '15%',
        },
        {
          title: '复合能力',
          align: 'center',
          dataIndex: 'name',
          key: 'name',
          width: '20%',
        },
        {
          title: '当量系数',
          align: 'center',
          dataIndex: 'eqvaRatio',
          key: 'eqvaRatio',
          width: '10%',
        },
        // {
        //   title: '获得方式',
        //   align: 'center',
        //   dataIndex: 'obtainMethodName',
        //   key: 'obtainMethodName',
        //   width: '15%',
        // },
        // {
        //   title: '获得状态',
        //   align: 'center',
        //   dataIndex: 'isHavecapaSet',
        //   key: 'isHavecapaSet',
        //   width: '10%',
        // },
        {
          title: '获得时间',
          align: 'center',
          dataIndex: 'obtainDate',
          key: 'obtainDate',
          width: '15%',
        },
        {
          title: '能力描述',
          dataIndex: 'ddesc',
          key: 'ddesc',
          // width: '25%',
          render: (value, row, key) => <pre>{row.ddesc}</pre>,
        },
      ],
    };
    // const abilityApplyTableProps = {
    //   domain: DOMAIN, // 必填 用于本地缓存表格的列配置
    //   rowKey: 'id',
    //   loading,
    //   // total,
    //   dataSource: dataSource.selectCapasetById ? [dataSource.selectCapasetById] : [],
    //   pagination: false,
    //   enableSelection: false,
    //   showColumn: false,
    //   showSearch: false,
    //   showExport: false,
    //   columns: [
    //     {
    //       title: '编号',
    //       align: 'center',
    //       dataIndex: 'capasetNo',
    //       key: 'capasetNo',
    //       width: '15%',
    //     },
    //     {
    //       title: '复合能力',
    //       align: 'center',
    //       dataIndex: 'name',
    //       key: 'name',
    //       width: '20%',
    //     },
    //     {
    //       title: '当量系数',
    //       align: 'center',
    //       dataIndex: 'eqvaRatio',
    //       key: 'eqvaRatio',
    //       width: '10%',
    //     },
    //     {
    //       title: '能力描述',
    //       dataIndex: 'ddesc',
    //       key: 'ddesc',
    //       // width: '25%',
    //       render: (value, row, key) => <pre>{row.ddesc}</pre>,
    //     },
    //   ],
    // };
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
            {formatMessage({ id: `misc.submit`, desc: '提交' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="复合能力权限申请" />}
          bordered={false}
        >
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="applyResName"
              label="申请人"
              decorator={{
                initialValue: dataSource.applyResName,
              }}
            >
              <Input placeholder="" disabled />
            </Field>

            <Field
              name="applyDate"
              label="申请日期"
              decorator={{
                initialValue: dataSource.applyDate,
              }}
            >
              <Input placeholder="" disabled />
            </Field>

            <Field
              name="buName"
              label="BaseBU"
              decorator={{
                initialValue: dataSource.buName,
              }}
            >
              <Input placeholder="" disabled />
            </Field>

            <Field
              name="personName"
              label="上级"
              decorator={{
                initialValue: dataSource.personName,
              }}
            >
              <Input placeholder="" disabled />
            </Field>
          </FieldList>
          <Divider dashed />
          <div>
            <span style={{ color: '#999', marginLeft: 22 }}>已获得能力</span>
            <DataTable {...abilityIntroTableProps} />
          </div>
          <FieldList getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="selectCapasetById"
              label="申请权限能力"
              fieldCol={1}
              labelCol={{ span: 3, xxl: 3 }}
              wrapperCol={{ span: 21, xxl: 21 }}
              style={{
                marginBottom: '20px',
              }}
            >
              <span>{dataSource.selectCapasetById ? dataSource.selectCapasetById.name : null}</span>
            </Field>
            <Field
              name="applyDesc"
              label="申请说明"
              decorator={{
                initialValue: formData.applyDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 3, xxl: 3 }}
              wrapperCol={{ span: 21, xxl: 21 }}
              style={{
                marginBottom: '20px',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入申请说明" />
            </Field>
            {dataSource.resList && dataSource.resList.length ? (
              <Field
                name="apprResId"
                label="审核人"
                decorator={{
                  initialValue: formData.apprResId,
                  rules: [
                    {
                      required: true,
                      message: '请选择审核人',
                    },
                  ],
                }}
                fieldCol={1}
                labelCol={{ span: 3, xxl: 3 }}
                wrapperCol={{ span: 6, xxl: 6 }}
              >
                <Selection.Columns
                  source={dataSource.resList || []}
                  // columns={[
                  //   { dataIndex: 'code', title: '编号', span: 10 },
                  //   { dataIndex: 'name', title: '名称', span: 14 },
                  // ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  placeholder="请选择审核人"
                  showSearch
                />
              </Field>
            ) : null}
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default CompoundPermission;
