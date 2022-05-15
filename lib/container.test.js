import { ServiceContainer } from './container';

const testValue = {
    a: 1
};

class TestService {}

describe('resolving', () => {
    const container = new ServiceContainer();
    container.value('testValue', testValue);
    container.instance('testInstance', () => {
        return new TestService();
    });
    container.instance('testGlobalInstance', () => {
        return new TestService();
    }, true);
    container.factory('testFactory', () => {
        return new TestService();
    });
    container.setResolver('testCustomValue', {
        resolve() {
            return testValue;
        },
        scope() {
            return this;
        }
    });

    test('resolve value', () => {
        expect(container.resolve('testValue')).toBe(testValue);
    });

    test('resolve instance', () => {
        const serviceKey = 'testInstance';
        const service = container.resolve(serviceKey);
        expect(service).toBeInstanceOf(TestService);
        expect(service).toBe(container.resolve(serviceKey));
        expect(service).not.toBe(container.scope().resolve(serviceKey));
    });

    test('resolve global instance', () => {
        const serviceKey = 'testGlobalInstance';
        const service = container.resolve(serviceKey);
        expect(service).toBeInstanceOf(TestService);
        expect(service).toBe(container.resolve(serviceKey));
        expect(service).toBe(container.scope().resolve(serviceKey));
    });

    test('resolve factory', () => {
        const service = container.resolve('testFactory');
        expect(service).toBeInstanceOf(TestService);
        expect(service).not.toBe(container.resolve('testFactory'));
    });

    test('resolve nothing', () => {
        expect(container.resolve('nothing')).toBeNull();
    });

    test('scope', () => {
        const scopedContainer = container.scope();
        expect(scopedContainer).toBeInstanceOf(ServiceContainer);
        expect(scopedContainer).not.toBe(container);
    });

    test('custom resolver', () => {
        expect(container.scope().resolve('testCustomValue')).toBe(testValue);
    });
});
