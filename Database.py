import app
class User(app.db.Model):
    __tablename__ = 'users'
    id=app.db.Column(app.db.Integer, primary_key=True)
    name=app.db.Column(app.db.String(50), nullable=False)
    email=app.db.Column(app.db.String(100), nullable=False)
    password=app.db.Column(app.db.String(50), nullable=False)

    def __init__(self, name, email, password): 
        self.name = name
        self.email = email
        self.password = password