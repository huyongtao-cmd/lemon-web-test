import React, { Component } from 'react';
import { Rate } from 'antd';
import DescriptionList from '@/components/layout/DescriptionList';
import { request } from '@/utils/networkUtils';
import { toQs } from '@/utils/stringUtils';
import api from '@/api';

const { evald } = api.eval;
const { Description } = DescriptionList;

const rateConfig = {
  allowClear: true,
  allowHalf: false,
  count: 5,
};

class EvalTemplate extends Component {
  state = {
    list: [],
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      this.fetchList(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { sourceId } = this.props;
    if (prevProps.sourceId !== sourceId && sourceId) {
      return sourceId;
    }
    return null;
  }

  fetchList = async sourceId => {
    const { options, fetchItems } = this.props;
    const items = typeof fetchItems === 'function' ? await fetchItems() : fetchItems || [];
    const { evalClass, evalType, evalClassName, evalTypeName } = options;
    const { status, response } = await request.get(toQs(evald, { sourceId, evalClass, evalType }));
    if (status === 200 && response.ok) {
      const { evalItemEntities: list, evalerResName, evaledResName, evalComment } = response.datum;
      this.setState({
        evalClassName,
        evalTypeName,
        evalerResName,
        evaledResName,
        evalComment,
        list: Array.isArray(list) ? list : [],
        items,
      });
    }
  };

  render() {
    const { list, items, ...forms } = this.state;
    return (
      <>
        <DescriptionList title="评价条目" col={2}>
          <Description term="评价类别">{forms.evalClassName}</Description>
          <Description term="评价类型">{forms.evalTypeName}</Description>
          <Description term="评价人">{forms.evalerResName}</Description>
          <Description term="被评价人">{forms.evaledResName}</Description>
        </DescriptionList>
        <DescriptionList col={1}>
          <Description term="评语">{forms.evalComment}</Description>
        </DescriptionList>
        <DescriptionList title="评价明细" col={1}>
          {list.map(item => {
            const { evalItemId, evalScore, evalComment } = item;
            const { evalPoint = '' } = items.find(i => i.id === evalItemId);
            return (
              <>
                <Description term={evalPoint}>
                  <Rate {...rateConfig} value={evalScore} disabled />
                </Description>
                <Description term="简评">{evalComment}</Description>
              </>
            );
          })}
        </DescriptionList>
      </>
    );
  }
}

export default EvalTemplate;
