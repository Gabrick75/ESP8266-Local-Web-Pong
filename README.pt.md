# Pong Multiplayer no ESP8266

[🇺🇸 Read in English](README.md)

## Visão Geral

Este projeto implementa um jogo Pong multiplayer hospedado inteiramente
em uma única placa ESP8266.

O jogo é servido via HTTP utilizando LittleFS e sincronizado por AJAX
polling com FPS fixo.

A arquitetura separa renderização (navegador) da lógica do jogo
(ESP8266), garantindo estabilidade e baixo consumo de memória.

## Imagens

<table>
  <tr>
    <td><img src="images/image1.png" alt="image 1"></td>
    <td><img src="images/image2.jpeg" alt="image 2"></td>
  </tr>
</table>

------------------------------------------------------------------------

## Funcionalidades

-   FPS de 24 FPS
-   JSON otimizado com snprintf (sem fragmentação de heap)
-   Dois modos de jogo:
    -   LOCAL (mesmo navegador, mesmo teclado)
    -   LAN (dois dispositivos na mesma rede)
-   Identificação de jogador por IP
-   Pontuação configurável (5--25)
-   Botões Start / Finish
-   Detecção automática de vencedor
-   Popup de vitória
-   Reset automático ao fechar

------------------------------------------------------------------------

## Modos de Jogo

### Modo LOCAL

-   Mesmo computador
-   Mesma aba do navegador
-   Mesmo teclado
    -   Player 1 → W / S
    -   Player 2 → Setas ↑ / ↓

O frontend define explicitamente qual barra mover.

### Modo LAN

-   Dois dispositivos na mesma rede local
-   O ESP8266 define:
    -   Primeiro IP → Player 1 (W/S)
    -   Segundo IP → Player 2 (Setas)
-   O backend valida usando remoteIP()

------------------------------------------------------------------------

## Arquitetura Técnica

-   ESP8266WebServer
-   Hospedagem estática via LittleFS
-   Loop baseado em millis()
-   Estrutura GameState contendo:
    -   Posições das barras
    -   Bola e velocidade
    -   Placar
    -   Pontuação máxima
    -   Estado de vencedor
    -   IPs dos jogadores

------------------------------------------------------------------------

## Como Usar

1.  Configure SSID e senha no sketch.
2.  Envie o código para o ESP8266.
3.  Envie a pasta /data via LittleFS.
4.  Acesse o IP exibido no Serial Monitor.
5.  Escolha o modo e jogue.

------------------------------------------------------------------------

## Melhorias Futuras
-   Bug in LAN mode
-   Comunicação via WebSocket
-   Modo single-player
-   Detecção automática de desconexão
-   Suporte touch para mobile
-   Support more than 2 players with multiple paddles.

