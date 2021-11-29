import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table, Row, Col, Radio, Switch, Input, DatePicker } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import Link from 'umi/link';
import DataTable from '@/components/common/DataTable';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import TreeSearch from '@/components/common/TreeSearch';
import { Selection } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { mountToTab } from '@/layouts/routerControl';

const DOMAIN = 'platTrain';
const { Description } = DescriptionList;
const RadioGroup = Radio.Group;

@connect(({ loading, platTrain }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...platTrain,
}))
@mountToTab()
class CapaTrain extends PureComponent {
  componentDidMount() {}

  fetchData = () => {};

  render() {
    const { loading, dispatch, platTrain = {} } = this.props;
    const {
      list = [
        {
          id: 1,
          listName1: 'java初级工程师',
          listName2: '2门',
          listName3: '2',
          listName4: '3',
          listName5: 'EL0126789011',
          listName6: 'java初级工程师证书',
          listName7: '是',
          listName8: 'YES',
        },
        {
          id: 2,
          listName1: 'java中级工程师',
          listName2: '2门',
          listName3: '2',
          listName4: '3',
          listName5: 'EL0126789011',
          listName6: 'java中级工程师证书',
          listName7: '是',
          listName8: 'YES',
        },
        {
          id: 3,
          listName1: 'java高级工程师',
          listName2: '2门',
          listName3: '2',
          listName4: '3',
          listName5: 'EL0126789011',
          listName6: 'java高级工程师证书',
          listName7: '否',
          listName8: 'NO',
        },
        {
          id: 4,
          listName1: '前端初级工程师',
          listName2: '2门',
          listName3: '2',
          listName4: '3',
          listName5: 'EL0126789011',
          listName6: '前端初级工程师证书',
          listName7: '是',
          listName8: 'YES',
        },
        {
          id: 5,
          listName1: '前端中级工程师',
          listName2: '2门',
          listName3: '2',
          listName4: '3',
          listName5: 'EL0126789011',
          listName6: '前端中级工程师证书',
          listName7: '是',
          listName8: 'YES',
        },
        {
          id: 6,
          listName1: '前端高级工程师',
          listName2: '2门',
          listName3: '2',
          listName4: '3',
          listName5: 'EL0126789011',
          listName6: '前端高级工程师证书',
          listName7: '是',
          listName8: 'YES',
        },
      ],
      total = 6,
      searchForm = {},
    } = platTrain;

    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      loading: false,
      total,
      showExport: false,
      showColumn: false,
      dataSource: list,
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
          title: '培训项目',
          dataIndex: 'name1',
          options: {
            initialValue: searchForm.name1,
          },
        },
        {
          title: '必修/选修',
          dataIndex: 'name10',
          options: {
            initialValue: searchForm.name10,
          },
          tag: (
            <RadioGroup>
              <Radio value="ACTIVE">必修</Radio>
              <Radio value="INACTIVE">选修</Radio>
              <Radio value="">全部</Radio>
            </RadioGroup>
          ),
        },
        {
          title: '状态',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={[]}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择反馈人"
              showSearch
            />
          ),
        },
        {
          title: '类型',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={[]}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择类型"
              showSearch
            />
          ),
        },
        {
          title: '截止日期',
          dataIndex: 'date',
          options: {
            initialValue: searchForm.date,
          },
          tag: <DatePicker.RangePicker format="YYYY-MM-DD" />,
        },
        {
          title: '学习进度',
          dataIndex: 'name2',
          options: {
            initialValue: searchForm.name2,
          },
          tag: (
            <Row>
              <Col span={10}>
                <Input placeholder="" />
              </Col>
              <Col span={4}>&nbsp;&nbsp;&nbsp;&nbsp;~</Col>
              <Col span={10}>
                <Input placeholder="" />
              </Col>
            </Row>
          ),
        },
        {
          title: '相关复合能力',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={[]}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择复合能力"
              showSearch
            />
          ),
        },
        {
          title: '相关单项能力',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={[]}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择单项能力"
              showSearch
            />
          ),
        },
        {
          title: '资源状态',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={[]}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择资源状态"
              showSearch
            />
          ),
        },
        {
          title: '资源类型',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Row>
              <Col span={10}>
                <Selection.Columns
                  source={[]}
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  placeholder="请选择资源状态"
                  showSearch
                />
              </Col>
              <Col span={4}>&nbsp;&nbsp;&nbsp;&nbsp;~</Col>
              <Col span={10}>
                <Selection.Columns
                  source={[]}
                  columns={[
                    { dataIndex: 'code', title: '编号', span: 10 },
                    { dataIndex: 'name', title: '名称', span: 14 },
                  ]}
                  transfer={{ key: 'id', code: 'id', name: 'name' }}
                  placeholder="请选择资源状态"
                  showSearch
                />
              </Col>
            </Row>
          ),
        },
        {
          title: 'BaseBU',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={[]}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择资源状态"
              showSearch
            />
          ),
        },
        {
          title: '资源',
          dataIndex: 'feedBackUserId',
          options: {
            initialValue: searchForm.feedBackUserId || undefined,
          },
          tag: (
            <Selection.Columns
              source={[]}
              columns={[
                { dataIndex: 'code', title: '编号', span: 10 },
                { dataIndex: 'name', title: '名称', span: 14 },
              ]}
              transfer={{ key: 'id', code: 'id', name: 'name' }}
              placeholder="请选择资源状态"
              showSearch
            />
          ),
        },
      ],
      leftButtons: [
        {
          key: 'close',
          title: '关闭',
          className: 'tw-btn-error',
          icon: 'close',
          loading: false,
          hidden: false,
          disabled: false,
          minSelections: 0,
          cb: (selectedRowKeys, selectedRows, queryParams) => {
            // router.push(`/org/bu/create`);
            // TODO
          },
        },
      ],
      columns: [
        {
          title: '培训项目',
          dataIndex: 'listName1',
          align: 'center',
          // render: (buNo, rowData) => {
          //   const href = `/org/bu/particulars?buId=${rowData.id}`;
          //   return (
          //     <Link className="tw-link" to={href}>
          //       {buNo}
          //     </Link>
          //   );
          // },
        },
        {
          title: '类型',
          dataIndex: 'listName2',
          align: 'center',
        },
        {
          title: '状态',
          dataIndex: 'listName3',
          align: 'center',
        },
        {
          title: '资源编号',
          dataIndex: 'listName4',
          align: 'center',
        },
        {
          title: '姓名',
          dataIndex: 'listName5',
          align: 'center',
        },
        {
          title: '资源状态',
          dataIndex: 'listName6',
          align: 'center',
        },
        {
          title: '资源类型一',
          dataIndex: 'listName7',
          align: 'center',
        },
        {
          title: '资源类型二',
          dataIndex: 'listName7',
          align: 'center',
        },
        {
          title: 'BaseBU',
          dataIndex: 'listName7',
          align: 'center',
        },
        {
          title: '必修/选修',
          dataIndex: 'listName7',
          align: 'center',
        },
        {
          title: '学习进度',
          dataIndex: 'listName7',
          align: 'center',
        },
        {
          title: '截止日期',
          dataIndex: 'listName7',
          align: 'center',
        },
      ],
    };

    return (
      <>
        <DataTable {...tableProps} />
      </>
    );
  }
}

export default CapaTrain;
