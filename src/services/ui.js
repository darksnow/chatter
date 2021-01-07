import { writable, get } from 'svelte/store';

export let notifications = writable([]);

export const notificationType = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
}

/**
 * Add a notification to the notification list.
 *
 * @param {string} notification The notification text.
 * @param {notificationType} type One of the defined notification types. Default: INFO.
 * @param {int} duration The amount of the time the notification should stay in seconds. Default 20. Set to zero to never expire.
 */
export function addNotification(notification, type, duration) {
  if (typeof(type) === 'undefined') type = 'info';
  if (typeof(duration) === 'undefined') duration = 20;

  // Generate a Unique ID for this notification.
  const stamp = Date.now();

  // Get the notification list, add the notification and set the store.
  const messList = get(notifications);
  console.log('EXISTING MESSAGES', messList, notification)
  messList.push({'stamp': stamp, 'content': notification, 'type': type});
  notifications.set(messList);
  // Set a timer to remove the notification from the store.
  if (duration > 0) {
    window.setTimeout(() => {
      rmNotification(stamp);
    }, duration * 1000);
  }
}

/**
 * Remove a notification from the list.
 *
 * @param {string} stamp The unqiue ID of the notification.
 */
export function rmNotification(stamp) {
  var list = get(notifications);
  const index = list.findIndex((el) => el.stamp == stamp);

  if (index >= 0) {
    list.splice(index, 1);
    notifications.set(list);
  }
}
