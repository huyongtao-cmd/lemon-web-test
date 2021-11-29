import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import { isNil, isEmpty } from 'ramda';
import { Button, Card, Radio, Row, Col, DatePicker, Table, Tooltip, Checkbox } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import { mountToTab, closeThenGoto } from '@/layouts/routerControl';
import FieldList from '@/components/layout/FieldList';
import Title from '@/components/layout/Title';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';
import { formatMessage } from 'umi/locale';
import { FileManagerEnhance, Selection, YearPicker } from '@/pages/gen/field';
import createMessage from '@/components/core/AlertMessage';
import { selectUserMultiCol } from '@/services/user/Contract/sales';
import SelectWithCols from '@/components/common/SelectWithCols';
import Loading from '@/components/core/DataLoading';
import styles from './index.less';

const { Field, FieldLine } = FieldList;
const RadioGroup = Radio.Group;
const DOMAIN = 'platCapaDoubleCheck';

@connect(({ platCapaDoubleCheck }) => ({
  platCapaDoubleCheck,
}))
class DoubleCheckLaunch extends PureComponent {
  componentDidMount() {
    const { id } = fromQs();
    const { dispatch } = this.props;
    dispatch({
      type: `${DOMAIN}/queryDoubleCheckDetail`,
      payload: {
        id,
      },
    });
  }

  handleCancel = () => {
    // TODO
  };

  handleSave = () => {
    const {
      dispatch,
      platCapaDoubleCheck: { doubleCheckDetail = {}, capaSetleveldName = [] },
    } = this.props;
    const { endDate } = doubleCheckDetail;
    const { hasLevelFlag } = fromQs();
    if (!endDate) {
      createMessage({ type: 'error', description: '请填写复核截止日期' });
      return;
    }
    let haveSomechecked = false;
    for (let i = 0; i < capaSetleveldName.length; i += 1) {
      const { isToCheck } = capaSetleveldName[i];
      if (isToCheck === 'YES') {
        haveSomechecked = true;
      }
    }

    if (!haveSomechecked) {
      createMessage({ type: 'error', description: '至少要勾选一个单项能力' });
      return;
    }

    dispatch({
      type: `${DOMAIN}/saveDoubleCheckHandle`,
      payload: {
        ...doubleCheckDetail,
        capaSetleveldName,
        hasLevelFlag: hasLevelFlag === 'YES',
      },
    });
  };

