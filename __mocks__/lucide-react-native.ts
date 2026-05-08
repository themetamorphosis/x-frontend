const React = require("react");

function mockIcon(name: string) {
  const component = (props: any) => React.createElement(name, props);
  component.displayName = name;
  return component;
}

module.exports = new Proxy(
  {},
  {
    get: (_target, prop: string) => mockIcon(prop),
  }
);
