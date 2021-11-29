import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { DatePicker, Input, Modal, Form, Row, Col, Divider } from 'antd';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import FieldList from '@/components/layout/FieldList';
// import createMessage from '@/components/core/AlertMessage';
import AsyncSelect from '@/components/common/AsyncSelect';
import { Selection } from '@/pages/gen/field';
import { formatDT } from '@/utils/tempUtils/DateTime';
import { injectUdc, mountToTab } from '@/layouts/routerControl';
import Link from 'umi/link';

const { RangePicker } = DatePicker;
const { Field } = FieldList;
const DOMAIN = 'userBroadcast';
@connect(({ loading, userBroadcast }) => ({
  loading,
  userBroadcast,
}))
@Form.create()
@injectUdc(
  {
    city: 'COM:CITY',
    province: 'COM:PROVINCE',
  },
  DOMAIN
)
@mountToTab()
class DistributeResponseList extends PureComponent {
  state = {
    visible: false,
    respond: [],
    interested: true,
    respDesc: null,
  };

  componentDidMount() {
    this.fetchData({ offset: 0, limit: 10, sortBy: 'id', sortDirection: 'DESC' });
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    });
  };

  // 国家 -> 省
  handleChangeC1 = value => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListC2`,
      payload: value,
    }).then(() => {
      dispatch({
        type: `${DOMAIN}/updateSearchForm`,
        payload: {
          workProvince: null,
          workPlace: null,
        },
      });
    });
  };

  // 省 -> 市
  handleChangeC2 = value => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateListC3`,
      payload: value,
    }).then(() => {
      dispatch({
        type: `${DOMAIN}/updateSearchForm`,
        payload: {
          workPlace: null,
        },
      });
    });
  };

  handleInteresred = () => {
    const { respond, interested, respDesc } = this.state;
    const { dispatch } = this.props;

    const method = interested ? 'interested' : 'uninterested';
    const newRespond = respond.map(item => {
      const newItem = {};
      newItem.id = item.id;
      newItem.distId = item.distId;
      newItem.respDesc = item.respDesc;
      if (method === 'interested') {
        newItem.disterResId = item.disterResId;
        newItem.disterResName = item.disterResName;
        newItem.reasonName = item.reasonName;
      }
      return newItem;
    });
    dispatch({
      type: `${DOMAIN}/${method}`,
      payload: newRespond,
    }).then(() => {
      this.toggleVisible();
    });
  };

  toggleVisible = () => {
    const { visible } = this.state;
    this.setState({ visible: !visible });
    if (visible) {
      this.setState({
        respond: [],
      });
    }
  };

  render() {
    const {
      dispatch,
      loading,
      userBroadcast: { dataSource, total, searchForm, c2Data, c3Data },
      form: { getFieldDecorator },
    } = this.props;
    const { visible, respond, interested, _udcMap = {} } = this.state;
    const { city = [], province = [] } = _udcMap;
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
          title: '现场|远程',
          dataIndex: 'workStyle',
          options: {
            initialValue: searchForm.workStyle,
          },
          tag: <Selection.UDC code="RES.WORK_STYLE" placeholder="请选择现场|远程" />,
        },
        {
          title: '派发对象',
          dataIndex: 'distName',
          options: {
            initialValue: searchForm.distName,
          },
          tag: <Input placeholder="请输入派发对象" />,
        },
        {
          title: '时间要求',
          dataIndex: 'timeRequirement',
          options: {
            initialValue: searchForm.timeRequirement,
          },
          tag: <Selection.UDC code="TSK.TIME_REQUIREMENT" placeholder="请选择时间要求" />,
        },
        {
          title: '工作地国家',
          dataIndex: 'workCountry',
          options: {
            initialValue: searchForm.workCountry,
          },
          tag: (
            <Selection.UDC
              code="COM.COUNTRY"
              placeholder="请选择国家"
              onChange={this.handleChangeC1}
            />
          ),
        },
        {
          title: '工作地省',
          dataIndex: 'workProvince',
          options: {
            initialValue: searchForm.workProvince,
          },
          tag: (
            <Selection
              source={c2Data || province}
              placeholder="请选择省"
              onChange={this.handleChangeC2}
            />
          ),
        },
        {
          title: '工作地城市',
          dataIndex: 'workPlace',
          options: {
            initialValue: searchForm.workPlace,
          },
          tag: <Selection source={c3Data || city} placeholder="请选择市" />,
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
        // 派发编号,派发对象,复合能力,派发人^v,工作地点,预计开始时间,预计结束时间 ,
        // 广播截止日期,当量系数,当量数,派发状态,现场|远程,时间要求
        {
          title: '派发编号',
          dataIndex: 'distNo',
          defaultSortOrder: 'descend',
          sorter: true,
          render: (value, row, key) => (
            <Link className="tw-link" to={`/user/distribute/detail?id=${row.distId}&flag=true`}>
              {value}
            </Link>
          ),
        },
        {
          title: '派发对象',
          dataIndex: 'reasonName',
        },
        {
          title: '复合能力',
          dataIndex: 'capabilitySet',
          align: 'center',
          render: (value, row, index) => `${row.jobType1Desc}-${row.jobType2Desc}-${row.levelName}`,
        },
        {
          title: '派发人',
          dataIndex: 'disterResName',
        },
        {
          title: '工作地点',
          dataIndex: 'workPlace',
          render: (value, row) => {
            const { workCountryDesc, workProvinceDesc, workPlaceDesc, workDetailaddr } = row;
            return `${workCountryDesc || ''}${workProvinceDesc ? '-' : ''}${workProvinceDesc ||
              ''}${workPlaceDesc ? '-' : ''}${workPlaceDesc || ''}${
              workDetailaddr ? '-' : ''
            }${workDetailaddr || ''}`;
          },
        },
        {
          title: '预计开始时间',
          dataIndex: 'planStartDate',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '预计结束时间',
          dataIndex: 'planEndDate',
          render: value => formatDT(value, 'YYYY-MM-DD HH:mm:ss'),
        },
        {
          title: '广播截止日期',
          dataIndex: 'broadcastCloseDay',
          render: value => formatDT(value, 'YYYY-MM-DD'),
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          align: 'center',
        },
        {
          title: '当量数',
          dataIndex: 'eqva',
        },
        {
          title: '派发状态',
          dataIndex: 'distStatusDesc',
          align: 'center',
        },
        {
          title: '现场|远程',
          dataIndex: 'workStyleDesc',
          align: 'center',
        },
        {
          title: '时间要求',
          dataIndex: 'timeRequirementDesc',
          align: 'center',
        },
      ],
      leftButtons: [
        {
          key: 'edit',
          className: 'tw-btn-primary',
          title: '感兴趣',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ respond: selectedRows, interested: true, respDesc: null });
            this.toggleVisible();
          },
        },
        {
          key: 'unInterested',
          className: 'tw-btn-primary',
          title: '不感兴趣',
          icon: 'form',
          loading: false,
          hidden: false,
          disabled: selectedRows => selectedRows.length === 0,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            this.setState({ respond: selectedRows, interested: false, respDesc: null });
            this.toggleVisible();
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="派发响应">
        <DataTable {...tableProps} />
        <Modal
          destroyOnClose
          title={interested ? '感兴趣' : '不感兴趣'}
          visible={visible}
          onOk={this.handleInteresred}
          onCancel={this.toggleVisible}
          width="60%"
        >
          <div>
            {respond &&
              respond.map((item, idx) => (
                <div>
                  <Row align="middle">
                    <Col span={8}>派发对象: {item.reasonName}</Col>
                    <Col span={2}> 描述:</Col>
                    <Col span={14}>
                      <Input
                        onChange={e => {
                          const newRespond = respond;
                          newRespond[idx].respDesc = e.target.value;
                          this.setState({ respond: newRespond });
                        }}
                      />
                    </Col>
                  </Row>
                  {idx !== respond.length - 1 && <Divider dashed />}
                </div>
              ))}
          </div>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default DistributeResponseList;
