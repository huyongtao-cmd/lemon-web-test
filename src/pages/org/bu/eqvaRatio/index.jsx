import React, { PureComponent } from 'react';
import { Input, Form, DatePicker, Card, Button } from 'antd';
import { connect } from 'dva';

import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import FieldList from '@/components/layout/FieldList';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import DescriptionList from '@/components/layout/DescriptionList';
import Title from '@/components/layout/Title';
import Ratio from './Ratio';
import Eqva from './Eqva';

const DOMAIN = 'orgEqvaRatio';

const { Field } = FieldList;
const { Description } = DescriptionList;

// 加载列表数据
@connect(({ loading, orgEqvaRatio }) => ({
  loading: loading.effects[`${DOMAIN}/query`], // 加载数据请求完成，菊花旋转图标隐藏
  ...orgEqvaRatio, // 解析本命名空间下的变量到props中
}))
@Form.create({})
// 切换到本tab页时？
@mountToTab()
class OrgEqvaRatio extends PureComponent {
  state = { activeTabKey: 'ratio' };

  // 组件加载时，加载数据
  componentDidMount() {
    const { dispatch } = this.props;
    const { resId, buId } = fromQs();

    dispatch({
      type: `${DOMAIN}/getPageConfig`,
      payload: { pageNo: 'BU_RES_EQVA_RATIO' },
    });

    // 加载基本信息
    dispatch({
      type: `${DOMAIN}/getResInfo`,
      payload: {
        buId,
        resId,
      },
    });

    // 加载当量系数信息
    dispatch({
      // 加载页面数据
      type: `orgRatio/query`,
      payload: {
        buId,
        resId,
      },
    });

    // 加载额定当量信息
    dispatch({
      // 加载页面数据
      type: `orgEqva/query`,
      payload: {
        buId,
        resId,
      },
    });
  }

  tabChange = key => {
    this.setState({ activeTabKey: key });
  };

  handleSave = () => {
    const { dispatch } = this.props;

    dispatch({
      type: `orgRatio/saveRatio`,
      payload: null,
    }).then(() => {
      dispatch({
        type: `orgEqva/saveEqva`,
        payload: null,
      }).then(() => {
        const { resId, buId } = fromQs();
        dispatch({
          type: `${DOMAIN}/getResInfo`,
          payload: {
            buId,
            resId,
          },
        });
      });
    });
  };

  // 组件渲染
  render() {
    const { pageConfig, formData = {}, ratio, eqva } = this.props;
    const { activeTabKey } = this.state;

    if (!pageConfig.pageBlockViews || pageConfig.pageBlockViews.length < 3) {
      return <div />;
    }
    const { pageFieldViews } = pageConfig.pageBlockViews[0];
    const { pageTabViews } = pageConfig;
    const pageFieldJson = {};
    // 对象数据数据处理，可以直接通过pageFieldJson.eqvaRatio取出对应字段的配置
    pageFieldViews.forEach(field => {
      pageFieldJson[field.fieldKey] = field; // fieldKey = 驼峰变量名
    });
    const tabList = [
      {
        key: 'ratio',
        tab: '当量系数',
      },
      {
        key: 'eqva',
        tab: '额定当量',
      },
    ];
    const contentList = {
      ratio: (
        <Ratio
          pageBlockView={pageConfig.pageBlockViews[1]}
          pageButtonViews={pageConfig.pageButtonViews}
          ratio={ratio}
        />
      ),
      eqva: (
        <Eqva
          pageBlockView={pageConfig.pageBlockViews[2]}
          pageButtonViews={pageConfig.pageButtonViews}
          eqva={eqva}
        />
      ),
    };
    let keyList = [];
    const pageTabJson = {};
    if (pageTabViews) {
      pageTabViews.forEach(tab => {
        pageTabJson[tab.tabKey] = tab;
      });
      keyList = pageTabViews.filter(tab => tab.visible).map(view => view.tabKey);
    }
    const permissionTabList = tabList
      .filter(tab => keyList.indexOf(tab.key) > -1)
      .map(view => ({
        ...view,
        tab: pageTabJson[view.key].tabName,
        sortNo: pageTabJson[view.key].sortNo,
      }))
      .sort((s1, s2) => s1.sortNo - s2.sortNo);

    const { mode, buId, from } = fromQs();
    const path = from === '/org/bu/resInfo' ? from : `${from}?buId=${buId}`;
    return (
      <PageHeaderWrapper title="额定当量系数管理">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            icon="save"
            size="large"
            onClick={this.handleSave}
            disabled={mode !== 'edit'}
            hidden={mode !== 'edit'}
          >
            {formatMessage({ id: `misc.save`, desc: '保存' })}
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            disabled={false}
            onClick={() => {
              closeThenGoto(path);
            }}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          className="tw-card-adjust"
          style={{ marginTop: '6px' }}
          title={<Title icon="profile" text="基本信息" />}
          bordered={false}
        >
          <DescriptionList size="large" col={2}>
            {pageFieldJson.resName.visibleFlag && (
              <Description term={pageFieldJson.resName.displayName || '资源'}>
                {formData.resName}
              </Description>
            )}
            {pageFieldJson.curEqvaRatio.visibleFlag && (
              <Description term={pageFieldJson.curEqvaRatio.displayName || '当前当量系数'}>
                {formData.curEqvaRatio}
              </Description>
            )}
            {pageFieldJson.dateFrom.visibleFlag && (
              <Description term={pageFieldJson.dateFrom.displayName || '加入日期'}>
                {formData.dateFrom}
              </Description>
            )}
            {pageFieldJson.dateTo.visibleFlag && (
              <Description term={pageFieldJson.dateTo.displayName || '离开日期'}>
                {formData.dateTo}
              </Description>
            )}
            {pageFieldJson.buPeriods.visibleFlag &&
              formData.buPeriods && (
                <Description term={pageFieldJson.buPeriods.displayName || 'bu区间明细'}>
                  {formData.buPeriods}
                </Description>
              )}
          </DescriptionList>
        </Card>

        <Card
          className="tw-card-multiTab"
          tabList={permissionTabList}
          activeTabKey={activeTabKey}
          onTabChange={this.tabChange}
          bordered={false}
        >
          {contentList[activeTabKey]}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default OrgEqvaRatio;
