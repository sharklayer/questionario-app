import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const questaoSchema = new Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['objetiva', 'vf'],
  },
  enunciado: {
    type: String,
    required: true,
  },
  opcoes: [
    { 
      texto: String,
      correta: Boolean,
    }
  ],
}, {
  collection: 'questoes'
});

export default models.Questao || model('Questao', questaoSchema);