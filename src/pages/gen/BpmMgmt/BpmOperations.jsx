import React from 'react';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { filter, isEmpty } from 'ramda';
import { Card, Button, Input, Row, Popover, Divider, Tooltip, Tabs } from 'antd';
import { closeThenGoto, closeTab } from '@/layouts/routerControl';
import ReactiveWrapper from '@/components/layout/ReactiveWrapper';
import { MultiSourceSelect } from '@/pages/gen/modal';
import PrintHelper from '@/components/common/PrintHelper';
import { fromQs } from '@/utils/stringUtils';
import { getUrl } from '@/utils/flowToRouter';
import BpmDiagram from './BpmDiagram';
import BpmFlowInfo from './BpmFlowInfo';
import BpmLogs from './BpmLogs';
import styles from './BpmDiagram.less';

const { TextArea } = Input;
const { TabPane } = Tabs;

const sourceConfig = [
  {
    name: 'iam:user',
    columns: [
      {
        title: '编码',
        dataIndex: 'code',
        className: 'text-center',
      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      // {
      //   title: '审批人',
      //   dataIndex: 'approver',
      //   render: (value, record) => {
      //     if (record && record.entity) {
      //       return record.entity.approver;
      //     }
      //     return '';
      //   },
      // },
    ],
  },
];

const NormalButton = ({ onChange, operation, btnCanUse }) => {
  const { key, title, className, icon, disabled, buttonLoading } = operation;
  return (
    <Button
      key={key}
      icon={icon}
      className={className}
      size="large"
      disabled={disabled || !btnCanUse}
      onClick={() => onChange('button', operation)}
      loading={buttonLoading}
    >
      {formatMessage({ id: title, desc: 'who care' })}
    </Button>
  );
};

const transferStores = stores => {
  // tag:: 这里是单数据源，所以 stores 的类型就是 { source: [{ code, name}] }
  // re-tag:: 应该写在model里面，写这里方便跟 then 之后的操作做对应
  if (isEmpty(stores)) return null;
  const source = Object.keys(stores)[0];
  const members = stores[source].map(({ code }) => code);
  const memberNames = stores[source]
    // eslint-disable-next-line
    .map(({ code, name }) => {
      return { [code]: name };
    })
    // eslint-disable-next-line
    .reduce((prev, curr) => {
      return { ...prev, ...curr };
    }, {});
  return {
    source,
    members,
    memberNames,
  };
};

const BpmOperations = ({
  viewMode,
  bpmForm,
  operations = [],
  onChange,
  prcId,
  printRef,
  bpmCancel,
  scope,
  buttonLoading,
  extraButtons,
  btnCanUse,
}) => {
  const validOperations = filter(({ type }) => type.toLowerCase() === 'button', operations);
  const CCBtn = filter(({ type }) => type.toLowerCase() === 'cc', operations);
  return (
    <>
      <Card className="tw-card-rightLine">
        {validOperations.map(operation => {
          const { key, className } = operation;
          const operationPlus = { ...operation, buttonLoading };
          if (viewMode) {
            if (!className.includes('stand')) return null;
            return (
              <NormalButton
                key={key}
                onChange={onChange}
                operation={operationPlus}
                btnCanUse={btnCanUse}
              />
            );
          }
          return (
            <NormalButton
              key={key}
              onChange={onChange}
              operation={operationPlus}
              btnCanUse={btnCanUse}
            />
          );
        })}
        <Popover
          placement="bottomRight"
          trigger="click"
          overlayClassName={styles.bpmnWrapper}
          content={
            <>
              <Tabs>
                <TabPane tab="流程图" key="1">
                  <Divider>流程图</Divider>
                  <BpmDiagram prcId={prcId} />
                  {/* <Divider>流程履历</Divider> */}
                  <BpmLogs prcId={prcId} />
                </TabPane>
                <TabPane tab="流程说明" key="2">
                  <BpmFlowInfo prcId={prcId} />
                </TabPane>
              </Tabs>
            </>
          }
        >
          <Tooltip title="查看流程图">
            <Button
              className={classnames('separate', 'tw-btn-default', 'stand')}
              icon="deployment-unit"
              size="large"
              type="dashed"
            />
          </Tooltip>
        </Popover>
        {extraButtons}
        {/* <PrintHelper content={() => printRef}> */}
        {scope &&
          fromQs().id && (
            <a
              href={`/print?scope=${scope}&id=${fromQs().id}&prcId=${prcId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 8 }}
            >
              <Tooltip title="打印单据">
                <Button
                  className={classnames('tw-btn-default', 'stand')}
                  type="dashed"
                  icon="printer"
                  size="large"
                />
              </Tooltip>
            </a>
          )}
        {/* </PrintHelper> */}
        <Button
          className={classnames('tw-btn-default', 'stand')}
          icon="undo"
          size="large"
          style={{ marginLeft: 8 }}
          onClick={() => {
            bpmCancel().then(() => {
              const { from } = fromQs();
              const url = getUrl(from);
              url ? closeThenGoto(url) : closeTab();
            });
          }}
        >
          {formatMessage({ id: `misc.rtn`, desc: '返回' })}
        </Button>
      </Card>
      <Card className="tw-card-rightLine">
        <ReactiveWrapper
          rowProps={{
            style: { width: '100%' },
          }}
        >
          {isEmpty(CCBtn) ? null : (
            <Row
              type="flex"
              align="middle"
              justify="start"
              style={{ flexWrap: 'nowrap', marginBottom: 8 }}
            >
              <div
                style={{
                  flex: 0,
                  padding: '0 8px',
                  wordBreak: 'keep-all',
                  alignSelf: 'flex-start',
                }}
              >
                补充知会：
              </div>
              <MultiSourceSelect
                disabled={viewMode}
                value={bpmForm.cc}
                dataSource={sourceConfig}
                onChange={stores => onChange('cc', transferStores(stores))}
                singleSource
              />
            </Row>
          )}
          <Row
            type="flex"
            align="middle"
            justify="start"
            style={{ flexWrap: 'nowrap', marginBottom: 8 }}
          >
            <div
              style={{
                flex: 0,
                padding: '0 8px',
                wordBreak: 'keep-all',
                alignSelf: 'flex-start',
              }}
            >
              填写意见：
            </div>
            <TextArea
              rows={3}
              disabled={viewMode}
              value={bpmForm.remark}
              placeholder="请填写意见"
              maxLength={400}
              onChange={e => onChange('input', e)}
            />
          </Row>
        </ReactiveWrapper>
      </Card>
    </>
  );
};

export default BpmOperations;
