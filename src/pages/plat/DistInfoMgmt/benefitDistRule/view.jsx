import React, { PureComponent } from 'react';
import { connect } from 'dva';
import classnames from 'classnames';
import { Button, Card, Divider } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import DescriptionList from '@/components/layout/DescriptionList';
import TransferView from '../component/TransferView';

const { Description } = DescriptionList;

const DOMAIN = 'benefitDistTemp';

@connect(({ loading, benefitDistTemp, dispatch }) => ({
  loading,
  benefitDistTemp,
  dispatch,
}))
@mountToTab()
class BenefitDistTempView extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/cleanDetail` }).then(res => {
      // 获取页面配置信息
      dispatch({
        type: `${DOMAIN}/getPageConfig`,
        payload: { pageNo: 'T_PROFITDIST_FUNCTION' },
      });
      id &&
        dispatch({
          type: `${DOMAIN}/queryView`,
          payload: {
            id,
          },
        }).then(response => {
          dispatch({
            type: `${DOMAIN}/proConAndproFacView`,
            payload: {
              id: response?.datum?.busiFunctionId,
            },
          });
        });
    });
  }

  // 配置所需要的内容
  renderPage = () => {
    const {
      benefitDistTemp: {
        detailFormData,
        pageConfig: { pageBlockViews = [] },
      },
    } = this.props;

    if (!pageBlockViews || pageBlockViews.length < 1) {
      return <div />;
    }
    const currentListConfig = pageBlockViews.filter(v => v.blockPageName === '利益分配模板编辑');
    // 修改之前的可配置化
    const { pageFieldViews = [] } = currentListConfig[0];
    const pageFieldJson = {};
    if (pageFieldViews) {
      pageFieldViews.forEach(field => {
        pageFieldJson[field.fieldKey] = field;
      });
      const { busiFunctionId = {}, templateName = {}, activeFlag = {} } = pageFieldJson;
      const fields = [
        <Description key="busiFunctionId" term={busiFunctionId.displayName}>
          {detailFormData.busiFunctionName || ''}
        </Description>,
        <Description key="templateName" term={templateName.displayName}>
          {detailFormData.templateName || ''}
        </Description>,
        <Description key="activeFlag" term={activeFlag.displayName}>
          {detailFormData.activeFlag === '0' ? '已启用' : ''}
          {detailFormData.activeFlag === '1' ? '未启用' : ''}
        </Description>,
      ];

      const filterList = fields
        .filter(field => !field.key || pageFieldJson[field.key].visibleFlag === 1)
        .sort((field1, field2) => field1.props.sortNo - field2.props.sortNo);
      return (
        <DescriptionList layout="horizontal" size="large" col={2}>
          {filterList}
        </DescriptionList>
      );
    }

    return '';
  };

  render() {
    const {
      benefitDistTemp: {
        profitConditionListView,
        profitConditionSelectListView,
        profitFactorListView,
        profitFactorSelectListView,
      },
    } = this.props;

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
          title={<Title icon="profile" text="模板详情" />}
          bordered={false}
        >
          {this.renderPage()}
          <Divider dashed />
          <DescriptionList title="利益分配条件" layout="horizontal" size="large" col={1}>
            <TransferView
              data={{
                leftData: profitConditionListView,
                rightData: profitConditionSelectListView,
              }}
              leftColumns={[
                {
                  title: '字段名称',
                  dataIndex: 'fieldName',
                  align: 'center',
                },
                {
                  title: '字段可选值',
                  dataIndex: 'fieldOptional',
                  align: 'center',
                },
              ]}
              rightColumns={[
                {
                  title: '利益分配条件',
                  dataIndex: 'fieldName',
                  align: 'center',
                },
              ]}
            />
          </DescriptionList>

          <br />
          <Divider dashed />

          <DescriptionList title="利益分配对象" layout="horizontal" size="large" col={1}>
            <TransferView
              data={{
                leftData: profitFactorListView,
                rightData: profitFactorSelectListView,
              }}
              leftColumns={[
                {
                  title: '字段名称',
                  dataIndex: 'profitFieldName',
                  align: 'center',
                },
              ]}
              rightColumns={[
                {
                  title: '利益分配对象',
                  dataIndex: 'profitFieldName',
                  align: 'center',
                },
              ]}
            />
          </DescriptionList>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default BenefitDistTempView;
