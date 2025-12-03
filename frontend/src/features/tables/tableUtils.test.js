/**
 * Unit tests for tableUtils.js
 */

import { getMergedGroup, resolveMergedGroupOrder, getPrimaryTable, canMergeTables } from './tableUtils';

describe('tableUtils', () => {
    describe('getMergedGroup', () => {
        it('should return single table if not merged', () => {
            const tables = [
                { _id: '1', tableNumber: 1, mergedWith: [] },
                { _id: '2', tableNumber: 2, mergedWith: [] }
            ];
            const result = getMergedGroup('1', tables);
            expect(result).toHaveLength(1);
            expect(result[0]._id).toBe('1');
        });

        it('should return all tables in merged group', () => {
            const tables = [
                { _id: '1', tableNumber: 1, mergedWith: ['2', '3'] },
                { _id: '2', tableNumber: 2, mergedWith: ['1', '3'] },
                { _id: '3', tableNumber: 3, mergedWith: ['1', '2'] }
            ];
            const result = getMergedGroup('1', tables);
            expect(result).toHaveLength(3);
            expect(result.map(t => t._id).sort()).toEqual(['1', '2', '3']);
        });

        it('should handle object references in mergedWith', () => {
            const tables = [
                { _id: '1', tableNumber: 1, mergedWith: [{ _id: '2' }] },
                { _id: '2', tableNumber: 2, mergedWith: [{ _id: '1' }] }
            ];
            const result = getMergedGroup('1', tables);
            expect(result).toHaveLength(2);
        });
    });

    describe('resolveMergedGroupOrder', () => {
        it('should return null if no order exists', () => {
            const tables = [
                { _id: '1', tableNumber: 1, mergedWith: ['2'], currentOrder: null },
                { _id: '2', tableNumber: 2, mergedWith: ['1'], currentOrder: null }
            ];
            const result = resolveMergedGroupOrder('1', tables);
            expect(result).toBeNull();
        });

        it('should return order from any table in group', () => {
            const order = { _id: 'order1', orderNumber: 123 };
            const tables = [
                { _id: '1', tableNumber: 1, mergedWith: ['2'], currentOrder: null },
                { _id: '2', tableNumber: 2, mergedWith: ['1'], currentOrder: order }
            ];
            const result = resolveMergedGroupOrder('1', tables);
            expect(result).toEqual(order);
        });
    });

    describe('getPrimaryTable', () => {
        it('should return table with order', () => {
            const order = { _id: 'order1' };
            const group = [
                { _id: '1', tableNumber: 5, currentOrder: null },
                { _id: '2', tableNumber: 3, currentOrder: order }
            ];
            const result = getPrimaryTable(group);
            expect(result._id).toBe('2');
        });

        it('should return lowest table number if no order', () => {
            const group = [
                { _id: '1', tableNumber: 5, currentOrder: null },
                { _id: '2', tableNumber: 3, currentOrder: null }
            ];
            const result = getPrimaryTable(group);
            expect(result.tableNumber).toBe(3);
        });
    });

    describe('canMergeTables', () => {
        it('should allow merge of available tables', () => {
            const tables = [
                { _id: '1', tableNumber: 1, status: 'available' },
                { _id: '2', tableNumber: 2, status: 'available' }
            ];
            const result = canMergeTables(['1', '2'], tables, []);
            expect(result.canMerge).toBe(true);
        });

        it('should block merge if table is reserved', () => {
            const tables = [
                { _id: '1', tableNumber: 1, status: 'available' },
                { _id: '2', tableNumber: 2, status: 'reserved' }
            ];
            const result = canMergeTables(['1', '2'], tables, []);
            expect(result.canMerge).toBe(false);
            expect(result.reason).toContain('reserved');
        });

        it('should block merge if reservation conflict exists', () => {
            const now = new Date();
            const tables = [
                { _id: '1', tableNumber: 1, status: 'available' },
                { _id: '2', tableNumber: 2, status: 'available' }
            ];
            const reservations = [{
                tableId: '1',
                reservationDate: now.toISOString().split('T')[0],
                reservationTime: now.toTimeString().split(' ')[0],
                duration: 90,
                status: 'confirmed',
                customerName: 'John Doe'
            }];
            const result = canMergeTables(['1', '2'], tables, reservations);
            expect(result.canMerge).toBe(false);
            expect(result.reason).toContain('Conflict');
        });
    });
});
