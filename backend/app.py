import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
import tempfile

app = Flask(__name__)
CORS(app)

# ─── Menu Data ───────────────────────────────────────────────────────────────

SOUPS = [
    {
        "id": "egusi",
        "name": "Egusi Soup",
        "description": "Rich melon seed soup with leafy vegetables and assorted meat",
        "price": 2500,
        "image": "egusi",
        "tags": ["popular", "rich"],
    },
    {
        "id": "efo_riro",
        "name": "Efo Riro",
        "description": "Flavorful spinach stew cooked with locust beans and assorted peppers",
        "price": 2500,
        "image": "efo_riro",
        "tags": ["yoruba", "vegetable"],
    },
    {
        "id": "ogbono",
        "name": "Ogbono Soup",
        "description": "Draw soup made from ground ogbono seeds with palm oil and stockfish",
        "price": 2200,
        "image": "ogbono",
        "tags": ["draw", "traditional"],
    },
    {
        "id": "ewedu",
        "name": "Ewedu Soup",
        "description": "Silky jute leaf soup, a Yoruba classic often paired with gbegiri",
        "price": 1800,
        "image": "ewedu",
        "tags": ["yoruba", "light"],
    },
    {
        "id": "gbegiri",
        "name": "Gbegiri Soup",
        "description": "Smooth bean-based soup, traditionally served alongside ewedu",
        "price": 2000,
        "image": "gbegiri",
        "tags": ["yoruba", "beans"],
    },
    {
        "id": "afang",
        "name": "Afang Soup",
        "description": "Calabar delicacy made with afang and waterleaf, loaded with protein",
        "price": 3000,
        "image": "afang",
        "tags": ["calabar", "premium"],
    },
    {
        "id": "edikang_ikong",
        "name": "Edikang Ikong",
        "description": "Premium vegetable soup with fluted pumpkin leaves and waterleaf",
        "price": 3200,
        "image": "edikang_ikong",
        "tags": ["calabar", "premium"],
    },
    {
        "id": "banga",
        "name": "Banga Soup",
        "description": "Palm fruit soup with aromatic spices, a Delta State specialty",
        "price": 2800,
        "image": "banga",
        "tags": ["delta", "aromatic"],
    },
    {
        "id": "oha",
        "name": "Oha Soup",
        "description": "Igbo soup made with tender oha leaves and cocoyam thickener",
        "price": 2500,
        "image": "oha",
        "tags": ["igbo", "traditional"],
    },
    {
        "id": "bitter_leaf",
        "name": "Bitter Leaf Soup",
        "description": "Hearty soup with washed bitter leaves and cocoyam paste",
        "price": 2500,
        "image": "bitter_leaf",
        "tags": ["igbo", "herbal"],
    },
]

IYAN_BASE_PRICE = 1500  # Base price for pounded yam

PROTEIN_OPTIONS = [
    {"id": "assorted", "name": "Assorted Meat", "price": 1500},
    {"id": "beef", "name": "Beef", "price": 1000},
    {"id": "chicken", "name": "Chicken", "price": 1200},
    {"id": "goat", "name": "Goat Meat", "price": 1500},
    {"id": "fish", "name": "Catfish", "price": 2000},
    {"id": "snail", "name": "Snail", "price": 2500},
    {"id": "ponmo", "name": "Ponmo (Cow Skin)", "price": 800},
    {"id": "stockfish", "name": "Stockfish", "price": 1200},
]

PORTION_SIZES = [
    {"id": "small", "name": "Small", "multiplier": 1.0},
    {"id": "medium", "name": "Medium", "multiplier": 1.5},
    {"id": "large", "name": "Large", "multiplier": 2.0},
]

POPULAR_COMBOS = [
    {
        "id": "amala_combo",
        "name": "The Abula Special",
        "description": "Ewedu + Gbegiri combo — the legendary Abula experience",
        "soups": ["ewedu", "gbegiri"],
        "discount": 500,
    },
    {
        "id": "egusi_efo",
        "name": "Double Green",
        "description": "Egusi + Efo Riro — rich and nutritious",
        "soups": ["egusi", "efo_riro"],
        "discount": 300,
    },
    {
        "id": "ogbono_egusi",
        "name": "Draw & Thick",
        "description": "Ogbono + Egusi — the ultimate texture combination",
        "soups": ["ogbono", "egusi"],
        "discount": 400,
    },
]

# ─── In-Memory Order Storage ─────────────────────────────────────────────────

