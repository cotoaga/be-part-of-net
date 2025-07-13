// jest.setup.js - Use require instead of import
require('@testing-library/jest-dom')

global.Response = class Response {
  static json(data) {
    return { json: () => Promise.resolve(data) }
  }
}