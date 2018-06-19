import ReactDom from 'react-dom';

export interface CustomizeElement extends Node {
  _selfFlag?: boolean | undefined;
  parentNode: CustomizeElement;
}

export function deepCopy(source: any, target: any) {
  target = (typeof target === 'object' && target) || {};
  for (let key in source) {
    target[key] =
      typeof source[key] === 'object'
        ? deepCopy(source[key], (target[key] = {}))
        : source[key];
  }
  return target;
}

export function deepMerge(from: any, to: any) {
  to = to || {};
  for (let key in from) {
    if (typeof from[key] === 'object') {
      if (typeof to[key] === 'undefined') {
        to[key] = {};
        deepCopy(from[key], to[key]);
      } else {
        deepMerge(from[key], to[key]);
      }
    } else {
      if (typeof to[key] === 'undefined') {
        to[key] = from[key];
      }
    }
  }
  return to;
}

let gutter: number;

export function getGutter() {
  if (gutter !== undefined) {
    return gutter;
  }
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';
  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  if (outer && outer.parentNode) {
    outer.parentNode.removeChild(outer);
  }
  gutter = widthNoScroll - widthWithScroll;
  return gutter;
}

const doneUtil: { [key: string]: boolean } = {
  refreshDomStyle: false,
  loadDomStyle: false,
  hide: false
};
export function hideSystemBar() {
  /* istanbul ignore next */
  {
    if (doneUtil.hide) {
      return;
    }
    doneUtil.hide = true;
    let styleDom = document.createElement('style');
    styleDom.type = 'text/css';
    styleDom.innerHTML =
      '.vuescroll-panel::-webkit-scrollbar{width:0;height:0}';
    document
      .getElementsByTagName('HEAD')
      .item(0)
      .appendChild(styleDom);
  }
}

const styleMap: { [key: string]: string } = {};

styleMap.refreshDomStyle = `
.vuescroll-refresh {
    position:absolute;
    width: 100%;
    color: black;
    height: 50px;
    text-align: center;
    font-size: 16px;
    line-height: 50px;
}
.vuescroll-refresh svg {
    margin-right: 10px;
    width: 25px;
    height: 25px;
    vertical-align: sub;
}
.vuescroll-refresh svg path,
.vuescroll-refresh svg rect{
fill: #FF6700;
}
`;

styleMap.loadDomStyle = `
.vuescroll-load {
    position:absolute;
    width: 100%;
    color: black;
    height: 50px;
    text-align: center;
    font-size: 16px;
    line-height: 50px;
}
.vuescroll-load svg {
    margin-right: 10px;
    width: 25px;
    height: 25px;
    vertical-align: sub;
}
.vuescroll-load svg path,
.vuescroll-load svg rect{
fill: #FF6700;
}
`;

export function createDomStyle(styleType: string) {
  if (doneUtil[styleType]) {
    return;
  }
  doneUtil[styleType] = true;
  let styleDom = document.createElement('style');
  styleDom.type = 'text/css';
  styleDom.innerHTML = styleMap[styleType];
  document
    .getElementsByTagName('HEAD')
    .item(0)
    .appendChild(styleDom);
}

export function eventCenter(
  dom: CustomizeElement,
  eventName: string,
  hander: (e: any) => void,
  capture = false,
  type = 'on'
) {
  type == 'on'
    ? dom.addEventListener(eventName, hander, capture)
    : dom.removeEventListener(eventName, hander, capture);
}
// native console
export const log = console;

export function isChildInParent(
  child: CustomizeElement,
  parent: CustomizeElement
) {
  let flag = false;
  if (!child || !parent) {
    return flag;
  }
  while (
    child.parentNode !== parent &&
    child.parentNode &&
    child.parentNode.nodeType !== 9 &&
    !child.parentNode._selfFlag
  ) {
    child = child.parentNode;
  }
  if (child.parentNode == parent) {
    flag = true;
  }
  return flag;
}

const pxValueReg = /(.*?)px/;
export function extractNumberFromPx(value: string) {
  const returnVal = pxValueReg.exec(value);
  return returnVal && returnVal[1];
}

export function isSupportTouch() {
  return 'ontouchstart' in window;
}

export function getPrefix(global: any) {
  let docStyle = document.documentElement.style;
  let engine: string = 'webkit';
  /* istanbul ignore if */
  if (
    global.opera &&
    Object.prototype.toString.call(global.opera) === '[object Opera]'
  ) {
    engine = 'presto';
  } /* istanbul ignore next */ else if ('MozAppearance' in docStyle) {
    engine = 'gecko';
  } else if ('WebkitAppearance' in docStyle) {
    engine = 'webkit';
  }
  const allTypes: any = {
    trident: 'ms',
    gecko: 'moz',
    webkit: 'webkit',
    presto: 'O'
  };
  let vendorPrefix: any = allTypes[engine];
  return vendorPrefix;
}

export function isSupportGivenStyle(property: any, value: string) {
  const compatibleValue = `-${getPrefix(window)}-${value}`;
  const testElm = document.createElement('div');
  testElm.style[property] = compatibleValue;
  if (testElm.style[property] == compatibleValue) {
    return compatibleValue;
  }
  /* istanbul ignore next */
  return false;
}

export function findDom(ref: React.ReactInstance): Element {
  const foundElm = ReactDom.findDOMNode(ref);
  const rtn: Element = (foundElm.nodeType == 1
    ? foundElm
    : document.createElement('div')) as Element;
  return rtn;
}
