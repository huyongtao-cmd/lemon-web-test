import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Input, DatePicker } from 'antd';
import update from 'immutability-helper';
import { genFakeId } from '@/utils/mathUtils';
import EditableDataTable from '@/components/common/EditableDataTable';
import SelectWithCols from '@/components/common/SelectWithCols';
import { Selection } from '@/pages/gen/field';
import { fromQs } from '@/utils/stringUtils';
import moment from 'moment';
import { selectUsersWithBu } from '@/services/gen/list';
import { commonCol } from '../config';

const DOMAIN = 'userOppsDetailcase';

const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, userOppsDetailcase, dispatch }) => ({
  loading,
  userOppsDetailcase,
  dispatch,
}))
class CaseEdit extends PureComponent {
  state = {
    _selectedRowKeys: [],
    userSource: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({ type: `${DOMAIN}/query`, payload: { oppoId: param.id } });
    dispatch({ type: `${DOMAIN}/selectUsers` });
    // 页面可配置化
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BUSINESS_EDIT_CASE_ANALYSIS' },
    });
    // .then(()=>{ this.fetchUserSource() })
    this.fetchUserSource();
  }

  fetchUserSource = () => {
    const {
      userOppsDetail: { userList },
    } = this.props;
    this.setState({ userSource: userList });
  };

  onCellChanged = (rowIndex, rowField) => rowFieldValue => {
    const {
      dispatch,
      userOppsDetailcase: { caseList },
    } = this.props;

    let newValue =
      rowFieldValue && rowFieldValue.target ? rowFieldValue.target.value : rowFieldValue;
    newValue =
      rowField === 'oppoDate' && newValue ? moment(newValue).format('YYYY-MM-DD') : newValue;

    const newDataSource = update(caseList, {
      [rowIndex]: {
        [rowField]: {
          $set: newValue,
        },
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { caseList: newDataSource },
    });
  };

  render() {
    const {
      loading,
      dispatch,
      userOppsDetail: { formData, userList },
      userOppsDetailcase: { caseList, caseTotal, casePageConfig },
    } = this.props;
    const { _selectedRowKeys, userSource } = this.state;
    // console.log(casePageConfig, 'case');
    // 页面配置数据处理
    if (!casePageConfig.pageBlockViews || casePageConfig.pageBlockViews.length < 1) {
      return <div />;
    }
    const currentBlockConfig = casePageConfig.pageBlockViews[0];
    const { pageFieldViews } = currentBlockConfig;
    const pageFieldJson = {};
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field;
    });
    // console.log(pageFieldJson, 'pageFieldJson');

    const tableProps = {
      rowKey: 'id',
      loading: loading.effects[`${DOMAIN}/query`] || loading.effects[`${DOMAIN}/getPageConfig`],
      total: caseTotal,
      dataSource: caseList,
      showCopy: false,
      // rowSelection: {
      //   selectedRowKeys: _selectedRowKeys,
      //   onChange: (selectedRowKeys, selectedRows) => {
      //     this.setState({
      //       _selectedRowKeys: selectedRowKeys,
      //     });
      //   },
      // },
      onAdd: newRow => {
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: {
            caseList: update(caseList, {
              $push: [
                {
                  ...newRow,
                  id: genFakeId(-1),
                  oppoId: formData.id,
                },
              ],
            }),
          },
        });
      },
      onDeleteItems: (selectedRowKeys, selectedRows) => {
        const newDataSource = caseList.filter(
          row => !selectedRowKeys.filter(keyValue => keyValue === row.id).length
        );
        dispatch({
          type: `${DOMAIN}/updateState`,
          payload: { caseList: newDataSource },
        });
      },
      columns: [
        pageFieldJson.oppoDate.visibleFlag && {
          title: `${pageFieldJson.oppoDate.displayName}`,
          sortNo: `${pageFieldJson.oppoDate.sortNo}`,
          dataIndex: 'oppoDate',
          width: 200,
          required: !!pageFieldJson.oppoDate.requiredFlag,
          render: (value, row, index) => (
            <DatePicker
              value={value ? moment(value) : null}
              className="x-fill-100"
              onChange={this.onCellChanged(index, 'oppoDate')}
            />
          ),
        },
        pageFieldJson.picResId.visibleFlag && {
          // title: '负责人', dataIndex: 'picId',
          // width: '20%',
          // render: (value, row, index) => (
          //   <Input defaultValue={value} onBlur={this.onCellChanged(index, 'picId')} />
          // ),
          title: `${pageFieldJson.picResId.displayName}`,
          sortNo: `${pageFieldJson.picResId.sortNo}`,
          dataIndex: 'picResId',
          width: 150,
          required: !!pageFieldJson.picResId.requiredFlag,
          render: (value, row, index) => (
            <Selection.Columns
              value={value}
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              dropdownStyle={{ width: 340 }}
              onChange={this.onCellChanged(index, 'picResId')}
            />
          ),
        },
        pageFieldJson.actionDesc.visibleFlag && {
          title: `${pageFieldJson.actionDesc.displayName}`,
          sortNo: `${pageFieldJson.actionDesc.sortNo}`,
          dataIndex: 'actionDesc',
          width: 200,
          required: !!pageFieldJson.actionDesc.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'actionDesc')}
            />
          ),
        },
        pageFieldJson.concernDesc.visibleFlag && {
          title: `${pageFieldJson.concernDesc.displayName}`,
          sortNo: `${pageFieldJson.concernDesc.sortNo}`,
          dataIndex: 'concernDesc',
          width: 200,
          required: !!pageFieldJson.concernDesc.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'concernDesc')}
            />
          ),
        },
        pageFieldJson.compeSituation.visibleFlag && {
          title: `${pageFieldJson.compeSituation.displayName}`,
          sortNo: `${pageFieldJson.compeSituation.sortNo}`,
          dataIndex: 'compeSituation',
          width: 200,
          required: !!pageFieldJson.compeSituation.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'compeSituation')}
            />
          ),
        },
        pageFieldJson.treatment.visibleFlag && {
          title: `${pageFieldJson.treatment.displayName}`,
          sortNo: `${pageFieldJson.treatment.sortNo}`,
          dataIndex: 'treatment',
          width: 200,
          required: !!pageFieldJson.treatment.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={35}
              onBlur={this.onCellChanged(index, 'treatment')}
            />
          ),
        },
        pageFieldJson.remark.visibleFlag && {
          title: `${pageFieldJson.remark.displayName}`,
          sortNo: `${pageFieldJson.remark.sortNo}`,
          dataIndex: 'remark',
          width: 300,
          required: !!pageFieldJson.remark.requiredFlag,
          render: (value, row, index) => (
            <Input
              defaultValue={value}
              maxLength={400}
              onBlur={this.onCellChanged(index, 'remark')}
            />
          ),
        },
      ]
        .filter(Boolean)
        .sort((field1, field2) => field1.sortNo - field2.sortNo),
      buttons: [],
    };

    return (
      <div>
        <div className="tw-card-title">
          {formatMessage({ id: `user.management.oppo.case`, desc: '案情分析' })}
        </div>
        <div style={{ margin: 12 }}>
          <EditableDataTable scroll={{ x: 1300 }} {...tableProps} />
        </div>
      </div>
    );
  }
}

export default CaseEdit;
