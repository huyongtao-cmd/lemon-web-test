/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Input,
  Form,
  Button,
  Progress,
  Switch,
  Card,
  Icon,
  InputNumber,
  Table,
  Divider,
  Row,
  Modal,
} from 'antd';

import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import EditableDataTable from '@/components/common/EditableDataTable';
import { isEmpty, isNil, indexOf, equals, type } from 'ramda';
import classnames from 'classnames';
import { Selection, DatePicker } from '@/pages/gen/field';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { selectUsersWithBu, selectInternalOus } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { genFakeId, mul, div, add } from '@/utils/mathUtils';
import update from 'immutability-helper';
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

  // ?????????????????????
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
      gradeType: { gradeTypeFormData, gradeTypeList, gradeTypeListDel },
      dispatch,
    } = this.props;
    const { visible } = this.state;

    const checkGradeTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      loading: false,
      dataSource: gradeTypeList,
      showCopy: false,
      rowSelection: {
        type: 'radio',
      },
      onAdd: newRow => {
        // ??????????????????????????????????????????
        if (
          gradeTypeFormData.keyresultType !== 'tag' &&
          !isEmpty(gradeTypeList) &&
          gradeTypeList[gradeTypeList.length - 1].customRuleEnd >= gradeTypeFormData.objValue
        ) {
          createMessage({ type: 'warn', description: '?????????????????????????????????????????????' });
          return;
        }
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            gradeTypeList: update(gradeTypeList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  gradeScore: 0,
                  gradeType: gradeTypeFormData.gradeType,
                  keyresultType: gradeTypeFormData.keyresultType,
                  // ??????????????????????????????????????????????????????+1
                  // eslint-disable-next-line no-nested-ternary
                  customRuleStart:
                    gradeTypeFormData.keyresultType === 'tag'
                      ? null
                      : isEmpty(gradeTypeList)
                        ? gradeTypeFormData.iniValue
                        : isNil(gradeTypeList[gradeTypeList.length - 1].customRuleEnd)
                          ? 0
                          : gradeTypeList[gradeTypeList.length - 1].customRuleEnd + 1,
                  customRuleEnd:
                    gradeTypeFormData.keyresultType === 'tag' ? null : gradeTypeFormData.objValue,
                  acheiveTag: gradeTypeFormData.keyresultType === 'tag' ? 'false' : null,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        if (gradeTypeList.length !== 1) {
          // ??????????????????????????????????????????????????????
          // eslint-disable-next-line no-restricted-syntax
          for (const a of gradeTypeList) {
            if (a.id === selectedRowKeys[0] && indexOf(a, gradeTypeList) === 0) {
              createMessage({
                type: 'warn',
                description: '??????????????????????????????????????????????????????',
              });
              return;
            }
            // ?????????????????????????????????????????????????????????????????????????????????????????????????????????(????????????????????????)
            if (
              a.id === selectedRowKeys[0] &&
              indexOf(a, gradeTypeList) + 1 !== gradeTypeList.length
            ) {
              gradeTypeList[indexOf(a, gradeTypeList) + 1].customRuleStart =
                gradeTypeList[indexOf(a, gradeTypeList)].customRuleStart;
            }
          }
        }

        const newDataSource = gradeTypeList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            gradeTypeList: newDataSource,
            gradeTypeListDel: [...gradeTypeListDel, selectedRowKeys[0]].filter(v => v > 0),
          },
        });
      },
      columns: [
        {
          title: '????????????',
          dataIndex: 'customRuleEnd',
          width: '45%',
          required: true,
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
                          description: '?????????????????????????????????????????????',
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
                    max={row.objValue}
                    precision={1}
                    formatter={values =>
                      gradeTypeFormData.keyresultType === 'PERCENT' ? `${values || 0}%` : values
                    }
                    parser={values =>
                      gradeTypeFormData.keyresultType === 'PERCENT'
                        ? values.replace('%', '')
                        : values
                    }
                  />
                </Row>
              </Input.Group>
            ) : (
              <Switch
                checked={row.acheiveTag === 'true'}
                checkedChildren="???"
                unCheckedChildren="???"
                onChange={e => {
                  this.onCheckGradeChanged(index, e ? 'true' : 'false', 'acheiveTag');
                }}
              />
            ),
        },
        {
          title: '??????', // ????????? ??????
          dataIndex: 'gradeScore',
          width: '25%',
          required: true,
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
              placeholder="???????????????"
            />
          ),
        },
        {
          title: '??????', // ????????? ??????
          dataIndex: 'gradeRemark',
          width: '30%',
          required: true,
          render: (value, row, index) => (
            <Input
              value={value}
              onChange={e => {
                this.onCheckGradeChanged(index, e.target.value, 'gradeRemark');
              }}
              placeholder="???????????????"
            />
          ),
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <Modal
          title="????????????"
          visible={visible}
          onCancel={() => this.onChange(false)}
          footer={[
            <Button
              className="tw-btn-primary"
              style={{ backgroundColor: '#284488' }}
              key="makeSure"
              onClick={() => {
                if (!gradeTypeFormData.gradeType) {
                  createMessage({
                    type: 'warn',
                    description: '????????????????????????',
                  });
                  return;
                }
                if (gradeTypeFormData.gradeType === 'RANGE') {
                  // ?????????????????????????????????
                  if (isEmpty(gradeTypeList)) {
                    createMessage({
                      type: 'warn',
                      description: '?????????????????????????????????',
                    });
                    return;
                  }

                  // ??????????????????????????????
                  const tt = gradeTypeList.filter(v => isNil(v.gradeScore));
                  if (tt.length) {
                    createMessage({
                      type: 'warn',
                      description: '??????????????????????????????',
                    });
                    return;
                  }

                  // ????????????????????????????????????????????????????????????????????????
                  const rangEnd =
                    gradeTypeList[gradeTypeList.length - 1].customRuleEnd ===
                    gradeTypeFormData.objValue;
                  if (gradeTypeFormData.keyresultType !== 'tag' && !rangEnd) {
                    createMessage({
                      type: 'warn',
                      description: `???????????????????????????????????????????????????????????????????????????`,
                    });
                    return;
                  }

                  // ????????????????????????????????????????????????????????????????????????????????????
                  if (gradeTypeFormData.keyresultType === 'tag') {
                    if (gradeTypeList.length !== 2) {
                      createMessage({
                        type: 'warn',
                        description: '???????????????????????????????????????????????????????????????',
                      });
                      return;
                    }
                    if (
                      gradeTypeList.filter(v => v.acheiveTag === 'true').length !== 1 ||
                      gradeTypeList.filter(v => v.acheiveTag === 'false').length !== 1
                    ) {
                      createMessage({
                        type: 'warn',
                        description: '????????????????????????????????????????????????',
                      });
                      return;
                    }
                  }
                }

                this.onChange(true);
              }}
            >
              ??????
            </Button>,
          ]}
          destroyOnClose
          afterClose={() => {
            // ????????????????????????
            dispatch({
              type: `${DOMAIN}/clean`,
            });
          }}
          width="60%"
        >
          <FieldList
            legend="????????????"
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field label="??????????????????" presentational>
              <span>
                {!isNil(gradeTypeFormData.keyresultName) ? gradeTypeFormData.keyresultName : ''}
              </span>
            </Field>
            <Field label="?????????????????????" presentational>
              <span>
                {!isNil(gradeTypeFormData.keyresultTypeName)
                  ? gradeTypeFormData.keyresultTypeName
                  : ''}
              </span>
            </Field>
            <Field label="?????????-?????????" presentational>
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
              label="??????????????????"
              decorator={{
                initialValue: gradeTypeFormData.gradeType || undefined,
                rules: [
                  {
                    required: true,
                    message: '???????????????????????????',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="OKR:GRADE_TYPE"
                placeholder="???????????????????????????"
                onChange={() => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      gradeTypeList: [],
                      gradeTypeListDel: [],
                    },
                  });
                }}
              />
            </Field>
          </FieldList>
          {gradeTypeFormData.gradeType === 'RANGE' && (
            <FieldList
              legend="????????????"
              layout="horizontal"
              getFieldDecorator={getFieldDecorator}
              col={2}
            >
              <EditableDataTable {...checkGradeTableProps} />
            </FieldList>
          )}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default GradeTypeComponent;
