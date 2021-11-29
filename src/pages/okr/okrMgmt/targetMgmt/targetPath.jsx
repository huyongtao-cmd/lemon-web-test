/* eslint-disable*/
import React, { PureComponent } from 'react';
import router from 'umi/router';
import G6 from '@antv/g6';
import { Spin } from 'antd';
import { connect } from 'dva';
import { markAsNoTab } from '@/layouts/routerControl';
import { fromQs } from '@/utils/stringUtils';
import { div, add } from '@/utils/mathUtils';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import styles from './style.less';
import companySvg from './img/company.svg';
import user from './img/user.svg';
import calendar from './img/calendar.svg';
import priority from './img/priority.svg';

// 对字符串超长做处理
const fittingString = (str = '', MaxNum) => {
  const strLen = str.replace(/[^\x00-\xff]/g, '01').length;
  if (div(strLen, 2) > MaxNum) {
    return `${str.substring(0, MaxNum)}...`;
  }
  return str;
};

// 节点参数配置
const ERROR_COLOR = '#F5222D';
const getNodeConfig = (node, type) => {
  if (node.nodeError) {
    return {
      basicColor: ERROR_COLOR,
      fontColor: '#FFF',
      borderColor: ERROR_COLOR,
      bgColor: '#E66A6C',
    };
  }
  let config = {
    x: -240,
    y: -120,
    width: 240,
    height: 120,
    fill: '#fff',
    radius: 4,
    stroke: '#b8b5b5',
    shadowColor: '#b8b5b5',
    shadowBlur: 10,
  };
  switch (type) {
    case 'workPlan': {
      config = {
        x: -240,
        y: -110,
        width: 240,
        height: 100,
        fill: '#D5FEFE',
        radius: 4,
        stroke: '#b8b5b5',
        shadowColor: '#b8b5b5',
        shadowBlur: 10,
      };
      break;
    }
    case 'timeWorkPlan': {
      config = {
        x: -280,
        y: -80,
        width: 280,
        height: 40,
        fill: '#E4E4E4',
        radius: 4,
        stroke: '#b8b5b5',
        shadowColor: '#b8b5b5',
        shadowBlur: 10,
      };
      break;
    }
    default:
      break;
  }
  return config;
};

// 节点公共配置
const nodeBasicMethod = {
  createNodeBox: (group, config) => {
    /* 最外面的大矩形 */
    const container = group.addShape('rect', {
      attrs: {
        x: config.x,
        y: config.y,
        width: config.width,
        height: config.height,
        fill: config.fill,
        stroke: config.stroke,
        radius: config.radius,
        cursor: config.cursor || 'default',
      },
    });
    return container;
  },
  /* 生成树上的 marker */
  createNodeMarker: (group, config, collapsed) => {
    group.addShape('circle', {
      attrs: {
        x: 6,
        y: add(-div(config.height, 2), add(config.y, config.height)),
        r: 13,
        fill: 'rgba(47, 84, 235, 0.05)',
        opacity: 0,
        zIndex: -2,
      },
      className: 'collapse-icon-bg',
    });
    group.addShape('marker', {
      attrs: {
        x: 6,
        y: add(-div(config.height, 2), add(config.y, config.height)),
        radius: 7,
        symbol: collapsed ? EXPAND_ICON : COLLAPSE_ICON,
        stroke: '#666',
        lineWidth: 1,
        fill: '#fff',
        cursor: 'pointer',
      },
      className: 'collapse-icon',
    });
  },
  afterDraw: function afterDraw(cfg, group) {
    /* 操作 marker 的背景色显示隐藏 */
    const icon = group.findByClassName('collapse-icon');
    if (icon) {
      const bg = group.findByClassName('collapse-icon-bg');
      icon.on('mouseenter', function() {
        bg.attr('opacity', 1);
        graph.get('canvas').draw();
      });
      icon.on('mouseleave', function() {
        bg.attr('opacity', 0);
        graph.get('canvas').draw();
      });
    }

    const objectClickDom = group.findByClassName('click-objectDom');

    if (objectClickDom) {
      objectClickDom.on('mouseenter', () => {
        objectClickDom.attr('fill', '#333');
        graph.get('canvas').draw();
      });
      objectClickDom.on('mouseleave', () => {
        objectClickDom.attr('fill', '#333');
        graph.get('canvas').draw();
      });
      objectClickDom.on('click', (item, index) => {
        const urls = getUrl();
        const from = stringify({ from: markAsNoTab(urls) });
        router.push(`/okr/okrMgmt/targetMgmt/view?id=${cfg.objectId}&${from}`);
      });
    }
  },
};

