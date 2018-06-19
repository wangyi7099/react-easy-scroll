import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import ops from '../shared/defaultConfig';
import { isSupportTouch, findDom } from '../shared/util';
import { Config } from '../shared/defaultConfig';
import {
  renderContainer,
  renderPanel,
  renderContent
} from '../shared/defaultRenderFunc';
import { containerStyle } from '../shared/componentStyles';

import { BarWrapper } from './scrollbar';
import { PanelWrapper } from './Panel';

import { core } from '../third-party/scroller/animate';
import {
  createEasingFunction,
  easingPattern
} from '../third-party/easingPattern';

interface Style {
  [key: string]: string | number;
}
export interface ReservedProps {
  ref: React.RefObject<any>;
  className: string;
  style: Style;
  onMouseenter(): void;
  onMouseleave(): void;
  onMousemove(): void;
  onTouchstart(): void;
  onTouchend(): void;
  onTouchmove(): void;
}
export interface UserPassProps {
  ops: Config;
  renderContainer(props?: any): React.ReactElement<ComponentProps>;
  renderPanel(props?: any): React.ReactElement<ComponentProps>;
  renderContent(props?: any): React.ReactElement<ComponentProps>;
}
export type ComponentProps = ReservedProps & UserPassProps;
export type animateStage = 'deactive' | 'active' | 'start' | 'beforeDeactive';
export interface BarState {
  move: number;
  size: number;
  opacity: number;
}
export interface ComponentStates {
  Container: {
    width: string;
    height: string;
    refreshStage: animateStage;
    loadStage: animateStage;
  };
  Bar: {
    VBar: BarState;
    HBar: BarState;
  };
}
export interface Dest {
  x?: string | number;
  y?: string | number;
}

function getNumericValue(distance, size) {
  let numbericValue: any = /(-?\d+(?:\.\d+?)?)%$/.exec(distance);
  if (!numbericValue) {
    numbericValue = distance - 0;
  } else {
    numbericValue = numbericValue[1] - 0;
    numbericValue = (size * numbericValue) / 100;
  }
  return numbericValue;
}

export default class ReactSuperScroll extends React.PureComponent<
  ComponentProps,
  ComponentStates
