import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotification } from "../rightDrawerSlice";
import { updateNotificationsCount } from "../headerSlice";

function NotificationBodyRightDrawer() {
  const notifications = useSelector((state) => state.rightDrawer.notifications);
  const dispatch = useDispatch();

  const handleNotificationClose = (index) => {
    dispatch(removeNotification(index));
    dispatch(updateNotificationsCount(notifications.length));
  };

  return (
    <>
      {notifications.length === 0 ? (
        <div className="mt-3 ms-3">No notifications available.</div>
      ) : (
        notifications.map((notification, index) => (
          <div
            className={`grid mt-3 card bg-base-100 rounded-box p-3
              ${
                notification.status === 1
                  ? "bg-primary bg-opacity-75"
                  : "bg-error bg-opacity-75 text-white"
              }
            `}
            key={index}
          >
            <div className="flex justify-between">
              <span>{notification.message}</span>
              <button
                className="btn btn-circle btn-sm bg-base-300"
                onClick={() => handleNotificationClose(index)}
              >
                X
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}

export default NotificationBodyRightDrawer;