  dateOnChange = (date, dateString) => {
    const {
      dispatch,
      platCapaDoubleCheck: { doubleCheckDetail = {} },
    } = this.props;
    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: {
        doubleCheckDetail: {
          ...doubleCheckDetail,
          endDate: dateString,
        },
      },
    });
  };

  checkpointName = value => (
    <>
      {value.map(item => (
        <div className={styles['detail-point-style']} key={item.id}>
          {item.capaName}
        </div>
      ))}
    </>
  );

  checkpointMode = value => (
    <>
      {value.map(item => (
        <div className={styles['detail-point-style']} key={item.id}>
          {item.capaType}
        </div>
      ))}
    </>
  );

  checkBoxPoint = (value, id) => {
    const {
      dispatch,
      platCapaDoubleCheck: { doubleCheckDetail = {}, capaSetleveldName = [] },
    } = this.props;
    return (
      <>
        {value.map(item => (
          <div className={styles['detail-point-style']} key={item.id}>
            <Checkbox
              checked={item.isToCheck === 'YES'}
              onChange={e => {
                const newCapaLevelNameList = capaSetleveldName.map(capaItem => {
                  const newCapaItem = Object.assign({}, capaItem);
                  const { capaSetlevelTypeName = [] } = capaItem;
                  if (capaItem.id === id) {
                    const newCapaLevelAbilityList = capaSetlevelTypeName.map(clalItem => {
                      const newClalItem = Object.assign({}, clalItem);
                      if (newClalItem.id === item.id) {
                        newClalItem.isToCheck = e.target.checked ? 'YES' : 'NO';
                      }
                      return newClalItem;
                    });
                    newCapaItem.capaSetlevelTypeName = newCapaLevelAbilityList;
                    newCapaItem.isToCheck = e.target.checked ? 'YES' : 'NO';
                  }

                  return newCapaItem;
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    capaSetleveldName: newCapaLevelNameList,
                  },
                });
              }}
            />
          </div>
        ))}
      </>
    );
  };

  render() {
    const {
      dispatch,
      platCapaDoubleCheck: { doubleCheckDetail = {}, capaSetleveldName = [] },
    } = this.props;
    const { jobType } = doubleCheckDetail;
    const { pageType, hasLevelFlag } = fromQs();
    let pointChecked = true;
    const levelChecked = capaSetleveldName.every(item => item.isToCheck === 'YES');

    for (let i = 0; i < capaSetleveldName.length; i += 1) {
      const { capaSetlevelTypeName = [] } = capaSetleveldName[i];
      if (!capaSetlevelTypeName.every(clalItem => clalItem.isToCheck === 'YES')) {
        pointChecked = false;
      }
    }

    const isAllChecked = pointChecked && levelChecked;
    const columnsLeveldName =
      hasLevelFlag === 'YES'
        ? [
            {
              title: '级别',
              dataIndex: 'leveldName',
              key: 'leveldName',
              align: 'center',
            },
          ]
        : [];

    const tablePropsNoLevelFlag = {
      rowKey: 'id',
      bordered: true,
      pagination: false,
      size: 'small',
      selectedRowKeys: null,
      dataSource: capaSetleveldName || [],
      columns: [
        ...columnsLeveldName,

        {
          title: '单项能力',
          dataIndex: 'capaSetlevelTypeName',
          key: 'checkpointName',
          align: 'center',
          width: 500,
          render: (value, row, index) => this.checkpointName(value),
        },
        {
          title: '分类',
          dataIndex: 'capaSetlevelTypeName',
          key: 'checkpointMode',
          align: 'center',
          render: (value, row, index) => this.checkpointMode(value),
        },
        {
          title: (sortOrder, sortColumn, filters) => (
            <Checkbox
              checked={isAllChecked}
              onClick={e => {
                const newCapaLevelNameList = capaSetleveldName.map(capaItem => {
                  const newCapaItem = Object.assign({}, capaItem);
                  const { capaSetlevelTypeName = [] } = capaItem;
                  const newCapaLevelAbilityList = capaSetlevelTypeName.map(clalItem => {
                    const newClalItem = Object.assign({}, clalItem);
                    newClalItem.isToCheck = e.target.checked ? 'YES' : 'NO';
                    return newClalItem;
                  });
                  newCapaItem.isToCheck = e.target.checked ? 'YES' : 'NO';
                  newCapaItem.capaSetlevelTypeName = newCapaLevelAbilityList;
                  return newCapaItem;
                });
                dispatch({
                  type: `${DOMAIN}/updateState`,
                  payload: {
                    capaSetleveldName: newCapaLevelNameList,
                  },
                });
              }}
            />
          ),
          dataIndex: 'capaSetlevelTypeName',
          key: 'checkBoxPoint',
          align: 'center',
          render: (value, row, index) => this.checkBoxPoint(value, row.id),
        },
      ],
    };

    return (
      <PageHeaderWrapper title="复核确认">
        <Card className="tw-card-rightLine">
          <Button
            className="tw-btn-primary"
            type="primary"
            size="large"
            onClick={() => this.handleSave()}
          >
            发起复核
          </Button>
          <Button
            className={classnames('separate', 'tw-btn-default')}
            icon="undo"
            size="large"
            onClick={this.handleCancel()}
          >
            {formatMessage({ id: `misc.rtn`, desc: '返回' })}
          </Button>
        </Card>
        <Card
          title={<Title icon="profile" id="复核确认" defaultMessage="复核确认" />}
          className="tw-card-adjust"
          bordered={false}
        >
          <Row>
            <Col span={6}>
              复合能力&nbsp;&nbsp;&nbsp;&nbsp;
              <span className={styles['capa-name']}>{jobType}</span>
            </Col>
            <Col span={10}>
              复核截止日期&nbsp;&nbsp;&nbsp;&nbsp;
              <DatePicker onChange={this.dateOnChange} />
            </Col>
          </Row>
          <div className={styles['capa-table-wrap']}>
            <div className={styles['capa-title']}>请勾选需要复核的考核点</div>
            <div className={styles['table-clear-padding']}>
              <Table {...tablePropsNoLevelFlag} />
            </div>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default DoubleCheckLaunch;
