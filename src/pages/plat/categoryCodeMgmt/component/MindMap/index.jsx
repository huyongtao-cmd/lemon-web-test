/* eslint-disable */
import React, { Component } from 'react';
import { Row, Col, Tag } from 'antd';
import $ from 'jquery';
import styles from './index.less';
import { type } from 'ramda';

// 数据结构
const ScriptManageObj = [
  {
    id: 1,
    name: 'A1A1A1A1A1A1A1A1A1A1',
    list: [
      {
        id: 11,
        name: 'B1',
        list: [
          {
            id: 111,
            name: 'C1',
            list: [
              {
                id: 111,
                name: 'D3',
                list: [],
              },
              {
                id: 111,
                name: 'D4',
                list: [],
              },
            ],
          },
        ],
      },
      {
        id: 12,
        name: 'B2',
        list: [
          {
            id: 121,
            name: 'C2',
            list: [
              {
                id: 111,
                name: 'D3',
                list: [
                  {
                    id: 111,
                    name: 'C1',
                    list: [
                      {
                        id: 111,
                        name: 'D3',
                        list: [],
                      },
                      {
                        id: 111,
                        name: 'D4',
                        list: [
                          {
                            id: 111,
                            name: 'C1',
                            list: [
                              {
                                id: 111,
                                name: 'D3',
                                list: [],
                              },
                              {
                                id: 111,
                                name: 'D4',
                                list: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                id: 111,
                name: 'D4',
                list: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

class MindMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: '<div class="table">',
      selectedNodekey: null,
    };
  }

  componentDidMount() {
    this.setState(
      {
        table: this.createNode(0, ScriptManageObj),
      },
      () => {
        this.bindClick();
      }
    );
  }

  bindClick = () => {
    const _this = this;
    $(function() {
      $('.node').on('click', function(e) {
        _this.setState(
          {
            selectedNodekey: $(this).attr('title'),
            table: '<div class="table">',
          },
          () => {
            _this.setState(
              {
                table: _this.createNode(0, ScriptManageObj),
              },
              () => {
                _this.bindClick();
              }
            );
            const { onChange } = _this.props;
            type(onChange) === 'Function' && onChange($(this).attr('title'));
          }
        );
      });
    });
  };

  createNode = (rowSpanNumber, obj) => {
    let { table } = this.state;
    const { selectedNodekey } = this.state;
    obj.forEach(item => {
      table += '<div class="tr">';
      if (obj.length > 1) {
        table += '<div class="tr_children"></div>';
      }
      table += '<div class="text-header">';
      if (rowSpanNumber === 1) {
        // 判断前面的横线要不要
        table += '<div class="before"></div>';
      }

      const nodeClass = item.name === selectedNodekey ? 'nodeActive' : 'node';
      table += '<div class="' + nodeClass + '" title=' + item.name + '>' + item.name + '</div>';

      if (item.list && item.list.length !== 0) {
        // 判断后面的横线要不要
        table += '<div class="after"></div>';
      }
      table += '</div>';
      if (item.list && item.list.length !== 0) {
        table += '<div class="content">';
        table += this.createNode(1, item.list); // 回调
        table += '</div>';
      }
      table += '</div>';
    });
    table += '</div>';
    return table;
  };

  render() {
    const { table } = this.state;

    return (
      <div style={{ margin: '20px' }}>
        <Row gutter={12} type="flex" align="middle">
          <Col span={4} style={{ marginTop: '-20px' }}>
            <Tag color="#2db7f5">上级：合作组织推介</Tag>
          </Col>
          <Col span={20}>
            <div className={styles.mindMap} dangerouslySetInnerHTML={{ __html: table }} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default MindMap;
