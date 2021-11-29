/* eslint-disable */
import React from 'react';
import router from 'umi/router';
import { Card, Button, Row } from 'antd';
import { fromQs } from '@/utils/stringUtils';
import classnames from 'classnames';
import DocumentTitle from 'react-document-title';
import {
  queryProjDaysEqvaMonthly,
  queryProjReim,
  queryProjDaysEqvaDaily,
  queryProjReimDetail,
  queryProjTimeSheetDetail,
  queryProjPurchaseContractDetail,
} from '@/services/user/project/project';
import PageHeaderWrapper from '@/components/layout/PageHeaderWrapper';

/**
 * 【人天当量统计表】：ProjDaysEqvaMonthly
 * 【费用统计表】：ProjReim
 * 【费用人天分析表】：ProjDaysEqvaDaily
 * 【费用明细表】：ProjReimDetail
 * 【工时明细表】：ProjTimeSheetDetail
 * 【采购合同明细表】：ProjPurchaseContractDetail
 */

// 动态设置iframe高度
const h = document.documentElement.clientHeight || document.body.clientHeight;
const height = h - 50 - 35 - 36;

class ReportViewer extends React.PureComponent {
  state = {
    title: '',
    url: '',
  };

  componentDidMount() {
    // 取出localStorage的数据并立即删除localStorage
    const reportParms = window.sessionStorage.getItem('reportParms');
    const reportParmObj = JSON.parse(reportParms);
    const { reportUrl = '' } = reportParmObj;
    // 替换请求中url的参数中的ID
    const { id } = fromQs();
    const url = reportUrl.replace('#projID#', id);
    this.setState({
      url,
    });
  }

  render() {
    const { url } = this.state;

    return (
      <PageHeaderWrapper>
        <Card
          className="tw-card-rightLine-more"
          title={
            <>
              <Button
                className="tw-btn-primary"
                size="large"
                onClick={() => {
                  queryProjDaysEqvaMonthly().then(resp => {
                    const { datum } = resp.response;
                    const { id } = fromQs();
                    window.sessionStorage.setItem(
                      'projDaysEqvaMonthly',
                      JSON.stringify({
                        ...datum,
                        reportUrl: datum.reportUrl.replace('#projID#', id),
                      })
                    );
                    router.push(`/user/project/projectWaitAuth?id=${id}&type=projDaysEqvaMonthly`);
                  });
                }}
              >
                人天当量统计表
              </Button>

              <Button
                className="tw-btn-primary"
                size="large"
                onClick={() => {
                  queryProjReim().then(resp => {
                    const { datum } = resp.response;
                    const { id } = fromQs();
                    window.sessionStorage.setItem(
                      'projReim',
                      JSON.stringify({
                        ...datum,
                        reportUrl: datum.reportUrl.replace('#projID#', id),
                      })
                    );
                    router.push(`/user/project/projectWaitAuth?id=${id}&type=projReim`);
                  });
                }}
              >
                费用统计表
              </Button>

              <Button
                className="tw-btn-primary"
                size="large"
                onClick={() => {
                  queryProjDaysEqvaDaily().then(resp => {
                    const { datum } = resp.response;
                    const { id } = fromQs();
                    window.sessionStorage.setItem(
                      'projDaysEqvaDaily',
                      JSON.stringify({
                        ...datum,
                        reportUrl: datum.reportUrl.replace('#projID#', id),
                      })
                    );
                    router.push(`/user/project/projectWaitAuth?id=${id}&type=projDaysEqvaDaily`);
                  });
                }}
              >
                费用人天分析表
              </Button>

              <Button
                className="tw-btn-primary"
                size="large"
                onClick={() => {
                  queryProjReimDetail().then(resp => {
                    const { datum } = resp.response;
                    const { id } = fromQs();
                    window.sessionStorage.setItem(
                      'projReimDetail',
                      JSON.stringify({
                        ...datum,
                        reportUrl: datum.reportUrl.replace('#projID#', id),
                      })
                    );
                    router.push(`/user/project/projectWaitAuth?id=${id}&type=projReimDetail`);
                  });
                }}
              >
                费用明细表
              </Button>

              <Button
                className="tw-btn-primary"
                size="large"
                onClick={() => {
                  queryProjTimeSheetDetail().then(resp => {
                    const { datum } = resp.response;
                    const { id } = fromQs();
                    window.sessionStorage.setItem(
                      'projTimeSheetDetail',
                      JSON.stringify({
                        ...datum,
                        reportUrl: datum.reportUrl.replace('#projID#', id),
                      })
                    );
                    router.push(`/user/project/projectWaitAuth?id=${id}&type=projTimeSheetDetail`);
                  });
                }}
              >
                工时明细表
              </Button>

              <Button
                className="tw-btn-primary"
                size="large"
                onClick={() => {
                  queryProjPurchaseContractDetail().then(resp => {
                    const { datum } = resp.response;
                    const { id } = fromQs();
                    window.sessionStorage.setItem(
                      'projPurchaseContractDetail',
                      JSON.stringify({
                        ...datum,
                        reportUrl: datum.reportUrl.replace('#projID#', id),
                      })
                    );
                    router.push(
                      `/user/project/projectWaitAuth?id=${id}&type=projPurchaseContractDetail`
                    );
                  });
                }}
              >
                采购合同明细表
              </Button>
            </>
          }
        />
        <div
          style={{
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <iframe src={url} style={{ width: '100%', height }} frameBorder="0" />
        </div>
      </PageHeaderWrapper>
    );
  }
}

export default ReportViewer;
