import React, { Component } from 'react';
import { Button, Card, Table } from 'antd';
import Title from '@/components/layout/Title';
import { connect } from 'dva';
import conf from '../../common/detailTableConf';
import styles from './JDEWageExport.less';
import { toQs, toUrl } from '@/utils/stringUtils';
import DataTable from '@/components/common/DataTable';

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  defaultPageSize: 10,
  defaultCurrent: 1,
  size: 'default',
};

const DOMAIN = 'wageCostMainPage';
@connect(({ loading, wageCostMainPage }) => ({
  loading,
  ...wageCostMainPage,
}))
class JDEWageExport extends Component {
  JdeExport = () => {
    const { mainDataId } = this.props;
    // eslint-disable-next-line no-restricted-globals
    location.href = toQs(`${SERVER_URL}/api/worth/v1/salCost/jdeExcel/export`, { id: mainDataId });
  };

  render() {
    const { loading, detailList, mainDataId } = this.props;
    return (
      <Card
        className="tw-card-adjust"
        headStyle={{ background: '#fff' }}
        bodyStyle={{ padding: '0px' }}
        bordered={false}
      >
        <div className={styles.orderDetail}>
          <div className={styles.detailTable}>
            <div className={styles.detailButton}>
              <Button
                className={['tw-btn-primary', `${styles.buttonLeft}`]}
                size="large"
                disabled={false}
                onClick={() => this.JdeExport()}
              >
                <Title
                  id="ui.menu.plat.expense.wageCost.JDEWageExport.exportBtn"
                  defaultMessage="JDE工资导出"
                />
              </Button>
            </div>
          </div>
          <DataTable
            enableSelection={false}
            showSearch={false}
            // bordered
            // pagination={defaultPagination}
            loading={loading.effects[`platResProfileCapa/query`]}
            dataSource={detailList}
            total={detailList.length}
            scroll={{ x: 5700 }}
            columns={conf()}
            searchBarForm={[]}
            rowKey={(record, index) => `${index}`}
            // expandedRowRender={this.expandedRowRender}
          />
        </div>
      </Card>
    );
  }
}

export default JDEWageExport;