> {
  // static variables
  static PropTypes = {
    ops: PropTypes.object,
    renderContainer: PropTypes.func,
    renderPanel: PropTypes.func,
    renderContent: PropTypes.func
  };
  static defaultProps = {
    ops,
    renderContainer,
    renderPanel,
    renderContent
  };
  containerRef: React.RefObject<any>;
  panelRef: React.RefObject<any>;
  // check whether there is
  // an error or not, if there is,
  // will return the raw children.
  renderError: boolean = false;
  // store the options that has been merged from user passed
  // to default
  mergedOptions: Config;
  isDragging: boolean = false;
  isClickingBar: boolean = false;
  pointerLeave: boolean = true;
  // record the internal scrollTop or scrollLeft
  internalScrollTop: number = 0;
  internalScrollLeft: number = 0;
  // current scrolling direction
  posX: string = null;
  posY: string = null;
  // scroller instance
  scroller: any;
  // timeoutId control the Bar's show time
  timeoutId: number = 0;
  // lefecycle
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
    this.panelRef = React.createRef();
    this.state = {
      Container: {
        refreshStage: 'deactive',
        loadStage: 'deactive',
        height: '100%',
        width: '100%'
      },
      // VBar = verticalBar
      // HBar = horitontalBar
      Bar: {
        VBar: {
          move: 0,
          size: 0,
          opacity: 0
        },
        HBar: {
          move: 0,
          size: 0,
          opacity: 0
        }
      }
    };
  }
  render() {
    if (this.renderError) {
      return this.props.children;
    }
    const { renderContainer, renderPanel, renderContent } = this.props;
    const { width, height } = this.state.Container;
    const { containerRef } = this;

    const eventObject: any = {};
    const canTouch = isSupportTouch();
    eventObject[canTouch ? 'onTouchstart' : 'onMouseenter'] = () => {
      this.pointerLeave = false;
      this.updateBarStateAndEmitEvent();
    };
    eventObject[canTouch ? 'onTouchleave' : 'onMouseenter'] = () => {
      this.pointerLeave = false;
      this.updateBarStateAndEmitEvent();
    };
    eventObject[canTouch ? 'onTouchmove' : 'onMousemove'] = () => {
      this.pointerLeave = false;
      this.updateBarStateAndEmitEvent();
    };
    return React.cloneElement<ComponentProps>(
      renderContainer(this.props),
      {
        ref: containerRef,
        className: 'react-super-scroll',
        style: {
          width,
          height,
          ...containerStyle
        },
        ...eventObject
      },
      <React.Fragment>
        <BarWrapper
          type="vertical"
          barState={this.state.Bar.VBar}
          mergedOptions={this.mergedOptions}
          setBarClick={this.setBarClick.bind(this)}
          scrollByBar={this.scrollByBar.bind(this)}
        />
        <BarWrapper
          type="horizontal"
          barState={this.state.Bar.HBar}
          mergedOptions={this.mergedOptions}
          setBarClick={this.setBarClick.bind(this)}
          scrollByBar={this.scrollByBar.bind(this)}
        />
      </React.Fragment>
    );
  }

  // private methods
  // ----------------
  // For internal use

  setBarClick(isClickingBar) {
    this.isClickingBar = isClickingBar;
    if (isClickingBar) {
      this.showBar();
    } else {
      this.hideBar();
    }
  }
  scrollByBar(axis: 'x' | 'y', panelScrollSizePercent: number) {
    const positon =
      findDom(this.panelRef.current).scrollHeight * panelScrollSizePercent;
    this.scrollTo({ [axis]: positon });
  }
  updateBarStateAndEmitEvent(eventType?, nativeEvent?) {
    const mode = this.mergedOptions.Container.mode;
    if (mode == 'native' || mode == 'pure-native') {
      this.updateNativeModeBarState();
    } else if (mode == 'slide') {
      if (!this.scroller) {
        return;
      }
      this.updateSlideModeBarState();
    }
    if (eventType) {
      this.emitEvent(eventType, nativeEvent);
    }
    this.showAndDefferedHideBar();
  }
  handleScroll(nativeEvent) {
    this.recordCurrentPos();
    this.updateBarStateAndEmitEvent('handle-scroll', nativeEvent);
  }
  // update native/pure-native mode Bar state
  updateNativeModeBarState() {
    const panelElm = findDom(this.panelRef.current);
    const containerElm = findDom(this.containerRef.current);

    const isPercent = this.mergedOptions.Container.sizeStrategy == 'percent';
    const clientWidth = containerElm.clientWidth;
    const clientHeight = containerElm.clientHeight;
    let heightPercentage = (clientHeight * 100) / panelElm.scrollHeight;
    let widthPercentage = (clientWidth * 100) / panelElm.scrollWidth;
    this.setState((preState: ComponentStates) => ({
      Bar: {
        VBar: {
          ...preState.Bar.VBar,
          move: (containerElm.scrollTop * 100) / clientHeight,
          size: heightPercentage < 100 ? heightPercentage : 0
        },
        HBar: {
          ...preState.Bar.HBar,
          move: (containerElm.scrollLeft * 100) / clientWidth,
          size: widthPercentage < 100 ? widthPercentage : 0
        }
      }
    }));
  }
  recordCurrentPos() {
    let mode = this.mode;
    if (this.mode !== this.lastMode) {
      mode = this.lastMode;
      this.lastMode = this.mode;
    }
    const state = this.vuescroll.state;
    let axis = findValuesByMode(mode, this);
    const oldX = state.internalScrollLeft;
    const oldY = state.internalScrollTop;
    state.posX =
      oldX - axis.x > 0 ? 'right' : oldX - axis.x < 0 ? 'left' : null;
    state.posY = oldY - axis.y > 0 ? 'up' : oldY - axis.y < 0 ? 'down' : null;
    state.internalScrollLeft = axis.x;
    state.internalScrollTop = axis.y;
  },
  // update slide mode Bar state
  updateSlideModeBarState() {
    // update slide mode scrollbars' state
    const panelElm = findDom(this.panelRef.current);
    const containerElm = findDom(this.containerRef.current);
    const scroller = this.scroller;
    let outerLeft = 0;
    let outerTop = 0;
    const clientWidth = containerElm.clientHeight;
    const clientHeight = containerElm.clientHeight;
    const contentWidth = clientWidth + this.scroller.__maxScrollLeft;
    const contentHeight = clientHeight + this.scroller.__maxScrollTop;
    const enableScrollX =
      clientWidth < contentWidth && this.mergedOptions.Panel.scrollingX;
    const enableScrollY =
      clientHeight < contentHeight && this.mergedOptions.Panel.scrollingY;
    // out of horizontal bountry
    if (enableScrollX) {
      /* istanbul ignore if */
      if (scroller.__scrollLeft < 0) {
        outerLeft = -scroller.__scrollLeft;
      } /* istanbul ignore next */ else if (
        scroller.__scrollLeft > scroller.__maxScrollLeft
      ) {
        outerLeft = scroller.__scrollLeft - scroller.__maxScrollLeft;
      }
    }
    // out of vertical bountry
    if (enableScrollY) {
      if (scroller.__scrollTop < 0) {
        outerTop = -scroller.__scrollTop;
      } else if (scroller.__scrollTop > scroller.__maxScrollTop) {
        outerTop = scroller.__scrollTop - scroller.__maxScrollTop;
      }
    }
    const heightPercentage = (clientHeight * 100) / (contentHeight + outerTop);
    const widthPercentage = (clientWidth * 100) / (contentWidth + outerLeft);
    const scrollTop = Math.min(
      Math.max(0, scroller.__scrollTop),
      scroller.__maxScrollTop
    );
    const scrollLeft = Math.min(
      Math.max(0, scroller.__scrollLeft),
      scroller.__maxScrollLeft
    );
    let moveY = ((containerElm.scrollTop + outerTop) * 100) / clientHeight;
    let moveX = ((containerElm.scrollLeft + outerLeft) * 100) / clientWidth;
    if (scroller.__scrollLeft < 0) {
      moveX = 0;
    }
    if (scroller.__scrollTop < 0) {
      moveY = 0;
    }
    this.setState((preState: ComponentStates) => ({
      Bar: {
        VBar: {
          ...preState.Bar.VBar,
          move: moveY,
          size: heightPercentage < 100 ? heightPercentage : 0
        },
        HBar: {
          ...preState.Bar.HBar,
          move: moveX,
          size: widthPercentage < 100 ? widthPercentage : 0
        }
      }
    }));
  }

  // show Bar and hide Bar later
  showAndDefferedHideBar() {
    this.showBar();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = 0;
    }
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = 0;
      this.hideBar();
    }, this.mergedOptions.Bar.showDelay);
  }
  // show Bar
  showBar() {
    this.setState((preState: ComponentStates) => ({
      Bar: {
        VBar: {
          ...preState.Bar.VBar,
          opacity: this.mergedOptions.Bar.VBar.opacity
        },
        HBar: {
          ...preState.Bar.VBar,
          opacity: this.mergedOptions.Bar.HBar.opacity
        }
      }
    }));
  }
  hideBar() {
    // when dtagging, just return
    /* istanbul ignore next */
    if (this.isDragging) {
      return;
    }
    if (
      !this.mergedOptions.Bar.VBar.keepShow &&
      !this.isClickingBar &&
      this.pointerLeave
    ) {
      this.setState((preState: ComponentStates) => ({
        Bar: {
          ...preState.Bar,
          VBar: {
            ...preState.Bar.VBar,
            opacity: 0
          }
        }
      }));
    }
    if (
      !this.mergedOptions.Bar.HBar.keepShow &&
      !this.isClickingBar &&
      this.pointerLeave
    ) {
      this.setState((preState: ComponentStates) => ({
        Bar: {
          ...preState.Bar,
          HBar: {
            ...preState.Bar.HBar,
            opacity: 0
          }
        }
      }));
    }
  }
  emitEvent(eventType: string, nativeEvent: any) {
    const emit = (type: any, ...args: any[]) => {
      if (typeof this.props[type] == 'function') {
        this.props[type].apply(args);
      }
    };

    const panelElm = findDom(this.panelRef.current);
    const containerElm = findDom(this.containerRef.current);
    let {
      scrollHeight,
      scrollWidth,
      clientHeight,
      clientWidth,
      scrollTop,
      scrollLeft
    } = panelElm;

    const vertical: any = {
      type: 'vertical'
    };
    const horizontal: any = {
      type: 'horizontal'
    };
    if (this.mergedOptions.Container.mode == 'slide') {
      scrollHeight = this.scroller.__contentHeight;
      scrollWidth = this.scroller.__contentWidth;
      scrollTop = this.scroller.__scrollTop;
      scrollLeft = this.scroller.__scrollLeft;
      clientHeight = containerElm.clientHeight;
      clientWidth = containerElm.clientWidth;
    }
    vertical.process = Math.min(scrollTop / (scrollHeight - clientHeight), 1);
    horizontal.process = Math.min(scrollLeft / (scrollWidth - clientWidth), 1);
    vertical.barSize = this.state.Bar.VBar.size;
    horizontal.barSize = this.state.Bar.HBar.size;
    vertical.scrollTop = scrollTop;
    horizontal.scrollLeft = scrollLeft;
    vertical.directionY = this.posY;
    horizontal.directionX = this.posX;

    emit.call(this, eventType, vertical, horizontal, nativeEvent);
  }
  // -----
  // all scroll* api will call internalScrollTo eventually
  internalScrollTo(destX, destY, animate, force) {
    const mode = this.mergedOptions.Container.mode;
    const panelElm = findDom(this.panelRef.current);

    // animate function
    function startScrolling(
      elm,
      deltaX,
      deltaY,
      speed,
      easing,
      scrollingComplete
    ) {
      const startLocationY = elm.scrollTop;
      const startLocationX = elm.scrollLeft;
      let positionX = startLocationX;
      let positionY = startLocationY;

      /* istanbul ignore next */
      if (startLocationY + deltaY < 0) {
        deltaY = -startLocationY;
      }
      const scrollHeight = elm.scrollHeight;
      if (startLocationY + deltaY > scrollHeight) {
        deltaY = scrollHeight - startLocationY;
      }
      if (startLocationX + deltaX < 0) {
        deltaX = -startLocationX;
      }
      if (startLocationX + deltaX > elm.scrollWidth) {
        deltaX = elm.scrollWidth - startLocationX;
      }

      const easingMethod = createEasingFunction(easing, easingPattern);

      const stepCallback = (percentage) => {
        positionX = startLocationX + deltaX * percentage;
        positionY = startLocationY + deltaY * percentage;
        elm.scrollTop = Math.floor(positionY);
        elm.scrollLeft = Math.floor(positionX);
      };

      const verifyCallback = () => {
        return (
          Math.abs(positionY - startLocationY) <= Math.abs(deltaY) ||
          Math.abs(positionX - startLocationX) <= Math.abs(deltaX)
        );
      };

      core.effect.Animate.start(
        stepCallback,
        verifyCallback,
        scrollingComplete,
        speed,
        easingMethod
      );
    }
    if (mode == 'native' || mode == 'pure-native') {
      if (animate) {
        // hadnle for scroll complete
        const scrollingComplete = () => {
          this.updateBarStateAndEmitEvent('handle-scroll-complete');
        };
        startScrolling(
          panelElm,
          destX - panelElm.scrollLeft,
          destY - panelElm.scrollTop,
          this.mergedOptions.Panel.speed,
          this.mergedOptions.Panel.easing,
          scrollingComplete
        );
      } else {
        panelElm.scrollTop = destY;
        panelElm.scrollLeft = destX;
      }
    } else if (mode == 'slide') {
      this.scroller.scrollTo(destX, destY, animate, undefined, force);
    }
  }
  // public Api
  // ---------
  scrollTo({ x, y }: Dest, animate = true, force = false) {
    const panelElm = findDom(this.panelRef.current);
    if (typeof x === 'undefined') {
      x = this.internalScrollLeft || 0;
    } else {
      x = getNumericValue(x, panelElm.scrollWidth);
    }
    if (typeof y === 'undefined') {
      y = this.internalScrollTop || 0;
    } else {
      y = getNumericValue(y, panelElm.scrollHeight);
    }
    this.internalScrollTo(x, y, animate, force);
  }
}
