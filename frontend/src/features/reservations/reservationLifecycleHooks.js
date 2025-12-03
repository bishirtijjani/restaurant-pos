import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateReservationStatus } from './reservationSlice';
import { isPast, addMinutes, parseISO } from 'date-fns';

/**
 * Hook to handle automated reservation lifecycle transitions.
 * - Checks for 'no-show' (grace period passed)
 * - Checks for 'expired' (end time passed)
 * 
 * @param {Object} config - Configuration options
 * @param {number} config.checkInterval - Interval in ms (default 60000)
 * @param {number} config.gracePeriodMinutes - Grace period for no-show (default 15)
 */
export const useReservationLifecycle = ({ 
    checkInterval = 60000, 
    gracePeriodMinutes = 15 
} = {}) => {
    const dispatch = useDispatch();
    const { items: reservations } = useSelector(state => state.reservations);

    useEffect(() => {
        const checkLifecycle = () => {
            const now = new Date();

            reservations.forEach(reservation => {
                // Skip if already in a terminal state
                if (['cancelled', 'completed', 'seated'].includes(reservation.status)) return;

                const reservationTime = new Date(`${reservation.reservationDate.split('T')[0]}T${reservation.reservationTime}`);
                const duration = reservation.duration || 120;
                const endTime = addMinutes(reservationTime, duration);
                const noShowTime = addMinutes(reservationTime, gracePeriodMinutes);

                // 1. Check for No-Show
                // If status is 'confirmed' or 'pending' and we are past the grace period
                if (['confirmed', 'pending'].includes(reservation.status) && isPast(noShowTime)) {
                    // Dispatch update to 'cancelled' with reason 'No Show'
                    // Note: We should probably only do this if it's NOT already cancelled
                    // The check above handles that, but let's be safe.
                    console.log(`Marking reservation ${reservation._id} as No-Show`);
                    dispatch(updateReservationStatus({ 
                        id: reservation._id, 
                        status: 'cancelled', 
                        reason: 'No Show (Auto)' 
                    }));
                }

                // 2. Check for Expired (if somehow it wasn't caught by no-show or was seated but never completed?)
                // Actually, if it's seated, we don't auto-expire it usually (they might just be eating late).
                // So we only expire 'pending'/'confirmed' if they passed the END time (which is way past grace period).
                else if (['confirmed', 'pending'].includes(reservation.status) && isPast(endTime)) {
                     console.log(`Marking reservation ${reservation._id} as Expired`);
                     dispatch(updateReservationStatus({ 
                        id: reservation._id, 
                        status: 'cancelled', 
                        reason: 'Expired (Auto)' 
                    }));
                }
            });
        };

        // Run immediately on mount
        checkLifecycle();

        // Set up interval
        const intervalId = setInterval(checkLifecycle, checkInterval);

        return () => clearInterval(intervalId);
    }, [reservations, dispatch, checkInterval, gracePeriodMinutes]);
};
