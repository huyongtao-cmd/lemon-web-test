import React from 'react';
import { connect } from 'dva';
import { Col, Form, Icon, Divider, Tooltip } from 'antd';

import { mountToTab } from '@/layouts/routerControl';
import { isEmpty, type } from 'ramda';
import styles from '../style.less';

const DOMAIN = 'showHomePage';

@connect(({ loading, showHomePage, dispatch }) => ({
  loading,
  showHomePage,
  dispatch,
}))
@Form.create({
  onValuesChange(props, changedValues) {
    if (!isEmpty(changedValues)) {
      props.dispatch({
        type: `${DOMAIN}/updateHomeForm`,
        payload: changedValues,
      });
    }
  },
})
@mountToTab()
class HomePageList extends React.PureComponent {
  onCellChanged = (index, value, name) => {
    const {
      showHomePage: { menuList },
      dispatch,
    } = this.props;

    const newDataSource = menuList;
    newDataSource[index] = {
      ...newDataSource[index],
      [name]: value,
    };

    dispatch({
      type: `${DOMAIN}/updateState`,
      payload: { menuList: newDataSource },
    });
  };

  menuClick = (parmars, queryCon) => {
    const newParmars = parmars.filter(v => Object.values(v)[0]);
    const { onMenuChange } = this.props;
    if (type(onMenuChange) === 'Function') {
      onMenuChange(newParmars, queryCon);
    }
  };

