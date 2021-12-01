/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
import React, { PureComponent, Component } from 'react';
import router from 'umi/router';
import G6 from '@antv/g6';
import { markAsNoTab } from '@/layouts/routerControl';
import { getUrl } from '@/utils/flowToRouter';
import { stringify } from 'qs';
import { div, add } from '@/utils/mathUtils';
import companySvg from './img/company.svg';
import deco from './img/deco.png';
import mingren from './img/mingren.webp';
import styles from './style.less';
import defaultBg from './img/default.png';
import { listData } from './test';

class TreeMap extends Component {
  componentDidMount() {
    const { dataSource, mode } = this.props;
    // const dataSource = listData();
    const COLLAPSE_ICON = function COLLAPSE_ICON(x, y, r) {
      // console.log(x, y, r, 'x, y, r');
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
      fitView: true,
      fitViewPadding: [CANVAS_HEIGHT, 0, 0, 100],
      modes: {
        default: [
          // {
          //   type: 'collapse-expand',
          //   shouldUpdate: e => {
          //     /* 点击 node 禁止展开收缩 */
          //     if (e.target.get('className') !== 'collapse-icon') {
          //       return false;
          //     }
          //     return true;
          //   },
          //   onChange: function onChange(item, collapsed) {
          //     const data = item.get('model');
          //     const icon = item.get('group').findByClassName('collapse-icon');
          //     if (collapsed) {
          //       icon.attr('symbol', EXPAND_ICON);
          //     } else {
          //       icon.attr('symbol', COLLAPSE_ICON);
          //     }
          //     data.collapsed = collapsed;
          //     return true;
          //   },
          // },
          {
            type: 'collapse-expand',
            onChange: function onChange(item, collapsed) {
              const data = item.get('model').data;
              data.collapsed = collapsed;
              return true;
            },
          },
          'drag-canvas',
          'zoom-canvas',
          // 'drag-node',
          // {
          //   type: 'tooltip',
          //   formatText: function formatText(model) {
          //     console.log(model,'model');
          //     return `<span style='font-size:20px;font-weight:bolder;'>${
          //       model.objectiveName
          //     }</span><br/><span style='font-size:16px;'>${model.objectiveSubjectName}</span>`;
          //   },
          // },
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
          return 350;
        },
        getHGap: function getHGap() {
          return 250;
        },
      },
    });

