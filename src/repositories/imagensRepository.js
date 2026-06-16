import { connection } from "../config/Database.js";

const imagensRepository = {

  selecionar: async (id) => {
    const sql = "SELECT image FROM Produtos WHERE id = ?";
    const values = [id];
    const [rows] = await connection.execute(sql, values);

    return rows; 
  }
};

export default imagensRepository;