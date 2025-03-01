// Simple event bus for communication between modules
class EventBus {
    constructor() {
        this.events = {};
    }

    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    off(eventName, callback) {
        if (!this.events[eventName]) return;
        
        this.events[eventName] = this.events[eventName].filter(
            cb => cb !== callback
        );
    }

    emit(eventName, data) {
        if (!this.events[eventName]) return;
        
        this.events[eventName].forEach(callback => {
            callback(data);
        });
    }
}

// Create a single instance to be used throughout the application
const eventBus = new EventBus();
export default eventBus;