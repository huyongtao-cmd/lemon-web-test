import React, { Component } from 'react';
import { connect } from 'dva';
import { List, Avatar, Icon, Input, Row, Col, Button, Card } from 'antd';
import createMessage from '@/components/core/AlertMessage';
import { equals, isNil, isEmpty, type } from 'ramda';

import styles from '../style.less';

// eslint-disable-next-line no-shadow
const IconText = ({ type, text, theme, onClick }) => (
  <span>
    <Icon type={type} theme={theme} onClick={onClick} style={{ marginRight: 8 }} />
    {text}
  </span>
);

const defaultPagination = {
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '50', '100', '300'],
  showTotal: total => `共 ${total} 条`,
  pageSize: 3,
  defaultCurrent: 1,
  size: 'default',
  hideOnSinglePage: true,
};

const DOMAIN = 'targetMgmt';

@connect(({ loading }) => ({
  loading:
    loading.effects[`${DOMAIN}/commentLike`] || loading.effects[`${DOMAIN}/commentSelectDetail`],
}))
class CommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listData: Array.isArray(props.listData) ? props.listData : [],
      like: props.like ? props.like : null,
      childrenComment: '',
      unfold: null,
    };
  }

  componentDidMount() {
    this.setState({
      unfold: null,
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      setTimeout(() => {
        this.setState({ listData: snapshot, childrenComment: null });
        const { unfold } = this.state;
        if (unfold) {
          this.onCellChanged(unfold);
        }
      }, 0);
    }
  }

  getSnapshotBeforeUpdate(prevProps, prevState, snapshot) {
    const { listData } = this.props;
    if (!equals(prevState.listData, listData)) {
      return Array.isArray(listData) ? listData : [];
    }
    return null;
  }

  // 行编辑触发事件
  onCellChanged = id => {
    const { listData } = this.state;

    // 点击的评论展开回复信息;
    const tt = listData.filter(v => v.id === id);
    if (isEmpty(tt)) {
      return;
    }
    tt[0].commentChildrenListFlag = !tt[0].commentChildrenListFlag;
    this.setState({
      unfold: tt[0].id,
    });
    const newListData = listData.map(v => {
      if (v.id === id) {
        return tt[0];
      }
      return v;
    });

    // 将其他展开的评论全部收起
    listData.forEach(v => {
      if (v.commentChildrenListFlag && v.id !== id) {
        // eslint-disable-next-line no-param-reassign
        v.commentChildrenListFlag = false;
      }
    });

    // 更新数据
    this.setState({
      listData: newListData,
      childrenComment: '',
    });
  };

  commentLike = (v, index) => {
    const { onLikeChange } = this.props;
    type(onLikeChange) === 'Function' && onLikeChange(v, index);
  };

  commentSubmit = (item, childrenComment, index) => {
    const { commentSubmit } = this.props;
    type(commentSubmit) === 'Function' && commentSubmit(item, childrenComment, index);
  };

  render() {
    const { listData, like, childrenComment } = this.state;
    const { loading } = this.props;
    return (
      <List
        style={{ maxHeight: '300px', overflowY: 'scroll' }}
        className={styles.commentContent}
        itemLayout="vertical"
        size="large"
        pagination={defaultPagination}
        dataSource={listData}
        renderItem={(item, index) => (
          <>
            <List.Item
              key={item.title}
              actions={
                like
                  ? [
                      // eslint-disable-next-line react/jsx-indent
                      <IconText
                        type="like"
                        theme={item.likeResultFlag === 'true' ? 'filled' : 'outlined'}
                        text={item.commentCount || 0}
                        key="list-vertical-like-filled"
                        onClick={e => {
                          loading
                            ? createMessage({ type: 'warn', description: '请等待上一次操作完成！' })
                            : this.commentLike(item);
                        }}
                        disabled={loading}
                      />,
                      !item.commentChildrenListFlag ? (
                        <a
                          // eslint-disable-next-line no-script-url
                          href="javascript:void(0)"
                          onClick={() => {
                            this.onCellChanged(item.id);
                          }}
                        >
                          回复
                          {item.children.length ? `(${item.children.length})` : ''}
                        </a>
                      ) : (
                        <a
                          // eslint-disable-next-line no-script-url
                          href="javascript:void(0)"
                          onClick={() => {
                            this.onCellChanged(item.id);
                          }}
                        >
                          收起回复
                        </a>
                      ),
                    ]
                  : [
                      !item.commentChildrenListFlag ? (
                        <a
                          // eslint-disable-next-line no-script-url
                          href="javascript:void(0)"
                          onClick={() => {
                            this.onCellChanged(item.id);
                          }}
                        >
                          回复
                          {item.children.length ? `(${item.children.length})` : ''}
                        </a>
                      ) : (
                        <a
                          // eslint-disable-next-line no-script-url
                          href="javascript:void(0)"
                          onClick={() => {
                            this.onCellChanged(item.id);
                          }}
                        >
                          收起回复
                        </a>
                      ),
                    ]
              }
            >
              <List.Item.Meta
                avatar={<Avatar size="large" icon="user" />}
                title={
                  <span>
                    <span>{item.resName || ''}</span>
                    &nbsp;
                    {item.objectTopFlag === '0' ? (
                      <span
                        style={{
                          display: 'inline-block',
                          width: '35px',
                          height: '35px',
                          backgroundColor: 'red',
                          color: 'white',
                          fontSize: '12px',
                          textAlign: 'center',
                          lineHeight: '35px',
                          borderRadius: '50%',
                        }}
                      >
                        辅导
                      </span>
                    ) : (
                      ''
                    )}
                  </span>
                }
                description={item.objectDate || ''}
              />
              <span
                title={item.objectComment || ''}
                style={{
                  fontSize: '18px',
                  color: '#000',
                  wordBreak: 'break-all',
                  whiteSpace: 'normal',
                  // overflow: 'hidden',
                  // textOverflow: 'ellipsis',
                  // width: '340px',
                  // display: 'block',
                }}
              >
                {item.objectComment || ''}
              </span>
            </List.Item>
            {item.commentChildrenListFlag ? (
              <>
                <List
                  className={styles.commentChildren}
                  // style={{ paddingRight: '10px' }}
                  itemLayout="vertical"
                  size="large"
                  pagination={item.children.length > 3 ? defaultPagination : false}
                  dataSource={item.children}
                  locale={{ emptyText: null }}
                  renderItem={items => (
                    <List.Item key={items.title}>
                      <List.Item.Meta
                        avatar={
                          <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                          // <Avatar src={items.avatar} />
                        }
                        title={
                          <span
                            style={{
                              wordBreak: 'break-all',
                              whiteSpace: 'normal',
                            }}
                          >
                            {`${items.resName}：${items.objectComment}`}
                          </span>
                        }
                        description={items.objectDate || ''}
                      />
                    </List.Item>
                  )}
                />
                <br />
                <Card
                  style={{ marginLeft: '50px' }}
                  bordered={false}
                  bodyStyle={{ padding: 0, paddingRight: '10px' }}
                >
                  <Input.TextArea
                    value={childrenComment}
                    onChange={e => {
                      this.setState({
                        childrenComment: e.target.value,
                      });
                    }}
                    style={{ marginBottom: '5px' }}
                    rows={3}
                  />
                  <div style={{ float: 'right' }}>
                    <span>
                      <Button
                        onClick={e => this.setState({ childrenComment: '' })}
                        className="tw-btn-error"
                      >
                        取消
                      </Button>
                    </span>
                    &nbsp; &nbsp;
                    <span>
                      <Button
                        onClick={e => {
                          if (!childrenComment) {
                            createMessage({
                              type: 'warn',
                              description: '评论内容不能为空！',
                            });
                            return;
                          }
                          this.commentSubmit(item, childrenComment, index);
                        }}
                        className="tw-btn-primary"
                        disabled={!childrenComment}
                      >
                        确认
                      </Button>
                    </span>
                  </div>
                </Card>
              </>
            ) : null}
          </>
        )}
      />
    );
  }
}

export default CommentList;
