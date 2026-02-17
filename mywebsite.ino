
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

void updateGame() {
  g.bX += g.vX;
  g.bY += g.vY;

  if (g.bY <= 0 || g.bY >= 240) g.vY *= -1;

  if (g.bX < 20 && g.bY > g.lY && g.bY < g.lY + 40) g.vX *= -1;
  if (g.bX > 300 && g.bY > g.rY && g.bY < g.rY + 40) g.vX *= -1;

  if (g.bX < 0) { g.rScore++; resetBall(); }
  if (g.bX > 320) { g.lScore++; resetBall(); }
}

void registerPlayer() {
  String ip = server.client().remoteIP().toString();

  if (g.player1IP == "") {
    g.player1IP = ip;
    Serial.println("Player 1 connected: " + ip);
  } else if (g.player2IP == "" && ip != g.player1IP) {
    g.player2IP = ip;
    Serial.println("Player 2 connected: " + ip);
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin("YOUR-SSID", "YOUR-PASSWORD");
  while (WiFi.status() != WL_CONNECTED) delay(500);

  Serial.print("ESP IP: ");
  Serial.println(WiFi.localIP());

  LittleFS.begin();

  server.serveStatic("/", LittleFS, "/index.html");
  server.serveStatic("/css/style.css", LittleFS, "/css/style.css");
  server.serveStatic("/js/script.js", LittleFS, "/js/script.js");

  server.on("/state.json", []() {
    registerPlayer();

    char json[256];
    snprintf(json, sizeof(json),
             "{\"lY\":%d,\"rY\":%d,\"bX\":%d,\"bY\":%d,\"lS\":%d,\"rS\":%d,\"p1\":\"%s\",\"p2\":\"%s\"}",
             g.lY, g.rY, g.bX, g.bY, g.lScore, g.rScore,
             g.player1IP.c_str(), g.player2IP.c_str());

    server.send(200, "application/json", json);
  });

  server.on("/input", []() {
    String ip = server.client().remoteIP().toString();

    if (server.hasArg("d")) {
      int d = server.arg("d").toInt();

      if (ip == g.player1IP) {
        g.lY = constrain(g.lY + d, 0, 200);
      } else if (ip == g.player2IP) {
        g.rY = constrain(g.rY + d, 0, 200);
      }
    }
    server.send(200, "text/plain", "ok");
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
