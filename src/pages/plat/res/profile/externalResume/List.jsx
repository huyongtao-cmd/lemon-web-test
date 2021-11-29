import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { mountToTab } from '@/layouts/routerControl';
import Link from 'umi/link';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Selection, DatePicker, FileManagerEnhance } from '@/pages/gen/field';
import SelectWithCols from '@/components/common/SelectWithCols';
import { Input, Radio, InputNumber, Tag, Row, Col } from 'antd';
import SyntheticField from '@/components/common/SyntheticField';
import { selectInternalOus, selectUsersWithBu } from '@/services/gen/list';
import { selectBuMultiCol } from '@/services/org/bu/bu';
import { omit, keys, values, isNil } from 'ramda';
import ResType from '@/pages/gen/field/resType';
import { genFakeId } from '@/utils/mathUtils';
import moment from 'moment';

const DOMAIN = 'externalResume';
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const particularColumns = [
  { dataIndex: 'code', title: '编号', span: 8 },
  { dataIndex: 'name', title: '名称', span: 16 },
];

@connect(({ loading, externalResume, dispatch }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  externalResume,
  dispatch,
}))
@mountToTab()
class ExternalResumeList extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchData();
    dispatch({ type: `${DOMAIN}/capaset` });
    // dispatch({ type: `${DOMAIN}/capa` });
    dispatch({ type: `${DOMAIN}/baseBU` });
    document
      .getElementsByClassName(`ant-btn-circle`)[0]
      .removeEventListener('click', this.resetForm);
    document.getElementsByClassName(`ant-btn-circle`)[0].addEventListener('click', this.resetForm);
  }

  componentDidUpdate() {
    document
      .getElementsByClassName(`ant-btn-circle`)[0]
      .removeEventListener('click', this.resetForm);
    document.getElementsByClassName(`ant-btn-circle`)[0].addEventListener('click', this.resetForm);
  }

  resetForm = () => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        startDate: '',
      },
    });
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        endDate: '',
      },
    });
  };

  fetchData = async params => {
    const { dispatch } = this.props;
    dispatch({ type: `${DOMAIN}/query`, payload: { ...params } });
  };

  handleChangeType = (value, index) => {
    if (index === 0) {
      const { dispatch } = this.props;
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: { type2: [] },
      });
      dispatch({
        type: `${DOMAIN}/typeChange`,
        payload: value[0],
      });
    }
  };

  handleChangeDate = (value, type) => {
    const { dispatch } = this.props;
    if (type === 'startDate') {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          startDate: value,
        },
      });
    } else {
      dispatch({
        type: `${DOMAIN}/updateState`,
        payload: {
          endDate: value,
        },
      });
    }
  };

  render() {
    const {
      dispatch,
      loading,
      externalResume: {
        dataSource,
        total,
        searchForm,
        baseBuData,
        baseBuDataSource,
        capasetData,
        capaData,
        type2 = [],
        startDate,
        endDate,
      },
    } = this.props;

    // console.warn(dataSource)

    const tableProps = {
      columnsCache: DOMAIN,
      dispatch,
      loading,
      expirys: 0,
      total,
      rowKey: 'id',
      sortBy: 'id',
      sortDirection: 'DESC',
      scroll: {
        x: 1800,
      },
      showExport: false,
      enableSelection: false,
      // filterMultiple: false,
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      // onSearchBarChange: (changedValues, allValues) => {
      //   console.log('changedValues', changedValues);
      //   console.log('allValues', allValues);
      //   /* --- 单项复合能力重置默认取值 --- */
      //   const resetParm = {};
      //   if (!changedValues.capaset && !changedValues.capa) {
      //     // 单项 复合 同时滞空
      //     resetParm.capaset = ['0', null];
      //     resetParm.capa = ['0', null];
      //   } else if (changedValues.capaset && !allValues.capa) {
      //     // 单项undefined 复合有值
      //     resetParm.capa = ['0', null];
      //   } else if (changedValues.capa && !allValues.capaset) {
      //     // 单项有值 复合undefined
      //     resetParm.capaset = ['0', null];
      //   }
      //   console.log('resetParm', resetParm);
      //   dispatch({
      //     type: `${DOMAIN}/updateSearchForm`,
      //     payload: {
      //       ...allValues,
      //       ...resetParm,
      //     },
      //   });
      // },
      searchBarForm: [
        {
          title: '资源',
          dataIndex: 'resId',
          options: {
            initialValue: searchForm.resId || undefined,
          },
          formItemLayout,
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          ),
        },
        {
          title: '复合能力',
          dataIndex: 'levelDid',
          options: {
            initialValue: searchForm.capaset || undefined,
          },
          formItemLayout,
          tag: (
            <Selection source={capasetData} placeholder="请选择复合能力" />
            // <SyntheticField className="tw-field-group">
            //   <Radio.Group
            //     className="tw-field-group-filter"
            //     buttonStyle="solid"
            //     defaultValue="0"
            //     style={{ width: '15%' }}
            //   >
            //     <Radio.Button style={{ width: '100%', textAlign: 'center', padding: 0 }} value="0">
            //       =
            //     </Radio.Button>
            //     <Radio.Button
            //       style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
            //       value="1"
            //     >
            //       ≥
            //     </Radio.Button>
            //     <Radio.Button
            //       style={{ width: '33.333%', textAlign: 'center', padding: 0 }}
            //       value="2"
            //     >
            //       ≤
            //     </Radio.Button>
            //   </Radio.Group>
            //   <Selection source={capasetData} placeholder="请选择复合能力" />
            // </SyntheticField>
          ),
        },
        {
          title: '资源类型',
          dataIndex: 'resTypeArr',
          formItemLayout,
          options: {
            initialValue: searchForm.resTypeArr,
          },
          tag: <ResType type2={type2} code="RES:RES_TYPE1" onChange={this.handleChangeType} />,
        },
        {
          title: 'BaseBU',
          dataIndex: 'baseBu',
          options: {
            initialValue: searchForm.baseBu,
          },
          formItemLayout,
          tag: (
            <SelectWithCols
              labelKey="name"
              placeholder="请选择BaseBU"
              columns={[
                { dataIndex: 'code', title: '编号', span: 6 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              dataSource={baseBuDataSource}
              selectProps={{
                showSearch: true,
                onSearch: value => {
                  dispatch({
                    type: `${DOMAIN}/updateState`,
                    payload: {
                      baseBuDataSource: baseBuData.filter(
                        d =>
                          d.code.indexOf(value) > -1 ||
                          d.name.toLowerCase().indexOf(value.toLowerCase()) > -1
                      ),
                    },
                  });
                },
                allowClear: true,
                style: { width: '100%' },
              }}
            />
          ),
        },
        {
          title: '上级资源',
          dataIndex: 'pResId',
          options: {
            initialValue: searchForm.presId || undefined,
          },
          formItemLayout,
          tag: (
            <Selection.Columns
              className="x-fill-100"
              source={() => selectUsersWithBu()}
              columns={particularColumns}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              dropdownMatchSelectWidth={false}
              showSearch
              onColumnsChange={value => {}}
            />
          ),
        },
        {
          title: '所属公司',
          dataIndex: 'ouId',
          options: {
            initialValue: searchForm.ouId,
          },
          formItemLayout,
          tag: <Selection source={() => selectInternalOus()} placeholder="请选择所属公司" />,
        },
        {
          title: '主服务地',
          dataIndex: 'baseCity',
          options: {
            initialValue: searchForm.baseCity,
          },
          formItemLayout,
          tag: <Selection.UDC code="COM.CITY" placeholder="请选择Base地" />,
        },
        {
          title: '更新日期',
          dataIndex: 'fileToOutDate',
          options: {
            initialValue: searchForm.fileToOutDate,
          },
          formItemLayout,
          tag: (
            <>
              <Row gutter={4} type="flex" justify="center">
                <Col span={11}>
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="开始日期"
                    onChange={value => {
                      this.handleChangeDate(value, 'startDate');
                    }}
                    value={startDate}
                    disabledDate={current => moment(current).valueOf() > moment(endDate).valueOf()}
                  />
                </Col>
                <Col span={2}>
                  <div style={{ width: '100%', textAlign: 'center' }}>~</div>
                </Col>
                <Col span={11}>
                  <DatePicker
                    format="YYYY-MM-DD"
                    placeholder="结束日期"
                    onChange={value => {
                      this.handleChangeDate(value, 'endDate');
                    }}
                    value={endDate}
                    disabledDate={current =>
                      moment(current).valueOf() < moment(startDate).valueOf()
                    }
                  />
                </Col>
              </Row>
            </>
          ),
        },
      ],
      columns: [
        {
          title: '资源编号',
          dataIndex: 'resNo',
          width: 100,
          align: 'center',
        },
        {
          title: '姓名',
          dataIndex: 'resName',
          width: 80,
          align: 'center',
        },
        {
          title: '资源类型',
          // dataIndex: 'resTypeName',
          align: 'center',
          // width: 180,
          render: (value, row, index) => <span>{row.resType1Name + ' - ' + row.resType2Name}</span>,
        },
        {
          title: '复合能力',
          dataIndex: 'capaName',
          align: 'center',
          width: 480,
          render: (value, row, index) => {
            if (isNil(value)) return null;
            return value.split(',').map(v => <Tag key={v}>{v}</Tag>);
          },
        },
        {
          title: 'BaseBU',
          dataIndex: 'buName',
          align: 'center',
          // width: 140,
        },
        {
          title: '上级资源',
          dataIndex: 'presName',
          align: 'center',
          width: 80,
        },
        {
          title: '主服务地',
          dataIndex: 'baseCityName',
          align: 'center',
          width: 80,
        },
        {
          title: '所属公司',
          dataIndex: 'ouName',
          align: 'center',
          // width: 280,
        },
        {
          title: '对外简历',
          dataIndex: 'id',
          align: 'center',
          width: 200,
          render: (value, row, index) => (
            <FileManagerEnhance
              api="/api/person/v1/res/pathToOut/sfs/token"
              dataKey={value}
              listType="text"
              disabled
              preview
              key={genFakeId(-1)}
            />
          ),
        },
        {
          title: '更新时间',
          dataIndex: 'fileToOutDate',
          align: 'center',
          width: 120,
        },
      ],
    };

    return (
      <PageHeaderWrapper title="创建销售列表">
        <DataTable {...tableProps} />
      </PageHeaderWrapper>
    );
  }
}

export default ExternalResumeList;
