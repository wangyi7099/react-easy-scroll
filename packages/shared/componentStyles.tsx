import { PositionProperty } from 'csstype';

const containerStyle = {
  padding: 0,
  position: 'relative',
  overflow: 'hidden'
};

type positionStyle = PositionProperty;

interface Style {
  position: positionStyle;
  [key: string]: any;
}

const panelStyle: Style = {
  position: 'relative',
  height: '100%'
};

const contentStyle: Style = {
  position: 'relative',
  minHeight: '100%',
  minWidth: '100%'
};

const railStyle: Style = {
  position: 'absolute',
  zIndex: 1
};

const barStyle: Style = {
  borderRadius: 'inherit',
  cursor: 'pointer',
  position: 'relative',
  transition: 'opacity .5s',
  userSelect: 'none'
};

export { containerStyle, panelStyle, contentStyle, railStyle, barStyle };
