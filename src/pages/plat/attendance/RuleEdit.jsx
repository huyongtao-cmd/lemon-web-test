import React, { PureComponent } from 'react';
import { Button, Form, Card, Input, Row, Col } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import classnames from 'classnames';
import { isEmpty } from 'ramda';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import DataTable from '@/components/common/DataTable';
import { Selection } from '@/pages/gen/field';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { selectUsersWithBu } from '@/services/gen/list';

import ResModal from './modal/Res';
import LocationModal from './modal/Location';
import TimeModal from './modal/Time';
import SpecModal from './modal/Spec';
import styles from './style.less';

const DOMAIN = 'platAttendanceRuleEdit';
const { Field } = FieldList;

@connect(({ loading, platAttendanceRuleEdit, dispatch }) => ({
  loading,
  platAttendanceRuleEdit,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues, allValues) {
    if (isEmpty(changedValues)) return;
    props.dispatch({
      type: `${DOMAIN}/updateForm`,
      payload: changedValues,
    });
  },
})
@mountToTab()
class RuleEdit extends PureComponent {
  state = {
    resVisible: false,
    resReset: true,
    locationVisible: false,
    locationIndex: -1,
    locationSource: {
      name: '',
      siteDesc: '',
      siteLatitude: 0,
      siteLongitude: 0,
      siteRadius: undefined,
    },
    timeVisible: false,
    timeIndex: -1,
    timeSource: {
      attendanceDateMon: false,
      attendanceDateTue: false,
      attendanceDateWed: false,
      attendanceDateThu: false,
      attendanceDateFri: false,
      attendanceDateSat: false,
      attendanceDateSun: false,
      attendanceTimeStart: '',
      attendanceTimeEnd: '',
      allowLateTimeNum: 0,
      allowLeaveTimeNum: 0,
      punchLimitStartTime: '',
      punchLimitEndTime: '',
    },
    specVisible: false,
    specIndex: -1,
    specSource: {
      attendanceDate: '',
      attendanceTimeStart: '',
      attendanceTimeEnd: '',
    },
    flag: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` });
    dispatch({ type: `${DOMAIN}/selectUser` });
    id &&
      dispatch({
        type: `${DOMAIN}/query`,
        payload: id,
      }).then(() => {
        this.setState({
          flag: true,
        });
      });
  }

  handleSave = () => {
    const {
      form: { validateFieldsAndScroll },
      platAttendanceRuleEdit: {
        formData,
        attendanceSiteEntity,
        attendanceNormalDateEntity,
        attendanceNormalDateSpecialEntity,
      },
      dispatch,
    } = this.props;
    const { id } = fromQs();
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const form = {
          ...formData,
          attendanceResIds: formData.attendanceResIds.join(','),
          reportToRes: formData.reportToRes.join(','),
          attendanceSiteEntity,
          attendanceNormalDateEntity,
          attendanceNormalDateSpecialEntity,
        };
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            btnCanUse: false,
          },
        });
        if (id) {
          dispatch({
            type: `${DOMAIN}/edit`,
            payload: form,
          });
        } else {
          dispatch({
            type: `${DOMAIN}/save`,
            payload: form,
          });
        }
      }
    });
  };

  toggleRes = () => {
    const { resVisible } = this.state;
    this.setState({
      resVisible: !resVisible,
    });
  };

  toggleReset = () => {
    const { resReset } = this.state;
    this.setState({
      resReset: !resReset,
    });
  };

  toggleLocation = () => {
    const { locationVisible } = this.state;
    this.setState({
      locationVisible: !locationVisible,
    });
  };

  toggleTime = () => {
    const { timeVisible } = this.state;
    this.setState({
      timeVisible: !timeVisible,
    });
  };

  toggleSpec = () => {
    const { specVisible } = this.state;
    this.setState({
      specVisible: !specVisible,
    });
  };

  render() {
    const {
      form,
      loading,
      dispatch,
      platAttendanceRuleEdit: {
        formData,
        attendanceSiteEntity,
        attendanceNormalDateEntity,
        attendanceNormalDateSpecialEntity,
        btnCanUse = true,
      },
    } = this.props;
    const { getFieldDecorator } = form;

    const {
      resVisible,
      resReset,
      locationVisible,
      locationSource,
      locationIndex,
      timeVisible,
      timeSource,
      timeIndex,
      specVisible,
      specSource,
      specIndex,
      flag,
    } = this.state;
    const { id } = fromQs();
    const disabledBtn = id ? loading.effects[`${DOMAIN}/query`] || !btnCanUse : false || !btnCanUse;

    const commonProps = {
      columnsCache: DOMAIN,
      dispatch,
      // sortBy: 'id',
      // rowKey: 'id',
      sortDirection: 'DESC',
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
    };

    const locationProps = {
      dataSource: attendanceSiteEntity,
      total: attendanceSiteEntity.length || 0,
      loading: disabledBtn,
      columns: [
        {
          title: '打卡地点',
          dataIndex: 'siteDesc',
        },
        {
          title: '选择范围',
          dataIndex: 'siteRadius',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          size: 'default',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              locationSource: {
                name: '',
                siteDesc: '',
                siteLatitude: 0,
                siteLongitude: 0,
                siteRadius: undefined,
              },
              locationIndex: -1,
            });
            this.toggleLocation();
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          size: 'default',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const index = selectedRowKeys[0];
            this.setState({
              locationSource: attendanceSiteEntity[index],
              locationIndex: index,
            });
            this.toggleLocation();
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          size: 'default',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const [index] = selectedRowKeys;
            attendanceSiteEntity.splice(index, 1);
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                attendanceSiteEntity,
              },
            });
          },
        },
      ],
    };

    const timeProps = {
      dataSource: attendanceNormalDateEntity,
      total: attendanceNormalDateEntity.length || 0,
      loading: disabledBtn,
      columns: [
        {
          title: '工作日',
          dataIndex: 'workday',
          render: (value, row, index) => {
            const {
              attendanceDateMon,
              attendanceDateTue,
              attendanceDateWed,
              attendanceDateThu,
              attendanceDateFri,
              attendanceDateSat,
              attendanceDateSun,
            } = row;
            return `
            ${attendanceDateMon ? '星期一' : ''}
            ${attendanceDateTue ? '星期二' : ''}
            ${attendanceDateWed ? '星期三' : ''}
            ${attendanceDateThu ? '星期四' : ''}
            ${attendanceDateFri ? '星期五' : ''}
            ${attendanceDateSat ? '星期六' : ''}
            ${attendanceDateSun ? '星期天' : ''}
            `;
          },
        },
        {
          title: '上班时间',
          dataIndex: 'attendanceTimeStart',
        },
        {
          title: '下班时间',
          dataIndex: 'attendanceTimeEnd',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          size: 'default',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              timeSource: {
                attendanceDateMon: false,
                attendanceDateTue: false,
                attendanceDateWed: false,
                attendanceDateThu: false,
                attendanceDateFri: false,
                attendanceDateSat: false,
                attendanceDateSun: false,
                attendanceTimeStart: '',
                attendanceTimeEnd: '',
                allowLateTimeNum: 0,
                allowLeaveTimeNum: 0,
                punchLimitStartTime: '',
                punchLimitEndTime: '',
              },
              timeIndex: -1,
            });
            this.toggleTime();
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          size: 'default',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const index = selectedRowKeys[0];
            this.setState({
              timeSource: attendanceNormalDateEntity[index],
              timeIndex: index,
            });
            this.toggleTime();
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          size: 'default',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const [index] = selectedRowKeys;
            attendanceNormalDateEntity.splice(index, 1);
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                attendanceNormalDateEntity,
              },
            });
          },
        },
      ],
    };

    const specProps = {
      dataSource: attendanceNormalDateSpecialEntity,
      total: attendanceNormalDateSpecialEntity.length || 0,
      loading: disabledBtn,
      columns: [
        {
          title: '日期',
          dataIndex: 'attendanceDate',
        },
        {
          title: '上班时间',
          dataIndex: 'attendanceTimeStart',
        },
        {
          title: '下班时间',
          dataIndex: 'attendanceTimeEnd',
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          size: 'default',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({
              specSource: {
                attendanceDate: '',
                attendanceTimeStart: undefined,
                attendanceTimeEnd: undefined,
              },
              specIndex: -1,
            });
            this.toggleSpec();
          },
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          size: 'default',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const index = selectedRowKeys[0];
            this.setState({
              specSource: attendanceNormalDateSpecialEntity[index],
              specIndex: index,
            });
            this.toggleSpec();
          },
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          size: 'default',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length !== 1,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            const [index] = selectedRowKeys;
            attendanceNormalDateSpecialEntity.splice(index, 1);
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                attendanceNormalDateSpecialEntity,
              },
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="报表维护">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            icon="save"
            size="large"
            disabled={disabledBtn}
            onClick={this.handleSave}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => closeThenGoto('/hr/attendanceMgmt/attendance/rule')}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          bordered={false}
          title={<Title icon="profile" text="打卡规则" />}
        >
          <FieldList
            layout="horizontal"
            getFieldDecorator={getFieldDecorator}
            col={2}
            hasSeparator={1}
          >
            <Field
              name="ruleName"
              label="规则名称"
              decorator={{
                initialValue: formData.ruleName,
                rules: [
                  {
                    required: true,
                    message: '请输入规则名称',
                  },
                ],
              }}
            >
              <Input placeholder="请输入规则名称" />
            </Field>

            <Field
              name="ruleType"
              label="规则类型"
              decorator={{
                initialValue: formData.ruleType,
                rules: [
                  {
                    required: true,
                    message: '请选择规则类型',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM:ATTENDANCE_RULE_TYPE" placeholder="请选择规则类型" />
            </Field>

            <Field
              name="attendanceResIds"
              label="打卡人员"
              decorator={{
                initialValue: formData.attendanceResIds,
                rules: [
                  {
                    required: true,
                    message: '请选择打卡人员',
                  },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Selection.Columns
                transfer={{ code: 'id', name: 'name' }}
                source={selectUsersWithBu}
                placeholder="请选择打卡人员"
                mode="multiple"
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 300 }}
                showSearch
                allowClear
                disabled
              />
            </Field>
            <Row gutter={24} style={{ display: 'inline-block', width: '100%' }}>
              <Col span={4} xxl={3} />
              <Col span={19} xxl={20}>
                <Button
                  className="tw-btn-primary"
                  type="primary"
                  icon="plus-circle"
                  onClick={() => this.toggleRes()}
                >
                  添加打卡人员
                </Button>
              </Col>
            </Row>

            <Field
              name="reportToRes"
              label="汇报对象"
              decorator={{
                initialValue: formData.reportToRes,
                rules: [
                  {
                    required: true,
                    message: '请选择汇报对象',
                  },
                ],
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Selection.Columns
                transfer={{ code: 'id', name: 'name' }}
                source={selectUsersWithBu}
                placeholder="请选择汇报对象"
                mode="multiple"
                columns={[
                  { dataIndex: 'code', title: '编号', span: 10 },
                  { dataIndex: 'name', title: '名称', span: 14 },
                ]}
                dropdownMatchSelectWidth={false}
                dropdownStyle={{ width: 300 }}
                showSearch
                allowClear
              />
            </Field>

            <Field
              required
              presentational
              label="打卡地点"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              className={styles['clear-padding']}
            >
              <DataTable {...commonProps} {...locationProps} />
            </Field>

            <Field
              required
              presentational
              label="打卡时间"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              className={styles['clear-padding']}
            >
              <DataTable {...commonProps} {...timeProps} />
            </Field>

            <Field
              presentational
              label="特殊日期"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
              className={styles['clear-padding']}
            >
              <DataTable {...commonProps} {...specProps} />
            </Field>

            <Field
              name="ruleEffectiveTime"
              label="规则生效时间"
              decorator={{
                initialValue: formData.ruleEffectiveTime,
                rules: [
                  {
                    required: true,
                    message: '请选择规则生效时间',
                  },
                ],
              }}
            >
              <Selection.UDC
                code="COM:ATTENDANCE_RULE_EFFECTIVE_TIME"
                placeholder="请选择规则生效时间"
              />
            </Field>

            <Field
              name="forceAttendance"
              label="强制补卡"
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 7, xxl: 8 }}
              decorator={{
                initialValue: formData.forceAttendance,
                rules: [
                  {
                    required: true,
                    message: '请选择是否强制补卡',
                  },
                ],
              }}
            >
              <Selection.UDC code="COM:YESNO" placeholder="请选择是否强制补卡" />
            </Field>
          </FieldList>
        </Card>

        {id ? (
          flag && (
            <ResModal
              visible={resVisible}
              reset={resReset}
              toggle={this.toggleRes}
              toggleReset={this.toggleReset}
              targetKeys={formData.attendanceResIds}
              form={form}
            />
          )
        ) : (
          <ResModal
            visible={resVisible}
            reset={resReset}
            toggle={this.toggleRes}
            toggleReset={this.toggleReset}
            targetKeys={formData.attendanceResIds}
            form={form}
          />
        )}

        <LocationModal
          visible={locationVisible}
          toggle={this.toggleLocation}
          source={locationSource}
          index={locationIndex}
        />

        <TimeModal
          visible={timeVisible}
          toggle={this.toggleTime}
          source={timeSource}
          index={timeIndex}
        />

        <SpecModal
          visible={specVisible}
          toggle={this.toggleSpec}
          source={specSource}
          index={specIndex}
        />
      </PageHeaderWrapper>
    );
  }
}

export default RuleEdit;
