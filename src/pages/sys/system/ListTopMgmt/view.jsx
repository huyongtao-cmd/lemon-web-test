/* eslint-disable no-nested-ternary */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Card, Divider, Row, Col } from 'antd';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DataTable from '@/components/common/DataTable';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { fromQs, randomString } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { isEmpty, isNil, clone } from 'ramda';
import DescriptionList from '@/components/layout/DescriptionList';
import { genFakeId } from '@/utils/mathUtils';
import TopList from './components/TopList';

const { Description } = DescriptionList;

const DOMAIN = 'listTopMgmt';

@connect(({ loading, listTopMgmt, dispatch }) => ({
  listTopMgmt,
  dispatch,
  loading,
}))
@mountToTab()
class ListTopMgmtView extends PureComponent {
  componentDidMount() {
    const {
      dispatch,
      listTopMgmt: { formData },
    } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      id &&
        dispatch({
          type: `${DOMAIN}/topListDetail`,
          payload: {
            id,
          },
        }).then(ress => {
          if (ress.dataSource !== 'SELF_DEF') {
            dispatch({
              type: `${DOMAIN}/getTopListDetail`,
              payload: {
                udcVal: ress.dataSource,
              },
            }).then(response => {
              dispatch({
                type: `${DOMAIN}/updateState`,
                payload: {
                  transformData: this.mockData(response),
                },
              });
            });
          } else {
            dispatch({
              type: `${DOMAIN}/updateState`,
              payload: {
                transformData: this.mockData(ress.list2),
              },
            });
          }
        });
    });
  }

  // 生成展示数据
  mockData = (arr = []) => {
    const tt = [];
    for (let i = 0; i < 5; i += 1) {
      arr.forEach((item, indedx) => {
        tt[i] = {
          ...tt[i],
          [item.word]:
            item.type === 'SORT_NO'
              ? i + 1
              : item.type === 'SORT_VAL'
                ? ((5 - i) * 10).toFixed(2).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
                : item.type === 'LABEL'
                  ? `XXX${i + 1}`
                  : `XXX${i + 1}`,
          [item.field]:
            item.type === 'SORT_NO'
              ? i + 1
              : item.type === 'SORT_VAL'
                ? ((5 - i) * 10).toFixed(2).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')
                : item.type === 'LABEL'
                  ? `XXX${i + 1}`
                  : `XXX${i + 1}`,
          id: genFakeId(-1),
          onlyKey: randomString(16),
        };
      });
    }
    return tt;
  };

  render() {
    const {
      listTopMgmt: { formData, getTopListByDataSource, transformData, customDataList, showTopList },
    } = this.props;

    const topListTableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      sortBy: 'id',
      sortDirection: 'DESC',
      loading: false,
      pagination: false,
      dataSource: getTopListByDataSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      columns: [
        {
          title: '字段',
          dataIndex: 'field',
          align: 'center',
        },
        {
          title: '类型',
          dataIndex: 'typeName',
          align: 'center',
        },
      ],
    };

    const customTopListTableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      pagination: false,
      dataSource: getTopListByDataSource,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      columns: [
        // {
        //   title: '字段',
        //   dataIndex: 'word',
        //   align: 'center',
        //   width: '20%',
        // },
        {
          title: '字段名',
          dataIndex: 'field',
          align: 'center',
          width: '40%',
        },
        {
          title: '类型',
          dataIndex: 'typeName',
          align: 'center',
          width: '40%',
        },
        {
          title: '顺序',
          dataIndex: 'sortNoTem',
          align: 'center',
          width: '20%',
        },
      ],
    };

    const customDataTableProps = {
      rowKey: 'groupNo',
      columnsCache: DOMAIN,
      sortBy: 'groupNo',
      sortDirection: 'DESC',
      loading: false,
      pagination: false,
      dataSource: customDataList,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
    };

    const showTopListTableProps = {
      sortBy: 'topListDId',
      rowKey: 'topListDId',
      loading: false,
      dataSource: showTopList,
      showCopy: false,
      scroll: { x: 1850 },
      sortDirection: 'DESC',
      pagination: false,
      showSearch: false,
      showColumn: false,
      showExport: false,
      enableSelection: false,
      columns: [
        {
          title: '榜单名称',
          dataIndex: 'topListName',
          align: 'center',
          required: true,
          width: 200,
        },
        {
          title: '筛选条件一',
          dataIndex: 'filter1',
          align: 'center',
          width: 700,
          render: (value, row, index) => (
            <Row gutter={8}>
              <Col span={10}>{row.fidNameValue1 || ''}</Col>
              <Col span={4}>{row.filterOperator1Name || ''}</Col>
              <Col span={10}>{row.filterVal1 || ''}</Col>
            </Row>
          ),
        },
        {
          title: '筛选条件二',
          dataIndex: 'filter2',
          align: 'center',
          width: 700,
          render: (value, row, index) => (
            <Row gutter={8}>
              <Col span={10}>{row.fidNameValue2 || ''}</Col>
              <Col span={4}>{row.filterOperator2Name || ''}</Col>
              <Col span={10}>{row.filterVal2 || ''}</Col>
            </Row>
          ),
        },
        {
          title: '是否显示',
          dataIndex: 'showFlag',
          align: 'center',
          width: 100,
          render: (val, row, index) => (val === 'YES' ? '是' : '否'),
        },
        {
          title: '显示顺序',
          dataIndex: 'sortNo',
          align: 'center',
          width: 100,
        },
      ],
    };

    let prescore = 0; // 预定义分数
    let ranking = 0; // 排名

    return (
      <PageHeaderWrapper>
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={() => {
              const { from } = fromQs();
              closeThenGoto(markAsTab(from));
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="榜单详情" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="数据来源">{formData.dataSourceDesc || ''}</Description>
            <Description term="榜单形式">{formData.layoutTypeDesc || ''}</Description>
            <Description term="排名方式">
              {formData.sortMethod === 'SMALL_TO_LARGE' && '从小到大'}
              {formData.sortMethod === 'LARGE_TO_SMALL' && '从大到小'}
            </Description>
            <Description term="默认显示名次数">{formData.defaultRank || ''}</Description>
            <Description term="最大显示名次数">{formData.maxRank || ''}</Description>
            <Description term="公示截止日">{formData.publieEndDate || ''}</Description>
          </DescriptionList>

          <Divider dashed />

          {formData.dataSource === 'SELF_DEF' ? (
            <>
              <DescriptionList size="large" col={2} title="榜单字段信息">
                <DataTable {...customTopListTableProps} />
              </DescriptionList>

              <Divider dashed />

              <DescriptionList size="large" col={2} title="榜单数据">
                <DataTable
                  {...customDataTableProps}
                  columns={[
                    ...getTopListByDataSource.map((v, index) => ({
                      title: v.field,
                      dataIndex: v.word,
                      align: 'center',
                    })),
                  ]}
                />
              </DescriptionList>
            </>
          ) : (
            <DescriptionList size="large" col={2} title="榜单字段信息">
              <DataTable {...topListTableProps} />
            </DescriptionList>
          )}

          <Divider dashed />

          <DescriptionList size="large" col={2} title="展示榜单" noReactive>
            <DataTable {...showTopListTableProps} />
          </DescriptionList>

          <Divider dashed />

          <DescriptionList size="large" col={2} title="榜单预览">
            <Card style={{ width: 800 }} bordered={false}>
              {formData.dataSource === 'SELF_DEF' &&
              customDataList.length &&
              getTopListByDataSource.length &&
              getTopListByDataSource.filter(v => v.type === 'SORT_VAL').length ? (
                <TopList
                  item={{
                    ...formData,
                    list: customDataList
                      .map(v => ({ ...v, onlyKey: randomString(16) }))
                      .sort((a, b) => {
                        if (formData.sortMethod === 'LARGE_TO_SMALL') {
                          return (
                            b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                            a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                          );
                        }
                        return (
                          a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                          b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                        );
                      })
                      .slice(0, 5)
                      .map((item, index) => {
                        if (
                          item[
                            getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word
                          ] === prescore
                        ) {
                          return { ...item, sort: ranking };
                        }
                        ranking += 1;
                        prescore =
                          item[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word];
                        return { ...item, sort: ranking };
                      }),
                    list2: getTopListByDataSource,
                  }}
                />
              ) : formData.dataSource !== 'SELF_DEF' &&
              transformData.length &&
              getTopListByDataSource.length &&
              getTopListByDataSource.filter(v => v.type === 'SORT_VAL').length ? (
                <TopList
                  item={{
                    ...formData,
                    list: transformData
                      .sort((a, b) => {
                        if (formData.sortMethod === 'LARGE_TO_SMALL') {
                          return (
                            b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                            a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                          );
                        }
                        return (
                          a[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word] -
                          b[getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word]
                        );
                      })
                      .slice(0, 5)
                      .map((item, index) => {
                        if (
                          item[
                            getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word || 0
                          ] === prescore
                        ) {
                          return { ...item, sort: ranking };
                        }
                        ranking += 1;
                        prescore =
                          item[
                            getTopListByDataSource.filter(v => v.type === 'SORT_VAL')[0].word || 0
                          ];
                        return { ...item, sort: ranking };
                      }),
                    list2: getTopListByDataSource,
                  }}
                />
              ) : (
                <div
                  style={{
                    height: '100%',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span>暂无数据</span>
                </div>
              )}
            </Card>
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default ListTopMgmtView;
