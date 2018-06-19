import React, { HTMLAttributes } from 'react';
import { Config } from '../shared/defaultConfig';
import { animateStage, Dest } from './Container';
import { panelStyle } from '../shared/componentStyles';
import { WrapContent } from './Content';

export interface UserPassProps {
  renderPanel(
    props?: any
  ): React.ReactElement<any> | React.DetailedReactHTMLElement<any, any>;
  renderContent(
    props?: any
  ): React.ReactElement<any> | React.DetailedReactHTMLElement<any, any>;
}
export interface ReservedProps extends React.HTMLAttributes<HTMLElement> {
  mergedOptions: Config;
  currentStage?: animateStage;
  className: string;
  callScrollTo: ({ x, y }: Dest) => void;
  forwardedRef: any;
  handleScroll: (e: any) => void;
}
export type ComponentProps = ReservedProps & UserPassProps;

class Panel extends React.PureComponent<ComponentProps> {
  componentDidMount() {
    this.autoScroll();
  }
  render() {
    let data = {
      class: ['vuescroll-panel']
    };
    const {
      renderContent,
      renderPanel,
      handleScroll,
      children,
      ...extraProps
    } = this.props;
    return React.cloneElement<any>(
      renderPanel(this.props),
      {
        className: 'scroll-panel',
        onScroll: handleScroll,
        style: panelStyle,
        // mxied props
        ...extraProps
      },
      children
    );
  }
  // methods
  autoScroll() {
    let x: string | number = 0;
    let y: string | number = 0;
    const { Panel } = this.props.mergedOptions;
    if (Panel.initialScrollX) {
      x = Panel.initialScrollX;
    }
    if (Panel.initialScrollY) {
      y = Panel.initialScrollY;
    }
    if (x || y) {
      this.props.callScrollTo({ x, y });
    }
  }
}
function CreatePanel(Panel: any) {
  function PanelWrapper(props: ComponentProps) {
    // scrollPanel data start
    const { forwardedRef, ...rest } = this.props;
    const PanelExtraProps = {
      style: {}
    };
    // set overflow only if the in native mode
    if (vm.mode == 'native') {
      // dynamic set overflow scroll
      // feat: #11
      if (vm.mergedOptions.scrollPanel.scrollingY) {
        scrollPanelData.style.overflowY = vm.bar.vBar.state.size
          ? 'scroll'
          : '';
      } else {
        scrollPanelData.style.overflowY = 'hidden';
      }
      if (vm.mergedOptions.scrollPanel.scrollingX) {
        scrollPanelData.style.overflowX = vm.bar.hBar.state.size
          ? 'scroll'
          : '';
      } else {
        scrollPanelData.style.overflowX = 'hidden';
      }
      let gutter = getGutter();
      /* istanbul ignore if */
      if (!gutter) {
        hideSystemBar();
        scrollPanelData.style.height = '100%';
      } else {
        // hide system bar by use a negative value px
        // gutter should be 0 when manually disable scrollingX #14
        if (vm.bar.vBar.state.size && vm.mergedOptions.scrollPanel.scrollingY) {
          scrollPanelData.style.marginRight = `-${gutter}px`;
        }
        if (vm.bar.hBar.state.size && vm.mergedOptions.scrollPanel.scrollingX) {
          scrollPanelData.style.height = `calc(100% + ${gutter}px)`;
        }
      }
      // clear legency styles of slide mode...
      scrollPanelData.style.transformOrigin = '';
      scrollPanelData.style.transform = '';
    } else if (vm.mode == 'slide') {
      scrollPanelData.style.transformOrigin = 'left top 0px';
      scrollPanelData.style.userSelect = 'none';
      scrollPanelData.style.height = '';
      // add box-sizing for sile mode because
      // let's use scrollPanel intead of scrollContent to wrap content
      scrollPanelData.style['box-sizing'] = 'border-box';
      scrollPanelData.style['min-width'] = '100%';
      scrollPanelData.style['min-height'] = '100%';
      let width = isSupportGivenStyle('width', 'fit-content');
      if (width) {
        scrollPanelData.style.width = width;
      } /* istanbul ignore next */ else {
        // fallback to inline block while
        // doesn't support 'fit-content',
        // this may cause some issues, but this
        // can make `resize` event work...
        scrollPanelData.display = 'inline-block';
      }
    } else if (vm.mode == 'pure-native') {
      scrollPanelData.style.width = '100%';
      if (vm.mergedOptions.scrollPanel.scrollingY) {
        scrollPanelData.style.overflowY = 'auto';
      } else {
        scrollPanelData.style.overflowY = 'hidden';
      }
      if (vm.mergedOptions.scrollPanel.scrollingX) {
        scrollPanelData.style.overflowX = 'auto';
      } else {
        scrollPanelData.style.overflowX = 'hidden';
      }
    }
    return (
      <scrollPanel {...scrollPanelData}>
        {createPanelChildren(vm, h)}
      </scrollPanel>
    );
  }
}

// export const PanelWrapper = (renderPanel, renderContent, config) => {};
