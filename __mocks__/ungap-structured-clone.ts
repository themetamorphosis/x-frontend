const structuredClone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export default structuredClone;
