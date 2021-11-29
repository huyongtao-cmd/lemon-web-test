import React, { PureComponent } from 'react';
import { Button, Card, Divider, Table, Tooltip } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { ascend, prop, sort, isEmpty } from 'ramda';

import { closeThenGoto, markAsTab, mountToTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { TagOpt } from '@/utils/tempUtils';
import FieldList from '@/components/layout/FieldList';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import DescriptionList from '@/components/layout/DescriptionList';
import Loading from '@/components/core/DataLoading';
import Title from '@/components/layout/Title';
import styles from './capa.less';

const DOMAIN = 'platCapaSetDetail';
const { Description } = DescriptionList;

@connect(({ loading, platCapaSetDetail }) => ({
  loading: loading.effects[`${DOMAIN}/query`],
  ...platCapaSetDetail,
}))
@mountToTab()
class CapaSetDetail extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const param = fromQs();
    dispatch({
      type: `${DOMAIN}/clean`,
    });
    if (param.id) {
      dispatch({
        type: `${DOMAIN}/query`,
        payload: param,
      });
    }
  }

  handleCancel = () => {
    closeThenGoto('/hr/capacity/set');
  };

  abilityName = value => (
    <>
      {value.map(item => (
        <div className={styles['detail-point-style']} key={item.id}>
          {item.text}
        </div>
      ))}
    </>
  );

  abilityType = value => (
    <>
      {value.map(item => (
        <div className={styles['detail-point-style']} key={item.id}>
          {item.capaTypeName}
        </div>
      ))}
    </>
  );

  abilityDesc = value => (
    <>
      {value.map(item => {
        const { dsc } = item;
        let dscShow = dsc;
        let longName = false;
        if (dsc && dsc.length > 20) {
          dscShow = dsc.substring(0, 20) + '...';
          longName = true;
        }
        const cpnComponents = longName ? (
          <Tooltip placement="top" title={<pre>{dsc}</pre>} key={item.id}>
            <div className={styles['detail-point-style']}>{dscShow}</div>
          </Tooltip>
        ) : (
          <div className={styles['detail-point-style']}>{dscShow}</div>
        );
        return cpnComponents;
      })}
    </>
  );

  render() {
    const {
      dispatch,
      detailForm = {},
      dataList,
      dataList2,
      loading,
      hasLevelFlagTablePropsList,
    } = this.props;

    const {
      id,
      capasetNo,
      levelId,
      hasLevelFlag,
      jobType1,
      jobType1Name,
      jobType2,
      jobType2Name,
      remark,
      capaSetLevelEntities,
      stringId,
      levelName,
      capasetStatusName,
      obtainMethodName,
      eqvaRatio,
      apprResName,
      ddesc,
      requestApply,
      across,
      applyStatus,
      applyStatusName,
      applyResName,
    } = detailForm;

    const tableDetailPropsHasLevelFlag = {
      rowKey: 'id',
      dataSource: hasLevelFlagTablePropsList,
      bordered: true,
      pagination: false,
      size: 'small',
      selectedRowKeys: null,
      columns: [
        {
          title: '级别',
          dataIndex: 'leveldName',
          key: 'leveldName',
          className: 'text-center',
          align: 'center',
        },
        {
          title: '获得方式',
          dataIndex: 'obtainMethodName',
          key: 'obtainMethodName',
          className: 'text-center',
          align: 'center',
        },
        {
          title: '当量系数',
          dataIndex: 'eqvaRatio',
          key: 'eqvaRatio',
          className: 'text-center',
          align: 'center',
        },
        {
          title: '能力描述',
          dataIndex: 'cdDesc',
          key: 'cdDesc',
          render: (value, row, key) => {
            let cdDescCom = <pre className={styles.cdDesc}>{value}</pre>;
            if (value && value.length > 20) {
              const newValue = value.substring(0, 20) + '...';
              cdDescCom = (
                <Tooltip placement="top" title={cdDescCom}>
                  <div className={styles['detail-point-style']}>{newValue}</div>
                </Tooltip>
              );
            }
            return cdDescCom;
          },
        },
        {
          title: '审核人',
          dataIndex: 'apprResName',
          key: 'apprResName',
          align: 'center',
          render: (value, row, index) => {
            const { levelFlag, obtainMethod, apprType, apprTypeName } = row;

            let appResName = value;
            if (levelFlag) {
              appResName = value + '及以上级别';
            }
            if (obtainMethod === 'AUTO') {
              appResName = '不需人工审核';
            }
            if (apprType === 'CAPA_ADMIN' || apprType === 'P_RES' || apprType === 'BU_PIC') {
              appResName = apprTypeName;
            }

            return appResName;
          },
        },
        {
          title: '单项能力',
          dataIndex: 'ability',
          key: 'abilityName',
          align: 'center',
          render: (value, row, index) => this.abilityName(value),
        },
        {
          title: '分类',
          dataIndex: 'ability',
          key: 'abilityType',
          align: 'center',
          render: (value, row, index) => this.abilityType(value),
        },
        {
          title: '单项能力描述',
          dataIndex: 'ability',
          key: 'abilityDesc',
          align: 'left',
          render: (value, row, index) => this.abilityDesc(value),
        },
      ],
    };

    const tableDetailPropsNoLevelFlag = {
      rowKey: 'id',
      dataSource: dataList2,
      bordered: true,
      pagination: false,
      size: 'small',
      selectedRowKeys: null,
      columns: [
        {
          title: '单项能力',
          dataIndex: 'text',
          key: 'text',
          align: 'center',
          width: 240,
        },
        {
          title: '分类',
          dataIndex: 'capaTypeName',
          key: 'capaTypeName',
          align: 'center',
          width: 240,
        },

        {
          title: '单项能力描述',
          dataIndex: 'dsc',
          width: 300,
          render: (value, row, key) => {
            let newValue = value;
            if (value && value.length > 50) {
              newValue = value.substring(0, 50) + '...';
            }
            return (
              <Tooltip title={<pre>{value}</pre>}>
                <div className={styles.dsc}>{newValue}</div>
              </Tooltip>
            );
          },
        },
      ],
    };

    return (
      <PageHeaderWrapper title="能力明细页">
        <Card className="tw-card-rightLine">
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        {loading ? (
          <Loading />
        ) : (
          <Card
            className="tw-card-adjust"
            bordered={false}
            title={
              <Title
                icon="profile"
                id="ui.menu.hr.capacity.capaSet.det"
                defaultMessage="复合能力详情"
              />
            }
          >
            <DescriptionList size="large" col={2}>
              <Description term="编号">{capasetNo}</Description>
              <Description term="复合能力">
                {[jobType1Name, jobType2Name].filter(Boolean).join('-')}
              </Description>
              <Description term="级别">{hasLevelFlag ? levelName : '无级别'}</Description>
              <Description term="状态">{capasetStatusName}</Description>
              <Description term="首次申请是否审批">
                {requestApply === 'YES' ? '是' : '否'}
              </Description>
              <Description term="首次申请审核人">
                {applyStatus === 'ASSIGN_RES' || applyStatus === 'BY_CAPASET'
                  ? applyResName
                  : applyStatusName}
              </Description>
              <Description term="是否可跨级别晋升">{across === 'YES' ? '是' : '否'}</Description>
              {!hasLevelFlag && (
                <Description term="获得方式">
                  <pre>{obtainMethodName}</pre>
                </Description>
              )}
              {!hasLevelFlag && (
                <Description term="当量系数">
                  <pre>{eqvaRatio}</pre>
                </Description>
              )}
              {/* {!hasLevelFlag ? (
                <Description term="审核人类型">
                  <pre>{detailForm.apprTypeName}</pre>
                </Description>
              ) : (
                ''
              )} */}
              {!hasLevelFlag && (
                <Description term="能力获取审核人">
                  {detailForm.apprTypeName !== '指定资源' && detailForm.apprTypeName !== '按能力'
                    ? detailForm.apprTypeName
                    : ''}
                  {apprResName}
                  {detailForm.levelFlag ? '及以上级别' : ''}
                </Description>
              )}
            </DescriptionList>
            {!hasLevelFlag && (
              <DescriptionList size="large" col="1">
                <Description term="能力描述" style={{ marginTop: '-16px' }}>
                  <pre>{ddesc}</pre>
                </Description>
              </DescriptionList>
            )}
            <Divider dashed />
            {hasLevelFlag && (
              <FieldList legend="级别定义" noReactive>
                <div className={styles['table-clear-padding']}>
                  <Table {...tableDetailPropsHasLevelFlag} />
                </div>
              </FieldList>
            )}
            {!hasLevelFlag && (
              <FieldList legend="能力构成" noReactive>
                <Table {...tableDetailPropsNoLevelFlag} />
              </FieldList>
            )}
          </Card>
        )}
      </PageHeaderWrapper>
    );
  }
}

export default CapaSetDetail;
