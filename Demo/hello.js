import React, { Component } from 'react';
class TestRef extends Component {
  render() {
    return (
      <div>
        <h2>Welcom1e to React components</h2>
      </div>
    );
  }
  componentDidMount() {
    console.log(this);
  }
}
export default class extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }
  render() {
    return (
      <div>
        <TestRef ref={this.myRef} />
        <button onClick={this.getRef.bind(this)}>getRef</button>
      </div>
    );
  }
  getRef() {
    console.log(this.myRef);
  }
}
