"""
═════════════════════════════════════════════════════════════════════════════
AEVORA / TravelIQ - Enterprise Production Locust Load Testing Suite
═════════════════════════════════════════════════════════════════════════════
Simulates realistic concurrent user journeys across all core platform APIs:
- Authentication & JWT Token Acquisition
- Multi-modal Search (Trains, Flights, Intercity Buses)
- AI Predictions (Delay, Fare, Occupancy, Crowd)
- Travel Chatbot Grounding
- Transactional Booking & PNR Creation
- Booking History Retrieval
- Telemetry & Health Checks
"""

import random
import time
from locust import HttpUser, task, between, tag

ORIGINS = ["NDLS", "HWH", "BOM", "MAS", "SBC", "PNBE"]
DESTINATIONS = ["CNB", "TATA", "PURI", "BSB", "AGC", "LKO"]
CLASSES = ["3A", "2A", "SL", "CC", "1A"]

class TravelIQCustomer(HttpUser):
    wait_time = between(1, 3)
    jwt_token = None
    user_id = None
    email = None

    def on_start(self):
        """Lifecycle hook: Register / Login and acquire authentic JWT session."""
        rand_id = random.randint(100000, 999999)
        self.email = f"loadtest_{rand_id}@aevora-test.io"
        self.password = "LoadTestSecure2026!"
        
        # 1. Register User
        reg_payload = {
            "name": f"Tester {rand_id}",
            "email": self.email,
            "password": self.password,
            "phone": f"+9198{rand_id:08d}"[:13]
        }
        with self.client.post("/api/auth/register", json=reg_payload, catch_response=True) as resp:
            if resp.status_code in (200, 201):
                data = resp.json()
                self.jwt_token = data.get("accessToken") or data.get("token")
                self.user_id = data.get("user", {}).get("id")
                resp.success()
            elif resp.status_code == 400 and "exists" in resp.text:
                # Fallback to login
                login_payload = {"email": self.email, "password": self.password}
                with self.client.post("/api/auth/login", json=login_payload, catch_response=True) as l_resp:
                    if l_resp.status_code == 200:
                        l_data = l_resp.json()
                        self.jwt_token = l_data.get("accessToken") or l_data.get("token")
                        l_resp.success()
                    else:
                        l_resp.failure(f"Login failed: {l_resp.status_code}")
            else:
                resp.failure(f"Registration failed: {resp.status_code}")

    def auth_headers(self):
        headers = {"Content-Type": "application/json"}
        if self.jwt_token:
            headers["Authorization"] = f"Bearer {self.jwt_token}"
        return headers

    @task(5)
    @tag("search")
    def search_trains(self):
        """High-frequency journey: Train Route Search between station pairs."""
        src = random.choice(ORIGINS)
        dst = random.choice([d for d in DESTINATIONS if d != src])
        payload = {
            "source": src,
            "destination": dst,
            "departureDate": "2026-11-28",
            "tripType": "One Way",
            "passengers": random.randint(1, 4)
        }
        with self.client.post("/api/travel/search", json=payload, headers=self.auth_headers(), catch_response=True) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Search failed with code {resp.status_code}")

    @task(3)
    @tag("health")
    def check_transit_sources(self):
        """Telemetry check: Data sources and registry health."""
        self.client.get("/api/travel/sources/health", headers=self.auth_headers())

    @task(3)
    @tag("ai")
    def predict_delay(self):
        """AI Inference: Predict Train Delay probabilities."""
        payload = {
            "train_number": "12301",
            "station_code": "NDLS",
            "day_of_week": 5
        }
        with self.client.post("/api/ai/predict-delay", json=payload, headers=self.auth_headers(), catch_response=True) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Delay prediction returned {resp.status_code}")

    @task(2)
    @tag("ai")
    def predict_fare(self):
        """AI Inference: Fare Forecast & Volatility."""
        payload = {
            "source_code": "NDLS",
            "destination_code": "CNB",
            "class_type": "3A",
            "travel_date": "2026-11-28"
        }
        self.client.post("/api/ai/predict-fare", json=payload, headers=self.auth_headers())

    @task(2)
    @tag("chatbot")
    def travel_chatbot_query(self):
        """AI Assistant: Query chatbot with domain questions."""
        questions = [
            "What is the best train from Delhi to Kanpur?",
            "How do I reserve a 2AC seat on Aevora?",
            "What food is famous near Bhubaneswar station?"
        ]
        payload = {"message": random.choice(questions)}
        self.client.post("/api/chatbot/message", json=payload, headers=self.auth_headers())

    @task(1)
    @tag("booking")
    def create_booking_and_retrieve_history(self):
        """Critical E-Commerce Journey: Create a train reservation and verify booking history."""
        if not self.jwt_token:
            return

        booking_payload = {
            "source_station_code": "NDLS",
            "destination_station_code": "CNB",
            "train_number": "12004",
            "travel_class": "CC",
            "ticket_fare": 750,
            "booking_date": "2026-11-28",
            "transport_type": "Train",
            "passengers": [
                {
                    "name": "Load Tester",
                    "age": 30,
                    "gender": "M",
                    "berth_preference": "No Preference"
                }
            ]
        }
        with self.client.post("/api/profile/bookings", json=booking_payload, headers=self.auth_headers(), catch_response=True) as b_resp:
            if b_resp.status_code in (200, 201):
                b_resp.success()
                # Follow-up: Read back booking history
                self.client.get("/api/profile/bookings", headers=self.auth_headers())
            elif b_resp.status_code == 429:
                b_resp.failure("Rate limit reached on bookings")
            else:
                b_resp.failure(f"Booking creation returned {b_resp.status_code}: {b_resp.text[:100]}")

    @task(2)
    @tag("profile")
    def view_profile(self):
        """User session: Fetch user profile details."""
        if self.jwt_token:
            self.client.get("/api/profile", headers=self.auth_headers())
