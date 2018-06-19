import { modes } from './constants';
import { log } from './util';

/**vuescroll */
interface Tips {
  deactive: string;
  active: string;
  start: string;
  beforeDeactive: string;
}

interface PullRefreshOrPushLoad {
  enable: boolean;
  tips: Tips;
}

interface Snapping {
  enable: boolean;
  width: number;
  height: number;
}

interface Container {
  // slide or native or pure-native
  mode: string;
  // The width of vuescroll is a percent or a pixed value?
  sizeStrategy: 'percent' | 'number';
  pullRefresh: PullRefreshOrPushLoad;
  pushLoad: PullRefreshOrPushLoad;
  paging: boolean;
  zooming: boolean;
  snapping: Snapping;
  scroller: object;
}
/**vuescroll end*/

/**scroll Panel*/
type easing =
  | 'easeInQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint';

interface Panel {
  initialScrollY: false | string | number;
  initialScrollX: false | string | number;
  scrollingX: boolean;
  scrollingY: boolean;
  speed: number;
  easing: easing | undefined;
}
/**scroll Panel end*/

/**rail start */
interface VRail {
  width: string;
  pos: string;
  background: string;
  opacity: number;
}
interface HRail {
  height: string;
  pos: string;
  background: string;
  opacity: number;
}
interface Rail {
  VRail: VRail;
  HRail: HRail;
}
/**rail end */
/**bar start */
interface BarType {
  background: string;
  keepShow: boolean;
  opacity: number;
  hover: false | string;
}
interface Bar {
  showDelay: number;
  VBar: BarType;
  HBar: BarType;
}
/**bar end */

/** config defination */
export interface Config {
  Container: Container;
  Panel: Panel;
  Bar: Bar;
  Rail: Rail;
}

const defaultConfig: Config = {
  // Container
  Container: {
    mode: 'native',
    // Container's size(height/width) should be a percent(100%)
    // or be a number that is equal to its parentNode's width or
    // height ?
    sizeStrategy: 'percent',
    // pullRefresh or pushLoad is only for the slide mode...
    pullRefresh: {
      enable: false,
      tips: {
        deactive: 'Pull to Refresh',
        active: 'Release to Refresh',
        start: 'Refreshing...',
        beforeDeactive: 'Refresh Successfully!'
      }
    },
    pushLoad: {
      enable: false,
      tips: {
        deactive: 'Push to Load',
        active: 'Release to Load',
        start: 'Loading...',
        beforeDeactive: 'Load Successfully!'
      }
    },
    paging: false,
    zooming: true,
    snapping: {
      enable: false,
      width: 100,
      height: 100
    },
    // some scroller options
    scroller: {
      /** Enable bouncing (content can be slowly moved outside and jumps back after releasing) */
      bouncing: true,
      /** Enable locking to the main axis if user moves only slightly on one of them at start */
      locking: true,
      /** Minimum zoom level */
      minZoom: 0.5,
      /** Maximum zoom level */
      maxZoom: 3,
      /** Multiply or decrease scrolling speed **/
      speedMultiplier: 1,
      /** This configures the amount of change applied to deceleration when reaching boundaries  **/
      penetrationDeceleration: 0.03,
      /** This configures the amount of change applied to acceleration when reaching boundaries  **/
      penetrationAcceleration: 0.08,
      /** Whether call e.preventDefault event when sliding the content or not */
      preventDefault: true
    }
  },
  Panel: {
    // when component mounted.. it will automatically scrolls.
    initialScrollY: false,
    initialScrollX: false,
    // feat: #11
    scrollingX: true,
    scrollingY: true,
    speed: 300,
    easing: undefined
  },
  Rail: {
    VRail: {
      width: '6px',
      pos: 'right',
      background: '#01a99a',
      opacity: 0
    },
    //
    HRail: {
      height: '6px',
      pos: 'bottom',
      background: '#01a99a',
      opacity: 0
    }
  },
  Bar: {
    showDelay: 500,
    VBar: {
      background: '#00a650',
      keepShow: false,
      opacity: 1,
      hover: false
    },
    //
    HBar: {
      background: '#00a650',
      keepShow: false,
      opacity: 1,
      hover: false
    }
  }
};

export default defaultConfig;
/**
 * validate the options
 *
 * @export
 * @param {any} ops
 */
export function validateOptions(ops: Config) {
  let shouldStopRender = false;
  const { Container, Panel } = ops;

  // validate Container
  if (!~modes.indexOf(Container.mode)) {
    log.error(`The Container's option "mode" should be one of the ${modes}`);
    shouldStopRender = true;
  }

  if (
    Container.paging == Container.snapping.enable &&
    Container.paging &&
    (Container.pullRefresh || Container.pushLoad)
  ) {
    log.error(
      'paging, snapping, (pullRefresh with pushLoad) can only one of them to be true.'
    );
  }
  // validate Panel
  const initialScrollY = Panel.initialScrollY;
  const initialScrollX = Panel.initialScrollX;

  if (initialScrollY && !String(initialScrollY).match(/^\d+(\.\d+)?(%)?$/)) {
    log.error(
      'The prop `initialScrollY`' +
        'should be a percent number like 10% or an exact number that greater than or equal to 0 like 100.'
    );
  }

  if (initialScrollX && !String(initialScrollX).match(/^\d+(\.\d+)?(%)?$/)) {
    log.error(
      'The prop `initialScrollX`' +
        'should be a percent number like 10% or an exact number that greater than or equal to 0 like 100.'
    );
  }

  return shouldStopRender;
}