orders = {}

# ─── API Routes ──────────────────────────────────────────────────────────────


@app.route("/api/menu", methods=["GET"])
def get_menu():
    """Get the full menu."""
    return jsonify(
        {
            "iyan_base_price": IYAN_BASE_PRICE,
            "soups": SOUPS,
            "proteins": PROTEIN_OPTIONS,
            "portions": PORTION_SIZES,
            "combos": POPULAR_COMBOS,
        }
    )


@app.route("/api/menu/soups", methods=["GET"])
def get_soups():
    """Get available soups."""
    return jsonify(SOUPS)


@app.route("/api/menu/proteins", methods=["GET"])
def get_proteins():
    """Get available protein options."""
    return jsonify(PROTEIN_OPTIONS)


@app.route("/api/order", methods=["POST"])
def create_order():
    """Create a new order."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No order data provided"}), 400

    items = data.get("items", [])
    if not items:
        return jsonify({"error": "Order must contain at least one item"}), 400

    # Validate and calculate total
    total = 0
    validated_items = []

    for item in items:
        soup_ids = item.get("soups", [])
        protein_ids = item.get("proteins", [])
        portion = item.get("portion", "small")
        quantity = item.get("quantity", 1)

        if not soup_ids:
            return jsonify({"error": "Each item must include at least one soup"}), 400

        if quantity < 1 or quantity > 20:
            return jsonify({"error": "Quantity must be between 1 and 20"}), 400

        # Calculate item price
        soup_price = sum(
            s["price"] for s in SOUPS if s["id"] in soup_ids
        )
        protein_price = sum(
            p["price"] for p in PROTEIN_OPTIONS if p["id"] in protein_ids
        )
        portion_mult = next(
            (p["multiplier"] for p in PORTION_SIZES if p["id"] == portion), 1.0
        )

        # Check for combo discount
        combo_discount = 0
        for combo in POPULAR_COMBOS:
            if set(combo["soups"]) == set(soup_ids):
                combo_discount = combo["discount"]
                break

        item_price = (
            (IYAN_BASE_PRICE + soup_price + protein_price) * portion_mult
            - combo_discount
        ) * quantity

        validated_items.append(
            {
                "soups": soup_ids,
                "proteins": protein_ids,
                "portion": portion,
                "quantity": quantity,
                "price": item_price,
            }
        )
        total += item_price

    order_id = str(uuid.uuid4())[:8].upper()
    order = {
        "id": order_id,
        "items": validated_items,
        "total": total,
        "customer_name": data.get("customer_name", "Guest"),
        "status": "confirmed",
        "created_at": datetime.now().isoformat(),
    }
    orders[order_id] = order

    return jsonify(order), 201


@app.route("/api/order/<order_id>", methods=["GET"])
def get_order(order_id):
    """Get order by ID."""
    order = orders.get(order_id.upper())
    if not order:
        return jsonify({"error": "Order not found"}), 404
    return jsonify(order)


@app.route("/api/tts", methods=["POST"])
def text_to_speech():
    """Convert text to speech audio."""
    data = request.get_json()
    if not data or "text" not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data["text"]
    lang = data.get("lang", "en")

    try:
        tts = gTTS(text=text, lang=lang, slow=False)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(tmp.name)
        tmp.close()
        return send_file(tmp.name, mimetype="audio/mpeg", as_attachment=False)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/bot/greeting", methods=["GET"])
def bot_greeting():
    """Get a greeting message from the ordering bot."""
    message = (
        "Welcome to Ile Iyan! I'm your ordering assistant. "
        "We serve the finest pounded yam with a variety of delicious Nigerian soups. "
        "You can combine soups for a unique experience. "
        "What would you like to order today?"
    )
    return jsonify({"message": message})


@app.route("/api/bot/process", methods=["POST"])
def bot_process():
    """Process a bot conversation message and return a response."""
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "No message provided"}), 400

    user_msg = data["message"].lower().strip()
    cart = data.get("cart", [])
    state = data.get("state", "greeting")

    response = _process_bot_message(user_msg, cart, state)
    return jsonify(response)


def _process_bot_message(message, cart, state):
    """Simple rule-based bot for order processing."""
    soup_names = {s["id"]: s["name"] for s in SOUPS}
    protein_names = {p["id"]: p["name"] for p in PROTEIN_OPTIONS}

    # Detect soup mentions
    detected_soups = []
    for soup in SOUPS:
        name_lower = soup["name"].lower()
        id_lower = soup["id"].replace("_", " ")
        if name_lower in message or id_lower in message:
            detected_soups.append(soup["id"])

    # Detect protein mentions
    detected_proteins = []
    for protein in PROTEIN_OPTIONS:
        name_lower = protein["name"].lower()
        id_lower = protein["id"].replace("_", " ")
        if name_lower in message or id_lower in message:
            detected_proteins.append(protein["id"])

    # Detect portion size
    detected_portion = None
    for portion in PORTION_SIZES:
        if portion["id"] in message:
            detected_portion = portion["id"]

    # State machine logic
    if state == "greeting" or any(
        w in message for w in ["menu", "what do you have", "options", "show me"]
    ):
        soup_list = ", ".join(s["name"] for s in SOUPS)
        return {
            "message": (
                f"Great! Here are our soups: {soup_list}. "
                "You can pick one or combine multiple soups. "
                "Which soup would you like with your Iyan?"
            ),
            "state": "choosing_soup",
            "cart": cart,
            "action": None,
        }

    if state == "choosing_soup" or detected_soups:
        if detected_soups:
            soup_display = " + ".join(soup_names[sid] for sid in detected_soups)
            return {
                "message": (
                    f"Excellent choice! {soup_display} with Iyan. "
                    "Would you like to add any protein? "
                    "Options: Assorted Meat, Beef, Chicken, Goat Meat, Catfish, Snail, Ponmo, Stockfish. "
                    "Or say 'no protein' to skip."
                ),
                "state": "choosing_protein",
                "cart": cart,
                "pending_soups": detected_soups,
                "action": {"type": "select_soups", "soups": detected_soups},
            }
        return {
            "message": "Which soup would you like? You can say the name of any soup, or combine them like 'ewedu and gbegiri'.",
            "state": "choosing_soup",
            "cart": cart,
            "action": None,
        }

    if state == "choosing_protein":
        pending_soups = data_get_nested(cart, "pending_soups", [])
        if "no protein" in message or "skip" in message or "none" in message:
            detected_proteins = []

        if detected_proteins or "no protein" in message or "skip" in message or "none" in message:
            return {
                "message": (
                    "What portion size would you like? "
                    "Small, Medium, or Large?"
                ),
                "state": "choosing_portion",
                "cart": cart,
                "pending_proteins": detected_proteins,
                "action": {"type": "select_proteins", "proteins": detected_proteins},
            }
        return {
            "message": "Which protein would you like? Say the name or 'no protein' to skip.",
            "state": "choosing_protein",
            "cart": cart,
            "action": None,
        }

    if state == "choosing_portion":
        if detected_portion:
            return {
                "message": (
                    f"Got it, {detected_portion} portion! "
                    "Would you like to add this to your order? Say 'yes' to confirm or 'add more' for another item."
                ),
                "state": "confirming",
                "cart": cart,
                "action": {"type": "select_portion", "portion": detected_portion},
            }
        return {
            "message": "Please choose a portion size: Small, Medium, or Large.",
            "state": "choosing_portion",
            "cart": cart,
            "action": None,
        }

    if state == "confirming":
        if any(w in message for w in ["yes", "confirm", "done", "place order", "checkout", "that's all"]):
            return {
                "message": (
                    "Your order has been placed! "
                    "Thank you for choosing Ile Iyan. Enjoy your meal! 🍽️"
                ),
                "state": "complete",
                "cart": cart,
                "action": {"type": "place_order"},
            }
        if any(w in message for w in ["add more", "another", "more"]):
            return {
                "message": "Sure! Which soup would you like for your next item?",
                "state": "choosing_soup",
                "cart": cart,
                "action": {"type": "add_to_cart"},
            }

    # Default fallback
    return {
        "message": (
            "I'm here to help you order! You can say things like:\n"
            "• 'Show me the menu'\n"
            "• 'I want egusi soup'\n"
            "• 'Ewedu and gbegiri'\n"
            "• 'Place my order'\n"
            "What would you like?"
        ),
        "state": state,
        "cart": cart,
        "action": None,
    }


def data_get_nested(data, key, default=None):
    """Safely get nested data."""
    if isinstance(data, dict):
        return data.get(key, default)
    if isinstance(data, list) and data:
        return data[-1].get(key, default) if isinstance(data[-1], dict) else default
    return default


# ─── Health Check ─────────────────────────────────────────────────────────────


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "Ile Iyan API"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
