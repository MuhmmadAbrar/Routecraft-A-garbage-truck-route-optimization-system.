#include <WiFi.h>
#include <HTTPClient.h>
#include <random>
#include <Arduino.h>
#include "soc/rtc.h"
#include "HX711.h"

String apiKey = "YVZ6OA3560DAGJTP";

const char *ssid = "Mi11x";
const char *pass = "passcode";
const char *server = "api.thingspeak.com";
// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 17;
const int LOADCELL_SCK_PIN = 5;
HX711 scale;

void setup() {
  Serial.begin(115200);
  rtc_cpu_freq_config_t config;
  rtc_clk_cpu_freq_get_config(&config);
  rtc_clk_cpu_freq_to_config(RTC_CPU_FREQ_80M, &config);
  rtc_clk_cpu_freq_set_config_fast(&config);
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(100);                      // this value is obtained by calibrating the scale with known weights; see the README for details
  scale.tare();
  delay(10);

  Serial.println("Connecting to WiFi");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
}

void loop() {
  
  int Capacity=scale.get_units(10);
  int dustbinCapacity = map(Capacity, -8387847, -21000, 0, 200);
  scale.power_down();             // put the ADC in sleep mode
  delay(500);
  scale.power_up();
  
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // Generate random values for dustbin capacity and weight
    //int dustbinCapacity = random(10, 101); // Random value between 10 and 100 liters
    //int dustbinWeight = random(5, 51); // Random value between 5 and 50 kilograms

    String url = "http://api.thingspeak.com/update?api_key=" + apiKey + "&field1=" + String(dustbinCapacity) ;

    http.begin(url);
    int httpCode = http.GET();

    if (httpCode > 0) {
      Serial.print("Dustbin Capacity: ");
      Serial.print(dustbinCapacity);
      Serial.print(" grams ");
      //Serial.print(dustbinWeight);
      Serial.println(" Sent to ThingSpeak.");
    } else {
      Serial.println("Connection to ThingSpeak failed.");
    }

    http.end();
  } else {
    Serial.println("WiFi Disconnected. Reconnecting...");
    WiFi.begin(ssid, pass);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi Reconnected");
  }

  // ThingSpeak needs a minimum 15 sec delay between updates
  delay(2000);
}