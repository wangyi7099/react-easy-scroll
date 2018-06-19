import React from 'react';
import { PositionProperty } from 'csstype';

import scrollMap from '../shared/scrollMap';
import { eventCenter, isSupportTouch } from '../shared/util';
import { Config } from '../shared/defaultConfig';

import { BarState } from './container';

export interface ComponentProps {
  type: 'vertical' | 'horizontal';
  barState: BarState;
  mergedOptions: Config;
  setBarClick: (isClickingBar: boolean) => {};
  scrollByBar: (axis: string, panelScrollSizePercent: string) => {};
}

const colorCache = {};
const rgbReg = /rgb\(/;
const extractRgbColor = /rgb\((.*)\)/;

/* istanbul ignore next */
function createMouseEvent(ctx) {
  const bar = ctx.barRef.current;
  const rail = ctx.railRef.current;

  function mousedown(e) {
    e.stopImmediatePropagation();
    document.onselectstart = () => false;
    ctx.axisStartPos =
      e[ctx.bar.client] - bar.getBoundingClientRect()[ctx.bar.posName];
    // tell parent that the mouse has been down.
    ctx.emit('setBarClick', true);
    eventCenter(document, 'mousemove', mousemove);
    eventCenter(document, 'mouseup', mouseup);
  }
  function mousemove(e) {
    if (!ctx.axisStartPos) {
      return;
    }
    const delta =
      e[ctx.bar.client] - rail.getBoundingClientRect()[ctx.bar.posName];
    const percent = (delta - ctx.axisStartPos) / rail[ctx.bar.offset];
    ctx.emit('scrollByBar', ctx.bar.axis.toLowerCase(), percent);
  }
  function mouseup() {
    ctx.emit('setBarClick', false);
    document.onselectstart = null;
    ctx.axisStartPos = 0;
    eventCenter(document, 'mousemove', mousemove, false, 'off');
    eventCenter(document, 'mouseup', mouseup, false, 'off');
  }

  return mousedown;
}
/* istanbul ignore next */
function createTouchEvent(ctx) {
  const bar = ctx.barRef.current;
  const rail = ctx.railRef.current;
  function touchstart(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    document.onselectstart = () => false;
    ctx.axisStartPos =
      e.touches[0][ctx.bar.client] -
      bar.getBoundingClientRect()[ctx.bar.posName];
    // tell parent that the mouse has been down.
    ctx.emit('setBarClick', true);
    eventCenter(document, 'touchmove', touchmove);
    eventCenter(document, 'touchend', touchend);
  }
  function touchmove(e) {
    if (!ctx.axisStartPos) {
      return;
    }
    const delta =
      e.touches[0][ctx.bar.client] -
      rail.getBoundingClientRect()[ctx.bar.posName];
    const percent = (delta - ctx.axisStartPos) / rail[ctx.bar.offset];
    ctx.emit('scrollByBar', ctx.bar.axis.toLowerCase(), percent);
  }
  function touchend() {
    ctx.emit('setBarClick', false);
    document.onselectstart = null;
    ctx.axisStartPos = 0;
    eventCenter(document, 'touchmove', touchmove, false, 'off');
    eventCenter(document, 'touchend', touchend, false, 'off');
  }
  return touchstart;
}
function getRgbAColor(color, opacity) {
  const id = color + '&' + opacity;
  if (colorCache[id]) {
    return colorCache[id];
  }
  const div = document.createElement('div');
  div.style.background = color;
  document.body.appendChild(div);
  const computedColor = window.getComputedStyle(div).backgroundColor;
  document.body.removeChild(div);
  /* istanbul ignore if */
  if (!rgbReg.test(computedColor)) {
    return color;
  }
  return (colorCache[id] = `rgba(${
    extractRgbColor.exec(computedColor)[1]
  }, ${opacity})`);
}
/* istanbul ignore next */
function handleRailClick(e, vm) {
  const { client, posName, scrollSize, offset, axis } = vm.bar;
  const inner = vm.barRef.current;
  const barOffset = inner[offset];
  const percent =
    (e[client] -
      e.currentTarget.getBoundingClientRect()[posName] -
      barOffset / 2) /
    e.currentTarget[offset];
  const pos = vm.railRef.current[scrollSize] * percent;
  parent.scrollTo({ [axis.toLowerCase()]: pos });
}

class ScrollBar extends React.PureComponent<ComponentProps> {
  bar: any;
  railRef: React.RefObject<HTMLDivElement>;
  barRef: React.RefObject<HTMLDivElement>;
  axisStartPos: 0;
  constructor(props) {
    super(props);
    this.railRef = React.createRef();
    this.barRef = React.createRef();
  }
  render() {
    const vm = this;
    const { mergedOptions: ops, type, barState } = vm.props;
    const railOps = ops.Rail[type == 'vertical' ? 'VRail' : 'HRail'];
    const barOps = ops.Bar[type == 'vertical' ? 'VBar' : 'HBar'];

    vm.bar = scrollMap[type];

    const railBackgroundColor = getRgbAColor(
      railOps.background,
      railOps.opacity
    );
    const position: PositionProperty = 'absolute';
    const rail: any = {
      className: `vuescroll-${type}-rail`,
      style: {
        position: 'absolute',
        zIndex: 1,
        borderRadius: railOps[vm.bar.opsSize],
        background: railBackgroundColor,
        [vm.bar.opsSize]: railOps[vm.bar.opsSize],
        [vm.bar.posName]: '2px',
        [vm.bar.opposName]: '2px',
        [railOps.pos]: '2px'
      },
      onClick(e) /* istanbul ignore next */ {
        handleRailClick(e, vm);
      },
      ref: vm.railRef
    };
    const barStyle = {
      [vm.bar.posName]: 0,
      [vm.bar.opsSize]: '100%',
      borderRadius: 'inherit',
      [vm.bar.size]: barState.size,
      background: railOps.background,
      opacity: railOps.opacity,
      transform: `translate${scrollMap[type].axis}(${barState.move}%)`,
      cursor: 'pointer',
      position: 'relative',
      transition: 'opacity .5s',
      userSelect: 'none'
    };
    const bar: any = {
      style: barStyle,
      class: `vuescroll-${type}-bar`,
      ref: vm.barRef,
      on: {}
    };
    /* istanbul ignore if */
    if (barOps.hover) {
      bar.on.mouseenter = () => {
        vm.barRef.current.style.background = barOps.hover as string;
      };
      bar.on.mouseleave = () => {
        vm.barRef.current.style.background = barOps.background;
      };
    }
    /* istanbul ignore if */
    if (isSupportTouch()) {
      bar.on.touchstart = createTouchEvent(vm);
    } else {
      bar.on.mousedown = createMouseEvent(vm);
    }
    return (
      <div {...rail}>
        <div {...bar} />
      </div>
    );
  }
  emit(deliveredMethod, ...args) {
    const method = this.props[deliveredMethod];
    method(...args);
  }
}

export class BarWrapper extends React.Component<ComponentProps> {
  render() {
    const vm = this;
    const { mergedOptions: ops, type, barState } = vm.props;
    const barMap = scrollMap[type];
    const barOps = ops.Bar[type == 'vertical' ? 'VBar' : 'HBar'];
    const refreshLoad =
      ops.Container.pullRefresh.enable || ops.Container.pushLoad.enable;
    if (
      !barState.size ||
      !ops.Panel['scrolling' + barMap.axis] ||
      ops.Container.mode == 'pure-native' ||
      (refreshLoad && type !== 'vertical' && ops.Container.mode === 'slide')
    ) {
      return null;
    }
    return <ScrollBar {...this.props} />;
  }
}
