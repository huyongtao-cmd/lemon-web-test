import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Card, Button, Input, Modal, Row, Col, Divider, Table } from 'antd';

import { mountToTab, closeThenGoto } from '@/layouts/routerControl';

import styles from './course.less';

@mountToTab()
class CourseDetail extends PureComponent {
  componentDidMount() {}

  render() {
    const { dispatch, loading, visible = false, onToggle, courseDetail = {} } = this.props;
    const {
      progCourseList = [],
      progName,
      progCount,
      totalHours,
      totalCredit,
      progDesc,
      sortLockedFlag,
      learnObj,
    } = courseDetail;
    const tableProps = {
      sortBy: 'id',
      rowKey: 'id',
      sortDirection: 'DESC',
      loading: false,
      dataSource: progCourseList || [],
      pagination: false,
      bordered: true,
      columns: [
        {
          title: 'NO.',
          dataIndex: 'sortNo',
          key: 'sortNo',
          align: 'center',
        },
        {
          title: '课程',
          dataIndex: 'courseName',
          key: 'courseName',
          align: 'center',
        },
        {
          title: '学时',
          dataIndex: 'classHour',
          key: 'classHour',
          align: 'center',
        },
        {
          title: '学分',
          dataIndex: 'credit',
          key: 'credit',
          align: 'center',
        },
        {
          title: '必修/选修',
          dataIndex: 'trnRequirementName',
          key: 'trnRequirementName',
          align: 'center',
        },
      ],
    };

    return (
      <Modal
        destroyOnClose
        title="培训项目详情"
        visible={visible}
        // onOk={this.handleSave}
        onCancel={onToggle}
        width="66%"
        footer={null}
        bodyStyle={{ padding: '10px 30px 30px' }}
      >
        <div className={styles['course-info']}>
          <div className={styles['course-name']}>{progName}</div>
          <div className={styles['course-data']}>
            <div className={styles['course-data-line']}>
              <div className={styles['course-data-row']}>
                &nbsp;&nbsp;&nbsp;&nbsp;课程数&nbsp;&nbsp;&nbsp;&nbsp;
                <span>{progCount}</span>
              </div>
              <div className={styles['course-data-row']}>
                总课时&nbsp;&nbsp;&nbsp;&nbsp;
                <span>{totalHours}</span>
              </div>
              <div className={styles['course-data-row']}>
                总学分&nbsp;&nbsp;&nbsp;&nbsp;
                <span>{totalCredit}</span>
              </div>
              <div>
                锁定课程顺序&nbsp;&nbsp;&nbsp;&nbsp;
                <span>{sortLockedFlag === 'Y' ? '是' : '否'}</span>
              </div>
            </div>
            <div className={styles['course-data-line']}>
              <div>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;简介&nbsp;&nbsp;&nbsp;&nbsp;
              </div>
              <div>
                <pre>{progDesc}</pre>
              </div>
            </div>
            <div className={styles['course-data-line']}>
              <div>学习目标&nbsp;&nbsp;&nbsp;&nbsp;</div>
              <div>
                <pre>{learnObj}</pre>
              </div>
            </div>
          </div>
        </div>
        <Divider dashed className={styles['course-line']} />
        <div className={styles['course-name']}>课程</div>
        <Table {...tableProps} />
      </Modal>
    );
  }
}

export default CourseDetail;
