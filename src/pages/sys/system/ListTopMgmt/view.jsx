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

  // ??????????????????
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
          title: '??????',
          dataIndex: 'field',
          align: 'center',
        },
        {
          title: '??????',
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
        //   title: '??????',
        //   dataIndex: 'word',
        //   align: 'center',
        //   width: '20%',
        // },
        {
          title: '?????????',
          dataIndex: 'field',
          align: 'center',
          width: '40%',
        },
        {
          title: '??????',
          dataIndex: 'typeName',
          align: 'center',
          width: '40%',
        },
        {
          title: '??????',
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
          title: '????????????',
          dataIndex: 'topListName',
          align: 'center',
          required: true,
          width: 200,
        },
        {
          title: '???????????????',
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
          title: '???????????????',
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
          title: '????????????',
          dataIndex: 'showFlag',
          align: 'center',
          width: 100,
          render: (val, row, index) => (val === 'YES' ? '???' : '???'),
        },
        {
          title: '????????????',
          dataIndex: 'sortNo',
          align: 'center',
          width: 100,
        },
      ],
    };

    let prescore = 0; // ???????????????
    let ranking = 0; // ??????

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
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>

        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="????????????" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            <Description term="????????????">{formData.dataSourceDesc || ''}</Description>
            <Description term="????????????">{formData.layoutTypeDesc || ''}</Description>
            <Description term="????????????">
              {formData.sortMethod === 'SMALL_TO_LARGE' && '????????????'}
              {formData.sortMethod === 'LARGE_TO_SMALL' && '????????????'}
            </Description>
            <Description term="?????????????????????">{formData.defaultRank || ''}</Description>
            <Description term="?????????????????????">{formData.maxRank || ''}</Description>
            <Description term="???????????????">{formData.publieEndDate || ''}</Description>
          </DescriptionList>

          <Divider dashed />

          {formData.dataSource === 'SELF_DEF' ? (
            <>
              <DescriptionList size="large" col={2} title="??????????????????">
                <DataTable {...customTopListTableProps} />
              </DescriptionList>

              <Divider dashed />

              <DescriptionList size="large" col={2} title="????????????">
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
            <DescriptionList size="large" col={2} title="??????????????????">
              <DataTable {...topListTableProps} />
            </DescriptionList>
          )}

          <Divider dashed />

          <DescriptionList size="large" col={2} title="????????????" noReactive>
            <DataTable {...showTopListTableProps} />
          </DescriptionList>

          <Divider dashed />

          <DescriptionList size="large" col={2} title="????????????">
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
                  <span>????????????</span>
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
