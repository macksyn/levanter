
import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://macksyn:SfxBZ7OkfnwMTWzk@cluster0.kzetb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const econSchema = new mongoose.Schema({
  id: String,
  balance: Number,
  bank: Number,
  lastWork: Number,
  lastDaily: Number,
  items: Object
});

export const Econ = mongoose.model('Econ', econSchema);
