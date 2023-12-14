const express = require("express");
const axios = require("axios");
var cors = require("cors");

// dados para testar 
let Produtos = [
  {
    id: 45,
    nome: "Coquinha gelada",
    preco: 345,
    quantidade: 2,
    categoria: "Bebidas",
    fabricante: {
      nomef: "Coca",
      endereco: "Rua dos Metais, 234"
    }
  },
  {
    id: 12,
    nome: "Água com gás",
    preco: 20,
    quantidade: 10,
    categoria: "Bebidas",
    fabricante: {
      nomef: "Totodile Águas com gás",
      endereco: "Rua do Jacare, 55"
    }

  },
  {
    id: 36,
    nome: "Pipoca",
    preco: 5,
    quantidade: 1,
    categoria: "Comidas",
    fabricante: {
      nomef: "João Pipoqueiro",
      endereco: "Avenida dos Andradas, na frente do vianna"
    }
  },
]


//minhas credenciais do app e url de redirecionamento 
//pra o github

const CLIENT_ID = "dd32ee4426432a538381";
const CLIENT_SECRET = "816e4a59cd7653cd94084c5670db031456cc3335";
const GITHUB_URL = "https://github.com/login/oauth/access_token";

const app = express();
app.use(express.json()); //falando pro meu api usar express parseando pra json 
app.use(cors({ credentials: true, origin: true })); //o cors serve pra poder especificar quem pode acessar os recursos
//da minha api, nesse caso permitindo acessos externos



app.get("/oauth/redirect", (req, res) => { //fazendo a chamada 
  axios({
    method: "POST",
    url: `${GITHUB_URL}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${req.query.code}`,
    headers: {
      Accept: "application/json",
    },
  }).then((response) => { //após reocnhecer os client id e secret que estamos passando, o gothub manda o token pra gente
    res.redirect(
      `http://localhost:3000?access_token=${response.data.access_token}`// nisso nós redirecionamos de volta a nossa 
      //aplicação, agora com o token retornado pelo github
      //para podermos acessar nossos métodos.
    );
  });
});
// rotas publicas
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`App rodando na porta ${PORT}`);
});

const tokenValidation = (req, res, next) => {
  const token = req.headers['authorization'];
  console.log(token);
  axios
    .get("http://localhost:8010/proxy/user", {
      headers: {
        Authorization: "token " + token,
      },
    })
    .then((res) => {
      return next();
    })
    .catch((error) => {
      console.log("error " + error);
    });

}


app.get("/produtos", (req, res) => {     //get all the nomes dos meus produtos
  res.statusCode = 200; //200 é ok deu certo 
  res.json(Produtos.map(produto => produto.nome))
});

//agora eu vou fazer a validação para utilizar as rotas privadas

app.use("*", tokenValidation); //a partir daqui todos os endpoints vão passar pelo
//tokenvalidation

app.get('/produto/:id', (req, res) => { //get pelo id
  console.log(typeof req.params.id);
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  }
  else {
    let id = parseInt(req.params.id);
    let produto = Produtos.find(elem => elem.id == id);
    if (produto != undefined) {
      res.statusCode = 200;
      res.json(produto);
    }
    else {
      res.sendStatus(404);
    }
  }
});

app.post('/produto', (req, res) => { //inserindo um novo produto 
  let { id, nome, preco, quantidade, categoria, fabricante } = req.body;
  Produtos.push({
    id: id,
    nome: nome,
    preco: preco,
    quantidade: quantidade,
    categoria: categoria,
    fabricante: fabricante
  });
  res.sendStatus(200);
});

app.put('/produto/:id', (req, res) => { //atualizando um produto 
  if (isNaN(req.params.id)) {
    res.sendStatus(400);
  } else {
    let id = parseInt(req.params.id);
    let produto = Produtos.find(elem => elem.id == id);
    if (produto != undefined) {

      let { nome, preco, quantidade, categoria, fabricante } = req.body;

      if (nome != undefined) {
        produto.nome = nome;
      }
      if (preco != undefined) {
        produto.preco = preco;
      }
      if (quantidade != undefined) {
        produto.quantidade = quantidade;
      }
      if (categoria != undefined) {
        produto.categoria = categoria;
      }
      if (fabricante != undefined) {
        produto.fabricante = fabricante;
      }

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});
