/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Button, Progress, Card, Icon, Divider, Tooltip } from 'antd';
import DataTable from '@/components/common/DataTable';
import { mountToTab, closeThenGoto, markAsTab } from '@/layouts/routerControl';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import classnames from 'classnames';
import { formatMessage } from 'umi/locale';
import { fromQs } from '@/utils/stringUtils';
import Title from '@/components/layout/Title';
import { mul, div, add } from '@/utils/mathUtils';

import targetSvg from './img/target.svg';
import keySvg from './img/key.svg';

import styles from './style.less';

const DOMAIN = 'targetEvalApply';

@connect(({ loading, targetEvalApply, dispatch }) => ({
  targetEvalApply,
  dispatch,
  loading,
}))
@Form.create({})
@mountToTab()
class TargetEvalApplyDetail extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    const { id } = fromQs();
    dispatch({ type: `${DOMAIN}/clean` }).then(res => {
      id &&
        dispatch({
          type: `${DOMAIN}/targetResultFlowDetail`,
          payload: {
            id,
          },
        });
    });
  }

  render() {
    const {
      loading,
      form: { getFieldDecorator, setFieldsValue },
      targetEvalApply: { formData, twOkrKeyresultView },
    } = this.props;

    const tableProps = {
      title: () => <span>打分明细</span>,
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      columnsCache: DOMAIN,
      loading: loading.effects[`${DOMAIN}/myVacationList`],
      showColumn: false,
      onRow: () => {},
      showSearch: false,
      showExport: false,
      pagination: false,
      enableSelection: false,
      enableDoubleClick: false,
      columns: [
        {
          title: '打分人',
          dataIndex: 'evalRoleName',
          align: 'center',
          width: '250px',
          render: (value, row, index) => {
            const { evalResIdName, evalRoleName } = row;
            if (evalRoleName === '最终确认') {
              return `${evalResIdName}(${evalRoleName})`;
            }
            return value;
          },
        },
        {
          title: '分数',
          dataIndex: 'evalScore',
          align: 'center',
          width: '150px',
          render: (value, row, index) => {
            const { evalRoleName } = row;
            if (evalRoleName === '自评') {
              return '-';
            }
            return value;
          },
        },
        {
          title: '评语',
          dataIndex: 'evalComment',
          render: (value, row, key) => {
            const { evalRoleName } = row;
            if (evalRoleName === '系统自动' || evalRoleName === '最终确认') {
              return '-';
            }
            return <pre>{value}</pre>;
            // return value && value.length > 15 ? (
            //   <Tooltip placement="left" title={value}>
            //     <pre>{`${value.substr(0, 15)}...`}</pre>
            //   </Tooltip>
            // ) : (
            //   <pre>{value}</pre>
            // );
          },
        },
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
          title={<Title icon="profile" text="打分明细" />}
          bordered={false}
        >
          <Card
            title={
              <span>
                <img width="20px" style={{ marginBottom: '9px' }} src={targetSvg} alt="目标" />
                &nbsp; {formData.objectiveName || ''}
              </span>
            }
            headStyle={{ border: 'none', height: 'auto' }}
            bodyStyle={{ paddingTop: 6, paddingLeft: '55px' }}
            bordered={false}
            className={styles.supObjective}
          >
            <div>
              <Icon type="home" />
              &nbsp; 父目标：
              {formData.supObjectveName || '无'}
              &nbsp; &nbsp;
              {formData.supObjectveName && (
                <span className="supobjectiveCurProg">
                  {formData.supobjectiveCurProg
                    ? Number(formData.supobjectiveCurProg).toFixed(2)
                    : '00.00'}
                  %
                </span>
              )}
            </div>
            <br />
            <div>
              <span>
                <Icon type="user" />
                {formData.objectiveResName || ''}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                目标类型：
                {formData.objectiveTypeName || ''}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                截止日期：
                {formData.endDate || ''}
              </span>
              &nbsp; &nbsp; &nbsp; &nbsp;
              <span>
                更新日期：
                {formData.objectiveUpdatedate || ''}
              </span>
            </div>
            <br />
            <div>
              <span>整体进度：</span>
              <span style={{ display: 'inline-block', width: '400px' }}>
                <Progress
                  strokeColor="#22d7bb"
                  percent={Number(formData.objectiveCurProg) || 0}
                  status="active"
                  format={percent => percent.toFixed(2) + '%'}
                />
              </span>
            </div>
          </Card>
          <Card
            title={
              <span>
                <img
                  width="20px"
                  style={{ marginBottom: '9px', transform: 'rotateY(180deg)' }}
                  src={keySvg}
                  alt="关键结果"
                />
                &nbsp; 关键结果
              </span>
            }
            headStyle={{ border: 'none' }}
            bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '70px' }}
            bordered={false}
          >
            <span style={{ display: 'inline-block' }}>得分</span>
            &nbsp;
            <span style={{ fontSize: '26px', color: '#3B5493', fontFamily: 'Sans-serif' }}>
              {(formData.finalScore && Number(formData.finalScore).toFixed(2)) || '100.00'}
            </span>
          </Card>
          {twOkrKeyresultView.map((item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={index}>
              <Divider dashed />
              <Card
                bodyStyle={{ paddingTop: 6, paddingBottom: 5, paddingLeft: '120px' }}
                bordered={false}
                className={styles.keyResult}
              >
                <span style={{ position: 'absolute', left: '40px' }}>
                  <Progress
                    width={60}
                    strokeColor="#22d7bb"
                    type="circle"
                    percent={Number(
                      item.objValue
                        ? mul(div(Number(item.curProg), Number(item.objValue)), 100).toFixed(1)
                        : '0.00'
                    )}
                    // format={percent => percent.toFixed(2) + '%'}
                  />
                </span>
                <div>
                  {item.keyresultName || ''}
                  &nbsp; &nbsp;
                  {`[权重${item.keyresultWeight}%]`}
                </div>
                <br />
                <div>
                  <span>
                    起始：
                    {item.iniValue || ''}
                    {item.keyresultType === 'PERCENT' ? '%' : ''}
                  </span>
                  &nbsp; &nbsp; &nbsp; &nbsp;
                  <span>
                    目标：
                    {item.objValue || ''}
                    {item.keyresultType === 'PERCENT' ? '%' : ''}
                  </span>
                  &nbsp; &nbsp; &nbsp; &nbsp;
                  <span>
                    <a>
                      <Tooltip
                        placement="left"
                        title={
                          <pre>
                            1、完成90%得90分； 2、完成80%得80分； 3、完成70%得70分；
                            4、完成70%以下，0分；
                          </pre>
                        }
                      >
                        打分规则
                      </Tooltip>
                    </a>
                  </span>
                </div>

                <div className={styles.dataTableBox}>
                  <DataTable {...tableProps} dataSource={item.twOkrKeyresultScoreView} />
                </div>
                <br />
              </Card>
            </React.Fragment>
          ))}
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default TargetEvalApplyDetail;
