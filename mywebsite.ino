#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <LittleFS.h>

const char* ssid = "ssid";
const char* password = "password";

ESP8266WebServer server(80);

// Função para detectar tipo de arquivo
String getContentType(String filename) {
  if (filename.endsWith(".html")) return "text/html";
  if (filename.endsWith(".css")) return "text/css";
  if (filename.endsWith(".js")) return "application/javascript";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg")) return "image/jpeg";
  if (filename.endsWith(".webp")) return "image/webp";
  return "text/plain";
}

// Servir arquivos
void handleFileRead(String path) {
  if (path.endsWith("/")) path += "index.html";

  if (LittleFS.exists(path)) {
    File file = LittleFS.open(path, "r");
    server.streamFile(file, getContentType(path));
    file.close();
  } else {
    server.send(404, "text/plain", "Arquivo não encontrado");
  }
}

void setup() {
  Serial.begin(115200);

  WiFi.begin(ssid, password);
  Serial.print("Conectando");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado!");
  Serial.println(WiFi.localIP());

  LittleFS.begin();

  server.onNotFound([]() {
    handleFileRead(server.uri());
  });

  server.begin();
}

void loop() {
  server.handleClient();
}
