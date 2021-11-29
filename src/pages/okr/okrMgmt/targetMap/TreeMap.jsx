/* eslint-disable no-nested-ternary */
import React, { PureComponent, Component } from 'react';
import router from 'umi/router';
import G6 from '@antv/g6';
import { markAsNoTab } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { div, add } from '@/utils/mathUtils';
import companySvg from './img/company.svg';
import styles from './style.less';

class TreeMap extends Component {
  componentDidMount() {
    const { dataSource } = this.props;

    const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
      return [
        ['M', x, y],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x + 2, y],
        ['L', x + 2 * r - 2, y],
      ];
    };
    const EXPAND_ICON = function EXPAND_ICON(x, y, r) {
      return [
        ['M', x, y],
        ['a', r, r, 0, 1, 0, r * 2, 0],
        ['a', r, r, 0, 1, 0, -r * 2, 0],
        ['M', x + 2, y],
        ['L', x + 2 * r - 2, y],
        ['M', x + r, y - r + 2],
        ['L', x + r, y + r - 2],
      ];
    };

    // 获取容器宽高，用于设置画布宽高
    const CANVAS_WIDTH = document.getElementById('mountNode').scrollWidth;
    const CANVAS_HEIGHT = document.getElementById('mountNode').scrollHeight;

    const graph = new G6.TreeGraph({
      container: 'mountNode',
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      renderer: 'svg', // 必须渲染为svg格式才能支持addShape dom
      direction: 'TB',
      fitViewPadding: [CANVAS_HEIGHT, 0, 0, 100],
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
            onChange: function onChange(item, collapsed) {
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
          },
          'drag-canvas',
          'zoom-canvas',
          // 'drag-node',
          {
            type: 'tooltip',
            formatText: function formatText(model) {
              return `<span style='font-size:20px;font-weight:bolder;'>${
                model.objectiveName
              }</span><br/><span style='font-size:16px;'>${model.objectiveSubjectName}</span>`;
            },
          },
        ],
      },
      defaultNode: {
        shape: 'tree-node',
        anchorPoints: [[0.5, 1], [0.5, 0]],
        width: 150,
        height: 50,
      },
      defaultEdge: {
        shape: 'hvh',
        // shape: 'polyline',
        style: {
          endArrow: false,
          lineWidth: 2,
          stroke: '#ccc',
        },
      },
      layout: {
        type: 'compactBox',
        direction: 'TB',
        getId: function getId(d) {
          return d.id;
        },
        getHeight: function getHeight() {
          return 16;
        },
        getWidth: function getWidth() {
          return 16;
        },
        getVGap: function getVGap() {
          return 100;
        },
        getHGap: function getHGap() {
          return 150;
        },
      },
    });

    G6.registerNode(
      'tree-node',
      {
        drawShape: function drawShape(cfg, group) {
          // 绘制rect框
          const rect = group.addShape('rect', {
            attrs: {
              x: -220,
              y: -120,
              width: 220,
              height: 120,
              fill: '#fff',
              radius: 4,
              stroke: '#b8b5b5',
              shadowColor: '#b8b5b5',
              shadowBlur: 10,
            },
          });

          const {
            objectiveName,
            objectiveSubjectName,
            objectiveResName,
            objectiveCurProg,
            objectiveType,
            objectiveTypeName,
            depth,
          } = cfg;
          // ===============绘制文本内容===========
          // 对第一节点进行特殊配置
          if (depth === 0) {
            // 目标名称
            const content =
              objectiveName && objectiveName.length > 10
                ? objectiveName.substring(0, 9) + '...'
                : objectiveName;
            const text = group.addShape('text', {
              attrs: {
                text: content,
                x: -190,
                y: -50,
                textAlign: 'left',
                fill: 'black',
                fontSize: 20,
                fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                fontWeight: 'bolder',
              },
            });
            // 绘制marker标记
            // const bbox = text.getBBox();
            const hasChildren = cfg.children && cfg.children.length > 0;
            if (hasChildren) {
              group.addShape('circle', {
                attrs: {
                  x: -110,
                  y: 6,
                  r: 13,
                  fill: 'rgba(47, 84, 235, 0.05)',
                  opacity: 0,
                  zIndex: -2,
                },
                className: 'collapse-icon-bg',
              });
              group.addShape('marker', {
                attrs: {
                  x: -116,
                  y: 6,
                  r: 6,
                  symbol: COLLAPSE_ICON,
                  stroke: '#666',
                  lineWidth: 1,
                  fill: '#fff',
                  cursor: 'pointer',
                },
                className: 'collapse-icon',
              });
            }
          } else {
            // 目标名称
            const content =
              objectiveName && objectiveName.length > 10
                ? objectiveName.substring(0, 9) + '...'
                : objectiveName;
            const text = group.addShape('text', {
              attrs: {
                text: content,
                x: -180,
                y: -90,
                textAlign: 'left',
                fill: 'black',
                fontSize: 16,
                fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                fontWeight: 'bolder',
              },
              className: 'hover-objectName',
            });

            // 目标主体
            const objectiveSubjectContent =
              objectiveSubjectName && objectiveSubjectName.length > 10
                ? objectiveSubjectName.substring(0, 9) + '...'
                : objectiveSubjectName;
            const objectiveSubjectText = group.addShape('text', {
              attrs: {
                text: objectiveSubjectContent,
                x: -180,
                y: -65,
                textAlign: 'left',
                fill: '#333',
                fontSize: 14,
                fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
              },
            });

            // 目标负责人
            const objectiveResNameText = group.addShape('text', {
              attrs: {
                text: objectiveResName,
                x: -180,
                y: -40,
                textAlign: 'left',
                fill: '#333',
                fontSize: 14,
                fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
              },
            });

            // 目标进度
            const objectiveCurProgDom = group.addShape('dom', {
              attrs: {
                x: -210,
                y: -25,
                width: 165,
                height: 8,
                html: `<div style='width:100%;height:100%;border:1px solid #a59d9d;border-radius: 8px;'><div style='height:100%;width:${objectiveCurProg}%;background-color:#B0FBA3;border-radius: 8px;'></div></div>`,
              },
              className: 'hover-objectDom',
            });

            // 目标进度数值
            const objectiveCurProgNumText = group.addShape('text', {
              attrs: {
                text: `${objectiveCurProg}%`,
                x: -5,
                y: -12,
                textAlign: 'right',
                fill: '#333',
                fontSize: 14,
              },
            });

            // 目标类型
            const objectiveTypeNameSize = 30;
            const objectiveTypeNameDom = group.addShape('dom', {
              attrs: {
                x: -35,
                y: -115,
                width: objectiveTypeNameSize,
                height: objectiveTypeNameSize,
                html: `<div style='width:100%;height:100%;background-color:${
                  objectiveType === 'COMPANY'
                    ? '#9A9845'
                    : objectiveType === 'BU'
                      ? '#B0FBA3'
                      : objectiveType === 'PERSON'
                        ? '#60CAFA'
                        : '#9A9845'
                };border-radius: 50%;font-size:12px;text-align:center;line-height:${objectiveTypeNameSize}px;font-weight:bolder'>${objectiveTypeName}</div>`,
              },
            });

            // 绘制marker标记
            // const bbox = text.getBBox();
            const hasChildren = cfg.children && cfg.children.length > 0;
            if (hasChildren) {
              group.addShape('circle', {
                attrs: {
                  x: -110,
                  y: 6,
                  r: 13,
                  fill: 'rgba(47, 84, 235, 0.05)',
                  opacity: 0,
                  zIndex: -2,
                },
                className: 'collapse-icon-bg',
              });
              group.addShape('marker', {
                attrs: {
                  x: -116,
                  y: 6,
                  r: 6,
                  symbol: COLLAPSE_ICON,
                  stroke: '#666',
                  lineWidth: 1,
                  fill: '#fff',
                  cursor: 'pointer',
                },
                className: 'collapse-icon',
              });
            }

            // 绘制 image 元素
            const svg = group.addShape('image', {
              attrs: {
                x: -210,
                y: -110,
                width: 20,
                height: 20,
                img: companySvg,
              },
            });

            // 绘制与rect框等大小的用于点击的模块（rect无法直接设置click事件）
            const clickDom = group.addShape('dom', {
              attrs: {
                x: -220,
                y: -120,
                width: 220,
                height: 120,
                radius: 4,
                stroke: '#b8b5b5',
                shadowColor: '#b8b5b5',
                shadowBlur: 10,
                cursor: 'pointer',
                html: `<div style='width:100%;height:100%;'></div>`,
              },
              className: 'click-objectDom',
            });
          }

          // rect设置属性
          rect.attr({
            fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
          });
          return rect;
        },
        afterDraw: (cfg, group) => {
          /* 操作 marker 的背景色显示隐藏 */
          const icon = group.findByClassName('collapse-icon');
          if (icon) {
            const bg = group.findByClassName('collapse-icon-bg');
            icon.on('mouseenter', () => {
              bg.attr('opacity', 1);
              graph.get('canvas').draw();
            });
            icon.on('mouseleave', () => {
              bg.attr('opacity', 0);
              graph.get('canvas').draw();
            });
          }

          const objectClickDom = group.findByClassName('click-objectDom');
          const objectName = group.findByClassName('hover-objectName');

          if (objectClickDom && objectName) {
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
              router.push(`/okr/okrMgmt/targetMgmt/view?id=${cfg.id}&${from}`);
            });
          }
        },
      },
      'single-shape'
    );

    G6.registerEdge('hvh', {
      draw(cfg, group) {
        const { startPoint, endPoint } = cfg;
        const shape = group.addShape('path', {
          attrs: {
            stroke: '#b8b5b5',
            path: [
              ['M', startPoint.x, startPoint.y],
              ['L', startPoint.x, endPoint.y / 3 + (2 / 3) * startPoint.y], //  三分之一处
              ['L', endPoint.x, endPoint.y / 3 + (2 / 3) * startPoint.y], //  三分之二处
              ['L', endPoint.x, endPoint.y],
            ],
          },
        });
        return shape;
      },
      shouldUpdate(type) {
        console.warn(type);
        return false;
      },
    });

    // 点击事件
    // graph.on('node:click', (e, v) => {
    //   console.warn(e);
    //   console.warn(v);
    // });

    // 监听节点的 mouseenter 事件 会导致drag事件失效
    // graph.on('node:mouseenter', ev => {
    //   console.warn(ev);
    //   // 获得当前鼠标操作的目标节点
    //   const node = ev.item;
    //   // 获得目标节点的所有相关边
    //   const edges = node.getEdges();
    //   // 将所有相关边的 running 状态置为 true，此时将会触发自定义节点的 setState 函数
    //   edges.forEach(edge => graph.setItemState(edge, 'running', true));
    // });

    G6.Util.traverseTree(dataSource, item => {
      // console.warn(item);
      // item.id = item.name;
    });

    graph.data(dataSource);
    graph.render();
    graph.fitView();
    graph.zoomTo(1, { x: div(CANVAS_WIDTH, 2), y: CANVAS_HEIGHT });
  }

  render() {
    return <div className={styles.mountNode} id="mountNode" />;
  }
}

export default TreeMap;
