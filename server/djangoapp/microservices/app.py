from flask import Flask, jsonify
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
from pathlib import Path

nltk.data.path.insert(0, str(Path(__file__).resolve().parent))
app = Flask("Sentiment Analyzer")

sia = SentimentIntensityAnalyzer()


@app.get('/')
def home():
    return "Welcome to the Sentiment Analyzer. \
    Use /analyze/text to get the sentiment"


@app.get('/analyze/<path:input_txt>')
def analyze_sentiment(input_txt):

    scores = sia.polarity_scores(input_txt)
    print(scores)
    compound = scores['compound']

    if compound >= 0.05:
        res = "positive"
    elif compound <= -0.05:
        res = "negative"
    else:
        res = "neutral"
    print({"sentiment": res})
    return jsonify({"sentiment": res})


if __name__ == "__main__":
    app.run(debug=True)