  render() {
    const {
      loading,
      dispatch,
      showHomePage: { menuList, hoverList },
    } = this.props;

    return (
      <Col
        span={4}
        style={{
          backgroundColor: '#fff',
          borderRight: '6px solid #f0f2f5',
          boxSizing: 'border-box',
          paddingRight: 0,
          position: 'relative',
        }}
        className={styles.menuBox}
      >
        {/* 根据hoverList是否为空判断有是否超过第二维度 */}
        {isEmpty(hoverList) ? (
          <div className={styles.menuWrap}>
            {menuList.map(left1 => (
              <div
                className={styles.menuLi}
                style={{ cursor: 'pointer', textIndent: '0' }}
                key={left1.catVal ? left1.catDesc : left1.showName}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {left1.catVal ? (
                    <span
                      className={styles.noHoverFirster}
                      onClick={() => {
                        if (left1.catVal) {
                          const queryCon = `${left1.catVal ? left1.catDesc : left1.showName}`;
                          this.menuClick([{ [left1.catDId]: left1.id }], queryCon);
                        }
                      }}
                    >
                      {left1.catDesc && left1.catDesc.length > 10 ? (
                        <Tooltip placement="left" title={left1.catDesc}>
                          {`${left1.catDesc.substr(0, 10)}...`}
                        </Tooltip>
                      ) : (
                        left1.catDesc
                      )}
                    </span>
                  ) : (
                    <span
                      className={styles.noHoverFirster}
                      onClick={() => {
                        if (left1.catVal) {
                          const queryCon = `${left1.catVal ? left1.catDesc : left1.showName}`;
                          this.menuClick([{ [left1.catDId]: left1.id }], queryCon);
                        }
                      }}
                    >
                      {left1.showName && left1.showName.length > 10 ? (
                        <Tooltip placement="left" title={left1.showName}>
                          {`${left1.showName.substr(0, 10)}...`}
                        </Tooltip>
                      ) : (
                        left1.showName
                      )}
                    </span>
                  )}
                  {left1.list.length ? (
                    <Icon
                      style={{ position: 'absolute', right: '10px', cursor: 'pointer' }}
                      type="right"
                    />
                  ) : null}
                </div>
                {!isEmpty(left1.list) ? (
                  <div className={styles.rightMenuBox}>
                    <div className={styles.rightMenu}>
                      <div
                        style={{ fontWeight: 'bold', marginBottom: '10px', paddingLeft: '14px' }}
                      >
                        {`${left1.catVal ? left1.catDesc : left1.showName} `}
                      </div>
                      {left1.list.map((left2, hoverIndex1) => (
                        <>
                          {left2.catDesc && left2.catDesc.length > 8 ? (
                            <Tooltip
                              placement="right"
                              title={left2.catDesc}
                              onClick={e => {
                                const queryCon = `${
                                  left1.catVal ? left1.catDesc : left1.showName
                                } - ${left2.catVal ? left2.catDesc : left2.showName}`;

                                this.menuClick(
                                  [{ [left1.catDId]: left1.id }, { [left2.catDId]: left2.id }],
                                  queryCon
                                );
                                e.stopPropagation();
                              }}
                            >
                              {`${left2.catDesc.substr(0, 8)}...`}
                            </Tooltip>
                          ) : (
                            <span
                              key={left2.catVal ? left2.catDesc : left2.showName}
                              onClick={e => {
                                const queryCon = `${
                                  left1.catVal ? left1.catDesc : left1.showName
                                } - ${left2.catVal ? left2.catDesc : left2.showName}`;

                                this.menuClick(
                                  [{ [left1.catDId]: left1.id }, { [left2.catDId]: left2.id }],
                                  queryCon
                                );
                                e.stopPropagation();
                              }}
                            >
                              {left2.catDesc}
                            </span>
                          )}
                        </>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          menuList.map((left1, index) => (
            <div key={left1.catVal ? left1.catDesc : left1.showName}>
              <div
                className={styles.firstMenu}
                clickFlag="true"
                onClick={e => {
                  if (e.target.getAttribute('clickFlag')) {
                    this.onCellChanged(index, !left1.collapsed, 'collapsed');
                    e.stopPropagation();
                  }
                }}
              >
                {left1.catVal ? (
                  <span
                    className={styles.firstTitle}
                    onClick={e => {
                      if (left1.catVal) {
                        const queryCon = `${left1.catVal ? left1.catDesc : left1.showName}`;
                        this.menuClick([{ [left1.catDId]: left1.id }], queryCon);
                        e.stopPropagation();
                      }
                      e.stopPropagation();
                    }}
                  >
                    &nbsp;
                    {left1.catDesc && left1.catDesc.length > 10 ? (
                      <Tooltip placement="right" title={left1.catDesc}>
                        {`${left1.catDesc.substr(0, 10)}...`}
                      </Tooltip>
                    ) : (
                      left1.catDesc
                    )}
                  </span>
                ) : (
                  <span
                    className={styles.firstTitle}
                    onClick={e => {
                      if (left1.catVal) {
                        const queryCon = `${left1.catVal ? left1.catDesc : left1.showName}`;
                        this.menuClick([{ [left1.catDId]: left1.id }], queryCon);
                        e.stopPropagation();
                      }
                      e.stopPropagation();
                    }}
                  >
                    &nbsp;
                    {left1.showName && left1.showName.length > 10 ? (
                      <Tooltip placement="right" title={left1.showName}>
                        {`${left1.showName.substr(0, 10)}...`}
                      </Tooltip>
                    ) : (
                      left1.showName
                    )}
                  </span>
                )}
                {left1.list.length ? (
                  <Icon
                    style={{ cursor: 'pointer', position: 'absolute', right: '10px' }}
                    type={left1.collapsed ? 'caret-down' : 'caret-up'}
                  />
                ) : null}
                {!isEmpty(hoverList) ? (
                  <div className={styles.rightMenuBox}>
                    <div className={styles.rightMenu}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        {`${left1.catVal ? left1.catDesc : left1.showName}`}
                      </div>
                      {hoverList.map((hoverItem1, hoverIndex1) => (
                        <div key={hoverItem1.catVal ? hoverItem1.catDesc : hoverItem1.showName}>
                          <div>
                            <div>
                              <b
                                className={
                                  hoverItem1.catVal ? styles.tagTitle : styles.noClickTagTitle
                                }
                                onClick={e => {
                                  if (hoverItem1.catVal) {
                                    const queryCon = `${
                                      left1.catVal ? left1.catDesc : left1.showName
                                    } - ${
                                      hoverItem1.catVal ? hoverItem1.catDesc : hoverItem1.showName
                                    }`;
                                    this.menuClick(
                                      [
                                        { [left1.catDId]: left1.id },
                                        { [hoverItem1.catDId]: hoverItem1.id },
                                      ],
                                      queryCon
                                    );
                                    e.stopPropagation();
                                  }
                                  e.stopPropagation();
                                }}
                              >
                                ● {hoverItem1.catVal ? hoverItem1.catDesc : hoverItem1.showName}
                              </b>
                            </div>
                            {hoverItem1.list.map((hoverItem2, hoverIndex2) => (
                              <span
                                key={hoverItem2.catVal ? hoverItem2.catDesc : hoverItem2.showName}
                                onClick={e => {
                                  const queryCon = `${
                                    left1.catVal ? left1.catDesc : left1.showName
                                  }- ${
                                    hoverItem1.catVal ? hoverItem1.catDesc : hoverItem1.showName
                                  } - ${
                                    hoverItem2.catVal ? hoverItem2.catDesc : hoverItem2.showName
                                  }`;
                                  this.menuClick(
                                    [
                                      { [left1.catDId]: left1.id },
                                      { [hoverItem1.catDId]: hoverItem1.id },
                                      { [hoverItem2.catDId]: hoverItem2.id },
                                    ],
                                    queryCon
                                  );
                                  e.stopPropagation();
                                }}
                              >
                                {hoverItem2.catDesc || ''}
                              </span>
                            ))}
                          </div>
                          {hoverIndex1 < hoverList.length - 1 ? <Divider dashed /> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div
                className={styles.menuWrap}
                style={{ display: left1.collapsed ? 'block' : 'none' }}
              >
                {left1.list.map(left2 => (
                  <div
                    className={styles.menuLi}
                    key={left2.catVal ? left2.catDesc : left2.showName}
                  >
                    {left2.catDesc && left2.catDesc.length > 8 ? (
                      <Tooltip
                        placement="right"
                        title={left2.catDesc}
                        onClick={e => {
                          const queryCon = `${left1.catVal ? left1.catDesc : left1.showName} - ${
                            left2.catVal ? left2.catDesc : left2.showName
                          }`;
                          this.menuClick(
                            [{ [left1.catDId]: left1.id }, { [left2.catDId]: left2.id }],
                            queryCon
                          );
                          e.stopPropagation();
                        }}
                      >
                        {`${left2.catDesc.substr(0, 8)}...`}
                      </Tooltip>
                    ) : (
                      <span
                        clickFlag="true"
                        onClick={e => {
                          if (e.target.getAttribute('clickFlag')) {
                            const queryCon = `${left1.catVal ? left1.catDesc : left1.showName} - ${
                              left2.catVal ? left2.catDesc : left2.showName
                            }`;
                            this.menuClick(
                              [{ [left1.catDId]: left1.id }, { [left2.catDId]: left2.id }],
                              queryCon
                            );
                          }
                          e.stopPropagation();
                        }}
                      >
                        {left2.catDesc || ''}
                      </span>
                    )}
                    {!isEmpty(hoverList) ? (
                      <div className={styles.rightMenuBox}>
                        <div className={styles.rightMenu}>
                          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                            {`${left1.catVal ? left1.catDesc : left1.showName} - ${
                              left2.catVal ? left2.catDesc : left2.showNamed
                            }`}
                          </div>
                          {hoverList.map((hoverItem1, hoverIndex1) => (
                            <div key={hoverItem1.catVal ? hoverItem1.catDesc : hoverItem1.showName}>
                              <div>
                                <div>
                                  <b
                                    className={
                                      hoverItem1.catVal ? styles.tagTitle : styles.noClickTagTitle
                                    }
                                    onClick={e => {
                                      if (hoverItem1.catVal) {
                                        const queryCon = `${
                                          left1.catVal ? left1.catDesc : left1.showName
                                        } - ${left2.catVal ? left2.catDesc : left2.showName} - ${
                                          hoverItem1.catVal
                                            ? hoverItem1.catDesc
                                            : hoverItem1.showName
                                        }`;
                                        this.menuClick(
                                          [
                                            { [left1.catDId]: left1.id },
                                            { [left2.catDId]: left2.id },
                                            { [hoverItem1.catDId]: hoverItem1.id },
                                          ],
                                          queryCon
                                        );
                                        e.stopPropagation();
                                      }
                                      e.stopPropagation();
                                    }}
                                  >
                                    ● {hoverItem1.catVal ? hoverItem1.catDesc : hoverItem1.showName}
                                  </b>
                                </div>
                                {hoverItem1.list.map((hoverItem2, hoverIndex2) => (
                                  <span
                                    key={
                                      hoverItem2.catVal ? hoverItem2.catDesc : hoverItem2.showName
                                    }
                                    onClick={e => {
                                      const queryCon = `${
                                        left1.catVal ? left1.catDesc : left1.showName
                                      } - ${left2.catVal ? left2.catDesc : left2.showName} - ${
                                        hoverItem1.catVal ? hoverItem1.catDesc : hoverItem1.showName
                                      } - ${
                                        hoverItem2.catVal ? hoverItem2.catDesc : hoverItem2.showName
                                      }`;
                                      this.menuClick(
                                        [
                                          { [left1.catDId]: left1.id },
                                          { [left2.catDId]: left2.id },
                                          { [hoverItem1.catDId]: hoverItem1.id },
                                          { [hoverItem2.catDId]: hoverItem2.id },
                                        ],
                                        queryCon
                                      );
                                      e.stopPropagation();
                                    }}
                                  >
                                    {hoverItem2.catDesc || ''}
                                  </span>
                                ))}
                              </div>
                              {hoverIndex1 < hoverList.length - 1 ? <Divider dashed /> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Col>
    );
  }
}

export default HomePageList;
