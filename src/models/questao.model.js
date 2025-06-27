import { Schema, model, models } from "mongoose";

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
});

export default models.Questao || model('Questao', questaoSchema);