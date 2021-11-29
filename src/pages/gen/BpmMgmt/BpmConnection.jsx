import React, { Component, Fragment } from 'react';
import { isEmpty, isNil, equals, type, filter, map } from 'ramda';
import { Card, Divider } from 'antd';
import { closeThenGoto } from '@/layouts/routerControl';
import DescriptionList from '@/components/layout/DescriptionList';
import { flowToRouter } from '@/utils/flowToRouter';
import { getFlowInfoByTaskInfo } from '@/services/gen/flow';

const { Description } = DescriptionList;

class BpmConnection extends Component {
  state = {
    flowsList: [],
  };

  componentDidMount() {
    const { source = [] } = this.props;
    !isEmpty(source) && this.compileParams(source);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!isNil(snapshot)) {
      this.compileParams(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { source = [] } = this.props;
    if (!isEmpty(source) && !equals(prevProps.source, source)) {
      return source;
    }
    return null;
  }

  // 这里提出来个方法专门做数据清洗，再有变更的时候，好注入:)
  compileParams = params => {
    // 筛选出来，如果有单据id，才做请求
    const legalParams = filter(({ docId }) => !isNil(docId), params);
    // 走正式请求
    this.fetchFlowInfo(legalParams);
  };

  fetchFlowInfo = async params => {
    const respDataList = await Promise.all(
      params.map(({ docId, procDefKey }) =>
        getFlowInfoByTaskInfo({ docId, procDefKey: procDefKey.split('.')[0] })
      )
    );
    // console.info("respDataList"+respDataList)
    const flowsList = respDataList
      .map(({ status, response }, index) => {
        if (!equals(status, 200)) return undefined;
        if (equals(status, 100)) return undefined;
        if (isEmpty(response)) return undefined;
        const { NO, docName, id, isTodo, taskId } = response || {};
        const rightSource = params[index];
        const { docId, procDefKey, title } = rightSource;
        const mode = isTodo === 'todo' ? 'edit' : 'view';
        const router = flowToRouter(procDefKey, { id, taskId, docId, mode });
        return {
          no: NO,
          name: docName,
          router,
          title,
        };
      })
      .filter(Boolean);
    // console.info("流程访问的时候获取值"+flowsList)
    this.setState({ flowsList });
  };

  goBpm = router => {
    router && closeThenGoto(router);
  };

  render() {
    const { flowsList = [] } = this.state;
    if (!flowsList.length) return null;
    return (
      <Card className="tw-card-adjust" title="相关流程" style={{ marginTop: 4 }}>
        {flowsList.map((flows, index) => {
          const { no, name, router, title } = flows;
          return (
            <Fragment key={`${no}-${name}`}>
              <DescriptionList key={no} size="large" title={title} col={2}>
                <Description term="流程编号">
                  <a className="tw-link" onClick={() => this.goBpm(router)}>
                    {no}
                  </a>
                </Description>
                <Description term="流程名称">
                  <a className="tw-link" onClick={() => this.goBpm(router)}>
                    {name}
                  </a>
                </Description>
              </DescriptionList>
              {index !== flowsList.length - 1 && <Divider dashed />}
            </Fragment>
          );
        })}
      </Card>
    );
  }
}

export default BpmConnection;
