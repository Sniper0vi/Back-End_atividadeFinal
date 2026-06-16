## API Reference 

### Pedidos

#### GET /pedidos
- **Descrição**: Obtém uma lista de pedidos
- **Response**: Array de pedidos

#### POST /pedidos
- **Descrição**: Cria um novo pedido
- **Body**:
```
Exemplo:
{
    "itens":[
        {"produtosId":6 , "quantidade":60 , "valorItem":1000.00}
    ]

}
```
- **Response**:
```
{
    "id":6,
    "valorTotal":60000
}
```

#### PUT /pedidos
- **Descrição**: Atualiza um pedido colocando o idPedidos no path params

- **Body**:
```
Exemplo:
{
    "status":"finalizado",
    "itens":[
        {"produtosId":4 , "quantidade":10 , "valorItem":30.00}
    ]

}
```
- **Response**:
```
{
    "message": "Pedido atualizado",
    "data":{
        "id":"2",
        "subTotal":300
    }
}
```

#### DELETE /pedidos
- **Descrição**: Deleta um pedidos já existente, colocando o idPedidos no path params
- **Response**:
```
{
    "message": "Pedido deletado"
    "data":{
        "id":5
    }
}
```
### Categorias

#### GET /categoria
- **Descrição**: Obtém uma lista de categorias
- **Response**: Array de Categorias

#### POST /categoria
- **Descrição**: Cria uma nova categoria
- **Body**:
```
Exemplo:
{
    "nome":"exemplo",
    "descricao":"exemplo"
}
```
- **Response**:
```
{
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 4,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
    }
}
```

#### PUT /categoria
- **Descrição**: Atualiza uma categoria colocando o idCategoria no path params

- **Body**:
```
Exemplo:
{
    "nome":"exemplo2",
    "descricao":"exemplo2"
}
```
- **Response**:
```
{
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "Rows matched: 1  Changed: 1  Warnings: 0",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
    }
}

```

#### DELETE /categoria
- **Descrição**: Deleta uma categoria já existente, colocando o idCategoria no path params
- **Response**:
```
{
    "message": "Categoria deletada com sucesso!"
}
```
### Produtos

#### GET /produtos
- **Descrição**: Obtém uma lista de produtos
- **Response**: Array de produtos

#### POST /produtos
- **Descrição**: Cria um novo produto
- **Body**:
```
Exemplo:

Campos enviados:
- idCategoria: 1
- nome: copo azul
- preco: 1000.00
- quantidade: 5
- descricao: AZUL
- image: arquivo JPG

```
- **Response**:
```
{
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 6,
        "info": "",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 0
    }
}
```

#### PUT /produtos
- **Descrição**: Atualiza uma produtos colocando o idProdutos no path params

- **Body**:
```
Exemplo:

Campos enviados:
- idCategoria: 1
- nome: copo azul
- preco: 1000.00
- quantidade: 5
- descricao: AZUL
- image: arquivo JPG

```
- **Response**:
```
{
    "result": {
        "fieldCount": 0,
        "affectedRows": 1,
        "insertId": 0,
        "info": "Rows matched: 1  Changed: 1  Warnings: 0",
        "serverStatus": 2,
        "warningStatus": 0,
        "changedRows": 1
    }
}
```

#### DELETE /clientes
- **Descrição**: Deleta um Produto já existente, colocando o idProdutos no path params
- **Response**:
```
{
    "message": "Produto de id:6 excluido com sucesso"
}
```