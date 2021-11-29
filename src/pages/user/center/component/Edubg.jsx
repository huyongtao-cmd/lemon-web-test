import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tooltip } from 'antd';
import moment from 'moment';
import { formatMessage } from 'umi/locale';
import { createConfirm } from '@/components/core/Confirm';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import EdubgModal from '../modal/EdubgModal';
import { genFakeId } from '@/utils/mathUtils';

const DOMAIN = 'userCenterInfoEdit';
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

@connect(({ loading, userCenterInfoEdit }) => ({
  userCenterInfoEdit,
  loading,
}))
class Edubg extends PureComponent {
  state = {
    edubgVisible: false, // 教育经历弹框显示
    edubgFormData: {
      ...edubgFormDataModel,
    },
  };

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
    const {
      userCenterInfoEdit: { twResEdubgTemporaryEntity, edubgSofarFlag },
    } = this.props;

    if (edubgFormData.date && typeof edubgFormData.date[0] !== 'string') {
      edubgFormData.dateFrom = edubgFormData.date[0].format('YYYY-MM-DD');
    }
    if (edubgFormData.date && typeof edubgFormData.date[1] !== 'string') {
      edubgFormData.dateTo = edubgFormData.date[1].format('YYYY-MM-DD');
    }
    if (edubgSofarFlag) {
      edubgFormData.dateTo = null;
      edubgFormData.dateView = `${edubgFormData.dateFrom}至今`;
    } else {
      edubgFormData.dateView = `${edubgFormData.dateFrom}至${edubgFormData.dateTo}`;
    }

    const tt = twResEdubgTemporaryEntity.filter(v => v.id === edubgFormData.id);
    if (!tt.length) {
      twResEdubgTemporaryEntity.push({ ...edubgFormData, id: genFakeId(-1), update: 1 });
    } else {
      twResEdubgTemporaryEntity.forEach((v, index) => {
        if (v.id === edubgFormData.id) {
          twResEdubgTemporaryEntity[index] = { ...edubgFormData, update: 1 };
        }
      });
    }

    this.setState({
      edubgVisible: !edubgVisible,
      edubgFormData,
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
        ...selectedRow,
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
      loading,
      dispatch,
      userCenterInfoEdit: { twResEdubgTemporaryEntity, edubgTotal, eddelId },
    } = this.props;
    const { edubgVisible, edubgFormData } = this.state;

    // 教育经历表格
    const edubgTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/queryEdubg`],
      pagination: false,
      total: edubgTotal,
      dataSource: twResEdubgTemporaryEntity,
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
              onOk: () => {
                const newDataSource = twResEdubgTemporaryEntity.filter(
                  row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
                );
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    twResEdubgTemporaryEntity: newDataSource,
                    eddelId: [...eddelId, ...selectedRowKeys],
                  },
                });
              },
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
