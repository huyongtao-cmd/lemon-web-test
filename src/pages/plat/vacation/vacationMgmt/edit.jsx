import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isNil, isEmpty } from 'ramda';
import { Button, Card, Form, Input, Radio, InputNumber, Select } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection, DatePicker, YearPicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import SelectWithCols from '@/components/common/SelectWithCols';
import Loading from '@/components/core/DataLoading';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const extrWorkColumns = [{ dataIndex: 'name', title: '加班开始日期～加班结束日期', span: 24 }];

const DOMAIN = 'vacationEdit';

@connect(({ loading, vacationEdit, vacationMgmt, dispatch }) => ({
  loading,
  vacationEdit,
  vacationMgmt,
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
      vacationEdit: { formData },
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
      vacationMgmt: { searchForm },
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
              closeThenGoto('/hr/attendanceMgmt/vacationMgmt?_refresh=0');
              dispatch({ type: `vacationMgmt/query`, payload: searchForm });
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
              closeThenGoto('/hr/attendanceMgmt/vacationMgmt?_refresh=0');
              dispatch({ type: `vacationMgmt/query`, payload: searchForm });
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
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      vacationEdit: {
        formData,
        resDataSource,
        baseBuDataSource,
        projSource,
        projList,
        extrWorkSource,
        extrWorkList,
        pageConfig,
      },
    } = this.props;
    const { isInLieu } = this.state;
    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    let currentBlockConfig = null;
    pageConfig.pageBlockViews.forEach(view => {
      if (view.blockKey === 'RES_VACATION_EDIT') {
        // 假期维护
        currentBlockConfig = view;
      }
    });
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    const {
      resId = {},
      vacationYear = {},
      vacationType = {},
      startDate = {},
      endDate = {},
      expirationDate = {},
      totalDays = {},
      usedDays = {},
      extrWorkId = {},
      overtime = {},
      extrWorkProjId = {},
      remark = {},
    } = pageFieldJson;
    const fields = [
      <Field
        name="vacationYear"
        key="vacationYear"
        label={vacationYear.displayName}
        sortNo={vacationYear.sortNo}
        decorator={{
          initialValue: formData.vacationYear || undefined,
          rules: [
            {
              required: !!vacationYear.requiredFlag,
              message: `${vacationYear.displayName}`,
            },
          ],
        }}
      >
        <DatePicker.YearPicker
          className="x-fill-100"
          format="YYYY"
          placeholder={`请选择${vacationYear.displayName}`}
        />
      </Field>,
      <Field
        name="resId"
        key="resId"
        label={resId.displayName}
        sortNo={resId.sortNo}
        decorator={{
          initialValue: formData.resId || undefined,
          rules: [
            {
              required: !!resId.requiredFlag,
              message: `请选择${resId.displayName}`,
            },
          ],
        }}
      >
        <Selection.ResFilterDimission
          className="x-fill-100"
          // source={resDataSource}
          source={() => selectUserMultiCol()}
          columns={particularColumns}
          transfer={{ key: 'id', code: 'id', name: 'name' }}
          dropdownMatchSelectWidth={false}
          showSearch
          onColumnsChange={value => {
            setFieldsValue({
              extrWorkProjId: null,
              extrWorkProjName: null,
              extrWorkId: null,
              extrWorkPlanName: null,
            });
          }}
          placeholder={`请选择${resId.displayName}`}
        />
      </Field>,
      <Field
        name="vacationType"
        key="vacationType"
        label={vacationType.displayName}
        sortNo={vacationType.sortNo}
        decorator={{
          initialValue: formData.vacationType || undefined,
          rules: [
            {
              required: !!vacationType.requiredFlag,
              message: `请选择${vacationType.displayName}`,
            },
          ],
        }}
      >
        <RadioGroup
          onChange={e => {
            this.setState({ isInLieu: e.target.value });
            if (e.target.value === 'ANNUAL') {
              setFieldsValue({
                overtime: null,
                extrWorkProjId: null,
                extrWorkProjIName: null,
                extrWorkId: null,
                extrWorkPlanName: null,
              });
              dispatch({
                type: `${DOMAIN}/updateForm`,
                payload: {
                  overtime: null,
                  extrWorkProjId: null,
                  extrWorkProjIName: null,
                  extrWorkId: null,
                  extrWorkPlanName: null,
                },
              });
            }
          }}
        >
          <Radio value="ANNUAL">年休</Radio>
          <Radio value="IN_LIEU">调休</Radio>
        </RadioGroup>
      </Field>,
      isInLieu === 'IN_LIEU' ? (
        <Field
          name="overtime"
          key="overtime"
          label={overtime.displayName}
          sortNo={overtime.sortNo}
          decorator={{
            initialValue: formData.overtime || undefined,
            rules: [
              {
                required: !!overtime.requiredFlag,
                message: `${overtime.displayName}必填`,
              },
            ],
          }}
        >
          <RadioGroup>
            <Radio value="YES">是</Radio>
            <Radio value="NO">否</Radio>
          </RadioGroup>
        </Field>
      ) : (
        <div />
      ),
      isInLieu === 'IN_LIEU' && formData.overtime === 'YES' ? (
        <Field
          name="extrWorkProjId"
          key="extrWorkProjId"
          label={extrWorkProjId.displayName}
          sortNo={extrWorkProjId.sortNo}
          decorator={{
            initialValue:
              formData.extrWorkProjId && formData.extrWorkProjName
                ? {
                    code: formData.extrWorkProjId,
                    name: formData.extrWorkProjName,
                  }
                : null,
            rules: [
              {
                required: formData.overtime === 'YES' || false,
                message: `${extrWorkProjId.displayName}必填`,
              },
            ],
          }}
        >
          <SelectWithCols
            labelKey="name"
            className="x-fill-100"
            columns={particularColumns}
            dataSource={projSource}
            onChange={value => {
              setFieldsValue({
                extrWorkId: null,
                extrWorkPlanName: null,
              });
              if (!isNil(value)) {
                // 加班计划列表
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    extrWorkSource: extrWorkList.filter(d => d.workReasonId === value.id),
                  },
                });
              } else {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    extrWorkSource: extrWorkList,
                    formData: {
                      ...formData,
                      extrWorkId: undefined,
                    },
                  },
                });
              }
            }}
            selectProps={{
              showSearch: true,
              disabled: !(isInLieu === 'IN_LIEU' && formData.overtime === 'YES'),
              onSearch: value => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    projSource: projList.filter(
                      d =>
                        d.code.indexOf(value) > -1 ||
                        d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                    ),
                  },
                });
              },
              allowClear: true,
            }}
          />
        </Field>
      ) : (
        <div />
      ),
      isInLieu === 'IN_LIEU' && formData.overtime === 'YES' ? (
        <Field
          name="extrWorkId"
          key="extrWorkId"
          label={extrWorkId.displayName}
          sortNo={extrWorkId.sortNo}
          decorator={{
            initialValue:
              formData.extrWorkId && formData.extrWorkPlanName
                ? {
                    code: formData.extrWorkId,
                    name: formData.extrWorkPlanName,
                  }
                : null,
            rules: [
              {
                required: formData.overtime === 'YES' || false,
                message: `${extrWorkId.displayName}必填`,
              },
            ],
          }}
        >
          <SelectWithCols
            labelKey="name"
            className="x-fill-100"
            columns={extrWorkColumns}
            dataSource={
              formData.extrWorkProjId
                ? extrWorkSource.filter(d => d.workReasonId === formData.extrWorkProjId)
                : extrWorkSource
            }
            onChange={value => {}}
            selectProps={{
              showSearch: true,
              disabled: !(
                isInLieu === 'IN_LIEU' &&
                formData.overtime === 'YES' &&
                !isNil(formData.extrWorkProjId)
              ),
              onSearch: value => {
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    extrWorkSource: extrWorkList.filter(
                      d =>
                        d.code.indexOf(value) > -1 ||
                        d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                    ),
                  },
                });
              },
              allowClear: true,
            }}
          />
        </Field>
      ) : (
        <div />
      ),
      <Field
        name="dates"
        key="endDate"
        label={endDate.displayName}
        sortNo={endDate.sortNo}
        decorator={{
          initialValue: formData.dates || '',
          rules: [
            {
              required: !!endDate.requiredFlag,
              message: `请选择${endDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker.RangePicker className="x-fill-100" format="YYYY-MM-DD" />
      </Field>,
      <Field
        name="expirationDate"
        key="expirationDate"
        label={expirationDate.displayName}
        sortNo={expirationDate.sortNo}
        decorator={{
          initialValue: formData.expirationDate || undefined,
          rules: [
            {
              required: !!expirationDate.requiredFlag,
              message: `请选择${expirationDate.displayName}`,
            },
          ],
        }}
      >
        <DatePicker className="x-fill-100" format="YYYY-MM-DD" />
      </Field>,
      <Field
        name="totalDays"
        key="totalDays"
        label={totalDays.displayName}
        sortNo={totalDays.sortNo}
        decorator={{
          initialValue: formData.totalDays || '',
          rules: [
            {
              required: !!totalDays.requiredFlag,
              message: `请输入${totalDays.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${totalDays.displayName}`} />
      </Field>,
      <Field
        name="usedDays"
        key="usedDays"
        label={usedDays.displayName}
        sortNo={usedDays.sortNo}
        decorator={{
          initialValue: formData.usedDays || '',
          rules: [
            {
              required: !!usedDays.requiredFlag,
              message: `请输入${usedDays.displayName}`,
            },
          ],
        }}
      >
        <Input placeholder={`请输入${usedDays.displayName}`} />
      </Field>,
      <Field
        name="remark"
        key="remark"
        label={remark.displayName}
        sortNo={remark.sortNo}
        fieldCol={1}
        labelCol={{ span: 4, xxl: 3 }}
        wrapperCol={{ span: 19, xxl: 20 }}
        decorator={{
          initialValue: formData.remark || '',
        }}
      >
        <Input.TextArea rows={3} placeholder={`请输入${remark.displayName}`} />
      </Field>,
    ];
    const filterList = fields
      .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
      .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
    return (
      <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
        {filterList}
      </FieldList>
    );
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      vacationEdit: {
        formData,
        resDataSource,
        baseBuDataSource,
        projSource,
        projList,
        extrWorkSource,
        extrWorkList,
        pageConfig,
      },
    } = this.props;
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

          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/attendanceMgmt/vacationMgmt?_refresh=0')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" id="ui.menu.plat.vacation.edit" defaultMessage="假期维护" />}
          bordered={false}
        >
          {!loading.effects[`${DOMAIN}/getPageConfig`] ? this.renderPage() : <Loading />}
          {/* <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
            <Field
              name="vacationYear"
              label="年度"
              decorator={{
                initialValue: formData.vacationYear || undefined,
                rules: [
                  {
                    required: true,
                    message: '年度',
                  },
                ],
              }}
            >
              <DatePicker.YearPicker
                className="x-fill-100"
                format="YYYY"
                placeholder="请选择年度"
              />
            </Field>
            <Field
              name="resId"
              label="资源"
              decorator={{
                initialValue: formData.resId || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择资源',
                  },
                ],
              }}
            >
              <Selection.ResFilterDimission
                className="x-fill-100"
                // source={resDataSource}
                source={() => selectUserMultiCol()}
                columns={particularColumns}
                transfer={{ key: 'id', code: 'id', name: 'name' }}
                dropdownMatchSelectWidth={false}
                showSearch
                onColumnsChange={value => {
                  setFieldsValue({
                    extrWorkProjId: null,
                    extrWorkProjName: null,
                    extrWorkId: null,
                    extrWorkPlanName: null,
                  });
                }}
                placeholder="请选择资源"
              />
            </Field>
            <Field
              name="vacationType"
              label="假期类型"
              decorator={{
                initialValue: formData.vacationType || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择假期类型',
                  },
                ],
              }}
            >
              <RadioGroup onChange={e => this.setState({ isInLieu: e.target.value })}>
                <Radio value="ANNUAL">年休</Radio>
                <Radio value="IN_LIEU">调休</Radio>
              </RadioGroup>
            </Field>
            {isInLieu === 'IN_LIEU' && (
              <Field
                name="overtime"
                label="是否加班调休"
                decorator={{
                  initialValue: formData.overtime || undefined,
                  rules: [
                    {
                      required: true,
                      message: '是否加班调休必填',
                    },
                  ],
                }}
              >
                <RadioGroup>
                  <Radio value="YES">是</Radio>
                  <Radio value="NO">否</Radio>
                </RadioGroup>
              </Field>
            )}
            {isInLieu === 'IN_LIEU' &&
              formData.overtime === 'YES' && (
                <Field
                  name="extrWorkProjId"
                  label="加班项目"
                  decorator={{
                    initialValue:
                      formData.extrWorkProjId && formData.extrWorkProjName
                        ? {
                            code: formData.extrWorkProjId,
                            name: formData.extrWorkProjName,
                          }
                        : null,
                    rules: [
                      {
                        required: formData.overtime === 'YES' || false,
                        message: '加班项目必填',
                      },
                    ],
                  }}
                >
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    columns={particularColumns}
                    dataSource={projSource}
                    onChange={value => {
                      setFieldsValue({
                        extrWorkId: null,
                        extrWorkPlanName: null,
                      });
                      if (!isNil(value)) {
                        // 加班计划列表
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            extrWorkSource: extrWorkList.filter(d => d.workReasonId === value.id),
                          },
                        });
                      } else {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            extrWorkSource: extrWorkList,
                            formData: {
                              ...formData,
                              extrWorkId: undefined,
                            },
                          },
                        });
                      }
                    }}
                    selectProps={{
                      showSearch: true,
                      disabled: !(isInLieu === 'IN_LIEU' && formData.overtime === 'YES'),
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            projSource: projList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                </Field>
              )}
            {isInLieu === 'IN_LIEU' &&
              formData.overtime === 'YES' && (
                <Field
                  name="extrWorkId"
                  label="加班安排"
                  decorator={{
                    initialValue:
                      formData.extrWorkId && formData.extrWorkPlanName
                        ? {
                            code: formData.extrWorkId,
                            name: formData.extrWorkPlanName,
                          }
                        : null,
                    rules: [
                      {
                        required: formData.overtime === 'YES' || false,
                        message: '加班安排必填',
                      },
                    ],
                  }}
                >
                  <SelectWithCols
                    labelKey="name"
                    className="x-fill-100"
                    columns={extrWorkColumns}
                    dataSource={
                      formData.extrWorkProjId
                        ? extrWorkSource.filter(d => d.workReasonId === formData.extrWorkProjId)
                        : extrWorkSource
                    }
                    onChange={value => {}}
                    selectProps={{
                      showSearch: true,
                      disabled: !(
                        isInLieu === 'IN_LIEU' &&
                        formData.overtime === 'YES' &&
                        !isNil(formData.extrWorkProjId)
                      ),
                      onSearch: value => {
                        dispatch({
                          type: `${DOMAIN}/updateState`,
                          payload: {
                            extrWorkSource: extrWorkList.filter(
                              d =>
                                d.code.indexOf(value) > -1 ||
                                d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                            ),
                          },
                        });
                      },
                      allowClear: true,
                    }}
                  />
                </Field>
              )}
            <Field
              name="dates"
              label="起始/截止"
              decorator={{
                initialValue: formData.dates || '',
                rules: [
                  {
                    required: true,
                    message: '请选择起始/截止时间',
                  },
                ],
              }}
            >
              <DatePicker.RangePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="expirationDate"
              label="有效期"
              decorator={{
                initialValue: formData.expirationDate || undefined,
                rules: [
                  {
                    required: true,
                    message: '请选择效期',
                  },
                ],
              }}
            >
              <DatePicker className="x-fill-100" format="YYYY-MM-DD" />
            </Field>
            <Field
              name="totalDays"
              label="总天数"
              decorator={{
                initialValue: formData.totalDays || '',
                rules: [
                  {
                    required: true,
                    message: '请输入总天数',
                  },
                ],
              }}
            >
              <Input placeholder="请输入总天数" />
            </Field>
            <Field
              name="usedDays"
              label="已用天数"
              decorator={{
                initialValue: formData.usedDays || '',
                rules: [
                  {
                    required: true,
                    message: '请输入已用天数',
                  },
                ],
              }}
            >
              <Input placeholder="请输入已用天数" />
            </Field>
            <Field
              name="remark"
              label="备注"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              decorator={{
                initialValue: formData.remark || '',
              }}
            >
              <Input.TextArea rows={3} placeholder="请输入备注" />
            </Field>
          </FieldList> */}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VacationEdit;
