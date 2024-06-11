from config import db

class Dustbin(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    latitude = db.Column(db.String(80), unique = False, nullable = False)
    longitude = db.Column(db.String(80), unique = False, nullable = False)
    capacity = db.Column(db.Float, unique = False, nullable = False)

    def to_json(self):
        return {
            "id":self.id,
            "latitude":self.latitude,
            "longitude":self.longitude,
            "capacity":self.capacity
        }