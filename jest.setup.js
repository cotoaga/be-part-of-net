import '@testing-library/jest-dom'
global.Response = class Response {
  static json(data) {
    return { json: () => Promise.resolve(data) }
  }
}