    G6.registerNode(
      'tree-node',
      {
        labelPosition: 'center',
        drawShape: function drawShape(cfg, group) {
          const {
            depth,
            showType,
            buResCount,
            personName = '',
            position = '',
            buName = '',
            birthday = '',
            enrollDate = '',
            bloodType = '',
            hobby = '',
            censusRegistration = '', //户籍
            constellation = '', //星座
            lifePhoto, //生活照
          } = cfg;
          // 绘制rect框
          let rect;
          // ===============绘制文本内容===========
          // 对第一节点进行特殊配置
          if (depth === 0) {
            rect = group.addShape('rect', {
              attrs: {
                x: 0,
                y: 0,
                width: 220,
                height: 120,
                fill: '#fff',
                radius: 4,
                stroke: '#b8b5b5',
                lineWidth: 1,
                // label:'测试'
              },
            });
            const text = group.addShape('text', {
              attrs: {
                text: '柠萌影业',
                x: 110,
                y: 70,
                textAlign: 'center',
                fill: 'red',
                fontSize: 40,
                fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                fontWeight: 'bolder',
              },
            });
            // 绘制marker标记
            // const bbox = text.getBBox();
            // const hasChildren = cfg.children && cfg.children.length > 0;
            // if (hasChildren) {
            //   group.addShape('circle', {
            //     attrs: {
            //       x: 104,
            //       y: 120,
            //       r: 12,
            //       fill: 'rgba(47, 84, 235, 0.05)',
            //       opacity: 0,
            //       zIndex: -2,
            //     },
            //     className: 'collapse-icon-bg',
            //   });
            //   group.addShape('marker', {
            //     attrs: {
            //       x: 104,
            //       y: 120,
            //       r: 6,
            //       symbol: COLLAPSE_ICON,
            //       stroke: '#666',
            //       lineWidth: 1,
            //       fill: '#fff',
            //       cursor: 'pointer',
            //     },
            //     className: 'collapse-icon',
            //   });
            // }
          } else {
            const interval = 20; //每行高度
            const lineLength = 5; //每行字数限制
            // let nameLines = 1;
            if (showType === 'IL') {
              //分管领导
              rect = group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 220,
                  height: 120,
                  fill: '#fff',
                  radius: 4,
                  stroke: '#b8b5b5',
                  lineWidth: 1,
                  // label:'测试'
                },
              });
              const nameText = group.addShape('text', {
                attrs: {
                  text: personName,
                  x: 20,
                  // y: 140 + nameLines * interval,
                  y: 50,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-name',
              });
              const positionText = group.addShape('text', {
                attrs: {
                  text: position,
                  x: 20,
                  // y: 160 + nameLines * interval,
                  y: 90,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-position',
              });
              // const bbox = text.getBBox();
              // const hasChildren = cfg.children && cfg.children.length > 0;
              // if (hasChildren) {
              //   group.addShape('circle', {
              //     attrs: {
              //       x: 97,
              //       y: 120,
              //       r: 13,
              //       fill: 'rgba(47, 84, 235, 0.05)',
              //       opacity: 0,
              //       zIndex: -2,
              //     },
              //     className: 'collapse-icon-bg',
              //   });
              //   group.addShape('marker', {
              //     attrs: {
              //       x: 104,
              //       y: 126,
              //       r: 6,
              //       symbol: COLLAPSE_ICON,
              //       stroke: '#666',
              //       lineWidth: 1,
              //       fill: '#fff',
              //       cursor: 'pointer',
              //     },
              //     className: 'collapse-icon',
              //   });
              // }
            } else if (showType === 'BU') {
              rect = group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 220,
                  height: 120,
                  fill: '#fff',
                  radius: 4,
                  stroke: '#b8b5b5',
                  lineWidth: 1,
                },
              });
              const buText = group.addShape('text', {
                attrs: {
                  text: buName,
                  x: 20,
                  // y: 140 + nameLines * interval,
                  y: 50,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-name',
              });
              if (mode === 'brief') {
                const buNoText = group.addShape('text', {
                  attrs: {
                    text: buResCount,
                    x: 20,
                    // y: 140 + nameLines * interval,
                    y: 50,
                    textAlign: 'left',
                    fill: 'black',
                    fontSize: 16,
                    fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                    fontWeight: 'bolder',
                    zIndex: 1,
                  },
                  className: 'hover-name',
                });
              }
              // const bbox = text.getBBox();
              // const hasChildren = cfg.children && cfg.children.length > 0;
              // if (hasChildren) {
              //   group.addShape('circle', {
              //     attrs: {
              //       x: 97,
              //       y: 120,
              //       r: 13,
              //       fill: 'rgba(47, 84, 235, 0.05)',
              //       opacity: 0,
              //       zIndex: -2,
              //     },
              //     className: 'collapse-icon-bg',
              //   });
              //   group.addShape('marker', {
              //     attrs: {
              //       x: 104,
              //       y: 126,
              //       r: 6,
              //       symbol: COLLAPSE_ICON,
              //       stroke: '#666',
              //       lineWidth: 1,
              //       fill: '#fff',
              //       cursor: 'pointer',
              //     },
              //     className: 'collapse-icon',
              //   });
              // }
            } else {
              rect = group.addShape('rect', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 220,
                  height: 320,
                  fill: '#fff',
                  radius: 4,
                  stroke: '#b8b5b5',
                  lineWidth: 1,
                  // label:'测试'
                },
              });
              // nameLines = Math.ceil(`姓名:${objectiveName}`.length / lineLength);
              // // 姓名
              // const name =
              //   // objectiveName && objectiveName.length > 20
              //   //   ? `姓名: ${objectiveName?.substring(0, 19)}...`
              //   //   : `姓名: ${objectiveName}...`;
              //   objectiveName && objectiveName.length > 5
              //     ? `姓名: ${objectiveName?.substring(0, 5)}
              //   ${objectiveName?.substring(5, 9)}...`
              //     : `姓名: ${objectiveName}`;
              const nameText = group.addShape('text', {
                attrs: {
                  text: `姓名: ${
                    personName
                      ? personName?.length <= 10
                        ? personName
                        : personName?.substring(0, 10) + '...'
                      : ''
                  }`,
                  x: 10,
                  // y: 140 + nameLines * interval,
                  y: 140,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // 部门
              // const bu =
              //   objectiveName && objectiveName.length > 20
              //     ? `部门: ${objectiveName?.substring(0, 19)}...`
              //     : `部门: ${objectiveName}`;
              const buText = group.addShape('text', {
                attrs: {
                  text: `部门: ${
                    buName ? (buName?.length <= 10 ? buName : buName?.substring(0, 10) + '...') : ''
                  }`,
                  x: 10,
                  // y: 160 + nameLines * interval,
                  y: 160,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // 职位
              // const position =
              //   objectiveName && objectiveName.length > 20
              //     ? `职位: ${objectiveName?.substring(0, 19)}...`
              //     : `职位: ${objectiveName}`;
              const positionText = group.addShape('text', {
                attrs: {
                  text: `职位: ${
                    position
                      ? position?.length <= 10
                        ? position
                        : position?.substring(0, 10) + '...'
                      : ''
                  }`,
                  x: 10,
                  // y: 180 + nameLines * interval,
                  y: 180,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // 入职日期
              // const hiredate =
              //   objectiveName && objectiveName.length > 20
              //     ? `入职日期: ${objectiveName?.substring(0, 19)}...`
              //     : `入职日期: ${objectiveName}`;
              const hiredateText = group.addShape('text', {
                attrs: {
                  text: `入职日期: ${
                    enrollDate
                      ? enrollDate?.length <= 10
                        ? enrollDate
                        : enrollDate?.substring(0, 10) + '...'
                      : ''
                  }`,
                  x: 10,
                  // y: 200 + nameLines * interval,
                  y: 200,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // 生日
              // const birthday =
              //   objectiveName && objectiveName.length > 20
              //     ? `生日: ${objectiveName?.substring(0, 19)}...`
              //     : `生日: ${objectiveName}`;
              const birthdayText = group.addShape('text', {
                attrs: {
                  text: `生日: ${
                    birthday
                      ? birthday?.length <= 10
                        ? birthday
                        : birthday?.substring(0, 10) + '...'
                      : ''
                  }`,
                  x: 10,
                  // y: 220 + nameLines * interval,
                  y: 220,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // 户籍
              // const census =
              //   objectiveName && objectiveName.length > 20
              //     ? `户籍: ${objectiveName?.substring(0, 19)}...`
              //     : `户籍: ${objectiveName}`;
              const censusText = group.addShape('text', {
                attrs: {
                  text: `户籍: ${
                    censusRegistration
                      ? censusRegistration?.length <= 10
                        ? censusRegistration
                        : censusRegistration?.substring(0, 10) + '...'
                      : ''
                  }`,
                  x: 10,
                  // y: 240 + nameLines * interval,
                  y: 240,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // 星座
              // const constellation =
              //   objectiveName && objectiveName.length > 20
              //     ? `星座: ${objectiveName?.substring(0, 19)}...`
              //     : `星座: ${objectiveName}`;
              const constellationText = group.addShape('text', {
                attrs: {
                  text: `星座: ${
                    constellation
                      ? constellation?.length <= 10
                        ? constellation
                        : constellation?.substring(0, 10) + '...'
                      : ''
                  }`,
                  x: 10,
                  y: 260,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // // 血型Type
              // const bloodType =
              //   objectiveName && objectiveName.length > 20
              //     ? `血型: ${objectiveName?.substring(0, 19)}...`
              //     : `血型: ${objectiveName}`;
              const bloodTypeText = group.addShape('text', {
                attrs: {
                  text: `血型: ${
                    bloodType
                      ? bloodType?.length <= 10
                        ? bloodType
                        : bloodType?.substring(0, 10) + '...'
                      : ''
                  }`,
                  x: 10,
                  y: 280,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              // // 爱好
              const hobbyText = group.addShape('text', {
                attrs: {
                  text: `爱好: ${
                    hobby ? (hobby?.length <= 10 ? hobby : hobby?.substring(0, 10) + '...') : ''
                  }`,
                  x: 10,
                  y: 300,
                  textAlign: 'left',
                  fill: 'black',
                  fontSize: 16,
                  fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
                  fontWeight: 'bolder',
                  zIndex: 1,
                },
                className: 'hover-objectName',
              });

              const image = group.addShape('image', {
                attrs: {
                  x: 0,
                  y: 0,
                  width: 220,
                  height: 120,
                  img: lifePhoto
                    ? `http://${
                        window.location.host
                      }/telework/api/common/v1/attachment/preview${lifePhoto}`
                    : defaultBg,
                },
                className: 'hover-image',
              });
              // const bbox = text.getBBox();
              // const hasChildren = cfg.children && cfg.children.length > 0;
              // if (hasChildren) {
              //   group.addShape('circle', {
              //     attrs: {
              //       x: 97,
              //       y: 320,
              //       r: 13,
              //       fill: 'rgba(47, 84, 235, 0.05)',
              //       opacity: 0,
              //       zIndex: -2,
              //     },
              //     className: 'collapse-icon-bg',
              //   });
              //   group.addShape('marker', {
              //     attrs: {
              //       x: 104,
              //       y: 326,
              //       r: 6,
              //       symbol: COLLAPSE_ICON,
              //       stroke: '#666',
              //       lineWidth: 1,
              //       fill: '#fff',
              //       cursor: 'pointer',
              //     },
              //     className: 'collapse-icon',
              //   });
              // }
            }

            // 绘制marker标记
          }

          // rect设置属性
          // rect.attr({
          //   fontFamily: 'Source Han Sans CN,Helvetica Neue,Arial,sans-serif',
          // });
          return rect;
        },
        afterDraw: (cfg, group) => {
          /* 操作 marker 的背景色显示隐藏 */
          // const icon = group.findByClassName('collapse-icon');
          // if (icon) {
          //   const bg = group.findByClassName('collapse-icon-bg');
          //   icon.on('mouseenter', () => {
          //     bg.attr('opacity', 1);
          //     graph.get('canvas').draw();
          //   });
          //   icon.on('mouseleave', () => {
          //     bg.attr('opacity', 0);
          //     graph.get('canvas').draw();
          //   });
          // }

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
        setState(name, value, item) {
          const group = item.getContainer();
          // const image = group.get('children')[3];
          // if (image) {
          //   // const bg = group.findByClassName('collapse-icon-bg');
          //   if (name === 'selected') {
          //     if (value) {
          //       image.attr({
          //         width: 520,
          //         height: 420,
          //         zIndex: 88,
          //       });
          //     } else {
          //       image.attr({
          //         width: 220,
          //         height: 120,
          //         zIndex: 0,
          //       });
          //     }
          //   }
          //   // image.on('mouseenter', () => {

          //   //   graph.get('canvas').draw();
          //   // });
          //   // image.on('mouseleave', () => {
          //   //   image.attr({
          //   //     width: 220,
          //   //     height: 120,
          //   //   });
          //   //   graph.get('canvas').draw();
          //   // });
          // }
        },
        // options: {
        //   // size: 60,
        //   // style: {
        //   //   lineWidth: 1
        //   // },
        //   stateStyles: {
        //     // 鼠标 hover 状态下的配置
        //     hover: {
        //       fillOpacity: 0,
        //       shadowBlur: 0,
        //     },
        //     // 选中节点状态下的配置
        //     selected: {
        //       lineWidth: 3,
        //     },
        //   },
        // },
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

    // graph.on('node:click', evt => {
    //   const { item } = evt;
    //   graph.setItemState(item, 'selected', !item.hasState('selected'));
    //   // graph.downloadImage();
    // });

    // graph.on('node:mouseleave', evt => {
    //   const { item } = evt;
    //   graph.setItemState(item, 'hover', false);
    // });

    G6.Util.traverseTree(dataSource, item => {
      // console.warn(item);
      // item.id = item.name;
    });

    // graph.node(function(node) {
    //   return {
    //     label: node.id,
    //     labelCfg: {
    //       offset: 10,
    //       position: node.children && node.children.length > 0 ? 'left' : 'right'
    //     }
    //   };
    // });
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
