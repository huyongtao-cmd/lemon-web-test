import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Button, Card, Divider, Input, DatePicker, Form, Table } from 'antd';
import router from 'umi/router';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import { UdcSelect } from '@/pages/gen/field';

const { Field, FieldLine } = FieldList;

const DOMAIN = 'userResPlanningHistory';

// 动态列属性初始化
const columnTempl = {
  title: 'W',
  dataIndex: 'yearWeek_',
  align: 'center',
  width: '20px',
};
// 动态列数组初始化
// let extraCols = [];

@connect(({ loading, userResPlanningHistory }) => ({
  userResPlanningHistory,
  loading: loading.effects[`${DOMAIN}/queryHistory`],
}))
class History extends PureComponent {
  state = {
    planningHidden: true, // 默认资源规划部分不显示
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryHistory`,
      payload: { objid: param.id, planType: param.planType },
    });
  };

  handleLook = selectedRowKey => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryById`,
      payload: { id: selectedRowKey },
    }).then(reason => {
      this.initColumns();
      this.setState({
        planningHidden: false,
      });
    });
  };

  initColumns() {
    // 初始化动态列
    const {
      dispatch,
      userResPlanningHistory: { dataSource, formData, extraCols },
    } = this.props;
    const newExtraCols = extraCols;

    for (let index = 0; index < parseInt(formData.durationWeek, 10); index += 1) {
      const dataIndex = columnTempl.dataIndex + index;
      extraCols.push({
        ...columnTempl,
        title: index === 0 ? columnTempl.title : columnTempl.title + '+' + index,
        dataIndex: columnTempl.dataIndex + index,
      });
    }

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { dataSource, formData, extraCols },
    });
  }

  render() {
    const {
      dispatch,
      loading,
      userResPlanningHistory: { historyDataSource, formData, dataSource, extraCols },
      form: { getFieldDecorator },
    } = this.props;
    const { planningHidden } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 变更历史表格
    const historyTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      total: 0,
      dataSource: historyDataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '版本号', // TODO: 国际化
          dataIndex: 'versionNo',
        },
        {
          title: '变更原因', // TODO: 国际化
          dataIndex: 'changeReason',
          align: 'center',
        },
        {
          title: '变更人', // TODO: 国际化
          dataIndex: 'createUserName',
          align: 'center',
        },
        {
          title: '变更日期', // TODO: 国际化
          dataIndex: 'createTime',
        },
      ],
      leftButtons: [
        {
          key: 'look',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.check.res.planning`, desc: '查看资源规划' }),
          loading: false,
          hidden: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.handleLook(selectedRowKeys[0]);
          },
        },
      ],
    };
    // 资源规划表格
    const planningTableProps = {
      bordered: true,
      size: 'small',
      rowKey: 'id',
      loading: false,
      pagination: false,
      dataSource,
      columns: [
        {
          title: '角色', // TODO: 国际化
          dataIndex: 'role',
          width: '20px',
        },
        {
          title: '复合能力（系数）', // TODO: 国际化
          dataIndex: 'capasetLevelDesc',
          align: 'center',
          width: '20px',
        },
        {
          title: '派发系数', // TODO: 国际化
          dataIndex: 'distributeRate',
          align: 'center',
          width: '20px',
        },
        {
          title: '资源', // TODO: 国际化
          dataIndex: 'resName',
          width: '20px',
        },
        {
          title: '开始日期', // TODO: 国际化
          dataIndex: 'startDate',
          width: '20px',
        },
        {
          title: '结束日期', // TODO: 国际化
          dataIndex: 'endDate',
          width: '20px',
        },
        {
          title: '汇总人天', // TODO: 国际化
          dataIndex: 'totalDays',
          width: '20px',
        },
        {
          title: '汇总当量数', // TODO: 国际化
          dataIndex: 'totalEqva',
          width: '20px',
        },
        ...extraCols,
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...historyTableProps} />
        <div hidden={planningHidden}>
          <Divider dashed />
          <FieldList
            layout="horizontal"
            legend="资源规划"
            getFieldDecorator={getFieldDecorator}
            col={2}
          >
            <Field
              name="versionNo"
              label="版本号"
              decorator={{
                initialValue: formData.versionNo || '',
              }}
            >
              <Input disabled />
            </Field>
            <Divider dashed />
            <Field
              name="planTypeDesc"
              label="计划类型"
              decorator={{
                initialValue: formData.planTypeDesc || '', // 2表示计划类型为“项目”
              }}
            >
              <Input disabled />
            </Field>

            <Field
              name="objName"
              label="计划对象"
              decorator={{
                initialValue: formData.objName || '',
              }}
            >
              <Input disabled />
            </Field>
            <FieldLine label="开始周（W）">
              <Field
                name="startDate"
                decorator={{
                  initialValue: formData.startDate || '',
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input disabled />
              </Field>
              <Field
                name="startWeek"
                decorator={{
                  initialValue: formData.startWeek || '',
                }}
                wrapperCol={{ span: 23, xxl: 23 }}
              >
                <Input placeholder="周数" disabled />
              </Field>
            </FieldLine>
            <Field
              name="durationWeek"
              label="持续周数"
              decorator={{
                initialValue: formData.durationWeek || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="salePhase"
              label="销售阶段"
              decorator={{
                initialValue: formData.salePhaseDesc || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="probabilityDesc"
              label="成单概率(交付角度)"
              decorator={{
                initialValue: formData.probabilityDesc || '',
              }}
            >
              <Input disabled />
            </Field>
            <Field
              name="remark"
              label="备注"
              decorator={{
                initialValue: formData.remark || '',
              }}
              fieldCol={1}
              labelCol={{ span: 4, xxl: 3 }}
              wrapperCol={{ span: 19, xxl: 20 }}
            >
              <Input.TextArea placeholder="" rows={3} maxLength={400} disabled />
            </Field>
          </FieldList>
          <Divider dashed />
          <Table {...planningTableProps} scroll={{ x: 1000 }} />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default History;
