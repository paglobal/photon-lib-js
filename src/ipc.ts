function ipcInit(port) {
  const socket = new WebSocket(`ws://127.0.0.1:${port}/ipc`);

  socket.addEventListener("open", () => {
    socket.addEventListener("message", (e) => {
      const data = JSON.parse(e.data);
      ipc.onEvents.get(data.event)?.forEach((callback) => {
        callback(data.payload, data.event);
      });
      ipc.onceEvents.get(data.event)?.forEach((callback) => {
        callback(data.payload, data.event);
        ipc.onceEvents.delete(data.event);
      });
    });
  });

  socket.addEventListener("close", () => {
    console.error(
      "IPC connection terminated. Attempting to re-establish connection..."
    );
    setTimeout(() => {
      const ipc = ipcInit(port);
      ipc.on("open", () => location.reload());
    }, 1000);
  });

  const ipc = {
    on: (event, callback) => {
      switch (event) {
        case "open":
        case "close":
        case "error":
          return socket.addEventListener(event, callback);
        default:
          return ipc.registerEvent(event, callback, "on");
      }
    },
    once: (event, callback) => {
      return ipc.registerEvent(event, callback, "once");
    },
    registerEvent: (event, callback, type) => {
      const eventsMap = ipc[`${type}Events`];
      if (!eventsMap.has(event)) {
        eventsMap.set(event, []);
      }

      const eventArray = eventsMap.get(event);
      eventArray.push(callback);

      return () => {
        const index = eventArray.indexOf(callback);
        if (index > -1) {
          eventArray.splice(index, 1);
        }

        if (eventArray.length === 0) eventsMap.delete(event);
      };
    },
    emit: (event, payload) => {
      socket.send(JSON.stringify({ event, payload }));
    },
    onEvents: new Map(),
    onceEvents: new Map(),
  };

  return ipc;
}

export default ipcInit;
