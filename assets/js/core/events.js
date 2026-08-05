// Event Bus for decoupled communication between modules

export class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} handler - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(handler);

    // Return unsubscribe function
    return () => this.unsubscribe(event, handler);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} handler - Callback function
   */
  unsubscribe(event, handler) {
    if (this.events.has(event)) {
      this.events.get(event).delete(handler);
      if (this.events.get(event).size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Publish an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  publish(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Subscribe once and auto-unsubscribe
   * @param {string} event - Event name
   * @param {Function} handler - Callback function
   */
  once(event, handler) {
    const wrappedHandler = (data) => {
      handler(data);
      this.unsubscribe(event, wrappedHandler);
    };
    this.subscribe(event, wrappedHandler);
  }

  /**
   * Clear all events
   */
  clear() {
    this.events.clear();
  }

  /**
   * Get listener count for an event
   * @param {string} event - Event name
   * @returns {number}
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  }
}

// Global event bus instance
export const eventBus = new EventBus();