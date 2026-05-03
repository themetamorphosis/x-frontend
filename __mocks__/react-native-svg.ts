const React = require("react");

function mockComponent(name: string) {
  const component = (props: any) => {
    const { children, ...rest } = props;
    return React.createElement(name, rest, children);
  };
  component.displayName = name;
  return component;
}

module.exports = {
  SvgXml: mockComponent("SvgXml"),
  SvgUri: mockComponent("SvgUri"),
  default: mockComponent("Svg"),
  Circle: mockComponent("Circle"),
  Rect: mockComponent("Rect"),
  Path: mockComponent("Path"),
  Line: mockComponent("Line"),
  G: mockComponent("G"),
};
