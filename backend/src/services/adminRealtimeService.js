class AdminRealtimeService {
  constructor() {
    this.clients = new Map();
    this.clientSeq = 1;
    this.keepAliveMs = 25000;
  }

  subscribe(req, res) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    const clientId = this.clientSeq++;
    const client = { id: clientId, res };
    this.clients.set(clientId, client);

    this.sendEvent(client, "connected", {
      type: "connected",
      message: "Realtime stream connected",
      timestamp: new Date().toISOString(),
      activeClients: this.clients.size,
    });

    const keepAliveTimer = setInterval(() => {
      this.sendEvent(client, "keepalive", {
        type: "keepalive",
        timestamp: new Date().toISOString(),
      });
    }, this.keepAliveMs);

    req.on("close", () => {
      clearInterval(keepAliveTimer);
      this.clients.delete(clientId);
    });
  }

  publish(changeType, payload = {}) {
    if (!changeType) return;

    const eventData = {
      type: "database_changed",
      changeType,
      payload,
      timestamp: new Date().toISOString(),
    };

    for (const client of this.clients.values()) {
      this.sendEvent(client, "database_changed", eventData);
    }
  }

  sendEvent(client, eventName, data) {
    if (!client?.res || client.res.writableEnded) return;

    try {
      client.res.write(`event: ${eventName}\n`);
      client.res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      this.clients.delete(client.id);
    }
  }
}

module.exports = new AdminRealtimeService();
