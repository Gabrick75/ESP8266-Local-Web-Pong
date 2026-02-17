
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <LittleFS.h>

#define FPS 24
#define FRAME_TIME (1000 / FPS)

ESP8266WebServer server(80);

struct GameState {
  int16_t lY = 100;
  int16_t rY = 100;
  int16_t bX = 160;
  int16_t bY = 120;
  int8_t vX = 3;
  int8_t vY = 2;
  uint8_t lScore = 0;
  uint8_t rScore = 0;
  uint8_t maxScore = 10;
  bool running = false;
  String winner = "";
  String player1IP = "";
  String player2IP = "";
};

GameState g;
unsigned long lastFrame = 0;

void resetBall() {
  g.bX = 160;
  g.bY = 120;
  g.vX *= -1;
}

void resetGame() {
  g.lScore = 0;
  g.rScore = 0;
  g.lY = 100;
  g.rY = 100;
  g.winner = "";
  resetBall();
}

void updateGame() {
  if (!g.running) return;

  g.bX += g.vX;
  g.bY += g.vY;

  if (g.bY <= 0 || g.bY >= 240) g.vY *= -1;

  if (g.bX < 20 && g.bY > g.lY && g.bY < g.lY + 40) g.vX *= -1;
  if (g.bX > 300 && g.bY > g.rY && g.bY < g.rY + 40) g.vX *= -1;

  if (g.bX < 0) { g.rScore++; resetBall(); }
  if (g.bX > 320) { g.lScore++; resetBall(); }

  if (g.lScore >= g.maxScore) { g.winner="Player 1"; g.running=false; }
  if (g.rScore >= g.maxScore) { g.winner="Player 2"; g.running=false; }
}

void registerPlayer() {
  String ip = server.client().remoteIP().toString();
  if (g.player1IP == "") g.player1IP = ip;
  else if (g.player2IP == "" && ip != g.player1IP) g.player2IP = ip;
}

void setup() {
  Serial.begin(115200);
  WiFi.begin("YOUR-SSID", "YOUR-PASSWORD");
  while (WiFi.status() != WL_CONNECTED) delay(500);

  Serial.println(WiFi.localIP());

  LittleFS.begin();

  server.serveStatic("/", LittleFS, "/index.html");
  server.serveStatic("/css/style.css", LittleFS, "/css/style.css");
  server.serveStatic("/js/script.js", LittleFS, "/js/script.js");

  server.on("/state.json", []() {
    registerPlayer();

    char json[512];
    snprintf(json, sizeof(json),
      "{\"lY\":%d,\"rY\":%d,\"bX\":%d,\"bY\":%d,\"lS\":%d,\"rS\":%d,\"max\":%d,\"run\":%d,\"winner\":\"%s\",\"p1\":\"%s\",\"p2\":\"%s\"}",
      g.lY,g.rY,g.bX,g.bY,g.lScore,g.rScore,g.maxScore,g.running,
      g.winner.c_str(),g.player1IP.c_str(),g.player2IP.c_str());

    server.send(200,"application/json",json);
  });

  server.on("/input", []() {
    if (!g.running) { server.send(200,"text/plain","stopped"); return; }

    String ip = server.client().remoteIP().toString();

    if (server.hasArg("p")) {
      // LOCAL MODE (explicit player)
      int p = server.arg("p").toInt();
      int d = server.arg("d").toInt();
      if (p == 1) g.lY = constrain(g.lY + d, 0, 200);
      if (p == 2) g.rY = constrain(g.rY + d, 0, 200);
    } else {
      // LAN MODE (IP based)
      int d = server.arg("d").toInt();
      if (ip == g.player1IP) g.lY = constrain(g.lY + d, 0, 200);
      if (ip == g.player2IP) g.rY = constrain(g.rY + d, 0, 200);
    }

    server.send(200,"text/plain","ok");
  });

  server.on("/start", []() {
    if (server.hasArg("max")) g.maxScore = server.arg("max").toInt();
    resetGame();
    g.running = true;
    server.send(200,"text/plain","started");
  });

  server.on("/finish", []() {
    g.running = false;
    server.send(200,"text/plain","finished");
  });

  server.begin();
}

void loop() {
  server.handleClient();
  unsigned long now = millis();
  if (now - lastFrame >= FRAME_TIME) {
    lastFrame = now;
    updateGame();
  }
}
