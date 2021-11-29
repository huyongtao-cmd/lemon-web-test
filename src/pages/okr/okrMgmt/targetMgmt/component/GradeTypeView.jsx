/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Form, Button, Switch, InputNumber, Row, Modal } from 'antd';

import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { isEmpty, isNil, equals, type } from 'ramda';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import DescriptionList from '@/components/layout/DescriptionList';

const { Field } = FieldList;
const { Description } = DescriptionList;

const DOMAIN = 'gradeType';

@connect(({ loading, gradeType, dispatch }) => ({
  gradeType,
  dispatch,
  loading,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateGradeTypeForm`,
        payload: changedValues,
      });
    }
  },
})
class GradeTypeComponent extends PureComponent {
  constructor(props) {
    super(props);
    const { visible } = props;
    this.state = {
      visible,
    };
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ visible: snapshot });
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { visible } = this.props;
    if (!equals(prevState.visible, visible)) {
      return visible;
    }
    return null;
  }

  // 行编辑触发事件
  onCheckGradeChanged = (index, value, name) => {
    const {
      gradeType: { gradeTypeList },
      dispatch,
    } = this.props;

    const newDataSource = gradeTypeList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { gradeTypeList: newDataSource },
    });
  };

  onChange = v => {
    const { visible } = this.state;
    this.setState({ visible }, () => {
      const { onChange } = this.props;
      type(onChange) === 'Function' && onChange(v);
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      gradeType: { gradeTypeFormData, gradeTypeList },
      dispatch,
    } = this.props;
    const { visible } = this.state;

    const checkGradeTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: gradeTypeList,
      showCopy: false,
      enableSelection: false,
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      columns: [
        {
          title: '进度区间',
          dataIndex: 'customRuleEnd',
          width: '45%',
          align: 'center',
          render: (value, row, index) =>
            gradeTypeFormData.keyresultType !== 'tag' ? (
              <Input.Group>
                <Row type="flex" align="middle" style={{ flexWrap: 'nowrap' }}>
                  <InputNumber
                    style={{ flexGrow: 1 }}
                    onChange={e => {
                      this.onCheckGradeChanged(index, e, 'customRuleStart');
                    }}
                    value={row.customRuleStart || 0}
                    precision={1}
                    formatter={values =>
                      gradeTypeFormData.keyresultType === 'PERCENT' ? `${values || 0}%` : values
                    }
                    parser={values =>
                      gradeTypeFormData.keyresultType === 'PERCENT'
                        ? values.replace('%', '')
                        : values
                    }
                    disabled
                  />
                  <span style={{ paddingLeft: 4, paddingRight: 4 }}>~</span>
                  <InputNumber
                    style={{ flexGrow: 1 }}
                    onChange={e => {
                      if (e > gradeTypeFormData.objValue) {
                        this.onCheckGradeChanged(index, 0, 'customRuleEnd');
                        createMessage({
                          type: 'warn',
                          description: '进度区间结束值不能超过目标值！',
                        });
                        return;
                      }
                      this.onCheckGradeChanged(index, e || 0, 'customRuleEnd');
                      if (index < gradeTypeList.length - 1) {
                        this.onCheckGradeChanged(index + 1, e + 1 || 0, 'customRuleStart');
                      }
                    }}
                    value={value || 0}
                    min={row.customRuleStart + 1 || 0}
                    max={100}
                    precision={1}
                    formatter={values =>
                      gradeTypeFormData.keyresultType === 'PERCENT' ? `${values || 0}%` : values
                    }
                    parser={values =>
                      gradeTypeFormData.keyresultType === 'PERCENT'
                        ? values.replace('%', '')
                        : values
                    }
                    disabled
                  />
                </Row>
              </Input.Group>
            ) : (
              <Switch
                checked={row.acheiveTag === 'true'}
                checkedChildren="是"
                unCheckedChildren="否"
                onChange={e => {
                  this.onCheckGradeChanged(index, e ? 'true' : false, 'acheiveTag');
                }}
                disabled
              />
            ),
        },
        {
          title: '得分', // 初始化 填写
          dataIndex: 'gradeScore',
          width: '25%',
          render: (value, row, index) => (
            <InputNumber
              min={0}
              max={100}
              precision={1}
              value={value || 0}
              className="x-fill-100"
              onChange={e => {
                this.onCheckGradeChanged(index, e || 0, 'gradeScore');
              }}
              placeholder="请输入得分"
              disabled
            />
          ),
        },
        {
          title: '备注', // 初始化 填写
          dataIndex: 'gradeRemark',
          width: '30%',
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={e => {
                this.onCheckGradeChanged(index, e.target.value, 'gradeRemark');
              }}
              placeholder="请输入备注"
              disabled
            />
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Modal
          title="打分规则"
          visible={visible}
          onCancel={() => this.onChange(false)}
          footer={[
            <Button
              className="tw-btn-primary"
              style={{ backgroundColor: '#284488' }}
              key="makeSure"
              onClick={() => {
                this.onChange(true);
              }}
            >
              确定
            </Button>,
          ]}
          destroyOnClose
          afterClose={() => {
            // 关闭清除所有数据
            dispatch({
              type: `${DOMAIN}/clean`,
            });
          }}
          width="60%"
        >
          <DescriptionList title="目标信息" size="large" col={2}>
            <Description term="关键结果名称">
              {!isNil(gradeTypeFormData.keyresultName) ? gradeTypeFormData.keyresultName : ''}
            </Description>
            <Description term="结果而衡量类型">
              {!isNil(gradeTypeFormData.keyresultTypeName)
                ? gradeTypeFormData.keyresultTypeName
                : ''}
            </Description>
            <Description term="起始值-目标值">
              {gradeTypeFormData.keyresultType !== 'tag'
                ? `${!isNil(gradeTypeFormData.iniValue) ? gradeTypeFormData.iniValue : ''} - ${
                    !isNil(gradeTypeFormData.objValue) ? gradeTypeFormData.objValue : ''
                  }`
                : ''}
            </Description>
            <Description term="打分规则类型">{gradeTypeFormData.gradeTypeName || ''}</Description>
          </DescriptionList>
          {/* <FieldList
            legend="目标信息"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field label="关键结果名称" presentational>
              <span>
                {!isNil(gradeTypeFormData.keyresultName) ? gradeTypeFormData.keyresultName : ''}
              </span>
            </Field>
            <Field label="结果而衡量类型" presentational>
              <span>
                {!isNil(gradeTypeFormData.keyresultTypeName)
                  ? gradeTypeFormData.keyresultTypeName
                  : ''}
              </span>
            </Field>
            <Field label="起始值-目标值" presentational>
              <span>
                {gradeTypeFormData.keyresultType !== 'tag'
                  ? `${!isNil(gradeTypeFormData.iniValue) ? gradeTypeFormData.iniValue : ''} - ${
                      !isNil(gradeTypeFormData.objValue) ? gradeTypeFormData.objValue : ''
                    }`
                  : ''}
              </span>
            </Field>
            <Field
              name="gradeType"
              label="打分规则类型"
              decorator={{
                initialValue: gradeTypeFormData.gradeType || undefined,
              }}
            >
              <Selection.UDC
                allowClear={false}
                code="OKR:GRADE_TYPE"
                placeholder="请选择打分规则类型"
                onChange={() => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      gradeTypeList: [],
                      gradeTypeListDel: [],
                    },
                  });
                }}
                disabled
              />
            </Field>
          </FieldList> */}
          {gradeTypeFormData.gradeType !== 'LINEAR' && (
            <>
              <FieldList
                legend="打分规则"
                layout="horizontal"
                getFieldDecorator={getFieldDecorator}
                col={2}
              />
              <DataTable {...checkGradeTableProps} />
            </>
          )}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default GradeTypeComponent;
