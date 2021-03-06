import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import DataTable from '@/components/common/DataTable';
import router from 'umi/router';

const DOMAIN = 'platTrainDetail';
const { Description } = DescriptionList;

@connect(({ loading, platTrainDetail }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  platTrainDetail,
}))
@mountToTab()
class CapaSetDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: { id },
      });
    }
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: {
        pageNo: 'TRAINING_DETAIL_LIST',
      },
    });
    this.fetchCapaList({
      offset: 0,
      limit: 10,
    });
    this.fetchCapaSetList({
      offset: 0,
      limit: 10,
    });
    this.fetchCourseList({
      offset: 0,
      limit: 10,
    });
  }

  fetchCapaList = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryCapaList`,
      payload: {
        trainingProgId: id,
        ...params,
      },
    });
  };

  fetchCourseList = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryCourseList`,
      payload: {
        trainingProgId: id,
        ...params,
      },
    });
  };

  fetchCapaSetList = params => {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({
      type: `${DOMAIN}/queryCapaSetList`,
      payload: {
        trainingProgId: id,
        ...params,
      },
    });
  };

  handleCancel = () => {
    closeThenGoto('/hr/capacity/train');
  };

  sortObj = (obj1, obj2) => {
    const a = obj1.sortNo;
    const b = obj2.sortNo;
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };

  render() {
    const { dispatch, loading, platTrainDetail = {} } = this.props;
    const {
      courseDetail = {},
      capaDataSource = [],
      capaTotal = 0,
      capaSetDataSource = [],
      capaSetTotal = 0,
      courseDataSource = [],
      courseTotal = 0,
      pageConfig = {},
      resourceDataSource = [],
    } = platTrainDetail;
    const {
      progName,
      jobClass1Name,
      jobClass2Name,
      entryTypeName,
      progStatusName,
      certNo,
      certName,
      resScopeName,
      progDesc,
      learnObj,
      sortLockedFlag,
      trainingClassName,
      entryType,
      jobScope,
      jobCapaSetIds,
      jobCapaSetNames,
    } = courseDetail;
    let { pageBlockViews = [] } = pageConfig;
    pageBlockViews = pageBlockViews.sort(this.sortObj);
    let columnsCourse = [];
    let columnsCapa = [];
    let columnsCapaSet = [];

    let pageFieldViewsCapaSet = [];
    let pageFieldViewsCapa = [];
    let pageFieldViewsCourse = [];
    if (pageBlockViews && pageBlockViews.length > 0) {
      pageBlockViews.forEach(view => {
        if (view.blockKey === 'CAPASET_LIST') {
          pageFieldViewsCapaSet = view.pageFieldViews;
        } else if (view.blockKey === 'CAPA_LIST') {
          pageFieldViewsCapa = view.pageFieldViews;
        } else if (view.blockKey === 'COURSE_LIST') {
          pageFieldViewsCourse = view.pageFieldViews;
        }
      });

      columnsCourse = pageFieldViewsCourse
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
          };
          if (item.fieldKey === 'trnRequirement') {
            columnsItem.dataIndex = 'trnRequirementName';
          }
          return columnsItem;
        });

      columnsCapa = pageFieldViewsCapa
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
            align: 'center',
          };
          return columnsItem;
        });

      columnsCapaSet = pageFieldViewsCapaSet
        .filter(item => item.visibleFlag === 1)
        .sort(this.sortObj)
        .map(item => {
          const columnsItem = {
            title: item.displayName,
            dataIndex: item.fieldKey,
          };
          if (item.fieldKey === 'capaSetName') {
            columnsItem.width = 300;
            columnsItem.align = 'center';
          }
          return columnsItem;
        });
    }

    const capaSetList = [];
    const idsList = jobCapaSetIds ? jobCapaSetIds.split(',') : [];
    const namesList = jobCapaSetNames ? jobCapaSetNames.split(',') : [];
    idsList.forEach((id, index) => {
      namesList.forEach((name, index1) => {
        if (index === index1) {
          capaSetList.push({
            id: Number(id),
            capaSetName: name,
          });
        }
      });
    });

    const tablePropsCourse = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      loading: false,
      total: courseTotal,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      dataSource: courseDataSource,
      onChange: filters => {
        this.fetchCourseList(filters);
      },
      columns: [...columnsCourse],
    };

    // const tablePropsCapa = {
    //   rowKey: 'id',
    //   columnsCache: DOMAIN,
    //   dispatch,
    //   loading: false,
    //   total: capaTotal,
    //   enableSelection: false,
    //   showColumn: false,
    //   showSearch: false,
    //   showExport: false,
    //   dataSource: capaDataSource,
    //   onChange: filters => {
    //     this.fetchCapaList(filters);
    //   },
    //   columns: [...columnsCapa],
    // };

    // const tablePropsCapaSet = {
    //   rowKey: 'id',
    //   columnsCache: DOMAIN,
    //   dispatch,
    //   loading: false,
    //   total: capaSetTotal,
    //   enableSelection: false,
    //   showColumn: false,
    //   showSearch: false,
    //   showExport: false,
    //   dataSource: capaSetDataSource,
    //   onChange: filters => {
    //     this.fetchCapaSetList(filters);
    //   },
    //   columns: [...columnsCapaSet],
    // };

    // ??????????????????
    const tablePropsCapaSet = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      scroll: capaSetList.length > 10 ? { y: 400 } : {},
      dispatch,
      loading: false,
      // total: capaSetTotal,
      pagination: false,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      dataSource: capaSetList,
      columns: [...columnsCapaSet],
    };

    // ????????????
    const tablePropsResource = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      dispatch,
      scroll: resourceDataSource.length > 10 ? { y: 400 } : {},
      loading: false,
      pagination: false,
      enableSelection: false,
      showColumn: false,
      showSearch: false,
      showExport: false,
      dataSource: resourceDataSource,
      columns: [
        {
          title: '????????????',
          dataIndex: 'resType1Name',
          width: '50%',
          align: 'center',
          render: (value, row, index) => `${row.resType1Name || ''}-${row.resType2Name || ''}`,
        },
        {
          title: '??????/??????',
          dataIndex: 'periodFlag',
          width: '50%',
          align: 'center',
          render: (value, row, index) => {
            let name = '';
            if (value === 'UNLIMITED') {
              name = '??????';
            } else if (value === 'SHORT') {
              name = '??????';
            } else if (value === 'LONG') {
              name = '??????';
            }
            return name;
          },
        },
      ],
    };
    return (
      <PageHeaderWrapper title="??????????????????">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            size="large"
            onClick={() => router.push(`/hr/capacity/train/push?id=${fromQs().id}`)}
          >
            ??????
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '??????' })}
          </Button>
        </Card>
        {loading ? (
          <Loading />
        ) : (
          <Card className="tw-card-adjust" bordered={false} title="??????????????????">
            <DescriptionList size="large" col={2}>
              <Description term="??????????????????">{progName}</Description>
              <Description term="??????">{trainingClassName}</Description>
              <Description term="????????????">{entryTypeName}</Description>
              <Description term="??????">{progStatusName}</Description>
              {entryType === 'TRN_JOB' && (
                <Description term="????????????">
                  {jobScope === 'BY_JOB_CLASS' ? '?????????????????????' : ''}
                  {jobScope === 'BY_CAPASET' ? '?????????????????????' : ''}
                </Description>
              )}
              {entryType === 'TRN_JOB' && (
                <Description term="????????????">
                  {[jobClass1Name, jobClass2Name].filter(Boolean).join('-')}
                </Description>
              )}
              <Description term="????????????">{certNo}</Description>
              <Description term="????????????">{certName}</Description>
            </DescriptionList>

            <DescriptionList size="large" col="1">
              <Description term="??????" style={{ marginTop: '-16px' }}>
                <pre>{progDesc}</pre>
              </Description>
            </DescriptionList>
            <DescriptionList size="large" col="1">
              <Description term="????????????" style={{ marginTop: '-16px' }}>
                <pre>{learnObj}</pre>
              </Description>
            </DescriptionList>
            <Divider dashed />
            {(entryType === 'TRN_JOB' || entryType === 'TRN_ENTRY') && (
              <>
                <FieldList legend="????????????" noReactive>
                  <div
                    style={{
                      color: '#1890ff',
                      paddingLeft: '24px',
                      marginTop: '10px',
                      marginBottom: '-20px',
                    }}
                  >
                    ?????????????????????????????????????????????
                  </div>
                  <div style={{ width: '1000px' }}>
                    <DataTable {...tablePropsResource} />
                  </div>
                </FieldList>
                <Divider dashed />
              </>
            )}
            {entryType === 'TRN_JOB' &&
              jobScope === 'BY_CAPASET' && (
                <>
                  <FieldList legend="??????????????????" noReactive>
                    <div style={{ width: '1000px' }}>
                      <DataTable {...tablePropsCapaSet} />
                    </div>
                  </FieldList>
                  <Divider dashed />
                </>
              )}
            <FieldList legend="????????????" noReactive>
              <div
                style={{
                  fontSize: '16px',
                  paddingLeft: '24px',
                  marginTop: '10px',
                  marginBottom: '-20px',
                }}
              >
                <span
                  style={{
                    color: '#9999',
                  }}
                >
                  ??????????????????:&nbsp;&nbsp;
                </span>
                {sortLockedFlag === 'Y' ? '???' : '???'}
                <span
                  style={{
                    color: '#1890ff',
                  }}
                >
                  &nbsp;&nbsp;(?????????,??????????????????????????????????????????????????????)
                </span>
              </div>
              <DataTable {...tablePropsCourse} />
            </FieldList>
            {/* <FieldList legend="????????????" noReactive>
              <div
                style={{
                  marginBottom: '-20px',
                  paddingLeft: '24px',
                  marginTop: '10px',
                }}
              >
                ??????????????????
              </div>
              <DataTable {...tablePropsCapa} />
              <div
                style={{
                  marginBottom: '-20px',
                  paddingLeft: '24px',
                  marginTop: '10px',
                }}
              >
                ??????????????????
              </div>
              <DataTable {...tablePropsCapaSet} />
            </FieldList> */}
          </Card>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default CapaSetDetail;
