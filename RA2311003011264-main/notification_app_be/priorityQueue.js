class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(item, priority = 0) {
    const entry = {
      item,
      priority: Number(priority) || 0,
      createdAt: Date.now(),
    };

    this.items.push(entry);
    this.items.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }

      return a.createdAt - b.createdAt;
    });

    return entry.item;
  }

  dequeue() {
    const entry = this.items.shift();
    return entry ? entry.item : null;
  }

  peek() {
    const entry = this.items[0];
    return entry ? entry.item : null;
  }

  toArray() {
    return this.items.map((entry) => entry.item);
  }

  get size() {
    return this.items.length;
  }
}

module.exports = PriorityQueue;
