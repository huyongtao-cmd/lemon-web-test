import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Divider, Tooltip } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import { formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import { isEmpty, isNil } from 'ramda';

const { Description } = DescriptionList;

const DOMAIN = 'prefCheckResult';

@connect(({ loading, prefCheckResult, dispatch }) => ({
  loading,
  prefCheckResult,
  dispatch,
}))
@mountToTab()
class PrefCheckResultDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      othersColumns: [],
    };
  }

  componentDidMount() {
    const { dispatch, user } = this.props;
    const { id } = fromQs();
    // 获取页面配置信息
    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'PERFORMANCE_EXAM_RESULT_DETAIL' },
    });
    id &&
      dispatch({
        type: `${DOMAIN}/examByIdResDetail`,
        payload: { id },
      }).then(res => {
        if (!isEmpty(res)) {
          // 处理多人评分数据格式-处理表头
          const { resFinallyViews } = res[0];
          if (!isEmpty(resFinallyViews)) {
            const tt = [];
            resFinallyViews.forEach((v, index) => {
              tt.push({
                title: `评分(${v.evalResIdName}-${v.evalWeight}%)`,
                align: 'center',
                dataIndex: `evalScore${index}`,
                width: 100,
              });
            });
            resFinallyViews.forEach((v, index) => {
              tt.push({
                title: `评语(${v.evalResIdName})`,
                dataIndex: `evalComment${index}`,
                width: 200,
                render: (value, row) =>
                  value && value.length > 15 ? (
                    <Tooltip placement="left" title={value}>
                      <pre>{`${value.substr(0, 15)}...`}</pre>
                    </Tooltip>
                  ) : (
                    <pre>{value}</pre>
                  ),
              });
            });

            this.setState(
              {
                othersColumns: tt,
              },
              () => {
                // 处理多人评分数据格式-处理表格数据
                res.forEach((v, i) => {
                  const { resFinallyViews: resFinallyViewsList } = v;
                  resFinallyViewsList.forEach((item, index) => {
                    if (item.poinType === '2') {
                      if (item.evalScoreFlag === '1') {
                        // eslint-disable-next-line no-param-reassign
                        v[`evalScore${index}`] = '达成';
                      }
                      if (item.evalScoreFlag === '0') {
                        // eslint-disable-next-line no-param-reassign
                        v[`evalScore${index}`] = '未达成';
                      }
                      // eslint-disable-next-line no-param-reassign
                      v[`evalComment${index}`] = item.evalComment;
                    } else if (item.poinType === '3') {
                      // eslint-disable-next-line no-param-reassign
                      v[`evalScore${index}`] = `-${item.evalScore}`;
                      // eslint-disable-next-line no-param-reassign
                      v[`evalComment${index}`] = item.evalComment;
                    } else {
                      // eslint-disable-next-line no-param-reassign
                      v[`evalScore${index}`] = item.evalScore;
                      // eslint-disable-next-line no-param-reassign
                      v[`evalComment${index}`] = item.evalComment;
                    }
                  });
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    examTmplPointViewList: res,
                  },
                });
              }
            );
          }
        }
      });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        pageConfig: {},
      },
    });
  }

  renderPage = () => {
    const {
      prefCheckResult: { formData, pageConfig },
    } = this.props;
    const { pageBlockViews } = pageConfig;
    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    let currentListConfig1 = [];
    let currentListConfig2 = [];
    let currentListConfig3 = [];
    pageBlockViews.forEach(view => {
      if (
        view.tableName === 'T_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_SUB1'
      ) {
        // 绩效考核结果
        currentListConfig1 = view;
      } else if (
        view.tableName === 'T_RES_PERFORMANCE_EXAM' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_MAIN'
      ) {
        currentListConfig2 = view;
      } else if (
        view.tableName === 'T_PERFORMANCE_EXAM_RANGE' &&
        view.blockKey === 'PERFORMANCE_EXAM_RESULT_DETAIL_SUB2'
      ) {
        currentListConfig3 = view;
      }
    });
    const { pageFieldViews: pageFieldViewsList1 } = currentListConfig1;
    const { pageFieldViews: pageFieldViewsList2 } = currentListConfig2;
    const { pageFieldViews: pageFieldViewsList3 } = currentListConfig3;

    const pageFieldJsonList = {};
    if (pageFieldViewsList1) {
      pageFieldViewsList1.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList2) {
      pageFieldViewsList2.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }
    if (pageFieldViewsList3) {
      pageFieldViewsList3.forEach(field => {
        pageFieldJsonList[field.fieldKey] = field;
      });
    }

    const {
      examName = {},
      examDesc = {},
      resType = {},
      buId = {},
      coopType = {},
      applyResId = {},
      applyDate = {},
      examGrade = {},
    } = pageFieldJsonList;
    if (pageFieldJsonList) {
      let fields = [];
      fields = [
        <Description term={examName.displayName}>{formData.examName || ''}</Description>,
        <Description term="考核期间">
          {`${formData.examPeriodStart || ''}${
            formData.examPeriodStart ? '-' : ''
          }${formData.examPeriodEnd || ''}`}
        </Description>,
        <Description term="考核资源">{formData.resName || ''}</Description>,
        <Description term={resType.displayName}>{formData.typeName || ''}</Description>,
        <Description term={buId.displayName}>{formData.buName || ''}</Description>,
        <Description term={coopType.displayName}>{formData.coopType || ''}</Description>,
        <Description term={examDesc.displayName}>
          {<pre>{formData.examDesc}</pre> || ''}
        </Description>,
        <Description term={applyResId.displayName}>{formData.applyResIdName || ''}</Description>,
        <Description term={applyDate.displayName}>{formData.applyDate || ''}</Description>,
        <Description term={`${examGrade.displayName}`}>
          {formData.gradeExamScore || ''}
        </Description>,
        <Description term="最终评分说明">
          <pre>{formData.gradeExplain || ''}</pre>
        </Description>,
      ];
      const filterList = fields
        .filter(field => !field.key || pageFieldJsonList[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <DescriptionList size="large" col={2}>
          {filterList}
        </DescriptionList>
      );
    }
    return null;
  };

  render() {
    const {
      loading,
      prefCheckResult: { formData, examTmplPointViewList = [] },
    } = this.props;
    const { othersColumns } = this.state;

    const examResultTableProps = {
      sortBy: 'id',
      rowKey: 'did',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/queryDetail`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      scroll: { x: 880 + (othersColumns.length / 2) * 300 },
      columns: [
        {
          title: '考核点',
          align: 'center',
          dataIndex: 'pointUdcName',
          width: 150,
        },
        {
          title: '评分类型',
          dataIndex: 'poinTypeName',
          align: 'center',
          width: 150,
        },
        {
          title: '考核点权重',
          align: 'center',
          dataIndex: 'weight',
          width: 100,
          render: (value, row, index) =>
            row.poinType !== '2' && row.poinType !== '3' && row.pointUdcName !== '最终得分'
              ? `${value || ''}%`
              : '-',
        },
        {
          title: '系统统计',
          dataIndex: 'sysExam',
          width: 200,
        },
        {
          title: '自评说明',
          dataIndex: 'selfEval',
          width: 200,
          render: (value, row, index) =>
            value && value.length > 15 ? (
              <Tooltip placement="left" title={<pre>{value}</pre>}>
                <pre>{`${value.substr(0, 15)}...`}</pre>
              </Tooltip>
            ) : (
              <pre>{value}</pre>
            ),
        },
        // {
        //   title: '最终得分',
        //   dataIndex: 'finalScore',
        //   align: 'center',
        //   width: 100,
        // },
        ...othersColumns,
      ],
    };

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
          title={<Title icon="profile" text="绩效考核明细" />}
          bordered={false}
        >
          {this.renderPage()}
          {/* <DescriptionList size="large" col={2}>
            <Description term="考核名称">{formData.examName || ''}</Description>
            <Description term="考核期间">
              {`${formData.examPeriodStart || ''}${
                formData.examPeriodStart ? '-' : ''
              }${formData.examPeriodEnd || ''}`}
            </Description>
            <Description term="考核资源">{formData.resName || ''}</Description>
            <Description term="资源类型">{formData.typeName || ''}</Description>
            <Description term="BU">{formData.buName || ''}</Description>
            <Description term="合作方式">{formData.coopType || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={1}>
            <Description term="考核说明">{<pre>{formData.examDesc}</pre> || ''}</Description>
          </DescriptionList>
          <DescriptionList size="large" col={2}>
            <Description term="考核发起人">{formData.applyResIdName || ''}</Description>
            <Description term="考核发起时间">{formData.applyDate || ''}</Description>
            <Description term="综合得分/等级">{formData.gradeExamScore || ''}</Description>
          </DescriptionList> */}
          <Divider dashed />
          <DescriptionList size="large" title="评分明细" col={2} />
          <DataTable {...examResultTableProps} dataSource={examTmplPointViewList} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PrefCheckResultDetail;
