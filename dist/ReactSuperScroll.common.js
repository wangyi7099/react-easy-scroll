/*
    * ReactSuperScroll 0.0.1
    * (c) 2018-2018 Yi(Yves) Wang
    * Released under the MIT License
    */
   
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var PropTypes = _interopDefault(require('prop-types'));

// all modes

// do nothing

// some small changes.

// native console

var global_config = {
    // container
    container: {
        mode: 'native',
        // container's size(height/width) should be a percent(100%)
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
    panel: {
        // when component mounted.. it will automatically scrolls.
        initialScrollY: false,
        initialScrollX: false,
        // feat: #11
        scrollingX: true,
        scrollingY: true,
        speed: 300,
        easing: undefined
    },
    rail: {
        vRail: {
            width: '6px',
            pos: 'right',
            background: '#01a99a',
            opacity: 0
        },
        //
        hRail: {
            height: '6px',
            pos: 'bottom',
            background: '#01a99a',
            opacity: 0
        }
    },
    bar: {
        showDelay: 500,
        vBar: {
            background: '#00a650',
            keepShow: false,
            opacity: 1,
            hover: false
        },
        //
        hBar: {
            background: '#00a650',
            keepShow: false,
            opacity: 1,
            hover: false
        }
    }
};
/**
 * validate the options
 *
 * @export
 * @param {any} ops
 */

var renderContainer = function renderContainer(props) {
    return React.createElement("div", null);
};
var renderPanel = function renderPanel(props) {
    return React.createElement("div", null);
};
var renderContent = function renderContent(props) {
    return React.createElement("div", null);
};

var containerStyle = {
    padding: 0,
    position: 'relative',
    overflow: 'hidden'
};

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ScrollBar = function (_React$Component) {
  _inherits(ScrollBar, _React$Component);

  function ScrollBar() {
    _classCallCheck(this, ScrollBar);

    return _possibleConstructorReturn(this, (ScrollBar.__proto__ || Object.getPrototypeOf(ScrollBar)).apply(this, arguments));
  }

  return ScrollBar;
}(React.Component);

var createBar = function createBar(_createBar, type) {};

var createPanel = function createPanel(renderPanel, renderContent, config) {};

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactSuperScroll = function (_React$Component) {
    _inherits$1(ReactSuperScroll, _React$Component);

    // lefecycle
    function ReactSuperScroll(props) {
        _classCallCheck$1(this, ReactSuperScroll);

        // check whether there is
        // an error or not, if there is,
        // will return the raw children.
        var _this = _possibleConstructorReturn$1(this, (ReactSuperScroll.__proto__ || Object.getPrototypeOf(ReactSuperScroll)).call(this, props));

        _this.renderError = false;
        _this.isDragging = false;
        _this.isClickingBar = false;
        _this.pointerLeave = true;
        // record the internal scrollTop or scrollLeft
        _this.internalScrollTop = 0;
        _this.internalScrollLeft = 0;
        // current scrolling direction
        _this.posX = null;
        _this.posY = null;
        _this.containerRef = React.createRef();
        _this.state = {
            scroll: {
                refreshStage: 'deactive',
                loadStage: 'deactive',
                height: '100%',
                width: '100%'
            },
            // vBar = verticalBar
            // hBar = horitontalBar
            bar: {
                vBar: {
                    move: 0,
                    size: 0,
                    opacity: 0
                },
                hBar: {
                    move: 0,
                    size: 0,
                    opacity: 0
                }
            }
        };
        return _this;
    }

    _createClass(ReactSuperScroll, [{
        key: 'render',
        value: function render() {
            if (this.renderError) {
                return this.props.children;
            }
            var _props = this.props,
                renderContainer$$1 = _props.renderContainer,
                renderPanel$$1 = _props.renderPanel,
                renderContent$$1 = _props.renderContent;
            var _state$scroll = this.state.scroll,
                width = _state$scroll.width,
                height = _state$scroll.height;
            var containerRef = this.containerRef;

            return React.cloneElement(renderContainer$$1(this.props), {
                ref: containerRef,
                className: 'react-super-scroll',
                style: Object.assign({ width: width,
                    height: height }, containerStyle)
            }, [createPanel(renderPanel$$1, renderContent$$1, this.mergedOptions), createBar('vertical', this.mergedOptions), createBar('horizontal', this.mergedOptions)]);
        }
        // methods

    }, {
        key: 'updateBarStateAndEmitEvent',
        value: function updateBarStateAndEmitEvent(eventType, nativeEvent) {
            var mode = this.mergedOptions.container.mode;
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
        // update native/pure-native mode bar state

    }, {
        key: 'updateNativeModeBarState',
        value: function updateNativeModeBarState() {}
        // update slide mode bar state

    }, {
        key: 'updateSlideModeBarState',
        value: function updateSlideModeBarState() {}
        // show bar and hide bar later

    }, {
        key: 'showAndDefferedHideBar',
        value: function showAndDefferedHideBar() {}
    }, {
        key: 'emitEvent',
        value: function emitEvent(eventType, nativeEvent) {}
    }]);

    return ReactSuperScroll;
}(React.Component);
// static variables


ReactSuperScroll.PropTypes = {
    ops: PropTypes.object,
    renderContainer: PropTypes.func,
    renderPanel: PropTypes.func,
    renderContent: PropTypes.func
};
ReactSuperScroll.defaultProps = {
    ops: global_config,
    renderContainer: renderContainer,
    renderPanel: renderPanel,
    renderContent: renderContent
};

exports.default = ReactSuperScroll;
exports.reactSuperScroll = ReactSuperScroll;
