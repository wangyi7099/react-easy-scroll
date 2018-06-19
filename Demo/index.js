import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Test from '../dist/ReactSuperScroll.common'

 
class App extends React.Component {
  componentDidMount() {
    console.log(this);
    console.log(ReactDOM.findDOMNode(this.refs['rf']))
  }
  render() {
    return (
      <Test ref="rf"/>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
