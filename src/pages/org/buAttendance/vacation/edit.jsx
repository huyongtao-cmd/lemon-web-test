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
import { selectbuMemberList } from '@/services/gen/list';
import createMessage from '@/components/core/AlertMessage';
import SelectWithCols from '@/components/common/SelectWithCols';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

const extrWorkColumns = [{ dataIndex: 'name', title: '加班开始日期～加班结束日期', span: 24 }];

const DOMAIN = 'orgVacationEdit';

@connect(({ loading, orgVacationEdit, orgVacation, dispatch }) => ({
  loading,
  orgVacationEdit,
  orgVacation,
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
      obj.extrWorkPlanName = extrWorkId.name;
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
      isInLieu: 'IN_LIEU',
    };
  }

  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    // 有id，修改
    id &&
      dispatch({
        type: `${DOMAIN}/queryDetail`,
        payload: {
          id,
        },
      });
    dispatch({ type: `${DOMAIN}/res` });
  }

  handleSubmit = () => {
    const {
      form: { validateFieldsAndScroll },
      orgVacation: { searchForm },
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
              closeThenGoto('/org/buAttendance/vacation?_refresh=0');
              dispatch({ type: `orgVacation/query`, payload: searchForm });
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
              closeThenGoto('/org/buAttendance/vacation?_refresh=0');
              dispatch({ type: `orgVacation/query`, payload: searchForm });
            } else {
              createMessage({ type: 'error', description: response.reason || '操作失败' });
            }
          });
        }
      }
    });
  };

  render() {
    const {
      loading,
      dispatch,
      form: { getFieldDecorator, setFieldsValue, getFieldValue },
      orgVacationEdit: {
        formData,
        resDataSource,
        baseBuDataSource,
        projSource,
        projList,
        extrWorkSource,
        extrWorkList,
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
            onClick={() => closeThenGoto('/org/buAttendance/vacation?_refresh=0')}
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
          <FieldList layout="horizontal" getFieldDecorator={getFieldDecorator} col={2}>
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
              <Selection.Columns
                className="x-fill-100"
                source={selectbuMemberList}
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
                initialValue: formData.vacationType || 'IN_LIEU',
              }}
            >
              <RadioGroup onChange={e => this.setState({ isInLieu: e.target.value })}>
                {/* <Radio value="ANNUAL">年休</Radio> */}
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
          </FieldList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default VacationEdit;
