import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Tooltip } from 'antd';
import moment from 'moment';
import router from 'umi/router';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { queryUdc } from '@/services/gen/app';
import FieldList from '@/components/layout/FieldList';
import { fromQs } from '@/utils/stringUtils';
import EdubgModal from '../modal/EdubgModal';
import style from '../index.less';

const DOMAIN = 'platResProfileBackground';
// 教育经历明细初始化
const edubgFormDataModel = {
  id: null,
  resId: null, // 资源id
  dateFrom: null, // 时间
  dateTo: null, // 时间
  schoolName: null, // 学校
  qualification: null, // 学历
  edusysType: null, // 学制
  majorName: null, // 专业
  majorDesc: null, // 专业描述
};

@connect(({ loading, platResProfileBackground }) => ({
  platResProfileBackground,
  loading: loading.effects[`${DOMAIN}/queryEdubg`],
}))
class Edubg extends PureComponent {
  state = {
    edubgVisible: false, // 教育经历弹框显示
    edubgFormData: {
      ...edubgFormDataModel,
    },
  };

  componentDidMount() {
    this.fetchData({ sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/queryEdubg`,
      payload: { resId: param.id },
    });
  };

  // 教育经历保存按钮事件
  edubgSubmitModal = () => {
    const { edubgVisible, edubgFormData } = this.state;
    const { dispatch } = this.props;
    // 获取url上的参数
    const param = fromQs();

    dispatch({
      type: `${DOMAIN}/edubgSave`,
      payload: { edubgFormData: { ...edubgFormData, resId: param.id } },
    }).then(reason => {
      this.setState({
        edubgVisible: !edubgVisible,
        edubgFormData,
      });
      this.fetchData();
    });
  };

  // 教育经历新增弹出窗。
  edubgToggleModal = () => {
    const { edubgVisible } = this.state;
    this.setState({
      edubgVisible: !edubgVisible,
      edubgFormData: {
        ...edubgFormDataModel,
      },
    });
  };

  // 教育经历修改弹出窗。
  edubgEditModal = selectedRow => {
    const { edubgVisible } = this.state;
    this.setState({
      edubgVisible: !edubgVisible,
      edubgFormData: {
        id: selectedRow.id,
        resId: selectedRow.resId,
        dateFrom: selectedRow.dateFrom,
        dateTo: selectedRow.dateTo,
        schoolName: selectedRow.schoolName,
        qualification: selectedRow.qualification,
        edusysType: selectedRow.edusysType,
        majorName: selectedRow.majorName,
        majorDesc: selectedRow.majorDesc,
      },
    });
  };

  edubgRangeSofar = flag => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { edubgSofarFlag: flag },
    });
  };

  render() {
    const {
      dispatch,
      loading,
      platResProfileBackground: { edubgDataSource, edubgTotal },
    } = this.props;
    const { edubgVisible, edubgFormData } = this.state;
    // 获取url上的参数
    const param = fromQs();

    // 教育经历表格
    const edubgTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: false,
      pagination: false,
      total: edubgTotal,
      dataSource: edubgDataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        // console.log(changedValues, allValues);
      },
      showSearch: false,
      columns: [
        {
          title: '学历类别', // TODO: 国际化
          dataIndex: 'edusysTypeName',
          align: 'center',
        },
        {
          title: '时间', // TODO: 国际化
          // dataIndex: 'dateView',
          render: (value, row, key) =>
            row.dateTo ? (
              <span>
                {moment(row.dateFrom).format('YYYY-MM') +
                  '~' +
                  moment(row.dateTo).format('YYYY-MM')}
              </span>
            ) : (
              <span>{moment(row.dateFrom).format('YYYY-MM') + '~至今'}</span>
            ),
        },
        {
          title: '学校', // TODO: 国际化
          dataIndex: 'schoolName',
        },
        {
          title: '学历', // TODO: 国际化
          dataIndex: 'qualificationName',
          align: 'center',
        },
        {
          title: '专业', // TODO: 国际化
          dataIndex: 'majorName',
        },
        {
          title: '专业描述', // TODO: 国际化
          dataIndex: 'majorDesc',
          render: (value, row, key) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={value}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
      ],
      leftButtons: [
        {
          key: 'add',
          className: 'tw-btn-primary',
          icon: 'plus-circle',
          title: formatMessage({ id: `misc.insert`, desc: '新增' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.edubgToggleModal(),
        },
        {
          key: 'edit',
          className: 'tw-btn-primary',
          icon: 'form',
          title: formatMessage({ id: `misc.update`, desc: '修改' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => this.edubgEditModal(selectedRows[0]),
        },
        {
          key: 'remove',
          className: 'tw-btn-error',
          icon: 'file-excel',
          title: formatMessage({ id: `misc.delete`, desc: '删除' }),
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 2,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            createConfirm({
              content: '确认删除所选记录？',
              onOk: () =>
                dispatch({
                  type: `${DOMAIN}/deleteEdubg`,
                  payload: { id: selectedRowKeys, queryParams: { resId: param.id } },
                }),
            });
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper>
        <DataTable {...edubgTableProps} />

        <EdubgModal
          edubgFormData={edubgFormData}
          visible={edubgVisible}
          handleCancel={this.edubgToggleModal}
          handleOk={this.edubgSubmitModal}
          handleSofar={this.edubgRangeSofar}
        />
      </PageHeaderWrapper>
    );
  }
}

export default Edubg;
