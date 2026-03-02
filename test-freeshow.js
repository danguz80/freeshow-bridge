const { io } = require("socket.io-client");

const socket = io("http://localhost:5505", {
  // NO forzamos websocket: dejamos polling+upgrade
  transports: ["polling", "websocket"],
  timeout: 2000,
});

socket.on("connect", () => {
  console.log("✅ CONNECTED", socket.id);

  // 1) escuchar TODO lo que llegue
  socket.onAny((event, ...args) => {
    console.log("📩 EVENT:", event, "argsLen:", args.length);
    if (args.length) console.log("   sample:", String(args[0]).slice(0, 200));
  });

  // 2) probar emit con ACK (v4)
  const payloadObj = { action: "get_projects" };
  const payloadStr = JSON.stringify(payloadObj);

  // a) como OBJETO
  socket.timeout(1500).emit("data", payloadObj, (err, reply) => {
    console.log("ACK obj err:", err?.message || null);
    console.log("ACK obj reply:", reply);
  });

  // b) como STRING (según doc)
  socket.timeout(1500).emit("data", payloadStr, (err, reply) => {
    console.log("ACK str err:", err?.message || null);
    console.log("ACK str reply:", reply);
  });

  // cerrar después de un rato
  setTimeout(() => socket.close(), 2500);
});

socket.on("connect_error", (e) => {
  console.log("❌ connect_error:", e.message);
});