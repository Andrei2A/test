/**
 * EventBus Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import EventBus, { eventBus } from '../src/state/EventBus.js';

describe('EventBus', () => {
    let bus;

    beforeEach(() => {
        bus = new EventBus();
    });

    describe('on()', () => {
        it('should register a listener', () => {
            const callback = vi.fn();
            bus.on('test', callback);
            bus.emit('test', { data: 'value' });

            expect(callback).toHaveBeenCalledWith({ data: 'value' });
        });

        it('should return an unsubscribe function', () => {
            const callback = vi.fn();
            const unsubscribe = bus.on('test', callback);

            unsubscribe();
            bus.emit('test');

            expect(callback).not.toHaveBeenCalled();
        });

        it('should allow multiple listeners for same event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            bus.on('test', callback1);
            bus.on('test', callback2);
            bus.emit('test');

            expect(callback1).toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });
    });

    describe('once()', () => {
        it('should only trigger callback once', () => {
            const callback = vi.fn();
            bus.once('test', callback);

            bus.emit('test');
            bus.emit('test');

            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('off()', () => {
        it('should remove a listener', () => {
            const callback = vi.fn();
            bus.on('test', callback);
            bus.off('test', callback);
            bus.emit('test');

            expect(callback).not.toHaveBeenCalled();
        });

        it('should not throw if listener does not exist', () => {
            expect(() => {
                bus.off('nonexistent', () => {});
            }).not.toThrow();
        });
    });

    describe('emit()', () => {
        it('should pass data to callbacks', () => {
            const callback = vi.fn();
            bus.on('test', callback);

            const data = { foo: 'bar', num: 42 };
            bus.emit('test', data);

            expect(callback).toHaveBeenCalledWith(data);
        });

        it('should not throw if no listeners', () => {
            expect(() => {
                bus.emit('nonexistent', { data: 'test' });
            }).not.toThrow();
        });

        it('should catch and log errors in callbacks', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });
            const normalCallback = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            bus.on('test', errorCallback);
            bus.on('test', normalCallback);
            bus.emit('test');

            expect(consoleSpy).toHaveBeenCalled();
            expect(normalCallback).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('clear()', () => {
        it('should remove all listeners for specific event', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            bus.on('test1', callback1);
            bus.on('test2', callback2);
            bus.clear('test1');

            bus.emit('test1');
            bus.emit('test2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalled();
        });

        it('should remove all listeners when no event specified', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            bus.on('test1', callback1);
            bus.on('test2', callback2);
            bus.clear();

            bus.emit('test1');
            bus.emit('test2');

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).not.toHaveBeenCalled();
        });
    });

    describe('singleton instance', () => {
        it('should export a singleton instance', () => {
            expect(eventBus).toBeInstanceOf(EventBus);
        });
    });
});
