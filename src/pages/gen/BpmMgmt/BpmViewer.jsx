import React, { Component, Fragment } from 'react';
import { isEmpty, isNil, equals, type } from 'ramda';
import { Card, Divider } from 'antd';
import { closeThenGoto } from '@/layouts/routerControl';
import DescriptionList from '@/components/layout/DescriptionList';
import { flowToRouter } from '@/utils/flowToRouter';
import { getFlowInfoByTaskInfo } from '@/services/gen/flow';

const { Description } = DescriptionList;

class BpmViewer extends Component {
  state = {
    flowsList: [],
  };

  componentDidMount() {
    const { docId, procDefKey } = this.props;
    docId && this.compileParams({ docId, procDefKey });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!isNil(snapshot)) {
      this.compileParams(snapshot);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { docId, procDefKey } = this.props;
    if (docId && !equals(prevProps.docId, docId)) {
      return { docId, procDefKey };
    }
    return null;
  }

  compileParams = param => {
    const { docId, procDefKey } = param;
    const defKeys = procDefKey.split('|');
    // 1. 当 docId 为数组时
    if (equals(type(docId), 'Array')) {
      // 需要 id 和 key 一一对应
      if (equals(defKeys.length, docId.length)) {
        const params = docId
          .map((doc, index) => {
            if (isNil(doc)) return undefined;
            return {
              docId: doc,
              procDefKey: defKeys[index],
            };
          })
          .filter(Boolean);
        this.fetchFlowInfo(params);
      }
      // 2. docId 不是数组， 但是  defKey 为数组时， 拆分为 一一对应
    } else if (defKeys.length) {
      // eslint-disable-next-line
      const params = defKeys.map(key => {
        return {
          docId,
          procDefKey: key,
        };
      });
      this.fetchFlowInfo(params);
    } else {
      // 3. docId 和 procDefKey 一一对应，切都不为多个时， 有 docId 做请求
      docId && this.fetchFlowInfo([{ docId, procDefKey }]);
    }
  };

  fetchFlowInfo = async params => {
    const respDatas = await Promise.all(
      params.map(({ docId, procDefKey }) =>
        getFlowInfoByTaskInfo({ docId, procDefKey: procDefKey.split('.')[0] })
      )
    );
    const flowsList = respDatas
      .map(({ status, response }, index) => {
        if (!equals(status, 200)) return undefined;
        if (equals(status, 100)) return undefined;
        if (isEmpty(response)) return undefined;
        const { NO, docName, id, isTodo, taskId } = response || {};
        const defKey = params[index].procDefKey;
        const mode = isTodo === 'todo' ? 'edit' : 'view';
        const router = flowToRouter(defKey, { id, taskId, docId: params[index].docId, mode });
        return {
          no: NO,
          name: docName,
          router,
        };
      })
      .filter(Boolean);
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
          const { no, name, router } = flows;
          const title = flowsList.length === 1 ? undefined : `流程${index + 1}`;
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

export default BpmViewer;
