import React, { PureComponent } from 'react';
import {
  Button,
  Card,
  Divider,
  Table,
  Input,
  Form,
  Radio,
  Checkbox,
  TreeSelect,
  InputNumber,
  Col,
  Row,
  Transfer,
  Icon,
} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import update from 'immutability-helper';
import classnames from 'classnames';
import { ascend, prop, sort, isEmpty } from 'ramda';
import { Selection } from '@/pages/gen/field';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { TagOpt } from '@/utils/tempUtils';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import EditableDataTable from '@/components/common/EditableDataTable';
import createMessage from '@/components/core/AlertMessage';
import CourseModal from '../Component/Course';
import { genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'platTrainEdit';
const { Description } = DescriptionList;
const { Field, FieldLine } = FieldList;

@connect(({ platTrainEdit }) => ({
  platTrainEdit,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class CapaSetDetail extends PureComponent {
  state = {
    visible: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    dispatch({
      type: `${DOMAIN}/getResType2`,
      payload: 'INTERNAL_RES',
    });
    dispatch({
      type: `${DOMAIN}/getResType2`,
      payload: 'EXTERNAL_RES',
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
    dispatch({
      type: `${DOMAIN}/queryTypeTree`,
    });
    dispatch({
      type: `${DOMAIN}/queryCourseList`,
    });
    // ??????????????????????????????
    dispatch({
      type: `${DOMAIN}/getCapaSetList`,
    });
  }

  handleCancel = () => {
    closeThenGoto('/hr/capacity/train');
  };

  handleSave = type => {
    const {
      dispatch,
      platTrainEdit = {},
      form: { validateFieldsAndScroll },
    } = this.props;
    const {
      rangeData = [],
      courseListData = [],
      formData = {},
      jobCapaSetIds = [],
    } = platTrainEdit;
    const newCourseListData = courseListData.map((item, idx) => {
      const newItem = Object.assign({}, item);
      newItem.sortNo = idx + 1;
      return newItem;
    });

    const parmas = {
      trainingProgListView: {
        ...formData,
        sortLockedFlag: formData.sortLockedFlag === 'Y' ? 'Y' : 'N',
        jobCapaSetIds: jobCapaSetIds.length > 0 ? jobCapaSetIds.join(',') : null, // ?????????????????????
      },
      trainingResScopeViewList: [],
      trainingProgCourseViewList: newCourseListData,
    };

    validateFieldsAndScroll((error, values) => {
      if (!error) {
        // ??????????????????
        dispatch({
          type: `${DOMAIN}/save`,
          payload: {
            ...parmas,
          },
        });
      } else {
        createMessage({ type: 'warn', description: '??????????????????' });
      }
    });
    if (
      formData.entryType === 'TRN_JOB' &&
      formData.jobScope === 'BY_JOB_CLASS' &&
      !formData.jobClass1
    ) {
      createMessage({
        type: 'warn',
        description: '?????????????????????',
      });
      return;
    }

    if (!courseListData || (courseListData && courseListData.length === 0)) {
      createMessage({ type: 'warn', description: '????????????????????????' });
      return;
    }
    const courseListDataTrnRequirement = courseListData.filter(
      item => item.trnRequirement === 'OPTIONAL'
    );
    if (
      courseListData &&
      courseListDataTrnRequirement &&
      courseListData.length === courseListDataTrnRequirement.length
    ) {
      createMessage({ type: 'warn', description: '????????????????????????????????????' });
      return;
    }
    if (formData.entryType === 'TRN_JOB' || formData.entryType === 'TRN_ENTRY') {
      let haveEmptyType1 = false;
      rangeData.forEach(item => {
        if (!item.resType1) {
          haveEmptyType1 = true;
        }
      });
      if (haveEmptyType1) {
        createMessage({ type: 'warn', description: '???????????????????????????????????????????????????' });
        return;
      }
      const newRangeData = rangeData.map(item => {
        const newItem = Object.assign({}, item);
        delete newItem.id;
        return JSON.stringify(newItem);
      });

      if (Array.from(new Set(newRangeData)).length !== rangeData.length) {
        createMessage({ type: 'warn', description: '????????????????????????????????????????????????' });
        return;
      }
      parmas.trainingResScopeViewList = rangeData || [];
    }
    // ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    if (
      formData.entryType === 'TRN_JOB' &&
      formData.jobScope === 'BY_CAPASET' &&
      jobCapaSetIds.length < 1
    ) {
      createMessage({ type: 'warn', description: '??????????????????????????????????????????' });
    }
  };

  toggle = () => {
    this.setState({
      visible: false,
    });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, platTrainEdit = {} } = this.props;
    const { rangeData = [] } = platTrainEdit;
    // ?????????????????????

    if (rowField === 'resType1') {
      const rowField2 = 'resType2';
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          rangeData: update(rangeData, {
            [rowIndex]: {
              [rowField]: {
                $set:
                  rowFieldValue && rowFieldValue.target
                    ? rowFieldValue.target.value
                    : rowFieldValue,
              },
              [rowField2]: {
                $set: undefined,
              },
            },
          }),
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          rangeData: update(rangeData, {
            [rowIndex]: {
              [rowField]: {
                $set:
                  rowFieldValue && rowFieldValue.target
                    ? rowFieldValue.target.value
                    : rowFieldValue,
              },
            },
          }),
        },
      });
    }
  };

  onCellChanged2 = (rowIndex, rowField) => rowFieldValue => {
    const { dispatch, platTrainEdit = {} } = this.props;
    const { courseListData = [] } = platTrainEdit;
    // ?????????????????????
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        courseListData: update(courseListData, {
          [rowIndex]: {
            [rowField]: {
              $set:
                rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue,
            },
          },
        }),
      },
    });
  };

  swap = (arr, idx1, idx2) => {
    const newArr = Object.assign([], arr);
    const temp = newArr[idx1];
    newArr[idx1] = newArr[idx2];
    newArr[idx2] = temp;
    return newArr;
  };

  render() {
    const {
      dispatch,
      form: { getFieldDecorator, setFieldsValue },
      platTrainEdit = {},
    } = this.props;
    const {
      treeData = [],
      formData = {},
      courseList = [],
      courseListData = [],
      rangeData = [],
      selectedKeys = [],
      jobType2Data = [],
      resType2Data = [],
      resType2InternalData = [],
      resType2ExternalData = [],
      capaSetList,
      jobCapaSetIds = [],
    } = platTrainEdit;
    const { visible = false } = this.state;
    const targetKeys = courseListData.map(item => parseInt(item.id, 10));
    const tableRange = {
      rowKey: 'id',
      loading: false,
      pagination: false,
      dataSource: rangeData,
      showCopy: false,
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            rangeData: update(rangeData, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  periodFlag: 'UNLIMITED',
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            rangeData: rangeData.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
          },
        });
      },
      columns: [
        {
          title: '????????????',
          dataIndex: 'resType',
          required: true,
          key: 'resType',
          align: 'center',
          width: '50%',
          render: (value, row, index) => (
            <Row>
              <Col span={11}>
                <Selection.UDC
                  value={row.resType1}
                  code="RES:RES_TYPE1"
                  onChange={this.onCellChanged(index, 'resType1')}
                  placeholder="????????????????????????"
                />
              </Col>
              <Col span={11} offset={2}>
                <Selection.Columns
                  value={row.resType2}
                  source={
                    // eslint-disable-next-line no-nested-ternary
                    row.resType1 === 'INTERNAL_RES'
                      ? resType2InternalData
                      : row.resType1 === 'EXTERNAL_RES'
                        ? resType2ExternalData
                        : []
                  }
                  placeholder="????????????????????????"
                  onChange={this.onCellChanged(index, 'resType2')}
                  showSearch
                />
              </Col>
            </Row>
          ),
        },

        {
          title: '??????/??????',
          dataIndex: 'periodFlag',
          key: 'periodFlag',
          align: 'center',
          width: '50%',
          render: (value, row, index) => (
            <Radio.Group onChange={this.onCellChanged(index, 'periodFlag')} value={value}>
              <Radio value="LONG">??????</Radio>
              <Radio value="SHORT">??????</Radio>
              <Radio value="UNLIMITED">??????</Radio>
            </Radio.Group>
          ),
        },
      ],
      buttons: [],
    };

    const tableCourse = {
      rowKey: 'id',
      loading: false,
      pagination: false,
      dataSource: courseListData,
      showCopy: false,
      onAdd: newRow => {
        this.setState({
          visible: true,
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            courseListData: courseListData.filter(
              row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
            ),
          },
        });
      },
      columns: [
        {
          title: 'NO.',
          dataIndex: 'sortNo',
          key: 'sortNo',
          render: (value, row, index) => index + 1,
        },
        {
          title: '??????',
          dataIndex: 'courseName',
          key: 'courseName',
        },

        {
          title: '??????/??????',
          dataIndex: 'trnRequirement',
          key: 'trnRequirement',
          render: (value, row, index) => (
            <Radio.Group value={value} onChange={this.onCellChanged2(index, 'trnRequirement')}>
              <Radio value="REQUIRED">??????</Radio>
              <Radio value="OPTIONAL">??????</Radio>
            </Radio.Group>
          ),
        },
        {
          title: '??????????????????',
          dataIndex: 'requiredTime',
          key: 'requiredTime',
          width: 300,
          render: (value, row, index) => (
            <InputNumber
              value={value}
              style={{
                width: '100%',
              }}
              min={0.1}
              precision={1}
              step={0.1}
              placeholder="???????????????????????????"
              onChange={this.onCellChanged2(index, 'requiredTime')}
            />
          ),
        },
        {
          title: '??????',
          dataIndex: 'remark',
          key: 'remark',
          width: 300,
          render: (value, row, index) => (
            <Input
              placeholder="???????????????"
              value={value}
              onChange={this.onCellChanged2(index, 'remark')}
            />
          ),
        },
      ],
      buttons: [
        {
          key: 'moveup',
          title: '??????',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: (selectedRowKeys, selectedRows) =>
            !selectedRowKeys || (selectedRowKeys && selectedRowKeys.length !== 1),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            const id = selectedRowKeys[0];
            const curr = courseListData.find(row => row.id === parseInt(id, 10));
            const idx = courseListData.indexOf(curr);
            if (idx === 0) {
              createMessage({ type: 'warn', description: '????????????????????????????????????' });
              return;
            }
            const newCourseListData = this.swap(courseListData, idx, idx - 1);
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                courseListData: newCourseListData,
              },
            });
          },
        },
        {
          key: 'movedown',
          title: '??????',
          className: 'tw-btn-primary',
          loading: false,
          hidden: false,
          disabled: (selectedRowKeys, selectedRows) =>
            !selectedRowKeys || (selectedRowKeys && selectedRowKeys.length !== 1),
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows) => {
            const id = selectedRowKeys[0];
            const curr = courseListData.find(row => row.id === parseInt(id, 10));
            const idx = courseListData.indexOf(curr);
            if (idx === courseListData.length - 1) {
              createMessage({ type: 'warn', description: '???????????????????????????????????????' });
              return;
            }
            const newCourseListData = this.swap(courseListData, idx, idx + 1);
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                courseListData: newCourseListData,
              },
            });
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper title="??????????????????">
        <Card className="tw-card-rightLine" bordered={false}>
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            // disabled={!btnCanUse}
            // loading={loading}
            onClick={() => this.handleSave('save')}
          >
            ??????
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        <Card className="tw-card-adjust" bordered={false} title="????????????">
          <FieldList
            layout="horizontal"
            // legend="????????????"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="progName"
              label="??????????????????"
              decorator={{
                initialValue: formData.progName,
                rules: [
                  {
                    required: true,
                    message: '???????????????????????????',
                  },
                ],
              }}
            >
              <Input placeholder="???????????????????????????" />
            </Field>
            <Field
              name="classId"
              label="??????"
              decorator={{
                initialValue: formData.classId,
                rules: [
                  {
                    required: true,
                    message: '???????????????',
                  },
                ],
              }}
            >
              <TreeSelect
                className="tw-field-group-field"
                treeData={Array.isArray(treeData) ? treeData : []}
                placeholder="??????"
                treeDefaultExpandedKeys={['-999']}
                onChange={v => {
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      classId: v,
                    },
                  });
                }}
              />
            </Field>
            <Field
              name="entryType"
              label="????????????"
              decorator={{
                initialValue: formData.entryType,
                rules: [
                  {
                    required: true,
                    message: '?????????????????????',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="RES:TRN_REASON_TYPE"
                placeholder="?????????????????????"
                onChange={v => {
                  setFieldsValue({
                    jobClass1: undefined,
                    jobClass2: undefined,
                    jobScope: undefined,
                  });
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      jobClass1: undefined,
                      jobClass2: undefined,
                      jobScope: undefined,
                      entryType: v,
                    },
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      rangeData: [],
                      jobCapaSetIds: [],
                    },
                  });
                }}
              />
            </Field>
            <Field
              label="??????"
              name="progStatus"
              decorator={{
                initialValue: formData.progStatus,
              }}
            >
              <Radio.Group>
                <Radio value="IN_USE">??????</Radio>
                <Radio value="NOT_USED">??????</Radio>
              </Radio.Group>
            </Field>
            <Field
              label="????????????"
              name="jobScope"
              decorator={{
                initialValue: formData.jobScope,
                rules: [
                  {
                    required: formData.entryType === 'TRN_JOB',
                    message: '?????????????????????',
                  },
                ],
              }}
            >
              <Radio.Group
                disabled={formData.entryType !== 'TRN_JOB'}
                onChange={e => {
                  setFieldsValue({
                    jobClass1: undefined,
                    jobClass2: undefined,
                  });
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      jobClass1: undefined,
                      jobClass2: undefined,
                    },
                  });
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      jobCapaSetIds: [],
                    },
                  });
                }}
              >
                <Radio value="BY_JOB_CLASS">?????????????????????</Radio>
                <Radio value="BY_CAPASET">?????????????????????</Radio>
              </Radio.Group>
            </Field>
            <FieldLine label="????????????">
              <Field
                name="jobClass1"
                wrapperCol={{ span: 23, xxl: 23 }}
                decorator={{
                  initialValue: formData.jobClass1,
                  rules: [
                    {
                      required: formData.jobScope === 'BY_JOB_CLASS',
                      message: '??????????????????',
                    },
                  ],
                }}
              >
                <Selection.UDC
                  code="RES:JOB_TYPE1"
                  placeholder="??????????????????"
                  disabled={formData.jobScope !== 'BY_JOB_CLASS'}
                  onChange={v => {
                    dispatch({
                      type: `${DOMAIN}/updateForm`,
                      payload: {
                        jobClass1: v,
                        jobClass2: undefined,
                      },
                    });
                    setFieldsValue({
                      jobClass2: undefined,
                    });
                    dispatch({
                      type: `${DOMAIN}/getJob2`,
                      payload: v,
                    });
                  }}
                />
              </Field>
              <Field
                name="jobClass2"
                wrapperCol={{ span: 23, offset: 1, xxl: 23 }}
                decorator={{
                  initialValue: formData.jobClass2,
                }}
              >
                <Selection.Columns
                  disabled={formData.jobScope !== 'BY_JOB_CLASS'}
                  source={jobType2Data || []}
                  placeholder="??????????????????"
                  showSearch
                />
              </Field>
            </FieldLine>

            <Field
              name="certNo"
              label="????????????"
              decorator={{
                initialValue: formData.certNo,
              }}
            >
              <Input placeholder="?????????????????????" />
            </Field>
            <Field
              name="certName"
              label="????????????"
              decorator={{
                initialValue: formData.certName,
              }}
            >
              <Input placeholder="?????????????????????" />
            </Field>

            <Field
              name="progDesc"
              label="??????"
              decorator={{
                initialValue: formData.progDesc,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="???????????????" rows={3} />
            </Field>
            <Field
              name="learnObj"
              label="????????????"
              decorator={{
                initialValue: formData.learnObj,
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="?????????????????????" rows={3} />
            </Field>
          </FieldList>
          <Divider dashed />
          {(formData.entryType === 'TRN_JOB' || formData.entryType === 'TRN_ENTRY') && (
            <FieldList legend="??????????????????" noReactive>
              <div style={{ color: '#1890ff', marginTop: '10px' }}>
                <span style={{ color: '#1890ff', margin: '5px 0' }}>
                  <Icon type="exclamation-circle" />
                  &nbsp;
                  <span>?????????????????????????????????????????????</span>
                </span>
              </div>
              <div style={{ width: '1000px' }}>
                <EditableDataTable {...tableRange} />
              </div>
              <Divider dashed />
            </FieldList>
          )}
          {/* ????????????????????????????????????????????????????????????????????????????????????????????? */}
          {formData.entryType === 'TRN_JOB' &&
            formData.jobScope === 'BY_CAPASET' && (
              <FieldList legend="??????????????????" noReactive>
                <div>
                  <span style={{ display: 'inline-block', width: '410px', margin: '10px 0' }}>
                    ????????????
                  </span>
                  <span
                    style={{ display: 'inline-block', width: '410px', margin: '10px 0 10px 48px' }}
                  >
                    ????????????
                  </span>
                </div>
                <Transfer
                  dataSource={capaSetList}
                  showSearch
                  filterOption={(inputValue, option) =>
                    option.title.indexOf(inputValue) > -1 ||
                    option.title.indexOf(inputValue.toUpperCase()) > -1 ||
                    option.title.indexOf(inputValue.toLowerCase()) > -1
                  }
                  targetKeys={jobCapaSetIds}
                  onChange={val =>
                    dispatch({
                      type: `${DOMAIN}/updateState`,
                      payload: {
                        jobCapaSetIds: val,
                      },
                    })
                  }
                  render={item => item.title}
                  listStyle={{ width: 410, height: 450 }}
                />
                <Divider dashed />
              </FieldList>
            )}

          <FieldList legend="??????" noReactive>
            <div style={{ marginTop: '10px' }}>
              <Checkbox
                checked={formData.sortLockedFlag === 'Y'}
                onChange={e => {
                  const sortLockedFlag = e.target.checked ? 'Y' : 'N';
                  dispatch({
                    type: `${DOMAIN}/updateForm`,
                    payload: {
                      sortLockedFlag,
                    },
                  });
                }}
              >
                <span style={{ color: '#1890ff' }}>
                  ??????????????????(???????????????????????????????????????????????????????????????)
                </span>
              </Checkbox>
            </div>
            <EditableDataTable {...tableCourse} />
          </FieldList>
        </Card>
        <CourseModal
          visible={visible}
          courseList={courseList.filter(item => !targetKeys.includes(parseInt(item.id, 10))) || []}
          onCancel={this.toggle}
          reset={[]}
          toggle={() => {
            this.toggle;
          }}
        />
      </PageHeaderWrapper>
    );
  }
}

export default CapaSetDetail;
