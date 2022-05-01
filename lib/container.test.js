import { ServiceContainer } from './container';

const testValue = {
    a: 1
};

describe('resolving', () => {
    const container = new ServiceContainer();
    container.value('testValue', testValue);

    test('resolve value', () => {
        expect(container.resolve('testValue')).toBe(testValue);
    });
});
