/**
 * EventBus - A simple publish/subscribe event system for component communication
 */
export class EventBus {
    constructor() {
        this.events = {};
    }
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to subscribe to
     * @param {function} callback - Function to call when event is published
     * @returns {function} Unsubscribe function
     */
    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        
        this.events[eventName].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.events[eventName] = this.events[eventName].filter(
                eventCallback => eventCallback !== callback
            );
        };
    }
    
    /**
     * Publish an event
     * @param {string} eventName - Name of the event to publish
     * @param {any} data - Data to pass to subscribers
     */
    publish(eventName, data) {
        if (!this.events[eventName]) {
            return;
        }
        
        this.events[eventName].forEach(callback => {
            callback(data);
        });
    }
}