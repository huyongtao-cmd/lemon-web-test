import React, { PureComponent } from 'react';
import { Button, Card, Popover } from 'antd';
import { connect } from 'dva';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { fromQs } from '@/utils/stringUtils';
import DescriptionList from '@/components/layout/DescriptionList';
import DataTable from '@/components/common/DataTable';
import Title from '@/components/layout/Title';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import moment from 'moment';

const { Description } = DescriptionList;

const DOMAIN = 'businessTmplDetail';
// 动态列属性初始化
const columnTempl = {
  title: 'W',
  dataIndex: 'yearWeek_',
  align: 'center',
  width: 50,
  render: '',
};
// 动态列数组初始化
let extraCols = [];

@connect(({ loading, businessTmplDetail, dispatch, user }) => ({
  loading,
  ...businessTmplDetail,
  dispatch,
  user,
}))
@mountToTab()
class BusinessTmplDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      columnNum: 0, // 记录动态列的数量
    };
  }

  componentDidMount() {
    const params = fromQs();
    this.fetchData(params);
  }

  fetchData = params => {
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/query`,
      payload: params,
    }).then(res => {
      if (res.ok) {
        const { formData } = this.props;
        const temp = [];
        if (formData.durationWeek) {
          for (let index = 0; index < parseInt(formData.durationWeek, 10); index += 1) {
            const styles = {
              cursor: 'pointer',
            };
            if (
              moment(formData.startDate)
                .add(index, 'weeks')
                .startOf('week')
                .format('YYYY-MM-DD') ===
              moment(new Date())
                .startOf('week')
                .format('YYYY-MM-DD')
            ) {
              styles.color = '#f5222d';
            } else {
              styles.color = '#008FDB';
            }
            temp.push({
              ...columnTempl,
              title: (
                <Popover
                  content={`${moment(formData.startDate)
                    .add(index, 'weeks')
                    .format('YYYY-MM-DD')}~${moment(formData.startDate)
                    .add(index, 'weeks')
                    .add(6, 'days')
                    .format('YYYY-MM-DD')}`}
                  trigger="hover"
                >
                  <span style={styles}>
                    {index === 0 ? columnTempl.title : columnTempl.title + index}
                  </span>
                </Popover>
              ),
              dataIndex: columnTempl.dataIndex + index,
              width: 50,
              // eslint-disable-next-line no-loop-func
            });
          }
        }
        extraCols = temp;
        dispatch({
          type: `${DOMAIN}/updateForm`,
          payload: { key: 'durationWeek', value: formData.durationWeek },
        });
        this.setState({
          columnNum: parseInt(formData.durationWeek, 10),
        });
      }
    });
  };

  render() {
    const { loading, dataSource, formData, dispatch } = this.props;
    const disabledBtn = loading.effects[`${DOMAIN}/query`];
    const { columnNum } = this.state;
    const tableProps = {
      rowKey: 'id',
      columnsCache: DOMAIN,
      loading: disabledBtn,
      scroll: { x: 1000 + columnNum * 50 },
      dataSource,
      onChange: filters => {
        this.fetchData(filters);
      },
      showSearch: false,
      showColumn: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      columns: [
        {
          title: '角色',
          dataIndex: 'role',
          align: 'center',
        },
        {
          title: '资源',
          dataIndex: 'resName',
          align: 'center',
        },
        {
          title: '复合能力（系数）',
          dataIndex: 'capasetLevelDesc',
          align: 'center',
        },
        {
          title: '系数',
          dataIndex: 'distributeRate',
          align: 'center',
          render: (value, row, index) => (value === 1 ? '是' : '否'),
        },
        {
          title: '开始日期',
          dataIndex: 'startDate',
          align: 'center',
        },
        {
          title: '结束日期',
          dataIndex: 'endDate',
          align: 'center',
        },
        {
          title: '总人天',
          dataIndex: 'totalDays',
          align: 'center',
        },
        {
          title: '总当量',
          dataIndex: 'totalEqva',
          align: 'center',
        },
        ...extraCols,
      ],
    };

    return (
      <PageHeaderWrapper title="商机模板详情">
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
          title={<Title icon="profile" id="sys.system.basicInfo" defaultMessage="基本信息" />}
          bordered={false}
          className="tw-card-adjust"
        >
          <DescriptionList size="large" col={2} hasSeparator>
            <Description term="名称">{formData.tmplName}</Description>
            <Description term="创建人">{formData.createResName}</Description>
            <Description term="权限类型 ">{formData.permissionTypeDesc}</Description>
            <Description term="持续周数">{formData.durationWeek}</Description>
          </DescriptionList>
        </Card>
        <br />
        <Card title="模板详情" bordered={false} className="tw-card-adjust">
          <DataTable {...tableProps} />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BusinessTmplDetail;