// 展开收起图标
const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
  return [
    ['M', x - r, y],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
    ['M', x - r + 4, y],
    ['L', x - r + 2 * r - 4, y],
  ];
};
const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
  return [
    ['M', x - r, y],
    ['a', r, r, 0, 1, 0, r * 2, 0],
    ['a', r, r, 0, 1, 0, -r * 2, 0],
    ['M', x - r + 4, y],
    ['L', x - r + 2 * r - 4, y],
    ['M', x - r + r, y - r + 4],
    ['L', x, y + r - 4],
  ];
};

const DOMAIN = 'targetMgmt';

@connect(({ loading, targetMgmt, dispatch }) => ({
  targetMgmt,
  dispatch,
  loading,
}))
class TargetPath extends PureComponent {
  componentDidMount() {
    const { dispatch } = this.props;
    const { objectId } = fromQs();
    dispatch({ type: `${DOMAIN}/targetPathMap`, payload: { objectId } }).then(res => {
      // 获取容器宽高，用于设置画布宽高
      const CANVAS_WIDTH = document.getElementById('mountNode').scrollWidth;
      const CANVAS_HEIGHT = document.getElementById('mountNode').scrollHeight;

      let selectedItem;
      const graph = new G6.TreeGraph({
        container: 'mountNode',
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        renderer: 'svg',
        fitViewPadding: [0, 40],
        // zoom: 0.1,
        modes: {
          default: [
            {
              type: 'collapse-expand',
              shouldUpdate: e => {
                /* 点击 node 禁止展开收缩 */
                if (e.target.get('className') !== 'collapse-icon') {
                  return false;
                }
                return true;
              },
              onChange: (item, collapsed) => {
                selectedItem = item;
                const data = item.get('model');
                const icon = item.get('group').findByClassName('collapse-icon');
                if (collapsed) {
                  icon.attr('symbol', EXPAND_ICON);
                } else {
                  icon.attr('symbol', COLLAPSE_ICON);
                }
                data.collapsed = collapsed;
                return true;
              },
              animate: {
                callback: () => {
                  // focusItem(item) 将元素移动到视口中心，该方法可用于做搜索后的缓动动画。
                  graph.focusItem(selectedItem);
                },
              },
            },
            {
              type: 'tooltip',
              formatText: data => {
                const type =
                  data.objectId && !data.workPlanId && !data.timeWorkPlanId
                    ? 'object'
                    : data.workPlanId
                      ? 'workPlan'
                      : 'timeWorkPlan';
                if (type === 'object') {
                  return `<span style='font-size:20px;font-weight:bolder;'>${data.objectiveName ||
                    ''}</span><br/><span style='font-size:16px;'>${data.objectiveSubjectName ||
                    ''}</span><br/><span style='font-size:16px;'>${data.objectiveResName ||
                    ''}</span>`;
                } else if (type === 'workPlan') {
                  return `<span style='font-size:20px;font-weight:bolder;'>${data.planNo || ''} - ${
                    data.taskName
                  } - ${
                    data.planStatusName
                  }</span><br/><span style='font-size:16px;'>${data.dateFrom ||
                    ''} ~ ${data.dateTo ||
                    ''}</span><br/><span style='font-size:16px;'>${data.priority || ''}</span>`;
                } else {
                  return `<span style='font-size:16px;'>${data.workDate ||
                    ''}</span><br/><span style='font-size:16px;'>${data.workDesc || ''}</span>`;
                }
              },
            },
            'drag-canvas',
            'zoom-canvas',
          ],
        },
        defaultNode: {
          shape: 'tree-node',
          anchorPoints: [[0, 0.5], [1, 0.5]],
        },
        defaultEdge: {
          shape: 'hvh',
          style: {
            lineWidth: 2,
            stroke: '#ccc',
          },
        },
        layout: {
          type: 'compactBox',
          direction: 'LR',
          // fixedRoot: false,
          getId: d => {
            return d.id;
          },
          getWidth: () => {
            return 243;
          },
          getVGap: () => {
            return 60;
          },
          getHGap: () => {
            return 60;
          },
        },
      });

      G6.registerNode(
        'tree-node',
        {
          drawShape: function drawShape(cfg, group) {
            const type =
              cfg.objectId && !cfg.workPlanId && !cfg.timeWorkPlanId
                ? 'object'
                : cfg.workPlanId
                  ? 'workPlan'
                  : 'timeWorkPlan';
            const config = getNodeConfig(cfg, type);

            /* 最外面的大矩形,有三种不同的矩形，配置化 */
            const container = nodeBasicMethod.createNodeBox(group, config, type);

            // ===============绘制目标文本内容===========
            // 目标
            if (type === 'object') {
              // 目标名称
              group.addShape('text', {
                attrs: {
                  text: fittingString(cfg.objectiveName || '', 9),
                  x: -200,
                  y: -90,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontWeight: 'bolder',
                },
              });

              // 目标主体
              group.addShape('text', {
                attrs: {
                  text: fittingString(`${cfg.objectiveSubjectName || ''}`, 10),
                  x: -195,
                  y: -65,
                  textAlign: 'left',
                  fill: '#333',
                  fontSize: 14,
                },
              });

              // 目标负责人
              group.addShape('text', {
                attrs: {
                  text: cfg.objectiveResName || '',
                  x: -180,
                  y: -40,
                  textAlign: 'left',
                  fill: '#333',
                  fontSize: 14,
                },
              });
              group.addShape('image', {
                attrs: {
                  x: -197,
                  y: -57,
                  img: user,
                },
              });

              // 目标进度
              group.addShape('dom', {
                attrs: {
                  x: -230,
                  y: -25,
                  width: 180,
                  height: 8,
                  html: `<div style='width:100%;height:100%;border:1px solid #a59d9d;border-radius: 8px;'><div style='height:100%;width:${cfg.objectiveCurProg ||
                    0}%;background-color:#B0FBA3;border-radius: 8px;'></div></div>`,
                },
              });

              // 目标进度数值
              group.addShape('text', {
                attrs: {
                  text: `${cfg.objectiveCurProg || 0}%`,
                  x: -5,
                  y: -12,
                  textAlign: 'right',
                  fill: '#333',
                  fontSize: 14,
                },
              });

              // 目标类型
              group.addShape('dom', {
                attrs: {
                  x: -35,
                  y: -115,
                  width: 30,
                  height: 30,
                  html: `<div style='width:100%;height:100%;background-color:${
                    cfg.objectiveType === 'COMPANY'
                      ? '#9A9845'
                      : cfg.objectiveType === 'BU'
                        ? '#B0FBA3'
                        : cfg.objectiveType === 'PERSON'
                          ? '#60CAFA'
                          : 'red'
                  };border-radius: 50%;font-size:12px;text-align:center;line-height:30px;font-weight:bolder;'>${cfg.objectiveTypeName ||
                    '暂无'}</div>`,
                },
              });

              // 绘制 左上角图标 image 元素
              group.addShape('image', {
                attrs: {
                  x: -230,
                  y: -110,
                  width: 20,
                  height: 20,
                  img: companySvg,
                },
              });

              // 绘制与rect框等大小的用于点击的模块（rect无法直接设置click事件）
              group.addShape('dom', {
                attrs: {
                  x: config.x,
                  y: config.y,
                  width: config.width,
                  height: config.height,
                  radius: 4,
                  stroke: '#b8b5b5',
                  shadowColor: '#b8b5b5',
                  shadowBlur: 10,
                  cursor: 'pointer',
                  html: `<div style='width:100%;height:100%;cursor:pointer'></div>`,
                },
                className: 'click-objectDom',
              });
            }

            // 工作计划
            if (type === 'workPlan') {
              // 任务编号
              group.addShape('dom', {
                attrs: {
                  x: -230,
                  y: -95,
                  width: 40,
                  height: 18,
                  fontSize: 12,
                  html: `<div style='width:40px;height:18px;line-height:18px;background-color:#F39F71;border-radius:2px;text-align:center;font-size:12px'><span>${cfg.planNo ||
                    ''}</span></div>`,
                },
              });

              // 任务名称
              group.addShape('text', {
                attrs: {
                  text: fittingString(`${cfg.taskName || ''}`, 7),
                  x: -185,
                  y: -78,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontWeight: 'bolder',
                },
              });

              // 任务状态
              group.addShape('text', {
                attrs: {
                  text: cfg.planStatusName || '',
                  x: -55,
                  y: -78,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 12,
                },
              });

              group.addShape('circle', {
                attrs: {
                  x: -10,
                  y: -85,
                  r: 3,
                  fill: cfg.planStatus === 'PLAN' ? 'red' : 'green',
                },
              });

              // 任务开始-结束日期
              group.addShape('image', {
                attrs: {
                  x: -210,
                  y: -63,
                  img: calendar,
                },
              });

              group.addShape('text', {
                attrs: {
                  text: `${cfg.dateFrom || ''} ~ ${cfg.dateTo || ''}`,
                  x: -183,
                  y: -46,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 12,
                },
              });

              // 优先级
              // 任务开始-结束日期
              group.addShape('image', {
                attrs: {
                  x: -210,
                  y: -33,
                  img: priority,
                },
              });
              group.addShape('text', {
                attrs: {
                  text: cfg.priority || '',
                  x: -183,
                  y: -16,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 12,
                },
              });
            }

            // 工时
            if (type === 'timeWorkPlan') {
              // 工作日期
              group.addShape('text', {
                attrs: {
                  text: cfg.workDate || '',
                  x: -270,
                  y: -50,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontWeight: 'bolder',
                },
              });

              // 工作说明
              group.addShape('text', {
                attrs: {
                  text: fittingString(`${cfg.workDesc || ''}`, 10),
                  x: -170,
                  y: -50,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontWeight: 'bolder',
                },
              });
            }

            // 绘制marker标记
            const hasChildren = cfg.children && cfg.children.length > 0;
            if (hasChildren) {
              nodeBasicMethod.createNodeMarker(group, config, cfg.collapsed);
            }

            // rect设置属性
            container.attr({
              fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
            });
            return container;
          },
          afterDraw: nodeBasicMethod.afterDraw,
          setState: nodeBasicMethod.setState,
        },
        'single-shape'
      );

      // 自定义线
      G6.registerEdge('hvh', {
        draw(cfg, group) {
          const { startPoint, endPoint } = cfg;
          const shape = group.addShape('path', {
            attrs: {
              stroke: '#ccc',
              path: [
                ['M', startPoint.x, startPoint.y],
                ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, startPoint.y], // 三分之一处
                ['L', endPoint.x / 3 + (2 / 3) * startPoint.x, endPoint.y], // 三分之二处
                ['L', endPoint.x, endPoint.y],
              ],
            },
          });
          return shape;
        },
        shouldUpdate(type) {
          return false;
        },
      });

      graph.data(res);
      graph.render();
      graph.fitView();
      graph.zoomTo(1, { x: div(CANVAS_WIDTH, 2), y: div(CANVAS_HEIGHT, 2) });
    });
  }

  render() {
    const { loading } = this.props;
    const spinLoading = loading.effects[`${DOMAIN}/targetPathMap`];

    return spinLoading ? (
      <Spin
        style={{ width: '100%', height: '100%', backgroundColor: '#fff' }}
        size="large"
        spinning={spinLoading}
      />
    ) : (
      <div className={styles.mountNode} id="mountNode" />
    );
  }
}

export default TargetPath;
