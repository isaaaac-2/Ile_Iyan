from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Store orders in memory (in production, use a database)
orders = []
order_counter = 1

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Backend is running'})

@app.route('/api/order', methods=['POST'])
def place_order():
    global order_counter
    
    try:
        data = request.get_json()
        quantity = data.get('quantity', 1)
        customer_name = data.get('customer_name', 'Guest')
        
        order = {
            'id': order_counter,
            'item': 'Iyan (Pounded Yam)',
            'quantity': quantity,
            'customer_name': customer_name,
            'timestamp': datetime.now().isoformat(),
            'status': 'confirmed'
        }
        
        orders.append(order)
        order_counter += 1
        
        response_message = f"Order confirmed! {quantity} plate{'s' if quantity > 1 else ''} of Iyan for {customer_name}. Your order number is {order['id']}."
        
        return jsonify({
            'success': True,
            'order': order,
            'message': response_message
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error processing order: {str(e)}'
        }), 400

@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify({'orders': orders})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
