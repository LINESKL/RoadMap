from pymongo import MongoClient

# Подключение к MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['roadmap_db']

# Коллекции
subjects_collection = db['subjects']
nodes_collection = db['nodes']