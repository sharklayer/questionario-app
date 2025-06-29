import mongoose from 'mongoose';
import Usuario from '../models/usuario.model.mjs';
import Questao from '../models/questao.model.mjs';
import Resposta from '../models/resposta.model.mjs';
import Atividade from '../models/atividade.model.mjs';

//criação das coleções no MongoDB >> node src/lib/initDB.js
async function syncDatabase() {
  const MONGODB_URI = "mongodb://localhost:27017/questionario";

  try {
    console.log('Iniciando conexão com o MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conexão estabelecida com sucesso.');

    console.log('\nSincronizando coleções...');

    const models = [
      { name: 'Usuario', model: Usuario },
      { name: 'Questao', model: Questao },
      { name: 'Resposta', model: Resposta },
      { name: 'Atividade', model: Atividade },
    ];

    for (const item of models) {
      try {
        await item.model.createCollection();
        console.log(`- Coleção '${item.name}' criada com sucesso.`);
      } catch (error) {
        if (error.codeName === 'NamespaceExists') {
          console.log(`- Coleção '${item.name}' já existe.`);
        } else {
          throw error;
        }
      }
    }

    console.log('\nSincronização do banco de dados concluída.');
  } catch (error) {
    console.error('\nOcorreu um erro durante a sincronização:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Conexão com o MongoDB fechada.');
    process.exit(0);
  }
}

syncDatabase();