import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, DatePicker, Modal, Form } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import SelectWithCols from '@/components/common/SelectWithCols';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
import { formatDT } from '@/utils/tempUtils/DateTime';
import Link from 'umi/link';

const { RangePicker } = DatePicker;
const { Field } = FieldList;
const SEL_COL = [
  // span为宽度。 合计不要超过24
  { dataIndex: 'code', title: '编号', span: 6 },
  { dataIndex: 'name', title: '名称', span: 14 },
];
const DOMAIN = 'userInvitation';
@connect(({ loading, userInvitation }) => ({
  loading,
  userInvitation,
}))
@Form.create()
class DistributeResponseList extends PureComponent {
  state = {
    visible: false,
    respond: {},
    interested: true,
    respDesc: null,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
    // 资源下拉
    dispatch({
      type: `${DOMAIN}/queryResList`,
    });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  handleInteresred = () => {
    const { respond, interested, respDesc } = this.state;
    const { dispatch } = this.props;

    const method = interested ? 'interested' : 'uninterested';
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: { id: respond.id, distId: respond.distId, respDesc },
    }).then(() => {
      this.toggleVisible();
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
  };

  render() {
    const {
      dispatch,
      loading,
      userInvitation: { dataSource, total, searchForm, resSource, resList },
      form: { getFieldDecorator },
    } = this.props;
    const { visible, respond, interested, respDesc } = this.state;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/query`],
      total,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      onSearchBarChange: (changedValues, allValues) => {
        dispatch({
          type: `${DOMAIN}/updateSearchForm`,
          payload: allValues,
        });
      },
      searchBarForm: [
        {
          title: '派发编号',
          dataIndex: 'distNo',
          options: {
            initialValue: searchForm.distNo,
          },
          tag: <Input placeholder="请输入派发编号" />,
        },
        {
          title: '派发人',
          dataIndex: 'disterResId',
          options: {
            initialValue: searchForm.disterResId,
          },
          tag: (
            <SelectWithCols
              labelKey="name"
              valueKey="code"
              className="x-fill-100"
              columns={SEL_COL}
              dataSource={resSource}
              onChange={() => {}}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      resSource: resList.filter(
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
          ),
        },
        {
          title: '派发时间',
          dataIndex: 'distTime',
          options: {
            initialValue: searchForm.distTime,
          },
          tag: <RangePicker />,
        },
      ],
      columns: [
        // 派发编号,复合能力,能力标签,派发BU,派发人,派发对象,派发状态^v,派发时间,派发说明
        {
          title: '派发编号',
          dataIndex: 'distNo',
          align: 'center',
          defaultSortOrder: 'descend',
          sorter: true,
          render: (value, row, index) => {
            const { distId } = row;
            return (
              <Link className="tw-link" to={`/user/distribute/detail?id=${distId}&flag=true`}>
                {value}
              </Link>
            );
          },
        },
        {
          title: '复合能力',
          dataIndex: 'capabilitySet',
          align: 'center',
          render: (value, row, index) => `${row.jobType1Desc}-${row.jobType2Desc}-${row.levelName}`,
        },
        // {
        //   title: '能力标签',
        //   dataIndex: 'capability',
        // },
        {
          title: '派发BU',
          dataIndex: 'distBu',
        },
        {
          title: '派发人',
          dataIndex: 'disterResName',
        },
        {
          title: '派发对象',
          dataIndex: 'reasonName',
        },
        {
          title: '派发状态',
          dataIndex: 'distStatusDesc',
          align: 'center',
        },
        {
          title: '派发时间',
          dataIndex: 'distTime',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '派发说明',
          dataIndex: 'distDesc',
        },
      ],
      leftButtons: [
        {
          key: 'interested',
          className: 'tw-btn-primary',
          title: '感兴趣',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ respond: selectedRows[0], interested: true, respDesc: null });
            this.toggleVisible();
          },
        },
        {
          key: 'unsuited',
          className: 'tw-btn-primary',
          title: '不感兴趣',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 1,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ respond: selectedRows[0], interested: true, respDesc: null });
            this.toggleVisible();
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="我收到的邀请">
        <DataTable {...tableProps} />
        <Modal
          destroyOnClose
          title={interested ? '感兴趣' : '不感兴趣'}
          visible={visible}
          onOk={this.handleInteresred}
          onCancel={this.toggleVisible}
          width="60%"
        >
          <FieldList
            getFieldDecorator={getFieldDecorator}
            layout="horizontal"
            style={{ overflow: 'hidden' }}
            col={2}
          >
            <Field label="派发对象" presentational>
              <span>{respond.reasonName}</span>
            </Field>
            <Field name="respDesc" label="描述">
              <Input
                maxLength={35}
                onChange={e => {
                  this.setState({ respDesc: e.target.value });
                }}
              />
            </Field>
          </FieldList>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default DistributeResponseList;
