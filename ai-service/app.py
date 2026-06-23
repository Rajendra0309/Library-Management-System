from flask import Flask, request, jsonify
from flask_cors import CORS
from recommend import get_recommendations
import traceback

app = Flask(__name__)
CORS(app)

@app.route('/api/ai/recommend', methods=['POST'])
def recommend_books():
    try:
        data = request.get_json()
        if not data or 'memberId' not in data:
            return jsonify({
                "success": False,
                "message": "memberId is required",
                "error": "Bad Request"
            }), 400

        member_id = data['memberId']
        recommendations = get_recommendations(member_id)

        return jsonify({
            "success": True,
            "message": "Recommendations generated successfully",
            "data": recommendations
        }), 200

    except Exception as e:
        print(f"Error in recommendation: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            "success": False,
            "message": "Failed to generate recommendations",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
